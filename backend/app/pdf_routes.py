from flask import request, send_file, jsonify, Blueprint, current_app
import os
from util import extract_text_from_pdf
from API import API_text_input

pdf_routes = Blueprint("pdf_routes", __name__)

@pdf_routes.route("/upload-PDF", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No PDF uploaded"}), 400
    
    file = request.files["file"]
    file_path = os.path.join(current_app.config['PDF_FOLDER'], file.filename)
    file.save(file_path)
    
    return jsonify({"message": "File uploaded successfully", "filename": file.filename})

@pdf_routes.route("/get-pdf/<filename>", methods=["GET"])
def get_pdf(filename):
    file_path = os.path.join(current_app.config['PDF_FOLDER'], filename)
    
    if not os.path.exists(file_path):
        return jsonify({"error": "PDF not found"}), 404
    
    return send_file(file_path, mimetype="application/pdf")

def cleanup():
    for pdf in os.listdir(current_app.config['PDF_FOLDER']):
        file_path = os.path.join(current_app.config['PDF_FOLDER'], pdf)
        os.remove(file_path)
        print(f"PDF deleted: {file_path}")

