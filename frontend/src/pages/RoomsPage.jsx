import { useEffect, useState } from "react";
import { getRooms, createRoom, updateRoom, deleteRoom } from "../api/api";

const ROOM_CATEGORIES = [
    "Стандарт",
    "Стандарт Улучшенный",
    "Полулюкс",
    "Люкс",
    "Делюкс",
    "Семейный",
    "Бизнес",
    "Президентский"
];

export default function RoomsPage() {
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState({
        room_number: "",
        category: ROOM_CATEGORIES[0],
        capacity: "",
        has_child_bed: false
    });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        room_number: "",
        category: ROOM_CATEGORIES[0],
        capacity: "",
        has_child_bed: false
    });
    const [errors, setErrors] = useState({
        room_number: ""
    });

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const roomsData = await getRooms();
            setRooms(roomsData);
        } catch (err) {
            alert("Ошибка загрузки номеров: " + err.message);
        }
    };

    const validateRoomNumber = (number, editingId = null) => {
        const isDuplicate = rooms.some(
            room => room.room_number.toLowerCase() === number.toLowerCase() && 
                   room.id !== editingId
        );
        
        if (isDuplicate) {
            setErrors(prev => ({...prev, room_number: "Номер комнаты уже существует"}));
            return false;
        }
        
        if (!number.trim()) {
            setErrors(prev => ({...prev, room_number: "Введите номер комнаты"}));
            return false;
        }
        
        setErrors(prev => ({...prev, room_number: ""}));
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateRoomNumber(newRoom.room_number)) return;
        
        try {
            await createRoom({
                ...newRoom,
                capacity: parseInt(newRoom.capacity)
            });
            await loadRooms();
            setNewRoom({
                room_number: "",
                category: ROOM_CATEGORIES[0],
                capacity: "",
                has_child_bed: false
            });
        } catch (err) {
            alert("Ошибка добавления: " + err.message);
        }
    };

    const startEditing = (room) => {
        setEditingId(room.id);
        setEditForm({
            room_number: room.room_number,
            category: room.category,
            capacity: room.capacity,
            has_child_bed: room.has_child_bed
        });
        setErrors({room_number: ""});
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        
        if (!validateRoomNumber(editForm.room_number, id)) return;
        
        try {
            await updateRoom(id, {
                ...editForm,
                capacity: parseInt(editForm.capacity)
            });
            setEditingId(null);
            await loadRooms();
        } catch (err) {
            alert("Ошибка обновления: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этот номер?")) {
            try {
                await deleteRoom(id);
                await loadRooms();
            } catch (err) {
                alert("Ошибка удаления: " + err.message);
            }
        }
    };

    return (
        <div style={{ 
            backgroundColor: 'white',
            padding: '1rem',
        }}>
            <h2 style={{ marginTop: 30 }}>Управление номерами</h2>
            
            <h3>Добавить новый номер</h3>
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        placeholder="Номер комнаты" 
                        value={newRoom.room_number}
                        onChange={(e) => setNewRoom({...newRoom, room_number: e.target.value})}
                        onBlur={() => validateRoomNumber(newRoom.room_number)}
                        style={{ width: '100%' }}
                    />
                    {errors.room_number && (
                        <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
                            {errors.room_number}
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <select
                        value={newRoom.category}
                        onChange={(e) => setNewRoom({...newRoom, category: e.target.value})}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        {ROOM_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        placeholder="Вместимость" 
                        type="number"
                        min="1"
                        max="10"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                        style={{ width: '100%' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={newRoom.has_child_bed}
                            onChange={(e) => setNewRoom({...newRoom, has_child_bed: e.target.checked})}
                        />
                        Детская кровать
                    </label>
                </div>
                <button 
                    type="submit"
                    disabled={!!errors.room_number}
                >
                    Добавить номер
                </button>
            </form>

            <ul style={{ listStyleType: "none", padding: 0 }}>
                {rooms.map((room, index) => (
                    <li key={room.id} style={{ 
                        marginBottom: "10px", 
                        padding: "10px", 
                        border: "1px solid #ddd", 
                        borderRadius: "4px" 
                    }}>
                        {editingId === room.id ? (
                            <form onSubmit={(e) => handleEditSubmit(e, room.id)}>
                                <div style={{ marginBottom: '15px' }}>
                                    <input
                                        placeholder="Номер комнаты"
                                        value={editForm.room_number}
                                        onChange={(e) => setEditForm({...editForm, room_number: e.target.value})}
                                        onBlur={() => validateRoomNumber(editForm.room_number, room.id)}
                                        style={{ width: '100%' }}
                                    />
                                    {errors.room_number && (
                                        <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
                                            {errors.room_number}
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <select
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                        style={{ width: '100%', padding: '8px' }}
                                    >
                                        {ROOM_CATEGORIES.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <input
                                        placeholder="Вместимость"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={editForm.capacity}
                                        onChange={(e) => setEditForm({...editForm, capacity: e.target.value})}
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={editForm.has_child_bed}
                                            onChange={(e) => setEditForm({...editForm, has_child_bed: e.target.checked})}
                                        />
                                        Детская кровать
                                    </label>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!!errors.room_number}
                                    style={{ marginRight: '10px' }}
                                >
                                    Сохранить
                                </button>
                                <button type="button" onClick={() => setEditingId(null)}>Отмена</button>
                            </form>
                        ) : (
                            <div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <span style={{ marginRight: "10px", fontWeight: "bold" }}>{index + 1}.</span>
                                        №{room.room_number} - {room.category} (Вместимость: {room.capacity}) 
                                        {room.has_child_bed && " | Детская кровать"}
                                    </div>
                                    <div>
                                        <button 
                                            onClick={() => startEditing(room)} 
                                            style={{ marginRight: "5px" }}
                                        >
                                            Изменить
                                        </button>
                                        <button onClick={() => handleDelete(room.id)}>Удалить</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// import { useEffect, useState } from "react";
// import { getRooms, createRoom, updateRoom, deleteRoom } from "../api/api";

// // Список доступных категорий номеров
// const ROOM_CATEGORIES = [
//     "Стандарт",
//     "Стандарт Улучшенный",
//     "Полулюкс",
//     "Люкс",
//     "Делюкс",
//     "Семейный",
//     "Бизнес",
//     "Президентский"
// ];

// export default function RoomsPage() {
//     const [rooms, setRooms] = useState([]);
//     const [newRoom, setNewRoom] = useState({
//         room_number: "",
//         category: ROOM_CATEGORIES[0], // Устанавливаем первую категорию по умолчанию
//         capacity: "",
//         has_child_bed: false
//     });
//     const [editingId, setEditingId] = useState(null);
//     const [editForm, setEditForm] = useState({
//         room_number: "",
//         category: ROOM_CATEGORIES[0],
//         capacity: "",
//         has_child_bed: false
//     });

//     // Загрузка данных
//     useEffect(() => {
//         loadRooms();
//     }, []);

//     const loadRooms = async () => {
//         try {
//             const roomsData = await getRooms();
//             setRooms(roomsData);
//         } catch (err) {
//             alert("Ошибка загрузки номеров: " + err.message);
//         }
//     };

//     // Обработчики для комнат
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await createRoom({
//                 ...newRoom,
//                 capacity: parseInt(newRoom.capacity)
//             });
//             await loadRooms();
//             setNewRoom({
//                 room_number: "",
//                 category: ROOM_CATEGORIES[0],
//                 capacity: "",
//                 has_child_bed: false
//             });
//         } catch (err) {
//             alert("Ошибка добавления: " + err.message);
//         }
//     };

//     const startEditing = (room) => {
//         setEditingId(room.id);
//         setEditForm({
//             room_number: room.room_number,
//             category: room.category,
//             capacity: room.capacity,
//             has_child_bed: room.has_child_bed
//         });
//     };

//     const handleEditSubmit = async (e, id) => {
//         e.preventDefault();
//         try {
//             await updateRoom(id, {
//                 ...editForm,
//                 capacity: parseInt(editForm.capacity)
//             });
//             setEditingId(null);
//             await loadRooms();
//         } catch (err) {
//             alert("Ошибка обновления: " + err.message);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm("Вы уверены, что хотите удалить этот номер?")) {
//             try {
//                 await deleteRoom(id);
//                 await loadRooms();
//             } catch (err) {
//                 alert("Ошибка удаления: " + err.message);
//             }
//         }
//     };

//     return (
//         <div style={{ 
//             backgroundColor: 'white',
//             padding: '1rem',
//         }}>
//             <h2 style={{ marginTop: 30 }}>Управление номерами</h2>
            
//             {/* Форма добавления номера */}
//             <h3>Добавить новый номер</h3>
//             <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Номер комнаты" 
//                         value={newRoom.room_number}
//                         onChange={(e) => setNewRoom({...newRoom, room_number: e.target.value})}
//                         style={{ width: '100%' }}
//                         required
//                     />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <select
//                         value={newRoom.category}
//                         onChange={(e) => setNewRoom({...newRoom, category: e.target.value})}
//                         style={{ width: '100%', padding: '8px' }}
//                     >
//                         {ROOM_CATEGORIES.map(category => (
//                             <option key={category} value={category}>{category}</option>
//                         ))}
//                     </select>
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Вместимость" 
//                         type="number"
//                         min="1"
//                         max="10"
//                         value={newRoom.capacity}
//                         onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
//                         style={{ width: '100%' }}
//                         required
//                     />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <label>
//                         <input 
//                             type="checkbox" 
//                             checked={newRoom.has_child_bed}
//                             onChange={(e) => setNewRoom({...newRoom, has_child_bed: e.target.checked})}
//                         />
//                         Детская кровать
//                     </label>
//                 </div>
//                 <button type="submit">Добавить номер</button>
//             </form>

//             {/* Список номеров */}
//             <ul style={{ listStyleType: "none", padding: 0 }}>
//                 {rooms.map((room, index) => (
//                     <li key={room.id} style={{ 
//                         marginBottom: "10px", 
//                         padding: "10px", 
//                         border: "1px solid #ddd", 
//                         borderRadius: "4px" 
//                     }}>
//                         {editingId === room.id ? (
//                             <form onSubmit={(e) => handleEditSubmit(e, room.id)}>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Номер комнаты"
//                                         value={editForm.room_number}
//                                         onChange={(e) => setEditForm({...editForm, room_number: e.target.value})}
//                                         style={{ width: '100%' }}
//                                         required
//                                     />
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <select
//                                         value={editForm.category}
//                                         onChange={(e) => setEditForm({...editForm, category: e.target.value})}
//                                         style={{ width: '100%', padding: '8px' }}
//                                     >
//                                         {ROOM_CATEGORIES.map(category => (
//                                             <option key={category} value={category}>{category}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Вместимость"
//                                         type="number"
//                                         min="1"
//                                         max="10"
//                                         value={editForm.capacity}
//                                         onChange={(e) => setEditForm({...editForm, capacity: e.target.value})}
//                                         style={{ width: '100%' }}
//                                         required
//                                     />
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <label>
//                                         <input 
//                                             type="checkbox" 
//                                             checked={editForm.has_child_bed}
//                                             onChange={(e) => setEditForm({...editForm, has_child_bed: e.target.checked})}
//                                         />
//                                         Детская кровать
//                                     </label>
//                                 </div>
//                                 <button type="submit">Сохранить</button>
//                                 <button type="button" onClick={() => setEditingId(null)}>Отмена</button>
//                             </form>
//                         ) : (
//                             <div>
//                                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                                     <div>
//                                         <span style={{ marginRight: "10px", fontWeight: "bold" }}>{index + 1}.</span>
//                                         №{room.room_number} - {room.category} (Вместимость: {room.capacity}) 
//                                         {room.has_child_bed && " | Детская кровать"}
//                                     </div>
//                                     <div>
//                                         <button 
//                                             onClick={() => startEditing(room)} 
//                                             style={{ marginRight: "5px" }}
//                                         >
//                                             Изменить
//                                         </button>
//                                         <button onClick={() => handleDelete(room.id)}>Удалить</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// import { useEffect, useState } from "react";
// import { getRooms, createRoom, updateRoom, deleteRoom } from "../api/api";
// import { getGuests } from "../api/api";
// import { createBooking } from "../api/api";

// export default function RoomsPage() {
//     const [rooms, setRooms] = useState([]);
//     const [guests, setGuests] = useState([]);
//     const [newRoom, setNewRoom] = useState({
//         room_number: "",
//         category: "",
//         capacity: "",
//         has_child_bed: false
//     });
//     const [editingId, setEditingId] = useState(null);
//     const [editForm, setEditForm] = useState({
//         room_number: "",
//         category: "",
//         capacity: "",
//         has_child_bed: false
//     });
//     const [showBookingModal, setShowBookingModal] = useState(false);
//     const [selectedRoomId, setSelectedRoomId] = useState(null);
//     const [selectedGuests, setSelectedGuests] = useState([]);
//     const [bookingDates, setBookingDates] = useState({
//         check_in_date: "",
//         check_out_date: ""
//     });

//     // Загрузка данных
//     useEffect(() => {
//         loadRooms();
//         loadGuests();
//     }, []);

//     const loadRooms = async () => {
//         try {
//             const roomsData = await getRooms();
//             setRooms(roomsData);
//         } catch (err) {
//             alert("Ошибка загрузки номеров: " + err.message);
//         }
//     };

//     const loadGuests = async () => {
//         try {
//             const guestsData = await getGuests();
//             setGuests(guestsData);
//         } catch (err) {
//             alert("Ошибка загрузки гостей: " + err.message);
//         }
//     };

//     // Обработчики для комнат
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await createRoom({
//                 ...newRoom,
//                 capacity: parseInt(newRoom.capacity)
//             });
//             await loadRooms();
//             setNewRoom({
//                 room_number: "",
//                 category: "",
//                 capacity: "",
//                 has_child_bed: false
//             });
//         } catch (err) {
//             alert("Ошибка добавления: " + err.message);
//         }
//     };

//     const startEditing = (room) => {
//         setEditingId(room.id);
//         setEditForm({
//             room_number: room.room_number,
//             category: room.category,
//             capacity: room.capacity,
//             has_child_bed: room.has_child_bed
//         });
//     };

//     const handleEditSubmit = async (e, id) => {
//         e.preventDefault();
//         try {
//             await updateRoom(id, {
//                 ...editForm,
//                 capacity: parseInt(editForm.capacity)
//             });
//             setEditingId(null);
//             await loadRooms();
//         } catch (err) {
//             alert("Ошибка обновления: " + err.message);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm("Вы уверены, что хотите удалить этот номер?")) {
//             try {
//                 await deleteRoom(id);
//                 await loadRooms();
//             } catch (err) {
//                 alert("Ошибка удаления: " + err.message);
//             }
//         }
//     };

//     // Обработчики для бронирования
//     const openBookingModal = (roomId) => {
//         setSelectedRoomId(roomId);
//         setShowBookingModal(true);
//         setSelectedGuests([]);
//         setBookingDates({
//             check_in_date: "",
//             check_out_date: ""
//         });
//     };

//     const toggleGuestSelection = (guestId) => {
//         setSelectedGuests(prev => 
//             prev.includes(guestId) 
//                 ? prev.filter(id => id !== guestId) 
//                 : [...prev, guestId]
//         );
//     };

//     const handleBookingSubmit = async (e) => {
//         e.preventDefault();
//         if (selectedGuests.length === 0) {
//             alert("Выберите хотя бы одного гостя");
//             return;
//         }

//         if (!bookingDates.check_in_date || !bookingDates.check_out_date) {
//             alert("Укажите даты заезда и выезда");
//             return;
//         }

//         try {
//             // Создаем бронирование
//             const booking = await createBooking({
//                 room_id: selectedRoomId,
//                 main_guest_id: selectedGuests[0],
//                 check_in_date: bookingDates.check_in_date,
//                 check_out_date: bookingDates.check_out_date,
//                 status: "confirmed"
//             });

//             // Здесь можно добавить логику для привязки других гостей к бронированию
//             // через BookingGuest если нужно

//             alert("Бронирование успешно создано!");
//             setShowBookingModal(false);
//         } catch (err) {
//             alert("Ошибка бронирования: " + err.message);
//         }
//     };

//     return (
//         <div style={{ 
//             backgroundColor: 'white',
//             padding: '1rem',
//         }}>
//             <h2 style={{ marginTop: 30 }}>Управление номерами</h2>
            
//             {/* Форма добавления номера */}
//             <h3>Добавить новый номер</h3>
//             <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Номер комнаты" 
//                         value={newRoom.room_number}
//                         onChange={(e) => setNewRoom({...newRoom, room_number: e.target.value})}
//                         style={{ width: '100%' }}
//                     />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Категория" 
//                         value={newRoom.category}
//                         onChange={(e) => setNewRoom({...newRoom, category: e.target.value})}
//                         style={{ width: '100%' }}
//                     />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Вместимость" 
//                         type="number"
//                         value={newRoom.capacity}
//                         onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
//                         style={{ width: '100%' }}
//                     />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <label>
//                         <input 
//                             type="checkbox" 
//                             checked={newRoom.has_child_bed}
//                             onChange={(e) => setNewRoom({...newRoom, has_child_bed: e.target.checked})}
//                         />
//                         Детская кровать
//                     </label>
//                 </div>
//                 <button type="submit">Добавить номер</button>
//             </form>

//             {/* Список номеров */}
//             <ul style={{ listStyleType: "none", padding: 0 }}>
//                 {rooms.map((room, index) => (
//                     <li key={room.id} style={{ 
//                         marginBottom: "10px", 
//                         padding: "10px", 
//                         border: "1px solid #ddd", 
//                         borderRadius: "4px" 
//                     }}>
//                         {editingId === room.id ? (
//                             <form onSubmit={(e) => handleEditSubmit(e, room.id)}>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Номер комнаты"
//                                         value={editForm.room_number}
//                                         onChange={(e) => setEditForm({...editForm, room_number: e.target.value})}
//                                         style={{ width: '100%' }}
//                                     />
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Категория"
//                                         value={editForm.category}
//                                         onChange={(e) => setEditForm({...editForm, category: e.target.value})}
//                                         style={{ width: '100%' }}
//                                     />
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Вместимость"
//                                         type="number"
//                                         value={editForm.capacity}
//                                         onChange={(e) => setEditForm({...editForm, capacity: e.target.value})}
//                                         style={{ width: '100%' }}
//                                     />
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <label>
//                                         <input 
//                                             type="checkbox" 
//                                             checked={editForm.has_child_bed}
//                                             onChange={(e) => setEditForm({...editForm, has_child_bed: e.target.checked})}
//                                         />
//                                         Детская кровать
//                                     </label>
//                                 </div>
//                                 <button type="submit">Сохранить</button>
//                                 <button type="button" onClick={() => setEditingId(null)}>Отмена</button>
//                             </form>
//                         ) : (
//                             <div>
//                                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                                     <div>
//                                         <span style={{ marginRight: "10px", fontWeight: "bold" }}>{index + 1}.</span>
//                                         №{room.room_number} - {room.category} (Вместимость: {room.capacity}) 
//                                         {room.has_child_bed && " | Детская кровать"}
//                                     </div>
//                                     <div>
//                                         <button 
//                                             onClick={() => openBookingModal(room.id)} 
//                                             style={{ marginRight: "5px" }}
//                                         >
//                                             Забронировать
//                                         </button>
//                                         <button 
//                                             onClick={() => startEditing(room)} 
//                                             style={{ marginRight: "5px" }}
//                                         >
//                                             Изменить
//                                         </button>
//                                         <button onClick={() => handleDelete(room.id)}>Удалить</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </li>
//                 ))}
//             </ul>

//             {/* Модальное окно бронирования */}
//             {showBookingModal && (
//                 <div style={{
//                     position: 'fixed',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     backgroundColor: 'rgba(0,0,0,0.5)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     zIndex: 1000
//                 }}>
//                     <div style={{
//                         backgroundColor: 'white',
//                         padding: '2rem',
//                         borderRadius: '4px',
//                         width: '600px',
//                         maxWidth: '90%'
//                     }}>
//                         <h3>Бронирование номера</h3>
                        
//                         <div style={{ marginBottom: '1rem' }}>
//                             <label style={{ display: 'block', marginBottom: '0.5rem' }}>Дата заезда:</label>
//                             <input 
//                                 type="date" 
//                                 value={bookingDates.check_in_date}
//                                 onChange={(e) => setBookingDates({...bookingDates, check_in_date: e.target.value})}
//                                 style={{ width: '100%' }}
//                             />
//                         </div>
                        
//                         <div style={{ marginBottom: '1rem' }}>
//                             <label style={{ display: 'block', marginBottom: '0.5rem' }}>Дата выезда:</label>
//                             <input 
//                                 type="date" 
//                                 value={bookingDates.check_out_date}
//                                 onChange={(e) => setBookingDates({...bookingDates, check_out_date: e.target.value})}
//                                 style={{ width: '100%' }}
//                             />
//                         </div>
                        
//                         <div style={{ marginBottom: '1rem' }}>
//                             <h4>Выберите гостей:</h4>
//                             <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                                 {guests.map(guest => (
//                                     <div key={guest.id} style={{ marginBottom: '0.5rem' }}>
//                                         <label>
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedGuests.includes(guest.id)}
//                                                 onChange={() => toggleGuestSelection(guest.id)}
//                                                 style={{ marginRight: '0.5rem' }}
//                                             />
//                                             {guest.name} ({guest.phone})
//                                         </label>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
                        
//                         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
//                             <button 
//                                 onClick={() => setShowBookingModal(false)}
//                                 style={{ padding: '0.5rem 1rem' }}
//                             >
//                                 Отмена
//                             </button>
//                             <button 
//                                 onClick={handleBookingSubmit}
//                                 style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white' }}
//                             >
//                                 Подтвердить бронь
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API_URL = 'http://localhost:5000';

// const RoomsPage = () => {
//   const [rooms, setRooms] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newRoom, setNewRoom] = useState({
//     room_number: '',
//     category: '',
//     capacity: '',
//     has_child_bed: false
//   });

//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   const fetchRooms = async () => {
//     const response = await axios.get(`${API_URL}/rooms`);
//     setRooms(response.data);
//   };

//   const deleteRoom = async (id) => {
//     if (!window.confirm('Удалить номер?')) return;

//     await axios.delete(`${API_URL}/rooms/${id}`);
//     fetchRooms();
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setNewRoom((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleAddRoom = async () => {
//     try {
//       await axios.post(`${API_URL}/rooms`, {
//         ...newRoom,
//         capacity: parseInt(newRoom.capacity, 10)
//       });
//       fetchRooms();
//       setNewRoom({
//         room_number: '',
//         category: '',
//         capacity: '',
//         has_child_bed: false
//       });
//       setShowAddModal(false);
//     } catch (error) {
//       alert('Ошибка при добавлении номера');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 style={{ marginTop: 30 }} className="text-2xl font-bold mb-4">Список номеров</h2>

//       <button
//         onClick={() => setShowAddModal(true)}
//         className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//       >
//         Добавить номер
//       </button>

//       <table className="w-full table-auto border border-gray-300">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 border">ID</th>
//             <th className="p-2 border">Номер</th>
//             <th className="p-2 border">Категория</th>
//             <th className="p-2 border">Вместимость</th>
//             <th className="p-2 border">Детская кровать</th>
//             <th className="p-2 border">Действия</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rooms.map((room) => (
//             <tr key={room.id} className="text-center">
//               <td className="border p-2">{room.id}</td>
//               <td className="border p-2">{room.room_number}</td>
//               <td className="border p-2">{room.category}</td>
//               <td className="border p-2">{room.capacity}</td>
//               <td className="border p-2">{room.has_child_bed ? 'Да' : 'Нет'}</td>
//               <td className="border p-2">
//                 <button
//                   onClick={() => deleteRoom(room.id)}
//                   className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                 >
//                   Удалить
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
//           <div className="bg-white p-6 rounded shadow w-96">
//             <h3 className="text-xl font-semibold mb-4">Добавить номер</h3>
//             <div className="space-y-4">
//               <input
//                 name="room_number"
//                 value={newRoom.room_number}
//                 onChange={handleChange}
//                 placeholder="Номер"
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 name="category"
//                 value={newRoom.category}
//                 onChange={handleChange}
//                 placeholder="Категория"
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 name="capacity"
//                 type="number"
//                 value={newRoom.capacity}
//                 onChange={handleChange}
//                 placeholder="Вместимость"
//                 className="w-full border p-2 rounded"
//               />
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   name="has_child_bed"
//                   checked={newRoom.has_child_bed}
//                   onChange={handleChange}
//                 />
//                 <span>Детская кровать</span>
//               </label>
//             </div>
//             <div className="mt-6 flex justify-end space-x-2">
//               <button
//                 onClick={handleAddRoom}
//                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//               >
//                 Добавить
//               </button>
//               <button
//                 onClick={() => setShowAddModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//               >
//                 Отмена
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoomsPage;
