import sqlite3 as sq

log_path = "app_log.db"

# Initialise empty data table
def log_init():
    con = sq.connect(log_path)
    cur = con.cursor()

    cur.execute("CREATE TABLE IF NOT EXISTS log(user_id, user_provided_text, app_response, mode, uploaded_pdf)")

    con.commit()
    con.close()

# Clear existing data table
def log_clear():
    con = sq.connect(log_path)
    cur = con.cursor()
    
    cur.execute("DROP TABLE IF EXISTS log")

    con.commit()
    con.close()

# Insert data row into table
def log_insert(user_id, user_provided_text, app_response, mode, uploaded_pdf):
    con = None # Initialize con to None
    try:
        con = sq.connect(log_path)
        cur = con.cursor()

        # Insert data rows into SQLite database app_log.db
        statement = """INSERT INTO log (user_id, user_provided_text, app_response, mode, uploaded_pdf)
            VALUES (?, ?, ?, ?, ?)"""
        cur.execute(statement, (user_id, user_provided_text, app_response, mode, uploaded_pdf))

        con.commit()
    finally:
        if con: # Ensure connection exists before closing
            con.close()
