import pytest
import json
from unittest.mock import patch, MagicMock
import os
from io import BytesIO

# Route paths defined in the blueprint
UPLOAD_ROUTE = "/upload-PDF"
GET_ROUTE_PREFIX = "/get-pdf/"

# --- Tests for POST /upload-PDF ---
def test_upload_pdf_no_file_part(client):
    """Test that a 400 error occurs if the 'file' part is missing."""
    response = client.post(UPLOAD_ROUTE, data={}, content_type='multipart/form-data')
    assert response.status_code == 400
    assert "No PDF uploaded" in response.get_json()["error"]


# --- Tests for GET /get-pdf/<filename> ---
@patch('app.pdf_routes.send_file')
@patch('app.pdf_routes.os.path.exists', return_value=True)
@patch('app.pdf_routes.os.path.join')
def test_get_pdf_success(mock_join, mock_exists, mock_send_file, client, app):
    """Test successful retrieval of a PDF file."""
    pdf_folder = app.config['PDF_FOLDER']
    filename = "existing_doc.pdf"
    expected_filepath = os.path.join(pdf_folder, filename)
    mock_join.return_value = expected_filepath
    # Mock send_file to return dummy content
    mock_send_file.return_value = "dummy pdf content"

    response = client.get(f'{GET_ROUTE_PREFIX}{filename}')

    mock_join.assert_any_call(pdf_folder, filename)
    mock_exists.assert_called_once_with(expected_filepath)
    mock_send_file.assert_called_once_with(expected_filepath, mimetype="application/pdf")
    assert response.data == b"dummy pdf content"

@patch('app.pdf_routes.os.path.exists', return_value=False)
@patch('app.pdf_routes.os.path.join')
def test_get_pdf_not_found(mock_join, mock_exists, client, app):
    """Test that a 404 error occurs for a non-existent PDF file."""
    pdf_folder = app.config['PDF_FOLDER']
    filename = "missing_doc.pdf"
    expected_filepath = os.path.join(pdf_folder, filename)
    mock_join.return_value = expected_filepath

    response = client.get(f'{GET_ROUTE_PREFIX}{filename}')

    assert response.status_code == 404
    assert "PDF not found" in response.get_json()["error"]
    mock_join.assert_any_call(pdf_folder, filename)
    mock_exists.assert_called_once_with(expected_filepath)
