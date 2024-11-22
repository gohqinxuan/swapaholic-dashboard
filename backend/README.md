# Firestore Flask Application

This repository contains a Flask-based REST API that integrates with Google Cloud Firestore. The application allows retrieving CSV/geoJSON data from a custom Firebase storage database.

## Project Structure

```
project
|-- backend
|     |-- .env                   # To create your own Environment variables for configuration
|     |-- app.py                 # Main Flask application
|     |-- Dockerfile             # Dockerfile for containerization
|     |-- README.md              # Instructions for local development
|     |-- requirements.txt       # Python dependencies
|     |-- csv_service.py         # CSV service handling
|     |-- geo_service.py         # geoJSON service handling
|     |-- firestore_credentials.json # Firestore service account credentials
|-- frontend
|     |-- public                 
|     |-- src 
|     |-- CHANGELOG.md
|     |-- LICENSE.md
|     |-- next-env.d.ts
|     |-- next.config.mjs
|     |-- package-lock.json
|     |-- package.json
|     |-- pnpm-lock.yaml
|     |-- prettier.config.js
|     |-- tsconfig.json
|-- README.md

```

## Prerequisites

- Python 3.7+
- Docker
- Firebase Storage Set Up

## Setup and Configuration

1. **Import the whole file to Github**

2. **Create Environment Variables Locally**

   Reminder to not upload the `.env` file to GitHub.
   Create a `.env` file in the `backend` directory with the following:

   ```env
   GOOGLE_APPLICATION_CREDENTIALS=/app/<original-file-name>.json
   PROJECT_NAME=<your-firebase-project-id>
   DATABASE_ID=<your-firebase-project-id>
   ```

   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google service account credentials file.
   - `PROJECT_NAME`: Your Firebase Project ID
   - `DATABASE_ID`: Your Firebase Project ID

3. **Firebase Service Account Key**

   Download the **Firebase service account key** from Firebase Project Setting>Service Accounts and place it in the `backend` directory. Add this file to `.gitignore` to avoid exposing sensitive credentials.

## Running the Application

### Using Terminal in VSC (Local Development)

1. **Open Docker Desktop**

2. **Build the Docker Image**

   ```
   docker build -t flask-dashboard-app .
   ```

3. **Run the Docker Container**

   ```
   docker run -p 5000:5000 flask-app
   ```

## API Endpoints

### GET `/csv/data`
- **Description**: Retrieve the csv file from Firebase Storage.
- **Response**: JSON containing all the data stored in csv file.

### GET `/geojson/data`
- **Description**: Retrieve the geoJSON file from Firebase Storage.
- **Response**: JSON containing all the data stored in geoJSON file.

## Troubleshooting

- **Error: "404 The database (default) does not exist for project"**:
  - Make sure the database ID in `.env` (`DATABASE_ID`) matches the custom Firebase database name (`swapaholic-dashboard`).
  - Ensure the Firebase database is correctly set up in Google Cloud.

- **Permissions Issues**:
  - Ensure that the service account has sufficient permissions for Firebase.
  - Verify that the `GOOGLE_APPLICATION_CREDENTIALS` path in `.env` is correct.

## Notes

- **Sensitive Information**: Always ensure that sensitive files, like `firebase_credential.json`, are not committed to version control by adding them to `.gitignore`.
- **Environment Variables**: Environment variables are used to configure the project settings, which makes it easier to switch between environments.
- **Extra**: Our original data is huge so upon opening it on Vercel, it takes a while to load.

## License

This project is licensed under the MIT License.