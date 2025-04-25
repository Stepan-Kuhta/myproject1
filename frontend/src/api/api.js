const API_URL = 'http://localhost:5000';

// Получение списка гостей
export async function getGuests() {
  const res = await fetch(`${API_URL}/guests`);
  if (!res.ok) throw new Error("Ошибка при загрузке гостей");
  return res.json();
}

// Создание нового гостя
export async function createGuest(data) {
  const res = await fetch(`${API_URL}/guests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при создании гостя");
  }

  return res.json();
}

// Обновление гостя
export async function updateGuest(id, data) {
  const res = await fetch(`${API_URL}/guests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при обновлении гостя");
  }

  return res.json();
}

// Удаление гостя
export async function deleteGuest(id) {
  const res = await fetch(`${API_URL}/guests/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при удалении гостя");
  }

  return res.json();
}

// Rooms API
export async function getRooms() {
  const res = await fetch(`${API_URL}/rooms`);
  if (!res.ok) throw new Error("Ошибка при загрузке номеров");
  return res.json();
}

export async function createRoom(data) {
  const res = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при создании номера");
  }
  return res.json();
}

export async function updateRoom(id, data) {
  const res = await fetch(`${API_URL}/rooms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при обновлении номера");
  }
  return res.json();
}

export async function deleteRoom(id) {
  const res = await fetch(`${API_URL}/rooms/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при удалении номера");
  }
  return res.json();
}

// Bookings API
export async function getBookings() {
  const res = await fetch(`${API_URL}/bookings`);
  if (!res.ok) throw new Error("Ошибка при загрузке бронирований");
  return res.json();
}

export async function updateBooking(id, data) {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при обновлении бронирования");
  }
  return res.json();
}

export async function deleteBooking(id) {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при удалении бронирования");
  }
  return res.json();
}

export async function createBooking(data) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      room_id: data.room_id,
      main_guest_id: data.main_guest_id,
      check_in_date: new Date(data.check_in_date).toISOString().split('T')[0],
      check_out_date: new Date(data.check_out_date).toISOString().split('T')[0],
      status: data.status || 'confirmed',
      price: data.price
    })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Ошибка при создании бронирования");
  }
  return res.json();
}
// Prices API (ДОБАВЛЕНО)
export async function getPrices() {
  const res = await fetch(`${API_URL}/prices`);
  if (!res.ok) throw new Error("Ошибка при загрузке цен");
  return res.json();
}