from flask import request, jsonify, Blueprint, current_app
import os
import sqlite3
from API import API_text_input
from log_interface import log_insert
from ai_prompt_util import prompt_builder, ai_temperature_control
from util import extract_text_from_pdf, pass_to_google_forms
import base64
import uuid
from datetime import datetime

aiapi_routes = Blueprint("aiapi_routes", __name__)

@aiapi_routes.route("/test", methods=["GET"])
def test_route():
    return jsonify({"message": "Test route working"})

# Endpoint for generating session summary
@aiapi_routes.route("/session-summary", methods=["POST"])
def generate_session_summary():
    user_id = request.cookies.get('user_id')
    if user_id == "null":
        user_id = "No user_id found."

    data = request.json
    session_id = data.get("session_id") if data else None

    try:
        # Connect to SQLite database
        conn = sqlite3.connect('app_log.db')
        cursor = conn.cursor()
        
        # Get interactions for this user and session
        if session_id:
            cursor.execute("""
                SELECT user_provided_text, app_response, mode, uploaded_pdf 
                FROM log 
                WHERE user_id = ? AND session_id = ?
                ORDER BY rowid
            """, (user_id, session_id))
        else:
            cursor.execute("""
                SELECT user_provided_text, app_response, mode, uploaded_pdf 
                FROM log 
                WHERE user_id = ? 
                ORDER BY rowid
            """, (user_id,))
        
        interactions = cursor.fetchall()
        conn.close()
        
        if not interactions:
            return jsonify({"summary": "No session data found for this user."})
        
        # Build session data for AI
        session_data = f"""
        User Session Summary Request:
        
        User ID: {user_id}
        Total Interactions: {len(interactions)}
        
        Session Details:
        """
        
        for i, (user_text, ai_response, mode, pdf_name) in enumerate(interactions, 1):
            session_data += f"""
        Interaction {i}:
        - PDF: {pdf_name}
        - Mode: {mode}
        - User Query: {user_text}
        - AI Response: {ai_response}
        """
        
        # Create AI prompt for summary
        summary_prompt = f"""
        You are an educational assistant. Create a comprehensive learning summary for a statistics student who used an AI tool to understand PDF content.
        
        Based on the session data below, create a structured summary that includes:
        1. **Key Topics Covered**: What statistical concepts did they explore?
        2. **Learning Progress**: What did they learn from each interaction?
        3. **Understanding Level**: Assess their comprehension based on their questions
        4. **Recommendations**: Suggest next steps for their learning journey
        
        Make the summary encouraging and educational. Focus on their learning achievements.
        
        Session Data:
        {session_data}
        """
        
        # Generate summary using AI
        messages = [{"role": "user", "content": summary_prompt}]
        summary = API_text_input(
            messages=messages,
            dev_msg="You are a helpful educational assistant creating learning summaries.",
            temperature=0.7
        )
        
        return jsonify({"summary": summary})
        
    except Exception as e:
        return jsonify({"error": f"Failed to generate summary: {str(e)}"}), 500

# Endpoint for handling highlighted text explanations
@aiapi_routes.route("/explain-highlight", methods=["POST"])
def explain_highlight():
    user_id = request.cookies.get('user_id')
    if user_id == "null":
        user_id = "No user_id found."

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.json
    
    if not data or "highlighted_text" not in data or "mode" not in data or "filename" not in data:
        return jsonify({"error": "Missing highlighted_text, mode, or filename in request"}), 400

    highlighted_text = data["highlighted_text"]
    mode = data["mode"]
    filename = data["filename"]
    image_base64 = data.get("image_base64")
    is_user_input = bool(data.get("is_user_input"))
    session_id = data.get("session_id")

    image_file_path = None
    # If image_base64 is present, save the image and set image_file_path
    if image_base64:
        random_part = str(uuid.uuid4())[:6]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"user_{user_id}_{session_id}_clip_{random_part}_{timestamp}.png"
        image_path = os.path.join(current_app.config['IMG_FOLDER'], image_filename)
        with open(image_path, "wb") as img_file:
            img_file.write(base64.b64decode(image_base64))
        image_file_path = image_filename

    file_path = os.path.join(current_app.config['PDF_FOLDER'], filename)
    try:
        full_text = extract_text_from_pdf(file_path)
    except Exception as e:
        return jsonify({"error": "Failed to extract text from PDF"}), 500
    
    # Initialize empty messages array (no history)
    messages = []

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

        log_insert(user_id, highlighted_text, explanation, mode, filename, session_id, image_file_path=image_file_path)
        #pass_to_google_forms(user_id, highlighted_text, explanation, mode, filename)
        
        return jsonify({
            "explanation": explanation
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500