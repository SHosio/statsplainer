import pytest
from unittest.mock import patch, MagicMock
import API  # The module that contains `API_text_input`

# Test 1: Successful text-only generation
@patch("API.client.chat.completions.create")
def test_API_text_input_success_text_only(mock_create):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Mocked successful response"))]
    mock_create.return_value = mock_response

    messages = [
        {"role": "user", "content": "What is a p-value?"},
        {"role": "assistant", "content": "It's a measure of statistical significance."},
        {"role": "user", "content": "Explain more."}
    ]
    dev_msg = "Explain like I'm a beginner."
    temperature = 0.5

    result = API.API_text_input(messages, dev_msg, temperature=temperature)
    assert result == "Mocked successful response"
    mock_create.assert_called_once()

# Test 2: Successful response with image_base64
@patch("API.client.chat.completions.create")
def test_API_text_input_success_with_image(mock_create):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Image-related response"))]
    mock_create.return_value = mock_response

    messages = [{"role": "user", "content": "Can you describe this?"}]
    dev_msg = "This image contains medical figures."
    image_base64 = "dummy_base64_string"

    result = API.API_text_input(messages, dev_msg, image_base64=image_base64)
    assert result == "Image-related response"
    mock_create.assert_called_once()

# Test 3: Simulate API error
@patch("API.client.chat.completions.create")
def test_API_text_input_api_error_returns_message(mock_create):
    mock_create.side_effect = Exception("API failure simulation")

    messages = [{"role": "user", "content": "What is the meaning of life?"}]
    dev_msg = "Keep it lighthearted."

    with pytest.raises(Exception) as exc_info:
        API.API_text_input(messages, dev_msg)

    assert "API failure simulation" in str(exc_info.value)

# Test 4: No developer message provided
@patch("API.client.chat.completions.create")
def test_API_text_input_no_dev_msg(mock_create):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Response without dev_msg"))]
    mock_create.return_value = mock_response

    messages = [{"role": "user", "content": "Define variance"}]

    result = API.API_text_input(messages, dev_msg=None)
    assert result == "Response without dev_msg"
    mock_create.assert_called_once()
