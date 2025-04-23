FROM python:3.11-slim

WORKDIR /app

# Сначала копируем только requirements.txt для кэширования
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Затем копируем остальные файлы
COPY . .

# Устанавливаем dos2unix и обрабатываем entrypoint.sh
RUN apt update && apt install -y postgresql-client dos2unix && \
    dos2unix /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]