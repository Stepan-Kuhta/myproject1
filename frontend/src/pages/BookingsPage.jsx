import { useEffect, useState } from "react";
import { getRooms, getGuests, createBooking, getBookings, updateBooking, deleteBooking } from "../api/api";

export default function BookingPage() {
    const [rooms, setRooms] = useState([]);
    const [guests, setGuests] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedGuests, setSelectedGuests] = useState([]);
    const [bookingDates, setBookingDates] = useState({
        check_in_date: "",
        check_out_date: ""
    });
    const [actionType, setActionType] = useState("");
    const [editingBooking, setEditingBooking] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);

    // Фиксированные цены для каждого типа номера
    const roomPrices = {
        "стандарт": 3000,
        "улучшенный": 4500,
        "люкс": 7000,
        "апартаменты": 10000
    };

    // Загрузка данных
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (bookingDates.check_in_date && bookingDates.check_out_date && selectedRoom) {
            calculatePrice();
        }
    }, [bookingDates, selectedRoom]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [roomsData, guestsData, bookingsData] = await Promise.all([
                getRooms(),
                getGuests(),
                getBookings()
            ]);
            setRooms(roomsData);
            setGuests(guestsData);
            setBookings(bookingsData);
        } catch (err) {
            alert("Ошибка загрузки данных: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = () => {
        if (!selectedRoom || !bookingDates.check_in_date || !bookingDates.check_out_date) return;

        const startDate = new Date(bookingDates.check_in_date);
        const endDate = new Date(bookingDates.check_out_date);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const roomCategory = selectedRoom.category.toLowerCase();
        const dailyPrice = roomPrices[roomCategory] || 0;
        
        setTotalPrice(dailyPrice * diffDays);
    };

    // Получение статуса номера
    const getRoomStatus = (room) => {
        const activeBooking = bookings.find(b => 
            b.room_id === room.id && 
            b.status !== "checked_out"
        );

        if (!activeBooking) return { status: "available", booking: null };

        // Получаем информацию о всех гостях
        const allGuestIds = activeBooking.guest_ids || [activeBooking.main_guest_id];
        const guestNames = allGuestIds.map(id => {
            const guest = guests.find(g => g.id === id);
            return guest ? guest.name : "Неизвестный гость";
        });

        return {
            status: activeBooking.status === "confirmed" ? "booked" : "occupied",
            booking: activeBooking,
            guestNames
        };
    };

    // Валидация данных
    const validateBooking = () => {
        const newErrors = {};
        const today = new Date().toISOString().split('T')[0];

        if (!bookingDates.check_in_date) {
            newErrors.check_in_date = "Укажите дату заезда";
        } else if (bookingDates.check_in_date < today) {
            newErrors.check_in_date = "Дата заезда не может быть в прошлом";
        }

        if (!bookingDates.check_out_date) {
            newErrors.check_out_date = "Укажите дату выезда";
        } else if (bookingDates.check_out_date <= bookingDates.check_in_date) {
            newErrors.check_out_date = "Дата выезда должна быть после даты заезда";
        }

        if (selectedGuests.length === 0) {
            newErrors.guests = "Выберите хотя бы одного гостя";
        } else if (selectedGuests.length > selectedRoom.capacity) {
            newErrors.guests = `Превышена вместимость номера (макс: ${selectedRoom.capacity})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Обработка бронирования/заселения
    const handleBookingAction = async () => {
        if (!validateBooking()) return;

        try {
            const bookingData = {
                room_id: selectedRoom.id,
                main_guest_id: selectedGuests[0],
                check_in_date: bookingDates.check_in_date,
                check_out_date: bookingDates.check_out_date,
                status: actionType === "booking" ? "confirmed" : "checked_in",
                price: totalPrice,
                guest_ids: selectedGuests
            };

            if (editingBooking) {
                await updateBooking(editingBooking.id, bookingData);
                alert("Бронирование успешно обновлено!");
            } else {
                await createBooking(bookingData);
                alert(actionType === "booking" 
                    ? "Номер успешно забронирован!" 
                    : "Гости успешно заселены!");
            }
            
            resetForm();
            await loadData();
        } catch (err) {
            alert("Ошибка: " + err.message);
        }
    };

    // Обработка выселения
    const handleCheckout = async (bookingId) => {
        if (!window.confirm("Вы уверены, что хотите выселить гостей из этого номера?")) return;

        try {
            await updateBooking(bookingId, { status: "checked_out" });
            alert("Гости успешно выселены!");
            await loadData();
        } catch (err) {
            alert("Ошибка выселения: " + err.message);
        }
    };

    // Обработка отмены бронирования
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Вы уверены, что хотите отменить это бронирование?")) return;

        try {
            await deleteBooking(bookingId);
            alert("Бронирование успешно отменено!");
            await loadData();
        } catch (err) {
            alert("Ошибка отмены бронирования: " + err.message);
        }
    };

    // Обработка заселения (подтверждение брони)
    const handleCheckin = async (bookingId) => {
        if (!window.confirm("Подтвердить заселение гостей?")) return;

        try {
            await updateBooking(bookingId, { status: "checked_in" });
            alert("Гости успешно заселены!");
            await loadData();
        } catch (err) {
            alert("Ошибка заселения: " + err.message);
        }
    };

    const resetForm = () => {
        setSelectedRoom(null);
        setSelectedGuests([]);
        setBookingDates({
            check_in_date: "",
            check_out_date: ""
        });
        setActionType("");
        setEditingBooking(null);
        setErrors({});
        setTotalPrice(0);
    };

    // Отображение информации о номере
    const renderRoomInfo = (room) => {
        const { status, booking, guestNames } = getRoomStatus(room);
        const statusText = {
            available: "Доступен",
            booked: "Забронирован",
            occupied: "Занят"
        }[status];

        const roomCategory = room.category.toLowerCase();
        const dailyPrice = roomPrices[roomCategory] || 0;

        return (
            <div style={{ 
                padding: "10px", 
                border: "1px solid #ddd", 
                borderRadius: "4px",
                backgroundColor: status === "available" ? "#f0fff0" : 
                              status === "booked" ? "#fffaf0" : "#fff0f0",
                marginBottom: "10px"
            }}>
                <h4>№{room.room_number} - {room.category}</h4>
                <p>Вместимость: {room.capacity} {room.has_child_bed && " | Детская кровать"}</p>
                <p>Цена за сутки: {dailyPrice} руб.</p>
                <p>Статус: <strong>{statusText}</strong></p>
                
                {booking && (
                    <div style={{ marginTop: "10px" }}>
                        <p>Гости: {guestNames.join(", ")}</p>
                        <p>Дата заезда: {new Date(booking.check_in_date).toLocaleDateString()}</p>
                        <p>Дата выезда: {new Date(booking.check_out_date).toLocaleDateString()}</p>
                        <p>Общая стоимость: {booking.price} руб.</p>
                        
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                            {status === "occupied" ? (
                                <button 
                                    onClick={() => handleCheckout(booking.id)}
                                    style={{ 
                                        backgroundColor: "#ff6b6b",
                                        color: "white",
                                        padding: "5px 10px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Выселить
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => handleCancelBooking(booking.id)}
                                        style={{ 
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            padding: "5px 10px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Отменить
                                    </button>
                                    <button 
                                        onClick={() => handleCheckin(booking.id)}
                                        style={{ 
                                            backgroundColor: "#28a745",
                                            color: "white",
                                            padding: "5px 10px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Заселить
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                {status === "available" && (
                    <div style={{ marginTop: "10px" }}>
                        <button 
                            onClick={() => {
                                setSelectedRoom(room);
                                setActionType("booking");
                            }}
                            style={{ 
                                backgroundColor: "#4CAF50",
                                color: "white",
                                padding: "5px 10px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginRight: "10px"
                            }}
                        >
                            Забронировать
                        </button>
                        <button 
                            onClick={() => {
                                setSelectedRoom(room);
                                setActionType("checkin");
                            }}
                            style={{ 
                                backgroundColor: "#2196F3",
                                color: "white",
                                padding: "5px 10px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Заселить
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Модальное окно бронирования/заселения
    const renderBookingModal = () => {
        if (!selectedRoom) return null;

        const roomCategory = selectedRoom.category.toLowerCase();
        const dailyPrice = roomPrices[roomCategory] || 0;

        return (
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "500px",
                    maxWidth: "90%"
                }}>
                    <h3>
                        {actionType === "booking" ? "Бронирование номера" : 
                         actionType === "checkin" ? "Заселение в номер" : 
                         "Редактирование бронирования"}
                    </h3>
                    <p>Номер: {selectedRoom.room_number} ({selectedRoom.category})</p>
                    <p>Вместимость: {selectedRoom.capacity} чел.</p>
                    <p>Цена за сутки: {dailyPrice} руб.</p>
                    
                    <div style={{ margin: "15px 0" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>
                            Дата заезда:
                            <input
                                type="date"
                                value={bookingDates.check_in_date}
                                onChange={(e) => setBookingDates({
                                    ...bookingDates,
                                    check_in_date: e.target.value
                                })}
                                style={{ 
                                    width: "100%", 
                                    padding: "8px",
                                    marginTop: "5px"
                                }}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </label>
                        {errors.check_in_date && (
                            <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.check_in_date}</p>
                        )}
                    </div>
                    
                    <div style={{ margin: "15px 0" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>
                            Дата выезда:
                            <input
                                type="date"
                                value={bookingDates.check_out_date}
                                onChange={(e) => setBookingDates({
                                    ...bookingDates,
                                    check_out_date: e.target.value
                                })}
                                style={{ 
                                    width: "100%", 
                                    padding: "8px",
                                    marginTop: "5px"
                                }}
                                min={bookingDates.check_in_date || new Date().toISOString().split('T')[0]}
                            />
                        </label>
                        {errors.check_out_date && (
                            <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.check_out_date}</p>
                        )}
                    </div>
                    
                    <div style={{ margin: "15px 0" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>
                            Выберите гостей (макс: {selectedRoom.capacity}):
                        </label>
                        <div style={{ 
                            maxHeight: "200px", 
                            overflowY: "auto",
                            border: "1px solid #ddd",
                            padding: "10px"
                        }}>
                            {guests.map(guest => (
                                <div key={guest.id} style={{ marginBottom: "5px" }}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedGuests.includes(guest.id)}
                                            onChange={() => {
                                                if (selectedGuests.includes(guest.id)) {
                                                    setSelectedGuests(selectedGuests.filter(id => id !== guest.id));
                                                } else {
                                                    if (selectedGuests.length < selectedRoom.capacity) {
                                                        setSelectedGuests([...selectedGuests, guest.id]);
                                                    }
                                                }
                                            }}
                                            disabled={
                                                !selectedGuests.includes(guest.id) && 
                                                selectedGuests.length >= selectedRoom.capacity
                                            }
                                        />
                                        {guest.name} (тел: {guest.phone})
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.guests && (
                            <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.guests}</p>
                        )}
                    </div>

                    {totalPrice > 0 && (
                        <div style={{ 
                            margin: "15px 0",
                            padding: "10px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "4px"
                        }}>
                            <h4>Стоимость проживания:</h4>
                            <p>Цена за сутки: {dailyPrice} руб.</p>
                            <p>Количество дней: {Math.ceil((new Date(bookingDates.check_out_date) - new Date(bookingDates.check_in_date)) / (1000 * 60 * 60 * 24))}</p>
                            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Итого: {totalPrice} руб.</p>
                        </div>
                    )}
                    
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                            onClick={resetForm}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#f0f0f0",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleBookingAction}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            {actionType === "booking" ? "Подтвердить бронь" : 
                             actionType === "checkin" ? "Заселить" : "Сохранить изменения"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div style={{ 
            backgroundColor: 'white',
            padding: '1rem',
        }}>
            <h2 style={{ marginTop: 30 }}>Бронирование и заселение</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
                {rooms.map(room => (
                    <div key={room.id}>
                        {renderRoomInfo(room)}
                    </div>
                ))}
            </div>
            
            {renderBookingModal()}
        </div>
    );
}