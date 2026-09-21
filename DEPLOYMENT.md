# Deploying ReviewIQ with GitHub Actions (CI/CD)

This project is configured with a fully automated CI/CD pipeline using GitHub Actions. Whenever you push changes to the `main` branch, the backend is automatically deployed to Google Cloud Run, and the frontend is deployed to Firebase Hosting.

## Initial Setup Prerequisites

Before the automated workflows can run, you need to configure Secrets in your GitHub repository so that GitHub has permission to deploy on your behalf.

### 1. Configure Backend Secrets (Google Cloud)
1. In your Google Cloud Console, create a **Service Account** with the following roles:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin (for Container Registry/Artifact Registry)
2. Generate a JSON Key for this Service Account.
3. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Add the following **New repository secrets**:
   - `GCP_PROJECT_ID`: Your Google Cloud Project ID (e.g., `reviewiq-production-123`).
   - `GCP_CREDENTIALS`: Paste the entire content of the JSON Key you downloaded in step 2.

### 2. Configure Frontend Secrets (Firebase)
1. On your local machine, run `firebase login:ci` in your terminal. This will open a browser window to authenticate.
2. The CLI will output a token (a long string of characters).
3. Go back to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Add the following **New repository secret**:
   - `FIREBASE_SERVICE_ACCOUNT`: Paste the token generated from the CLI.

---

## How It Works

You do not need to run any manual deployment commands. 

- **Backend Updates**: If you modify any files inside the `backend/` directory and push to the `main` branch, the `.github/workflows/cloud-run-deploy.yml` action will trigger. It builds the Docker container and deploys it live to Cloud Run.
- **Frontend Updates**: If you modify any files inside the `frontend/` directory and push to the `main` branch, the `.github/workflows/firebase-deploy.yml` action will trigger. It builds the Vite app and deploys it live to Firebase Hosting.

You can monitor the status of your deployments in the **Actions** tab of your GitHub repository.
