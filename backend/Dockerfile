FROM python:3.11-bullseye
WORKDIR /app
COPY . /app
RUN pip install --upgrade pip && pip install -r requirements.txt
EXPOSE 5000
COPY .env /app/.env
COPY swapaholic-8672c-firebase-adminsdk-798x0-6ef8889d26.json /app/swapaholic-8672c-firebase-adminsdk-798x0-6ef8889d26.json
ENV FLASK_APP app.py
ENV FLASK_RUN_HOST 0.0.0.0
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]