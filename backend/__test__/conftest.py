import pytest
import os
import tempfile

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app # Changed from relative import

@pytest.fixture(scope='module')
def app():
    """Create and configure a new app instance for each test module."""
    # Create a temporary directory for uploads during testing if needed
    # Or mock os.makedirs and file operations within tests
    img_dir = tempfile.mkdtemp()
    pdf_dir = tempfile.mkdtemp()
    hist_dir = tempfile.mkdtemp()

    # Create the app instance using the factory
    app = create_app()

    # Apply test-specific configuration
    app.config.update({
        "TESTING": True,
        # Use temporary folders for testing to avoid polluting real folders
        'IMG_FOLDER': img_dir,
        'PDF_FOLDER': pdf_dir,
        'HISTORY_FOLDER': hist_dir,
    })


    yield app # Provide the app instance to tests

    # Clean up temporary directories after tests run
    try:
        os.rmdir(img_dir)
        os.rmdir(pdf_dir)
        os.rmdir(hist_dir)
    except OSError:
        # Handle cases where directories might not be empty if tests failed uncleanly
        pass


@pytest.fixture()
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture()
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()
