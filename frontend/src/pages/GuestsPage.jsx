import { useEffect, useState } from "react";
import { getGuests, createGuest, updateGuest, deleteGuest } from "../api/api";

export default function GuestsPage() {
    const [guests, setGuests] = useState([]);
    const [newGuest, setNewGuest] = useState({
        name: "", phone: "", email: "", passport_series: "", passport_number: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "", phone: "", email: "", passport_series: "", passport_number: ""
    });
    const [errors, setErrors] = useState({
        phone: "",
        passport_series: "",
        passport_number: ""
    });

    useEffect(() => {
        loadGuests();
    }, []);

    const loadGuests = async () => {
        try {
            const guestsData = await getGuests();
            setGuests(guestsData);
        } catch (err) {
            alert("Ошибка загрузки гостей: " + err.message);
        }
    };

    const validateNumbers = (field, value) => {
        const onlyNumbers = /^[0-9]+$/;
        let isValid = true;
        const newErrors = { ...errors };

        if (field === 'phone') {
            if (!onlyNumbers.test(value)) {
                newErrors.phone = "Телефон должен содержать только цифры";
                isValid = false;
            } else if (value.length < 10 || value.length > 15) {
                newErrors.phone = "Телефон должен быть от 10 до 15 цифр";
                isValid = false;
            } else {
                newErrors.phone = "";
            }
        }

        if (field === 'passport_series') {
            if (!onlyNumbers.test(value)) {
                newErrors.passport_series = "Серия паспорта должна содержать только цифры";
                isValid = false;
            } else if (value.length !== 4) {
                newErrors.passport_series = "Серия паспорта должна содержать 4 цифры";
                isValid = false;
            } else {
                newErrors.passport_series = "";
            }
        }

        if (field === 'passport_number') {
            if (!onlyNumbers.test(value)) {
                newErrors.passport_number = "Номер паспорта должен содержать только цифры";
                isValid = false;
            } else if (value.length !== 6) {
                newErrors.passport_number = "Номер паспорта должен содержать 6 цифр";
                isValid = false;
            } else {
                newErrors.passport_number = "";
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isPhoneValid = validateNumbers('phone', newGuest.phone);
        const isSeriesValid = validateNumbers('passport_series', newGuest.passport_series);
        const isNumberValid = validateNumbers('passport_number', newGuest.passport_number);

        if (!isPhoneValid || !isSeriesValid || !isNumberValid) return;

        try {
            await createGuest(newGuest);
            await loadGuests();
            setNewGuest({ name: "", phone: "", email: "", passport_series: "", passport_number: "" });
        } catch (err) {
            alert("Ошибка добавления: " + err.message);
        }
    };

    const startEditing = (guest) => {
        setEditingId(guest.id);
        setEditForm({ ...guest });
        setErrors({ phone: "", passport_series: "", passport_number: "" });
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();

        const isPhoneValid = validateNumbers('phone', editForm.phone);
        const isSeriesValid = validateNumbers('passport_series', editForm.passport_series);
        const isNumberValid = validateNumbers('passport_number', editForm.passport_number);

        if (!isPhoneValid || !isSeriesValid || !isNumberValid) return;

        try {
            await updateGuest(id, editForm);
            setEditingId(null);
            await loadGuests();
        } catch (err) {
            alert("Ошибка обновления: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этого гостя?")) {
            try {
                await deleteGuest(id);
                await loadGuests();
            } catch (err) {
                alert("Ошибка удаления: " + err.message);
            }
        }
    };

    const handleFieldChange = (field, value, isEditForm = false) => {
        if (isEditForm) {
            setEditForm(prev => ({ ...prev, [field]: value }));
        } else {
            setNewGuest(prev => ({ ...prev, [field]: value }));
        }

        if (['phone', 'passport_series', 'passport_number'].includes(field)) {
            validateNumbers(field, value);
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
        }}>
            <h2 style={{ marginTop: 30 }}>Гости</h2>
            <ul style={{ listStyleType: "none", padding: 0, width: '100%' }}>
                {guests.map((g, index) => (
                    <li key={g.id} style={{
                        marginBottom: "15px",
                        padding: "15px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        width: '100%'
                    }}>
                        {editingId === g.id ? (
                            <form onSubmit={(e) => handleEditSubmit(e, g.id)} style={{ width: '100%' }}>
                                {['name', 'phone', 'email', 'passport_series', 'passport_number'].map((field) => (
                                    <div style={{ marginBottom: '15px' }} key={field}>
                                        <input
                                            placeholder={field === 'name' ? 'Имя' :
                                                field === 'phone' ? 'Телефон' :
                                                field === 'email' ? 'Email' :
                                                field === 'passport_series' ? 'Серия паспорта' : 'Номер паспорта'}
                                            value={editForm[field]}
                                            onChange={(e) => handleFieldChange(field, e.target.value, true)}
                                            style={{ width: '100%' }}
                                        />
                                        {errors[field] && (
                                            <div style={{
                                                color: 'red',
                                                fontSize: '0.8rem',
                                                marginTop: '5px'
                                            }}>
                                                {errors[field]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div>
                                    <button type="submit" style={{ marginRight: '10px' }}>Сохранить</button>
                                    <button type="button" onClick={() => setEditingId(null)}>Отмена</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                width: '100%'
                            }}>
                                <div>
                                    <strong>{index + 1}.</strong> {g.name} — {g.phone} {g.email} {g.passport_series} {g.passport_number}
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <button onClick={() => startEditing(g)} style={{ marginRight: "10px" }}>Изменить</button>
                                    <button onClick={() => handleDelete(g.id)}>Удалить</button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <h3>Добавить нового гостя</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Имя</label>
                    <input  
                        value={newGuest.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)} 
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Телефон</label>
                    <input 
                        value={newGuest.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)} 
                        style={{ width: '100%' }}
                    />
                    {errors.phone && (
                        <div style={{ 
                            color: 'red', 
                            fontSize: '0.8rem',
                            marginTop: '5px'
                        }}>
                            {errors.phone}
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input 
                        value={newGuest.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)} 
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Серия паспорта</label>
                    <input 
                        value={newGuest.passport_series}
                        onChange={(e) => handleFieldChange('passport_series', e.target.value)} 
                        style={{ width: '100%' }}
                    />
                    {errors.passport_series && (
                        <div style={{ 
                            color: 'red', 
                            fontSize: '0.8rem',
                            marginTop: '5px'
                        }}>
                            {errors.passport_series}
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Номер паспорта</label>
                    <input 
                        value={newGuest.passport_number}
                        onChange={(e) => handleFieldChange('passport_number', e.target.value)} 
                        style={{ width: '100%' }}
                    />
                    {errors.passport_number && (
                        <div style={{ 
                            color: 'red', 
                            fontSize: '0.8rem',
                            marginTop: '5px'
                        }}>
                            {errors.passport_number}
                        </div>
                    )}
                </div>
                <button type="submit">Добавить</button>
            </form>

        </div>
    );
}

// import { useEffect, useState } from "react";
// import { getGuests, createGuest, updateGuest, deleteGuest } from "../api/api";

// export default function GuestsPage() {
//     const [guests, setGuests] = useState([]);
//     const [newGuest, setNewGuest] = useState({
//         name: "", phone: "", email: "", passport_series: "", passport_number: ""
//     });
//     const [editingId, setEditingId] = useState(null);
//     const [editForm, setEditForm] = useState({
//         name: "", phone: "", email: "", passport_series: "", passport_number: ""
//     });
//     const [errors, setErrors] = useState({
//         phone: "",
//         passport_series: "",
//         passport_number: ""
//     });

//     // Получаем список гостей при загрузке компонента
//     useEffect(() => {
//         loadGuests();
//     }, []);

//     const loadGuests = async () => {
//         try {
//             const guestsData = await getGuests();
//             setGuests(guestsData);
//         } catch (err) {
//             alert("Ошибка загрузки гостей: " + err.message);
//         }
//     };

//     // Валидация числовых полей
//     const validateNumbers = (field, value) => {
//         const onlyNumbers = /^[0-9]+$/;
//         let isValid = true;
//         const newErrors = { ...errors };

//         if (field === 'phone') {
//             if (!onlyNumbers.test(value)) {
//                 newErrors.phone = "Телефон должен содержать только цифры";
//                 isValid = false;
//             } else if (value.length < 10 || value.length > 15) {
//                 newErrors.phone = "Телефон должен быть от 10 до 15 цифр";
//                 isValid = false;
//             } else {
//                 newErrors.phone = "";
//             }
//         }

//         if (field === 'passport_series') {
//             if (!onlyNumbers.test(value)) {
//                 newErrors.passport_series = "Серия паспорта должна содержать только цифры";
//                 isValid = false;
//             } else if (value.length !== 4) {
//                 newErrors.passport_series = "Серия паспорта должна содержать 4 цифры";
//                 isValid = false;
//             } else {
//                 newErrors.passport_series = "";
//             }
//         }

//         if (field === 'passport_number') {
//             if (!onlyNumbers.test(value)) {
//                 newErrors.passport_number = "Номер паспорта должен содержать только цифры";
//                 isValid = false;
//             } else if (value.length !== 6) {
//                 newErrors.passport_number = "Номер паспорта должен содержать 6 цифр";
//                 isValid = false;
//             } else {
//                 newErrors.passport_number = "";
//             }
//         }

//         setErrors(newErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         // Проверяем все числовые поля перед отправкой
//         const isPhoneValid = validateNumbers('phone', newGuest.phone);
//         const isSeriesValid = validateNumbers('passport_series', newGuest.passport_series);
//         const isNumberValid = validateNumbers('passport_number', newGuest.passport_number);
        
//         if (!isPhoneValid || !isSeriesValid || !isNumberValid) {
//             return;
//         }

//         try {
//             await createGuest(newGuest);
//             await loadGuests();
//             setNewGuest({ name: "", phone: "", email: "", passport_series: "", passport_number: "" });
//         } catch (err) {
//             alert("Ошибка добавления: " + err.message);
//         }
//     };

//     const startEditing = (guest) => {
//         setEditingId(guest.id);
//         setEditForm({
//             name: guest.name,
//             phone: guest.phone,
//             email: guest.email,
//             passport_series: guest.passport_series,
//             passport_number: guest.passport_number
//         });
//         // Сбрасываем ошибки при начале редактирования
//         setErrors({
//             phone: "",
//             passport_series: "",
//             passport_number: ""
//         });
//     };

//     const handleEditSubmit = async (e, id) => {
//         e.preventDefault();
        
//         // Проверяем все числовые поля перед отправкой
//         const isPhoneValid = validateNumbers('phone', editForm.phone);
//         const isSeriesValid = validateNumbers('passport_series', editForm.passport_series);
//         const isNumberValid = validateNumbers('passport_number', editForm.passport_number);
        
//         if (!isPhoneValid || !isSeriesValid || !isNumberValid) {
//             return;
//         }

//         try {
//             await updateGuest(id, editForm);
//             setEditingId(null);
//             await loadGuests();
//         } catch (err) {
//             alert("Ошибка обновления: " + err.message);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm("Вы уверены, что хотите удалить этого гостя?")) {
//             try {
//                 await deleteGuest(id);
//                 await loadGuests();
//             } catch (err) {
//                 alert("Ошибка удаления: " + err.message);
//             }
//         }
//     };

//     // Обработчик изменения полей с валидацией на лету
//     const handleFieldChange = (field, value, isEditForm = false) => {
//         if (isEditForm) {
//             setEditForm(prev => ({ ...prev, [field]: value }));
//         } else {
//             setNewGuest(prev => ({ ...prev, [field]: value }));
//         }

//         // Валидация на лету для числовых полей
//         if (['phone', 'passport_series', 'passport_number'].includes(field)) {
//             validateNumbers(field, value);
//         }
//     };

//     return (
//         <div style={{ 
//             backgroundColor: 'white',
//             padding: '1rem',
//         }}>
//             <h2 style={{ marginTop: 30 }}>Гости</h2>
//             <ul style={{ listStyleType: "none", padding: 0 }}>
//                 {guests.map((g, index) => (
//                     <li key={g.id} style={{ 
//                         marginBottom: "10px", 
//                         padding: "10px", 
//                         border: "1px solid #ddd", 
//                         borderRadius: "4px" 
//                     }}>
//                         {editingId === g.id ? (
//                             <form onSubmit={(e) => handleEditSubmit(e, g.id)}>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Имя"
//                                         value={editForm.name}
//                                         onChange={(e) => handleFieldChange('name', e.target.value, true)}
//                                         style={{ width: '100%' }}
//                                     />
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Телефон"
//                                         value={editForm.phone}
//                                         onChange={(e) => handleFieldChange('phone', e.target.value, true)}
//                                         style={{ width: '100%' }}
//                                     />
//                                     {errors.phone && (
//                                         <div style={{ 
//                                             color: 'red', 
//                                             fontSize: '0.8rem',
//                                             marginTop: '5px'
//                                         }}>
//                                             {errors.phone}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Email"
//                                         value={editForm.email}
//                                         onChange={(e) => handleFieldChange('email', e.target.value, true)}
//                                         style={{ width: '100%' }}
//                                     />
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Серия паспорта"
//                                         value={editForm.passport_series}
//                                         onChange={(e) => handleFieldChange('passport_series', e.target.value, true)}
//                                         style={{ width: '100%' }}
//                                     />
//                                     {errors.passport_series && (
//                                         <div style={{ 
//                                             color: 'red', 
//                                             fontSize: '0.8rem',
//                                             marginTop: '5px'
//                                         }}>
//                                             {errors.passport_series}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div style={{ marginBottom: '15px' }}>
//                                     <input
//                                         placeholder="Номер паспорта"
//                                         value={editForm.passport_number}
//                                         onChange={(e) => handleFieldChange('passport_number', e.target.value, true)}
//                                         style={{ width: '100%' }}
//                                     />
//                                     {errors.passport_number && (
//                                         <div style={{ 
//                                             color: 'red', 
//                                             fontSize: '0.8rem',
//                                             marginTop: '5px'
//                                         }}>
//                                             {errors.passport_number}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <button type="submit" style={{ marginRight: '10px' }}>Сохранить</button>
//                                     <button type="button" onClick={() => setEditingId(null)}>Отмена</button>
//                                 </div>
//                             </form>
//                         ) : (
//                             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                                 <div>
//                                     <span style={{ marginRight: "10px", fontWeight: "bold" }}>{index + 1}.</span>
//                                     {g.name} — {g.phone} {g.email} {g.passport_series} {g.passport_number}
//                                 </div>
//                                 <div>
//                                     <button onClick={() => startEditing(g)} style={{ marginRight: "5px" }}>Изменить</button>
//                                     <button onClick={() => handleDelete(g.id)}>Удалить</button>
//                                 </div>
//                             </div>
//                         )}
//                     </li>
//                 ))}
//             </ul>

//             <h3>Добавить нового гостя</h3>
//             <form onSubmit={handleSubmit}>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Имя" 
//                         value={newGuest.name}
//                         onChange={(e) => handleFieldChange('name', e.target.value)} 
//                         style={{ width: '100%' }}
//                     />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Телефон" 
//                         value={newGuest.phone}
//                         onChange={(e) => handleFieldChange('phone', e.target.value)} 
//                         style={{ width: '100%' }}
//                     />
//                     {errors.phone && (
//                         <div style={{ 
//                             color: 'red', 
//                             fontSize: '0.8rem',
//                             marginTop: '5px'
//                         }}>
//                             {errors.phone}
//                         </div>
//                     )}
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Email" 
//                         value={newGuest.email}
//                         onChange={(e) => handleFieldChange('email', e.target.value)} 
//                         style={{ width: '100%' }}
//                     />
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Серия паспорта" 
//                         value={newGuest.passport_series}
//                         onChange={(e) => handleFieldChange('passport_series', e.target.value)} 
//                         style={{ width: '100%' }}
//                     />
//                     {errors.passport_series && (
//                         <div style={{ 
//                             color: 'red', 
//                             fontSize: '0.8rem',
//                             marginTop: '5px'
//                         }}>
//                             {errors.passport_series}
//                         </div>
//                     )}
//                 </div>
//                 <div style={{ marginBottom: '15px' }}>
//                     <input 
//                         placeholder="Номер паспорта" 
//                         value={newGuest.passport_number}
//                         onChange={(e) => handleFieldChange('passport_number', e.target.value)} 
//                         style={{ width: '100%' }}
//                     />
//                     {errors.passport_number && (
//                         <div style={{ 
//                             color: 'red', 
//                             fontSize: '0.8rem',
//                             marginTop: '5px'
//                         }}>
//                             {errors.passport_number}
//                         </div>
//                     )}
//                 </div>
//                 <button type="submit">Добавить</button>
//             </form>
//         </div>
//     );
// }

// import { useEffect, useState } from "react";
// import { getGuests, createGuest, updateGuest, deleteGuest } from "../api/api";

// export default function GuestsPage() {
//     const [guests, setGuests] = useState([]);
//     const [newGuest, setNewGuest] = useState({
//         name: "", phone: "", email: "", passport_series: "", passport_number: ""
//     });
//     const [editingId, setEditingId] = useState(null);
//     const [editForm, setEditForm] = useState({
//         name: "", phone: "", email: "", passport_series: "", passport_number: ""
//     });

//     // Получаем список гостей при загрузке компонента
//     useEffect(() => {
//         loadGuests();
//     }, []);

//     const loadGuests = async () => {
//         try {
//             const guestsData = await getGuests();
//             setGuests(guestsData);
//         } catch (err) {
//             alert("Ошибка загрузки гостей: " + err.message);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await createGuest(newGuest);
//             await loadGuests();
//             setNewGuest({ name: "", phone: "", email: "", passport_series: "", passport_number: "" });
//         } catch (err) {
//             alert("Ошибка добавления: " + err.message);
//         }
//     };

//     const startEditing = (guest) => {
//         setEditingId(guest.id);
//         setEditForm({
//             name: guest.name,
//             phone: guest.phone,
//             email: guest.email,
//             passport_series: guest.passport_series,
//             passport_number: guest.passport_number
//         });
//     };

//     const handleEditSubmit = async (e, id) => {
//         e.preventDefault();
//         try {
//             await updateGuest(id, editForm);
//             setEditingId(null);
//             await loadGuests();
//         } catch (err) {
//             alert("Ошибка обновления: " + err.message);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm("Вы уверены, что хотите удалить этого гостя?")) {
//             try {
//                 await deleteGuest(id);
//                 await loadGuests();
//             } catch (err) {
//                 alert("Ошибка удаления: " + err.message);
//             }
//         }
//     };

//     return (
//         <div style={{ 
//             backgroundColor: 'white',  // Принудительно белый фон
//             padding: '1rem',
//         }}>
//             <h2 style={{ marginTop: 30 }}>Гости</h2>
//             <ul style={{ listStyleType: "none", padding: 0 }}>
//                 {guests.map((g, index) => (
//                     <li key={g.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
//                         {editingId === g.id ? (
//                             <form onSubmit={(e) => handleEditSubmit(e, g.id)}>
//                                 <input
//                                     placeholder="Имя"
//                                     value={editForm.name}
//                                     onChange={(e) => setEditForm({...editForm, name: e.target.value})}
//                                 />
//                                 <input
//                                     placeholder="Телефон"
//                                     value={editForm.phone}
//                                     onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
//                                 />
//                                 <input
//                                     placeholder="Email"
//                                     value={editForm.email}
//                                     onChange={(e) => setEditForm({...editForm, email: e.target.value})}
//                                 />
//                                 <input
//                                     placeholder="Серия паспорта"
//                                     value={editForm.passport_series}
//                                     onChange={(e) => setEditForm({...editForm, passport_series: e.target.value})}
//                                 />
//                                 <input
//                                     placeholder="Номер паспорта"
//                                     value={editForm.passport_number}
//                                     onChange={(e) => setEditForm({...editForm, passport_number: e.target.value})}
//                                 />
//                                 <button type="submit">Сохранить</button>
//                                 <button type="button" onClick={() => setEditingId(null)}>Отмена</button>
//                             </form>
//                         ) : (
//                             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                                 <div>
//                                     <span style={{ marginRight: "10px", fontWeight: "bold" }}>{index + 1}.</span>
//                                     {g.name} — {g.phone} {g.email} {g.passport_series} {g.passport_number}
//                                 </div>
//                                 <div>
//                                     <button onClick={() => startEditing(g)} style={{ marginRight: "5px" }}>Изменить</button>
//                                     <button onClick={() => handleDelete(g.id)}>Удалить</button>
//                                 </div>
//                             </div>
//                         )}
//                     </li>
//                 ))}
//             </ul>

//             <h3>Добавить нового гостя</h3>
//             <form onSubmit={handleSubmit}>
//                 <input 
//                     placeholder="Имя" 
//                     value={newGuest.name}
//                     onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} 
//                 />
//                 <input 
//                     placeholder="Телефон" 
//                     value={newGuest.phone}
//                     onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} 
//                 />
//                 <input 
//                     placeholder="Email" 
//                     value={newGuest.email}
//                     onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} 
//                 />
//                 <input 
//                     placeholder="Серия паспорта" 
//                     value={newGuest.passport_series}
//                     onChange={(e) => setNewGuest({ ...newGuest, passport_series: e.target.value })} 
//                 />
//                 <input 
//                     placeholder="Номер паспорта" 
//                     value={newGuest.passport_number}
//                     onChange={(e) => setNewGuest({ ...newGuest, passport_number: e.target.value })} 
//                 />
//                 <button type="submit">Добавить</button>
//             </form>
//         </div>
//     );
// }

// import { useEffect, useState } from "react";
// import { getGuests, createGuest } from "../api/api";

// export default function GuestsPage() {
//     const [guests, setGuests] = useState([]);
//     const [newGuest, setNewGuest] = useState({
//         name: "", phone: "", email: "", passport_series: "", passport_number: ""
//     });

//     // Получаем список гостей при загрузке компонента
//     useEffect(() => {
//         getGuests()
//             .then(setGuests)
//             .catch((err) => alert("Ошибка загрузки гостей: " + err.message));
//     }, []);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             // Создаем нового гостя
//             const added = await createGuest(newGuest);

//             // Обновляем список гостей, добавляя нового
//             setGuests((prevGuests) => [...prevGuests, added]);

//             // Очищаем форму
//             setNewGuest({ name: "", phone: "", email: "", passport_series: "", passport_number: "" });
//         } catch (err) {
//             alert("Ошибка добавления: " + err.message);
//         }
//     };

//     return (
//         <div>
//             <h2>Гости</h2>
//             <ul>
//                 {guests.map((g) => (
//                     <li key={g.id}>
//                         {g.name} — {g.phone} {g.email} {g.passport_series} {g.passport_number}
//                     </li>
//                 ))}
//             </ul>

//             <h3>Добавить нового гостя</h3>
//             <form onSubmit={handleSubmit}>
//                 <input 
//                     placeholder="Имя" 
//                     value={newGuest.name}
//                     onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} 
//                 />
//                 <input 
//                     placeholder="Телефон" 
//                     value={newGuest.phone}
//                     onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} 
//                 />
//                 <input 
//                     placeholder="Email" 
//                     value={newGuest.email}
//                     onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} 
//                 />
//                 <input 
//                     placeholder="Серия паспорта" 
//                     value={newGuest.passport_series}
//                     onChange={(e) => setNewGuest({ ...newGuest, passport_series: e.target.value })} 
//                 />
//                 <input 
//                     placeholder="Номер паспорта" 
//                     value={newGuest.passport_number}
//                     onChange={(e) => setNewGuest({ ...newGuest, passport_number: e.target.value })} 
//                 />
//                 <button type="submit">Добавить</button>
//             </form>
//         </div>
//     );
// }

// import { useEffect, useState } from "react";
// import { getGuests, createGuest } from "../api/api";

// export default function GuestsPage() {
//     const [guests, setGuests] = useState([]);
//     const [newGuest, setNewGuest] = useState({
//         name: "", phone: "", email: "", passport_series: "", passport_number: ""
//     });

//     useEffect(() => {
//         getGuests().then(setGuests).catch(console.error);
//     }, []);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const added = await createGuest(newGuest);
//             setGuests([...guests, added]);
//             setNewGuest({ name: "", phone: "", email: "", passport_series: "", passport_number: "" });
//         } catch (err) {
//             alert("Ошибка добавления: " + (err.response?.data?.error || err.message));
//         }
//     };

//     return (
//         <div>
//             <h2>Гости</h2>
//             <ul>
//                 {guests.map((g) => (
//                     <li key={g.id}>
//                         {g.name} — {g.phone} {g.email} {g.passport_series} {g.passport_number}
//                     </li>
//                 ))}
//             </ul>
//             <form onSubmit={handleSubmit}>
//                 <input placeholder="Имя" value={newGuest.name}
//                     onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} />
//                 <input placeholder="Телефон" value={newGuest.phone}
//                     onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} />
//                 <input placeholder="Email" value={newGuest.email}
//                     onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} />
//                 <input placeholder="Серия паспорта" value={newGuest.passport_series}
//                     onChange={(e) => setNewGuest({ ...newGuest, passport_series: e.target.value })} />
//                 <input placeholder="Номер паспорта" value={newGuest.passport_number}
//                     onChange={(e) => setNewGuest({ ...newGuest, passport_number: e.target.value })} />
//                 <button type="submit">Добавить</button>
//             </form>
//         </div>
//     );
// }


// import { useEffect, useState } from "react";
// import { getGuests, createGuest } from "../api/api";

// export default function GuestsPage() {
//     const [guests, setGuests] = useState([]);
//     const [newGuest, setNewGuest] = useState({ name: "", phone: "", email: "" });

//     useEffect(() => {
//         getGuests().then(setGuests).catch(console.error);
//     }, []);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const added = await createGuest(newGuest);
//         setGuests([...guests, added]);
//         setNewGuest({ name: "", phone: "", email: "" });
//     };

//     return (
//         <div>
//             <h2>Гости</h2>
//             <ul>
//                 {guests.map((g) => (
//                     <li key={g.id}>{g.name} — {g.phone} {g.email} {g.passport_series} {g.passport_number}</li>
//                 ))}
//             </ul>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     placeholder="Имя"
//                     value={newGuest.name}
//                     onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
//                 />
//                 <input
//                     placeholder="Телефон"
//                     value={newGuest.phone}
//                     onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
//                 />
//                 <input
//                     placeholder="Email"
//                     value={newGuest.email}
//                     onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
//                 />
//                 <button type="submit">Добавить</button>
//             </form>
//         </div>
//     );
// }
