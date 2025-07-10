from flask import request, jsonify, send_file, Blueprint, current_app
import os

img_routes = Blueprint("img_routes", __name__)

@img_routes.route("/upload-image", methods=["POST"])
def upload_image():
    # print(request.files["file"]) # Removed problematic print statement
    if "file" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["file"]

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    file_path = os.path.join(current_app.config['IMG_FOLDER'], file.filename)
    file.save(file_path)

    return jsonify({"message": "Image uploaded successfully", "filename": file.filename})

@img_routes.route("/get-image/<filename>", methods=["GET"])
def get_image(filename):
    file_path = os.path.join(current_app.config['IMG_FOLDER'], filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "Image not found"}), 404

    return send_file(file_path, mimetype="image/*")
