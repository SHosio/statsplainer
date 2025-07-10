import pytest
import json
from unittest.mock import patch, MagicMock

# Route path defined in the blueprint
ROUTE_PATH = "/user_id"

# Corrected patch path
@patch('app.userid_handler.pass_to_google_forms')
def test_get_id_with_cookie(mock_pass_to_forms, client):
    """Verify the route reads the user_id cookie and calls pass_to_google_forms."""
    user_id_from_cookie = "actual_user_id_123"
    # Set the cookie in the test client (removed 'localhost')
    client.set_cookie('user_id', user_id_from_cookie)

    response = client.post(ROUTE_PATH) # POST request as defined in the route

    assert response.status_code == 200
    assert response.get_json() == {"message": "Success"}
    # Verify pass_to_google_forms was called with the ID from the cookie
    mock_pass_to_forms.assert_called_once_with(user_id_from_cookie)

# Corrected patch path
@patch('app.userid_handler.pass_to_google_forms')
def test_get_id_with_null_cookie(mock_pass_to_forms, client):
    """Verify the route handles the 'null' string cookie value correctly."""
    user_id_from_cookie = "null" # The specific string value checked in the code
    client.set_cookie('user_id', user_id_from_cookie) # Removed 'localhost'
    expected_id_passed = "No user_id found." # The value used when cookie is "null"

    response = client.post(ROUTE_PATH)

    assert response.status_code == 200
    assert response.get_json() == {"message": "Success"}
    # Verify pass_to_google_forms was called with the specific string
    mock_pass_to_forms.assert_called_once_with(expected_id_passed)

# Corrected patch path
@patch('app.userid_handler.pass_to_google_forms')
def test_get_id_without_cookie(mock_pass_to_forms, client):
    """Verify the route handles the absence of the user_id cookie."""
    # No cookie is set
    expected_id_passed = None # request.cookies.get('user_id') returns None if not found

    response = client.post(ROUTE_PATH)

    assert response.status_code == 200
    assert response.get_json() == {"message": "Success"}
    # Verify pass_to_google_forms was called with None
    mock_pass_to_forms.assert_called_once_with(expected_id_passed)

# Corrected patch path
@patch('app.userid_handler.pass_to_google_forms', side_effect=Exception("Google Forms Error"))
def test_get_id_pass_to_forms_error(mock_pass_to_forms, client):
    """Verify that errors from pass_to_google_forms propagate."""
    user_id_from_cookie = "user_causing_error"
    client.set_cookie('user_id', user_id_from_cookie) # Removed 'localhost'

    # The route does not handle exceptions from pass_to_google_forms, so it should propagate
    with pytest.raises(Exception, match="Google Forms Error"):
        client.post(ROUTE_PATH)

    # Verify pass_to_google_forms was still called
    mock_pass_to_forms.assert_called_once_with(user_id_from_cookie)
