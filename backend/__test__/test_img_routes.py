import pytest
import json
from unittest.mock import patch, MagicMock
import os
from io import BytesIO

UPLOAD_ROUTE = "/upload-image"
GET_ROUTE_PREFIX = "/get-image/"

def test_upload_image_no_file_part(client):
    """Test that a 400 error occurs if the 'file' part is missing."""
    response = client.post(UPLOAD_ROUTE, data={}, content_type='multipart/form-data')

    assert response.status_code == 400
    assert "No image uploaded" in response.get_json()["error"]

@patch('app.img_routes.send_file')
@patch('app.img_routes.os.path.exists', return_value=True)
@patch('app.img_routes.os.path.join')
def test_get_image_success(mock_join, mock_exists, mock_send_file, client, app):
    """Test successful image retrieval."""
    img_folder = app.config['IMG_FOLDER']
    filename = "existing_image.jpg"
    expected_filepath = os.path.join(img_folder, filename)
    mock_join.return_value = expected_filepath
    mock_send_file.return_value = "dummy file content"

    response = client.get(f'{GET_ROUTE_PREFIX}{filename}')

    mock_join.assert_any_call(img_folder, filename)
    mock_exists.assert_called_once_with(expected_filepath)
    mock_send_file.assert_called_once_with(expected_filepath, mimetype="image/*")
    assert response.data == b"dummy file content"

@patch('app.img_routes.os.path.exists', return_value=False)
@patch('app.img_routes.os.path.join')
def test_get_image_not_found(mock_join, mock_exists, client, app):
    """Test that a 404 error occurs for a non-existent image."""
    img_folder = app.config['IMG_FOLDER']
    filename = "not_found.gif"
    expected_filepath = os.path.join(img_folder, filename)
    mock_join.return_value = expected_filepath

    response = client.get(f'{GET_ROUTE_PREFIX}{filename}')

    assert response.status_code == 404
    assert "Image not found" in response.get_json()["error"]
    mock_join.assert_any_call(img_folder, filename)
    mock_exists.assert_called_once_with(expected_filepath)
