# Firestore Flask Application

This repository contains a Flask-based REST API that integrates with Google Cloud Firestore. The application allows uploading and retrieving CSV data to/from a custom Firestore database.

## Project Structure

```
project
|-- dashboardApp (Backend)
|     |-- .env                   # To create your own Environment variables for configuration
|     |-- app.py                 # Main Flask application
|     |-- Dockerfile             # Dockerfile for containerization
|     |-- requirements.txt       # Python dependencies
|     |-- csv_service.py         # CSV service handling
|     |-- firestore_credentials.json # Firestore service account credentials
|-- public (frontend files)
|-- src (frontend files)
```

## Prerequisites

- Python 3.7+
- Docker
- Google Cloud project set up with Firestore enabled
- Google Cloud service account with Firestore access

## Setup and Configuration

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd project/dashboardApp
   ```

2. **Environment Variables**

   Create a `.env` file in the `dashboardApp` directory with the following:

   ```env
   GOOGLE_APPLICATION_CREDENTIALS=/app/firestore_credentials.json
   PROJECT_NAME=<your-google-cloud-project-name>
   DATABASE_ID=<your-database-id>
   ```

   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google service account credentials file.
   - `PROJECT_NAME`: Your Google Cloud project ID.
   - `DATABASE_ID`: Your custom Firestore database ID.

3. **Firestore Service Account Key**

   Download the **Firestore service account key** from Google Cloud Console and place it in the `dashboardApp` directory as `firestore_credentials.json`. Add this file to `.gitignore` to avoid exposing sensitive credentials.

4. **Install Dependencies**

   Install dependencies locally (for testing purposes):

   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

### 1. Using Docker

1. **Build the Docker Image**

   ```bash
   docker build -t flask-dashboard-app .
   ```

2. **Run the Docker Container**

   ```bash
   docker run -d -p 5000:5000 -v "<path-to-your-firestore-credentials.json>:/app/firestore_credentials.json" flask-dashboard-app
   ```

   - Replace `<path-to-your-firestore-credentials.json>` with the full path to the credentials file.

### 2. Running Locally

1. **Activate Python Environment** (Optional but recommended):

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Run Flask Application**

   ```bash
   python app.py
   ```

   By default, the Flask application will run at [http://localhost:5000](http://localhost:5000).

## API Endpoints

### POST `/csv`
- **Description**: Upload a CSV file to Firestore.
- **Request**: Use `multipart/form-data` in Postman or similar tools. Key should be `file`.
- **Response**: Returns status 201 if upload is successful.

### GET `/csv/data`
- **Description**: Retrieve all data from Firestore.
- **Response**: JSON containing all the data stored in Firestore.

## Troubleshooting

- **Error: "404 The database (default) does not exist for project"**:
  - Make sure the database ID in `.env` (`DATABASE_ID`) matches the custom Firestore database name (`swapaholic-dashboard`).
  - Ensure the Firestore database is correctly set up in Google Cloud.

- **Permissions Issues**:
  - Ensure that the service account has sufficient permissions for Firestore.
  - Verify that the `GOOGLE_APPLICATION_CREDENTIALS` path in `.env` is correct.

## Notes

- **Sensitive Information**: Always ensure that sensitive files, like `firestore_credentials.json`, are not committed to version control by adding them to `.gitignore`.
- **Environment Variables**: Environment variables are used to configure the project settings, which makes it easier to switch between environments.

## License

This project is licensed under the MIT License.