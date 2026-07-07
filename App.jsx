import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    room_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: '',
    check_out_date: '',
    total_price: ''
  });

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  const fetchRooms = async () => {
    const res = await fetch(`${API_URL}/rooms`);
    const data = await res.json();
    setRooms(data);
  };

  const fetchBookings = async () => {
    const res = await fetch(`${API_URL}/bookings`);
    const data = await res.json();
    setBookings(data);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.room_id) return alert("Please select a room.");

    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert("Booking successfully created!");
      setFormData({
        room_id: '',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        check_in_date: '',
        check_out_date: '',
        total_price: ''
      });
      fetchRooms();
      fetchBookings();
    } else {
      alert("Error generating booking.");
    }
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h1>Grand Horizon Hotel Manager</h1>
      </header>

      <main className="dashboard">
        {/* ROOMS DIRECTORY */}
        <section className="card list-section">
          <h2>Room Directory</h2>
          <div className="room-grid">
            {rooms.map(room => (
              <div key={room.id} className={`room-card ${room.status.toLowerCase()}`}>
                <h3>Room {room.room_number}</h3>
                <p>Type: <strong>{room.type}</strong></p>
                <p>Price: <strong>${room.price_per_night}/night</strong></p>
                <span className="status-badge">{room.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BOOKING FORM */}
        <section className="card form-section">
          <h2>New Reservation</h2>
          <form onSubmit={handleBookingSubmit}>
            <label>Select Room</label>
            <select name="room_id" value={formData.room_id} onChange={handleInputChange} required>
              <option value="">-- Select Available Room --</option>
              {rooms.filter(r => r.status === 'Available').map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.room_number} ({room.type} - ${room.price_per_night}/n)
                </option>
              ))}
            </select>

            <label>Guest Name</label>
            <input type="text" name="guest_name" value={formData.guest_name} onChange={handleInputChange} required />

            <label>Guest Email</label>
            <input type="email" name="guest_email" value={formData.guest_email} onChange={handleInputChange} required />

            <label>Phone Number</label>
            <input type="tel" name="guest_phone" value={formData.guest_phone} onChange={handleInputChange} />

            <div className="form-row">
              <div>
                <label>Check-in</label>
                <input type="date" name="check_in_date" value={formData.check_in_date} onChange={handleInputChange} required />
              </div>
              <div>
                <label>Check-out</label>
                <input type="date" name="check_out_date" value={formData.check_out_date} onChange={handleInputChange} required />
              </div>
            </div>

            <label>Total Quoted Price ($)</label>
            <input type="number" name="total_price" value={formData.total_price} onChange={handleInputChange} required />

            <button type="submit" className="btn-submit">Confirm Reservation</button>
          </form>
        </section>

        {/* ACTIVE BOOKINGS */}
        <section className="card full-width">
          <h2>Active Reservations Log</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Guest</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign: 'center'}}>No active reservations found.</td></tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.room_number}</strong></td>
                      <td>{b.type}</td>
                      <td>{b.guest_name}</td>
                      <td>{b.check_in_date}</td>
                      <td>{b.check_out_date}</td>
                      <td>${b.total_price}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;