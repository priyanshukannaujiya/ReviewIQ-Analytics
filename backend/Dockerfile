FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run migrations (non-fatal) then start server
CMD ["sh", "-c", "alembic upgrade head || echo 'Migration step skipped, starting server anyway' && gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:${PORT:-8000} --timeout 120"]
