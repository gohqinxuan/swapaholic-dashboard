FROM python:3.11-bullseye
WORKDIR /app
COPY . /app
RUN pip install --upgrade pip && pip install -r requirements.txt
EXPOSE 5000
COPY .env /app/.env
ENV FLASK_APP app.py
ENV FLASK_RUN_HOST 0.0.0.0
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
