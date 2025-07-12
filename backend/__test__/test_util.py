import pytest
from unittest.mock import patch, MagicMock
import util
import requests # Import requests for handling potential request exceptions

# --- Tests for extract_text_from_pdf ---

# Mock the fitz (PyMuPDF) library used in util.py
@patch('util.fitz.open')
def test_extract_text_from_pdf_success(mock_fitz_open):
    """Test successful text extraction and cleaning across multiple PDF pages."""
    mock_doc = MagicMock()
    mock_page1 = MagicMock()
    mock_page1.get_text.return_value = "Page one content ends-" # Example hyphenated word
    mock_page2 = MagicMock()
    mock_page2.get_text.return_value = "hyphenated. Page two has\nmore text ." # Example newline and space before period

    # Simulate iterating through the mock document's pages
    mock_doc.__iter__.return_value = [mock_page1, mock_page2]
    # Mock the return value of fitz.open (note: util.py doesn't use a context manager here)
    mock_fitz_open.return_value = mock_doc

    pdf_path = "dummy/path/to/file.pdf"
    # Expected text after cleaning (hyphen removed, spaces adjusted)
    expected_cleaned_text = "Page one content endshyphenated. Page two has more text."

    extracted_text = util.extract_text_from_pdf(pdf_path)

    mock_fitz_open.assert_called_once_with(pdf_path)
    mock_page1.get_text.assert_called_once_with("text")
    mock_page2.get_text.assert_called_once_with("text")
    assert extracted_text == expected_cleaned_text

@patch('util.fitz.open', side_effect=Exception("Failed to open PDF"))
def test_extract_text_from_pdf_file_open_error(mock_fitz_open):
    """Test that an exception is raised if opening the PDF fails."""
    pdf_path = "non/existent/file.pdf"

    with pytest.raises(Exception, match="Failed to open PDF"):
        util.extract_text_from_pdf(pdf_path)
    mock_fitz_open.assert_called_once_with(pdf_path)

# --- Tests for clean_pdf_text ---
@pytest.mark.parametrize("input_text, expected_output", [
    ("Line one.\nLine two.", "Line one. Line two."),
    ("Word ends-\nhyphenated.", "Word endshyphenated."), # Hyphen is removed
    ("Sentence one . Sentence two ,", "Sentence one. Sentence two,"), # Space before punctuation handled
    ("Single line.", "Single line."),
    ("Line with buffer-\n", "Line with buffer"), # Hyphen at line end is removed
    ("", ""), # Empty input handles correctly
])
def test_clean_pdf_text(input_text, expected_output):
    """Test various scenarios for cleaning extracted PDF text."""
    assert util.clean_pdf_text(input_text) == expected_output


# --- Tests for pass_to_google_forms ---
# Mock the requests.post function used in util.py
@patch('util.requests.post')
def test_pass_to_google_forms_success(mock_post):
    """Test that the Google Forms POST request is constructed and sent correctly."""
    user_id = "test_user_123"
    expected_url = "https://docs.google.com/forms/d/e/1FAIpQLSflKM9wbXoNShp1reRQIuarEjVJlfw3ug5xepwIunceWUK45g/formResponse"
    # Use the specific entry ID defined in the util function
    expected_data = {'entry.2029882290': user_id}

    util.pass_to_google_forms(user_id)

    mock_post.assert_called_once_with(expected_url, data=expected_data)

@patch('util.requests.post', side_effect=requests.exceptions.RequestException("Network Error"))
def test_pass_to_google_forms_request_failure(mock_post):
    """Test that network errors during the POST request are propagated."""
    user_id = "test_user_456"
    expected_url = "https://docs.google.com/forms/d/e/1FAIpQLSflKM9wbXoNShp1reRQIuarEjVJlfw3ug5xepwIunceWUK45g/formResponse"
    expected_data = {'entry.2029882290': user_id}

    # The function doesn't currently handle exceptions from requests.post, so it should raise.
    with pytest.raises(requests.exceptions.RequestException, match="Network Error"):
         util.pass_to_google_forms(user_id)

    # Assert that the post was attempted
    mock_post.assert_called_once_with(expected_url, data=expected_data)



