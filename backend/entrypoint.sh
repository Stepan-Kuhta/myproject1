#!/bin/bash

echo "Ожидание PostgreSQL..."
for i in {1..30}; do
    if PGPASSWORD=$DB_PASSWORD psql -h db -U $DB_USER -d $DB_NAME -c "SELECT 1" >/dev/null 2>&1; then
        echo "PostgreSQL готов!"
        break
    fi
    echo "Попытка $i/30: PostgreSQL еще не готов..."
    sleep 1
done

# Просто запускаем приложение, оно само создаст таблицы
exec python app.py



# #!/bin/bash

# # Ждем пока PostgreSQL будет готов (до 30 секунд)
# echo "Ожидание PostgreSQL..."
# for i in {1..30}; do
#     if PGPASSWORD=$DB_PASSWORD psql -h db -U $DB_USER -d $DB_NAME -c "SELECT 1" >/dev/null 2>&1; then
#         echo "PostgreSQL готов!"
#         break
#     fi
#     echo "Попытка $i/30: PostgreSQL еще не готов..."
#     sleep 1
# done

# # Применяем миграции
# flask db upgrade

# # Запускаем приложение
# exec python app.py