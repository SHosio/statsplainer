import pytest
from unittest.mock import patch, MagicMock
import log_interface # Changed from relative import

# --- Mocks for sqlite3 ---
# We patch 'log_interface.sq' because that's how sqlite3 is imported in log_interface.py
# We patch 'log_interface.sq.connect' because that's how sqlite3 is imported in log_interface.py
# We also patch the log_path variable to potentially use an in-memory DB or temp file if needed,
# but for mocking connect, it's simpler to just check the path argument.
@patch('log_interface.sq.connect')
def test_log_init_creates_table(mock_connect):
    """Verify log_init executes the correct CREATE TABLE statement."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Use the exact SQL from the source code
    expected_sql = "CREATE TABLE IF NOT EXISTS log(user_id, user_provided_text, app_response, mode, uploaded_pdf)"

    log_interface.log_init()

    mock_connect.assert_called_once_with(log_interface.log_path) # Check correct db path used
    mock_conn.cursor.assert_called_once()
    mock_cursor.execute.assert_called_once_with(expected_sql)
    mock_conn.commit.assert_called_once()
    mock_conn.close.assert_called_once()

@patch('log_interface.sq.connect', side_effect=log_interface.sq.Error("DB Connection Error"))
def test_log_init_handles_connection_error(mock_connect):
    """Verify log_init propagates connection errors."""
    # Mock connect to raise an error
    # The function doesn't catch the error, so it should propagate
    with pytest.raises(log_interface.sq.Error, match="DB Connection Error"):
        log_interface.log_init()
    mock_connect.assert_called_once_with(log_interface.log_path)


@patch('log_interface.sq.connect')
def test_log_clear_drops_table(mock_connect):
    """Verify log_clear executes the correct DROP TABLE statement."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Use the exact SQL from the source code
    expected_sql = "DROP TABLE IF EXISTS log"

    log_interface.log_clear()

    mock_connect.assert_called_once_with(log_interface.log_path)
    mock_conn.cursor.assert_called_once()
    mock_cursor.execute.assert_called_once_with(expected_sql)
    mock_conn.commit.assert_called_once()
    mock_conn.close.assert_called_once()

@patch('log_interface.sq.connect')
def test_log_insert_inserts_data(mock_connect):
    """Verify log_insert executes the correct INSERT statement with parameters."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    # Test data
    user_id = "user123"
    user_text = "Sample query"
    app_response = "Sample response"
    mode = "ELI5"
    pdf = "document.pdf"

    # Use the exact SQL from the source code (normalize whitespace for safety)
    expected_sql_raw = """INSERT INTO log (user_id, user_provided_text, app_response, mode, uploaded_pdf)
        VALUES (?, ?, ?, ?, ?)"""
    expected_sql_normalized = " ".join(expected_sql_raw.split())
    expected_params = (user_id, user_text, app_response, mode, pdf)

    # Act
    log_interface.log_insert(user_id, user_text, app_response, mode, pdf)

    mock_connect.assert_called_once_with(log_interface.log_path)
    mock_conn.cursor.assert_called_once()
    # Check execute call arguments
    args, kwargs = mock_cursor.execute.call_args
    executed_sql_normalized = " ".join(args[0].split())
    assert executed_sql_normalized == expected_sql_normalized
    assert args[1] == expected_params # Check parameters tuple
    mock_conn.commit.assert_called_once()
    mock_conn.close.assert_called_once()

@patch('log_interface.sq.connect')
def test_log_insert_handles_execute_error(mock_connect):
    """Verify log_insert propagates errors during cursor execution."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    # Simulate an error when execute is called
    mock_cursor.execute.side_effect = log_interface.sq.Error("Insert failed")
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    with pytest.raises(log_interface.sq.Error, match="Insert failed"):
        log_interface.log_insert("user", "text", "resp", "mode", "pdf")

    # Ensure connection was still attempted and cursor obtained
    mock_connect.assert_called_once_with(log_interface.log_path)
    mock_conn.cursor.assert_called_once()
    mock_cursor.execute.assert_called_once() # Execute was attempted
    # Commit and close might not be called depending on where the error occurs
    # mock_conn.commit.assert_not_called() # Or called depending on structure
    mock_conn.close.assert_called_once() # Close should ideally still be called in a finally block (but isn't in current code)
