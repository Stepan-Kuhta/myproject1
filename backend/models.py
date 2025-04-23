from flask_sqlalchemy import SQLAlchemy
from database import db

class Guest(db.Model):
    __tablename__ = 'guests'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), nullable=True)
    passport_series = db.Column(db.String(4), nullable=True, unique=True)
    passport_number = db.Column(db.String(6), nullable=True, unique=True)

class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    room_number = db.Column(db.String(10), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    has_child_bed = db.Column(db.Boolean, nullable=False, default=False)

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    main_guest_id = db.Column(db.Integer, db.ForeignKey('guests.id'), nullable=False)
    check_in_date = db.Column(db.Date, nullable=False)
    check_out_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='pending', nullable=False)
    discount = db.Column(db.Numeric(5, 2), nullable=False, default=0.00)

    room = db.relationship('Room', backref=db.backref('bookings', lazy=True))
    main_guest = db.relationship('Guest', backref=db.backref('main_bookings', lazy=True))

class BookingGuest(db.Model):
    __tablename__ = 'bookingGuests'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    guest_id = db.Column(db.Integer, db.ForeignKey('guests.id'), nullable=False)

    booking = db.relationship('Booking', backref=db.backref('booking_guests', lazy=True))
    guest = db.relationship('Guest', backref=db.backref('booking_guests', lazy=True))

class Price(db.Model):
    __tablename__ = 'prices'

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    day_of_week = db.Column(db.String(15), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    room = db.relationship('Room', backref=db.backref('prices', lazy=True))

class Discount(db.Model):
    __tablename__ = 'discounts'

    id = db.Column(db.Integer, primary_key=True)
    min_days = db.Column(db.Integer, nullable=False)
    max_days = db.Column(db.Integer, nullable=False)
    discount_percent = db.Column(db.Numeric(5, 2), nullable=False)

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), nullable=False)

    booking = db.relationship('Booking', backref=db.backref('payments', lazy=True))
