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