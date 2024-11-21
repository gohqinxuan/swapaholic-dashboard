from flask import Flask, request, jsonify, Blueprint
from google.cloud import firestore
from csv_service import CSVService
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, storage
from flask_cors import CORS  # Import CORS
import json

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure Firestore credentials using environment variables
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
project_name = os.getenv("PROJECT_NAME")
database_id = os.getenv("DATABASE_ID")

# Initialize Firebase Admin SDK
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
firebase_admin.initialize_app(credentials.Certificate(credentials_path), {
    'storageBucket': os.getenv("STORAGE_BUCKET")  # Use the STORAGE_BUCKET environment variable
})

# Create Firestore client
db = firestore.Client(project=project_name, database=database_id)

# Create blueprints for different routes
csv_bp = Blueprint('csv', __name__)

# CSV Service for CSV operations
csv_service = CSVService(db)

# Blueprint setup for GeoJSON
geojson_bp = Blueprint('geojson_bp', __name__)

@geojson_bp.route('/geojson/data', methods=['GET'])
def get_geojson_data():
    """Fetches a GeoJSON file from Firebase Storage by filename."""
    filename = request.args.get('filename')

    if not filename:
        return jsonify({"error": "Filename is required"}), 400

    try:
        # Get the GeoJSON file from Firebase Storage
        bucket = storage.bucket()  # This gets the default Firebase storage bucket
        blob = bucket.blob(filename)

        if not blob.exists():
            return jsonify({"error": "File not found in Firebase Storage"}), 404

        # Download the file content as text (GeoJSON content)
        geojson_data = blob.download_as_text()

        # Optionally, parse the GeoJSON data (e.g., check if it's valid GeoJSON)
        try:
            geojson = json.loads(geojson_data)  # Parse JSON to validate GeoJSON structure
            # Check if the GeoJSON contains 'features' and 'type'
            if 'features' in geojson and geojson['type'] == 'FeatureCollection':
                # Extract the features and return them wrapped in a FeatureCollection
                return jsonify({
                    "type": "FeatureCollection",
                    "features": geojson['features']
                }), 200  # Return only the features as a valid FeatureCollection
            else:
                # If the GeoJSON is invalid, we return an error message
                return jsonify({"error": "Invalid GeoJSON structure (missing 'features' or wrong 'type')"}), 400
        except json.JSONDecodeError as e:
            return jsonify({"error": f"Failed to parse GeoJSON: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@csv_bp.route('/csv/data', methods=['GET'])
def get_csv_data():
    """Fetches a CSV file from Firebase Storage by filename."""
    filename = request.args.get('filename')

    if not filename:
        return jsonify({"error": "Filename is required"}), 400

    try:
        # Get the CSV file from Firebase Storage
        bucket = storage.bucket()  # This gets the default Firebase storage bucket
        blob = bucket.blob(filename)

        if not blob.exists():
            return jsonify({"error": "File not found in Firebase Storage"}), 404

        # Download the file content as text
        csv_data = blob.download_as_text()

        return jsonify({"data": csv_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Register blueprints
app.register_blueprint(csv_bp)
app.register_blueprint(geojson_bp)

# Run the application (only if this file is run directly)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
