import pytest
import json
from unittest.mock import patch, MagicMock
import os
from unittest.mock import patch, mock_open

# --- Tests for POST /upload_history/<filename> ---

@patch('app.history_routes.json.dump')
@patch('builtins.open', new_callable=mock_open)
@patch('app.history_routes.os.path.join')
def test_upload_history_success(mock_join, mock_file_open, mock_json_dump, client, app):
    """Verify successful saving of history JSON."""
    # Arrange
    filename_base = "my_doc"
    filename_json = f"{filename_base}.json"
    history_folder = app.config['HISTORY_FOLDER']
    expected_filepath = os.path.join(history_folder, filename_json)
    mock_join.return_value = expected_filepath

    history_data = {"mode1": [{"sender": "user", "text": "hello"}]}
    request_data = {"content": history_data}

    # Act
    response = client.post(f'/upload_history/{filename_base}', json=request_data)

    # Assert
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert response_data["message"] == "History saved successfully"
    assert response_data["History"] == filename_json

    mock_join.assert_any_call(history_folder, filename_json) # Changed to assert_any_call
    mock_file_open.assert_called_once_with(expected_filepath, 'w')
    # Get the file handle mock used in the 'with open...' block
    file_handle = mock_file_open()
    mock_json_dump.assert_called_once_with(history_data, file_handle)

def test_upload_history_not_json(client):
    """Verify 400 error if request is not JSON."""
    filename_base = "my_doc"
    response = client.post(f'/upload_history/{filename_base}', data="not json")
    assert response.status_code == 400
    assert "Request must be in JSON format" in response.get_json()["error"]

def test_upload_history_missing_content(client):
    """Verify 400 error if 'content' key is missing in JSON."""
    filename_base = "my_doc"
    response = client.post(f'/upload_history/{filename_base}', json={"other_key": "value"})
    assert response.status_code == 400
    assert "chat history in request body" in response.get_json()["error"] # Matches error message in code

@patch('app.history_routes.json.dump', side_effect=OSError("Disk full"))
@patch('builtins.open', new_callable=mock_open)
@patch('app.history_routes.os.path.join')
def test_upload_history_write_error(mock_join, mock_file_open, mock_json_dump, client, app):
    """Verify error during file writing propagates (likely results in 500)."""
    # Arrange
    filename_base = "my_doc_fail"
    filename_json = f"{filename_base}.json"
    history_folder = app.config['HISTORY_FOLDER']
    expected_filepath = os.path.join(history_folder, filename_json)
    mock_join.return_value = expected_filepath
    history_data = {"mode1": [{"sender": "user", "text": "hello"}]}
    request_data = {"content": history_data}

    # Act & Assert
    # The route doesn't explicitly handle OSError during dump, so it should propagate
    # leading Flask to return a 500 Internal Server Error.
    # We don't assert the exact 500 message as it's framework-generated.
    with pytest.raises(OSError, match="Disk full"):
         client.post(f'/upload_history/{filename_base}', json=request_data)

    # Verify mocks were called up to the point of failure
    mock_join.assert_any_call(history_folder, filename_json) # Changed to assert_any_call
    mock_file_open.assert_called_once_with(expected_filepath, 'w')
    file_handle = mock_file_open()
    mock_json_dump.assert_called_once_with(history_data, file_handle)


# --- Tests for GET /retrieve_history/<filename> ---

@patch('app.history_routes.json.load')
@patch('builtins.open', new_callable=mock_open, read_data='{"mode1": [{"sender": "AI", "text": "response"}]}')
@patch('app.history_routes.os.path.exists', return_value=True)
@patch('app.history_routes.os.path.join')
def test_retrieve_history_success(mock_join, mock_exists, mock_file_open, mock_json_load, client, app):
    """Verify successful retrieval of history JSON."""
    # Arrange
    filename_base = "existing_doc"
    filename_json = f"{filename_base}.json"
    history_folder = app.config['HISTORY_FOLDER']
    expected_filepath = os.path.join(history_folder, filename_json)
    mock_join.return_value = expected_filepath

    expected_history_data = {"mode1": [{"sender": "AI", "text": "response"}]}
    # Configure mock_json_load to return the data when called
    mock_json_load.return_value = expected_history_data

    # Act
    response = client.get(f'/retrieve_history/{filename_base}')

    # Assert
    assert response.status_code == 200
    assert response.get_json() == expected_history_data

    mock_join.assert_any_call(history_folder, filename_json) # Changed to assert_any_call
    mock_exists.assert_called_once_with(expected_filepath)
    mock_file_open.assert_called_once_with(expected_filepath, 'r')
    # Get the file handle mock used in the 'with open...' block
    file_handle = mock_file_open()
    mock_json_load.assert_called_once_with(file_handle)

@patch('app.history_routes.os.path.exists', return_value=False)
@patch('app.history_routes.os.path.join')
def test_retrieve_history_not_found(mock_join, mock_exists, client, app):
    """Verify 404 error if history file does not exist."""
    filename_base = "non_existent_doc"
    filename_json = f"{filename_base}.json"
    history_folder = app.config['HISTORY_FOLDER']
    expected_filepath = os.path.join(history_folder, filename_json)
    mock_join.return_value = expected_filepath

    # Act
    response = client.get(f'/retrieve_history/{filename_base}')

    # Assert
    assert response.status_code == 404
    assert "File not found" in response.get_json()["error"]
    mock_join.assert_any_call(history_folder, filename_json) # Changed to assert_any_call
    mock_exists.assert_called_once_with(expected_filepath)

@patch('app.history_routes.json.load', side_effect=json.JSONDecodeError("Bad JSON", "doc", 0))
@patch('builtins.open', new_callable=mock_open, read_data='invalid json')
@patch('app.history_routes.os.path.exists', return_value=True)
@patch('app.history_routes.os.path.join')
def test_retrieve_history_decode_error(mock_join, mock_exists, mock_file_open, mock_json_load, client, app):
    """Verify error during JSON decoding propagates (likely results in 500)."""
    # Arrange
    filename_base = "corrupt_doc"
    filename_json = f"{filename_base}.json"
    history_folder = app.config['HISTORY_FOLDER']
    expected_filepath = os.path.join(history_folder, filename_json)
    mock_join.return_value = expected_filepath

    # Act & Assert
    # The route doesn't explicitly handle JSONDecodeError, so it should propagate
    with pytest.raises(json.JSONDecodeError):
         client.get(f'/retrieve_history/{filename_base}')

    # Verify mocks were called up to the point of failure
    mock_join.assert_any_call(history_folder, filename_json) # Changed to assert_any_call
    mock_exists.assert_called_once_with(expected_filepath)
    mock_file_open.assert_called_once_with(expected_filepath, 'r')
    file_handle = mock_file_open()
    mock_json_load.assert_called_once_with(file_handle)
