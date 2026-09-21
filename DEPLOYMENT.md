# Deploying ReviewIQ (Render + Vercel + Neon)

This guide provides instructions to deploy the ReviewIQ monorepo architecture:
- **Frontend**: Vercel
- **Backend**: Render (Docker)
- **Database**: Neon (PostgreSQL)

## 1. Prerequisites
- A GitHub repository containing this codebase.
- Accounts on [Render](https://render.com), [Vercel](https://vercel.com), and [Neon](https://neon.tech).

## 2. Database Configuration (Neon)
1. In your Neon dashboard, get your PostgreSQL Connection String.
2. Note this string down as `DATABASE_URL`. It should look like `postgresql+psycopg://user:pass@host/dbname?sslmode=require`.

## 3. Backend Deployment (Render)
Render is configured via Infrastructure-as-Code using the `render.yaml` file located in the root of the project.

1. Go to your Render Dashboard -> Click **New** -> **Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` file and create a new Web Service for the backend.
4. During setup, Render will prompt you to enter the environment variables defined in the yaml file:
   - `DATABASE_URL`: Paste your Neon connection string.
   - `CORS_ORIGINS`: Temporarily put `*` or `http://localhost:5173`. We will change this to the Vercel URL later.
   - `SECRET_KEY`: Generate a random secure string (e.g., via `openssl rand -hex 32`).
5. Click **Apply**. Render will build the Docker container and start the FastAPI service.
6. Once deployed, copy the **Render URL** (e.g., `https://reviewiq-backend-xxxx.onrender.com`).

## 4. Frontend Deployment (Vercel)
Vercel has native support for Vite React applications.

1. Go to your Vercel Dashboard -> Click **Add New** -> **Project**.
2. Import this GitHub repository.
3. In the configuration screen, set the **Root Directory** to `frontend`.
4. Vercel will automatically detect the framework as Vite.
5. Expand the **Environment Variables** section and add:
   - Name: `VITE_API_URL`
   - Value: `[YOUR RENDER URL]/api` (e.g., `https://reviewiq-backend-xxxx.onrender.com/api`)
6. Click **Deploy**.
7. Once deployed, copy the **Vercel URL** (e.g., `https://reviewiq.vercel.app`).

## 5. Finalizing CORS (Important)
To secure the backend and allow the frontend to communicate with it, you must update the CORS settings in Render.

1. Go back to the Render Dashboard -> Select your Web Service.
2. Go to **Environment**.
3. Update the `CORS_ORIGINS` variable to point to your new Vercel URL:
   - Value: `[YOUR VERCEL URL],http://localhost:5173` (e.g., `https://reviewiq.vercel.app,http://localhost:5173`)
4. Save the changes. Render will automatically restart the backend with the correct CORS configuration.

## 6. Architecture Map
- **Vercel (React Frontend)** -> calls `VITE_API_URL` -> **Render (FastAPI Backend)**
- **Render (FastAPI Backend)** -> calls `DATABASE_URL` -> **Neon (PostgreSQL Database)**

You are now live!
