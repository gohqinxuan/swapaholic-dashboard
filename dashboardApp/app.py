from flask import Flask, request, jsonify, Blueprint
from google.cloud import firestore
from csv_service import CSVService
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure Firestore credentials using environment variables
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
project_name = os.getenv("PROJECT_NAME", "<RENAME WITH YOUR PROJECT NAME>")
database_id = os.getenv("DATABASE_ID", "<RENAME WITH YOUR DATABASE ID>")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
db = firestore.Client(project=project_name, database=database_id)

# Create blueprints for different routes
csv_bp = Blueprint('csv', __name__)

# CSV Service for CSV operations
csv_service = CSVService(db)

@csv_bp.route('/csv', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        csv_data = csv_service.parse_csv(file)
        csv_service.store_data(csv_data)
        return jsonify({"message": "CSV uploaded successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@csv_bp.route('/csv/data', methods=['GET'])
def get_csv_data():
    try:
        data = csv_service.retrieve_data()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Register blueprints
app.register_blueprint(csv_bp)

# Run the application (only if this file is run directly)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)