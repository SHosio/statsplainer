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


# --- Tests for cleanup_history ---

# Mock the os functions used for file system operations
@patch('util.os.remove')
@patch('util.os.path.isfile')
@patch('util.os.listdir')
@patch('util.os.path.join')
@patch('util.os.path.abspath')
def test_cleanup_history_removes_files(mock_abspath, mock_join, mock_listdir, mock_isfile, mock_remove):
    """Test that cleanup_history correctly identifies and removes files (not directories)."""
    # Define a mock absolute path for the history folder.
    # Note: The function uses a relative path "../history_uploads", so mocking abspath is crucial.
    base_dir = "/mock/base/Statsplainer/backend" # Assumed location of util.py for relative path calculation
    history_folder = "/mock/base/Statsplainer/history_uploads" # The target directory

    mock_abspath.return_value = history_folder # Mock the absolute path resolution

    # Configure os.path.join mock to return appropriate paths
    def join_side_effect(*args):
        if args == ("..", "history_uploads"):
            # Path used by abspath - return value doesn't matter much as abspath is mocked
            return "../history_uploads"
        elif args[0] == history_folder:
            # Construct full path for items within the history folder
            return f"{history_folder}/{args[1]}"
        # Fallback for other potential joins (though unlikely in this function)
        return os.path.normpath(os.path.join(*args))

    mock_join.side_effect = join_side_effect

    # Simulate directory contents including a subdirectory
    mock_listdir.return_value = ['file1.txt', 'file2.log', 'subdir']
    # Mock isfile to return True only for the files
    mock_isfile.side_effect = lambda path: path.endswith('.txt') or path.endswith('.log')

    # Define the expected paths passed to os.remove
    expected_remove_calls = [
        f"{history_folder}/file1.txt",
        f"{history_folder}/file2.log"
    ]

    util.cleanup_history()

    mock_abspath.assert_called_once() # Verify the folder path was resolved
    mock_listdir.assert_called_once_with(history_folder)
    assert mock_isfile.call_count == 3 # isfile checked for all three items
    assert mock_remove.call_count == 2 # remove called only for the two files
    # Verify os.remove was called with the correct full file paths
    mock_remove.assert_any_call(expected_remove_calls[0])
    mock_remove.assert_any_call(expected_remove_calls[1])


@patch('util.os.remove')
@patch('util.os.path.isfile')
@patch('util.os.listdir')
@patch('util.os.path.join')
@patch('util.os.path.abspath')
def test_cleanup_history_empty_directory(mock_abspath, mock_join, mock_listdir, mock_isfile, mock_remove):
    """Test that cleanup_history handles an empty directory correctly."""
    history_folder = "/some/base/path/Statsplainer/history_uploads"
    mock_abspath.return_value = history_folder
    mock_join.side_effect = lambda *args: os.path.normpath(os.path.join(*args)) if args[0] == history_folder else "../history_uploads"
    mock_listdir.return_value = [] # Empty directory

    util.cleanup_history()

    mock_abspath.assert_called_once()
    mock_listdir.assert_called_once_with(history_folder)
    mock_isfile.assert_not_called()
    mock_remove.assert_not_called()

@patch('util.os.remove', side_effect=OSError("Permission denied"))
@patch('util.os.path.isfile', return_value=True)
@patch('util.os.listdir', return_value=['locked_file.txt'])
@patch('util.os.path.join')
@patch('util.os.path.abspath')
def test_cleanup_history_remove_error(mock_abspath, mock_join, mock_listdir, mock_isfile, mock_remove):
    """Test that errors during os.remove are propagated."""
    history_folder = "/mock/base/Statsplainer/history_uploads"
    file_path = f"{history_folder}/locked_file.txt"
    mock_abspath.return_value = history_folder
    # Ensure join returns the correct path for the file to be removed
    mock_join.side_effect = lambda *args: file_path if args[0] == history_folder else "../history_uploads"

    # The cleanup function doesn't catch OSError, so it should raise.
    with pytest.raises(OSError, match="Permission denied"):
        util.cleanup_history()

    # Assert that the function attempted the operation
    mock_abspath.assert_called_once()
    mock_listdir.assert_called_once_with(history_folder)
    mock_isfile.assert_called_once_with(file_path)
    mock_remove.assert_called_once_with(file_path)
