from flask import Flask, jsonify, request
from config import Config
from database import db, init_db
from models import Guest, Room, Booking, BookingGuest, Price, Discount, Payment
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError, DataError
from datetime import datetime
from sqlalchemy import and_, or_

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

init_db(app)

@app.route('/')
def home():
    return "Добро пожаловать в API отеля!"

# ------- Guests -------
@app.route('/guests', methods=['GET', 'POST'])
def guests():
    if request.method == 'GET':
        guests = Guest.query.all()
        return jsonify([{"id": g.id, "name": g.name, "phone": g.phone, "email": g.email, 
                        "passport_number": g.passport_number, "passport_series": g.passport_series} 
                       for g in guests])
    
    data = request.get_json()
    
    # Проверка на уникальность паспортных данных
    if data.get('passport_series') or data.get('passport_number'):
        existing_guest = Guest.query.filter(
            (Guest.passport_series == data.get('passport_series')) &
            (Guest.passport_number == data.get('passport_number'))
        ).first()
        if existing_guest:
            return jsonify({"error": "Гость с такими паспортными данными уже существует"}), 400
    
    try:
        guest = Guest(**data)
        db.session.add(guest)
        db.session.commit()
        return jsonify({
            "id": guest.id,
            "name": guest.name,
            "phone": guest.phone,
            "email": guest.email,
            "passport_series": guest.passport_series,
            "passport_number": guest.passport_number
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Паспортные данные должны быть уникальными"}), 400


@app.route('/guests/<int:guest_id>', methods=['GET', 'PUT', 'DELETE'])
def guest(guest_id):
    guest = Guest.query.get(guest_id)
    if not guest:
        return jsonify({"error": "Гость не найден"}), 404

    if request.method == 'GET':
        return jsonify(vars(guest))

    if request.method == 'PUT':
        data = request.get_json()
        
        # Проверка на уникальность паспортных данных
        if 'passport_series' in data or 'passport_number' in data:
            new_series = data.get('passport_series', guest.passport_series)
            new_number = data.get('passport_number', guest.passport_number)
            
            existing_guest = Guest.query.filter(
                (Guest.passport_series == new_series) &
                (Guest.passport_number == new_number) &
                (Guest.id != guest_id)
            ).first()
            
            if existing_guest:
                return jsonify({"error": "Гость с такими паспортными данными уже существует"}), 400

        try:
            for key, value in data.items():
                setattr(guest, key, value)
            db.session.commit()
            return jsonify({"message": "Гость обновлен"}), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Паспортные данные должны быть уникальными"}), 400

    db.session.delete(guest)
    db.session.commit()
    return jsonify({"message": "Гость удален"}), 200

@app.route('/rooms', methods=['GET', 'POST'])
def rooms():
    if request.method == 'GET':
        try:
            rooms = Room.query.all()
            return jsonify([{
                'id': r.id,
                'room_number': r.room_number,
                'category': r.category,
                'capacity': r.capacity,
                'has_child_bed': r.has_child_bed
            } for r in rooms])
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # Обработка POST-запроса
    data = request.get_json()
    try:
        room = Room(
            room_number=data['room_number'],
            category=data['category'],
            capacity=data['capacity'],
            has_child_bed=data.get('has_child_bed', False)
        )
        db.session.add(room)
        db.session.commit()
        return jsonify({
            'id': room.id,
            'room_number': room.room_number,
            'category': room.category,
            'capacity': room.capacity,
            'has_child_bed': room.has_child_bed
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/rooms/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Номер не найден"}), 404

    # Удаляем все связанные бронирования
    Booking.query.filter_by(room_id=room_id).delete()
    db.session.commit()

    # Теперь удаляем сам номер
    db.session.delete(room)
    db.session.commit()

    return jsonify({"message": "Номер удален и связанные бронирования удалены"}), 200

@app.route('/rooms/<int:room_id>', methods=['GET', 'PUT'])
def room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Номер не найден"}), 404

    if request.method == 'GET':
        return jsonify(vars(room))

    if request.method == 'PUT':
        for key, value in request.get_json().items():
            setattr(room, key, value)
        db.session.commit()
        return jsonify({"message": "Номер обновлен"}), 200

    db.session.delete(room)
    db.session.commit()
    return jsonify({"message": "Номер удален"}), 200

# ------- Bookings -------
@app.route('/bookings', methods=['GET', 'POST'])
def bookings():
    if request.method == 'GET':
        bookings = Booking.query.all()
        return jsonify([{
            'id': b.id,
            'room_id': b.room_id,
            'main_guest_id': b.main_guest_id,
            'check_in_date': b.check_in_date,
            'check_out_date': b.check_out_date,
            'status': b.status,
            'discount': float(b.discount) if b.discount else 0.0,
            'price': float(b.price) if b.price else 0.0
        } for b in bookings])

    # Для POST-запроса
    data = request.get_json()
    if 'price' not in data:
        data['price'] = 0.00  # Устанавливаем значение по умолчанию, если цена не указана
        
    booking = Booking(**data)
    db.session.add(booking)
    db.session.commit()
    return jsonify({"id": booking.id}), 201
@app.route('/bookings/<int:booking_id>', methods=['GET', 'PUT', 'DELETE'])
def booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Бронирование не найдено"}), 404

    if request.method == 'GET':
        return jsonify({
            'id': booking.id,
            'room_id': booking.room_id,
            'main_guest_id': booking.main_guest_id,
            'check_in_date': booking.check_in_date,
            'check_out_date': booking.check_out_date,
            'status': booking.status,
            'discount': float(booking.discount) if booking.discount else 0.0,
            'price': float(booking.price) if booking.price else 0.0
        })

    if request.method == 'PUT':
        data = request.get_json()
        if 'price' not in data:
            data['price'] = booking.price  # Сохраняем текущее значение, если новое не указано
            
        for key, value in data.items():
            setattr(booking, key, value)
        db.session.commit()
        return jsonify({"message": "Бронирование обновлено"}), 200

    db.session.delete(booking)
    db.session.commit()
    return jsonify({"message": "Бронирование удалено"}), 200

# ------- BookingGuest -------
@app.route('/booking-guests', methods=['GET', 'POST'])
def booking_guests():
    if request.method == 'GET':
        bg = BookingGuest.query.all()
        return jsonify([vars(b) for b in bg])

    record = BookingGuest(**request.get_json())
    db.session.add(record)
    db.session.commit()
    return jsonify({"id": record.id}), 201

@app.route('/booking-guests/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def booking_guest(id):
    record = BookingGuest.query.get(id)
    if not record:
        return jsonify({"error": "Запись не найдена"}), 404

    if request.method == 'GET':
        return jsonify(vars(record))

    if request.method == 'PUT':
        for key, value in request.get_json().items():
            setattr(record, key, value)
        db.session.commit()
        return jsonify({"message": "Запись обновлена"}), 200

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Запись удалена"}), 200

# ------- Prices -------
@app.route('/prices', methods=['GET', 'POST'])
def prices():
    if request.method == 'GET':
        prices = Price.query.all()
        return jsonify([vars(p) for p in prices])

    price = Price(**request.get_json())
    db.session.add(price)
    db.session.commit()
    return jsonify({"id": price.id}), 201

@app.route('/prices/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def price(id):
    price = Price.query.get(id)
    if not price:
        return jsonify({"error": "Цена не найдена"}), 404

    if request.method == 'GET':
        return jsonify(vars(price))

    if request.method == 'PUT':
        for key, value in request.get_json().items():
            setattr(price, key, value)
        db.session.commit()
        return jsonify({"message": "Цена обновлена"}), 200

    db.session.delete(price)
    db.session.commit()
    return jsonify({"message": "Цена удалена"}), 200

# ------- Discounts -------
@app.route('/discounts', methods=['GET', 'POST'])
def discounts():
    if request.method == 'GET':
        discounts = Discount.query.all()
        return jsonify([vars(d) for d in discounts])

    discount = Discount(**request.get_json())
    db.session.add(discount)
    db.session.commit()
    return jsonify({"id": discount.id}), 201

@app.route('/discounts/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def discount(id):
    discount = Discount.query.get(id)
    if not discount:
        return jsonify({"error": "Скидка не найдена"}), 404

    if request.method == 'GET':
        return jsonify(vars(discount))

    if request.method == 'PUT':
        for key, value in request.get_json().items():
            setattr(discount, key, value)
        db.session.commit()
        return jsonify({"message": "Скидка обновлена"}), 200

    db.session.delete(discount)
    db.session.commit()
    return jsonify({"message": "Скидка удалена"}), 200

# ------- Payments -------
@app.route('/payments', methods=['GET', 'POST'])
def payments():
    if request.method == 'GET':
        payments = Payment.query.all()
        return jsonify([vars(p) for p in payments])

    payment = Payment(**request.get_json())
    db.session.add(payment)
    db.session.commit()
    return jsonify({"id": payment.id}), 201

@app.route('/payments/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def payment(id):
    payment = Payment.query.get(id)
    if not payment:
        return jsonify({"error": "Платёж не найден"}), 404

    if request.method == 'GET':
        return jsonify(vars(payment))

    if request.method == 'PUT':
        for key, value in request.get_json().items():
            setattr(payment, key, value)
        db.session.commit()
        return jsonify({"message": "Платёж обновлён"}), 200

    db.session.delete(payment)
    db.session.commit()
    return jsonify({"message": "Платёж удалён"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
