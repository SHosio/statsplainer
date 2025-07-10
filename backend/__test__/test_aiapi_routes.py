import pytest
import json
from unittest.mock import patch
from unittest.mock import patch, mock_open

ROUTE_PATH = "/explain-highlight"

def test_explain_highlight_missing_data(client):
    """Ensure a 400 error is returned if required data fields are missing."""
    response = client.post(ROUTE_PATH, json={
        "highlighted_text": "Some text",
    })
    assert response.status_code == 400
    assert "Missing highlighted_text, mode, or filename" in response.get_json()["error"]


@patch('app.aiapi_routes.extract_text_from_pdf', side_effect=Exception("PDF Read Error"))
def test_explain_highlight_pdf_extract_fail(mock_extract_pdf, client, app):
    """Ensure a 500 error is returned if PDF text extraction fails."""
    pdf_filename = "bad.pdf"
    pdf_folder = app.config['PDF_FOLDER']
    request_data = {"highlighted_text": "text", "mode": "Def", "filename": pdf_filename}
    client.set_cookie('user_id', 'test')

    response = client.post(ROUTE_PATH, json=request_data)

    assert response.status_code == 500
    assert "Failed to extract text from PDF" in response.get_json()["error"]
    mock_extract_pdf.assert_called_once()


@patch('app.aiapi_routes.log_insert')
@patch('app.aiapi_routes.API_text_input', side_effect=Exception("AI Boom"))
@patch('app.aiapi_routes.ai_temperature_control', return_value=0.1)
@patch('app.aiapi_routes.prompt_builder', return_value="Prompt")
@patch('builtins.open', new_callable=mock_open, read_data='{}')
@patch('app.aiapi_routes.extract_text_from_pdf', return_value="PDF Text")
def test_explain_highlight_api_fail(mock_extract_pdf, mock_file_open, mock_prompt_builder, mock_temp_control, mock_api_call, mock_log_insert, client, app):
    """Ensure a 500 error is returned if the AI API call fails."""
    pdf_filename = "api_fail.pdf"
    pdf_folder = app.config['PDF_FOLDER']
    request_data = {"highlighted_text": "text", "mode": "Def", "filename": pdf_filename}
    client.set_cookie('user_id', 'test_api_fail')

    response = client.post(ROUTE_PATH, json=request_data)

    assert response.status_code == 500
    mock_api_call.assert_called_once()
