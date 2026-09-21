# ReviewIQ — Turn Customer Reviews into Intelligence

ReviewIQ is a full-stack SaaS platform designed to help businesses monitor, analyze, and extract actionable intelligence from their customer reviews and complaints. With real-time dashboards and intelligent sentiment analysis, businesses can turn unstructured feedback into clear metrics.

## 🚀 Key Features

- **Executive Dashboard:** Get a bird's eye view of total reviews, positive/negative breakdowns, and high-priority complaints.
- **Sentiment Analysis:** Visualize customer sentiment distributions across all feedback channels dynamically.
- **Real-time Data Fetching:** Experience instantaneous dashboard loads with local data caching and background synchronization.
- **Mobile-First Design:** Fully responsive interface featuring a sleek mobile slide-out drawer, ensuring you can track your business on the go.
- **Premium UX/UI:** Buttery-smooth page transitions, staggered spring animations, and dynamic charts powered by Framer Motion.
- **Secure Authentication:** Robust user authentication with native `bcrypt` password hashing and JWT token handling.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling and responsiveness
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for fluid, 60fps UI animations and route transitions
- **State & Data Fetching:** [@tanstack/react-query](https://tanstack.com/query/v5) for powerful asynchronous state management, caching, and instant hydration
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Deployment:** Vercel

### Backend (API)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11)
- **Database ORM:** SQLAlchemy 2.0
- **Database Provider:** [Neon Serverless PostgreSQL](https://neon.tech/)
- **Authentication:** JWT (JSON Web Tokens) with direct `bcrypt` password hashing
- **Deployment:** Render (Dockerized environment with Gunicorn/Uvicorn workers)

---

## 🏃‍♂️ Getting Started Locally

ReviewIQ is structured as a monorepo containing both the `frontend` and `backend`.

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- A Neon PostgreSQL database URL

### 1. Backend Setup
Navigate to the backend directory and set up a virtual environment:
```bash
cd backend
python -m venv .venv

# On Windows
.venv\Scripts\activate
# On Mac/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with the following variables:
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&channel_binding=require"
SECRET_KEY="your-super-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="1440"
CORS_ORIGINS="http://localhost:5173,https://your-frontend-domain.vercel.app"
```

Start the FastAPI development server:
```bash
uvicorn app.main:app --reload
```
The API will be running at `http://localhost:8000`.

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend

# Install dependencies
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:8000/api/v1"
```

Start the Vite development server:
```bash
npm run dev
```
The web application will be running at `http://localhost:5173`.

---

## 📦 Deployment Architecture

- **Frontend (Vercel):** The React frontend is deployed automatically on Vercel upon pushing to the `main` branch. It utilizes Vercel's global edge network for lightning-fast asset delivery.
- **Backend (Render):** The FastAPI backend is dockerized and deployed on Render. It handles the API routes and directly communicates with the Neon Database. Render is configured to auto-deploy on `main` branch pushes.

## 🔒 Security Notes
- Passwords are hashed using the modern `bcrypt` algorithm.
- Database connections enforce SSL (`sslmode=require`).
- CORS is strictly configured to only allow requests from the designated frontend domains.
