FROM python:3.9-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY run.py .
COPY app/ app/
COPY pdf_uploads/ pdf_uploads/
COPY img_uploads/ img_uploads/
COPY history_uploads/ history_uploads/
COPY API.py .
COPY util.py .
COPY log_interface.py .
COPY app_log.db .
COPY ai_prompt_util.py .

# Expose the port your backend listens on
EXPOSE 5000

# Run your server
CMD ["python", "run.py"]
