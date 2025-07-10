from app import create_app
from log_interface import log_init, log_clear
import os
import atexit
from util import cleanup_history

app = create_app()
atexit.register(cleanup_history)

if __name__ == "__main__":
    log_clear()
    log_init()

    app.run(
        debug=True,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )