import csv
from google.cloud import firestore

class CSVService:
    def __init__(self, db):
        self.db = db

    def parse_csv(self, file):
        csv_data = []
        stream = file.stream.read().decode("UTF-8").splitlines()
        reader = csv.DictReader(stream)
        for row in reader:
            csv_data.append(row)
        return csv_data

    def store_data(self, csv_data):
        collection_ref = self.db.collection('csv_data')
        for entry in csv_data:
            collection_ref.add(entry)

    def retrieve_data(self):
        collection_ref = self.db.collection('csv_data')
        docs = collection_ref.stream()
        return [doc.to_dict() for doc in docs]