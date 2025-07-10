from flask import request, jsonify, Blueprint, current_app
import os
from API import API_text_input
from log_interface import log_insert
from ai_prompt_util import prompt_builder, ai_temperature_control
from util import extract_text_from_pdf, pass_to_google_forms
import json

aiapi_routes = Blueprint("aiapi_routes", __name__)

# Endpoint for handling highlighted text explanations
@aiapi_routes.route("/explain-highlight", methods=["POST"])
def explain_highlight():
    user_id = request.cookies.get('user_id')
    if user_id == "null":
        user_id = "No user_id found."

    data = request.json
    if not data or "highlighted_text" not in data or "mode" not in data or "filename" not in data:
        return jsonify({"error": "Missing highlighted_text, mode, or filename in request"}), 400

    highlighted_text = data["highlighted_text"]
    mode = data["mode"]
    filename = data["filename"]
    image_base64 = data.get("image_base64")
    is_user_input = bool(data.get("is_user_input"))
    
    # Extract pdf logic
    file_path = os.path.join(current_app.config['PDF_FOLDER'], filename)
    try:
        full_text = extract_text_from_pdf(file_path)
    except Exception as e:
        return jsonify({"error": "Failed to extract text from PDF"}), 500
    
    # Sending chat history logic
    history_file = os.path.join("..", current_app.config['HISTORY_FOLDER'], filename.replace(".pdf", ".json"))
    try:
        with open(history_file, 'r') as f:
            full_history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
            full_history = {}

    current_mode_history = full_history.get(mode, [])
    messages = []

    for entry in current_mode_history:
        if entry["sender"] == "user":
            messages.append({
                "role": "user",
                "content": f"(Highlighted Text / user query)\n{entry['text']}"
            })
        elif entry["sender"] == "AI":
            messages.append({
                "role": "assistant",
                "content": f"(Explanation)\n{entry['text']}"
            })
    # End of chat history logic

    # Tell the AI whether the query is a highlighted text or a user query
    if is_user_input:
        combined_text = f"""This query is related to the user input:                   {highlighted_text}. 
                        """
    elif image_base64:
        combined_text = """This query is related to the image attached and thus there is no highlighted text, replace all explainations for the highlighted text for the image provided.\n"""
    else:
        combined_text = f"""Highlighted Text:
                            '{highlighted_text}'
                        """

    messages.insert(0, {"role": "user", "content": full_text})
    messages.append({"role": "user", "content": combined_text})
    
    if image_base64:
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": full_text},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}}
            ]
        })
    
    try:
        # Call API utility with combined text and mode-specific instructions
        # Pass image_base64 if it exists
        explanation = API_text_input(
            messages=messages, 
            dev_msg=prompt_builder(mode), 
            image_base64=image_base64,
            temperature=ai_temperature_control(mode))

        log_insert(user_id, highlighted_text, explanation, mode, filename)
        #pass_to_google_forms(user_id, highlighted_text, explanation, mode, filename)
        
        return jsonify({
            "explanation": explanation
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500