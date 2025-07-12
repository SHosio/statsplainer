from flask import request, jsonify, send_file, Blueprint, current_app
import os
from log_interface import log_insert
import uuid
from datetime import datetime

img_routes = Blueprint("img_routes", __name__)

@img_routes.route("/upload-image", methods=["POST"])
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["file"]
    user_id = request.cookies.get('user_id')
    session_id = request.form.get('session_id') or request.args.get('session_id') or 'nosession'
    # Compose new filename with session-based naming
    random_part = str(uuid.uuid4())[:6]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_filename = f"user_{user_id}_{session_id}_clip_{random_part}_{timestamp}_{file.filename}"
    file_path = os.path.join(current_app.config['IMG_FOLDER'], new_filename)
    file.save(file_path)

    # Log the image upload (no user_provided_text, app_response, or mode for raw upload)
    log_insert(user_id, None, None, None, None, session_id, image_file_path=new_filename)

    return jsonify({"message": "Image uploaded successfully", "filename": new_filename, "session_id": session_id})

@img_routes.route("/get-image/<filename>", methods=["GET"])
def get_image(filename):
    file_path = os.path.join(current_app.config['IMG_FOLDER'], filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "Image not found"}), 404

    return send_file(file_path, mimetype="image/*")
