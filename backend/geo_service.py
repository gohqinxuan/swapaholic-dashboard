import json
from google.cloud import firestore

class GeoJSONService:
    def __init__(self, db):
        self.db = db

    def parse_geojson(self, file):
        try:
            # Read the GeoJSON file content
            geo_data = json.load(file)
            # Ensure the GeoJSON contains a valid 'features' key
            if 'features' in geo_data:
                return geo_data['features']  # Return only the features for simplicity
            else:
                raise ValueError("Invalid GeoJSON structure: 'features' key not found.")
        except json.JSONDecodeError as e:
            print(f"Error decoding GeoJSON: {e}")
            return None
        except Exception as e:
            print(f"Error parsing GeoJSON: {e}")
            return None
        
    def retrieve_data(self):
        collection_ref = self.db.collection('geojson_data')
        docs = collection_ref.stream()
        return [doc.to_dict() for doc in docs]
