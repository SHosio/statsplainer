from flask import Flask
from flask_cors import CORS
import os

def create_app():
    print("🚀 create_app() called")
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    base_dir = os.path.abspath(os.path.dirname(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, '..'))

    app.config['IMG_FOLDER'] = os.path.join(project_root, 'img_uploads')
    app.config['PDF_FOLDER'] = os.path.join(project_root, 'pdf_uploads')
    app.config['DATABASE_FOLDER'] = os.path.join(project_root, 'database')


    os.makedirs(app.config['IMG_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PDF_FOLDER'], exist_ok=True)
    os.makedirs(app.config['DATABASE_FOLDER'], exist_ok=True)


    from .img_routes import img_routes
    from .pdf_routes import pdf_routes
    from .aiapi_routes import aiapi_routes
    from .userid_handler import userid_handler


    app.register_blueprint(img_routes)
    app.register_blueprint(pdf_routes)
    app.register_blueprint(aiapi_routes)
    app.register_blueprint(userid_handler)


    return app