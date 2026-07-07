const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'hotel.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Rooms Table
    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      price_per_night REAL NOT NULL,
      status TEXT DEFAULT 'Available'
    )`);

    // Guests Table
    db.run(`CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT
    )`);

    // Bookings Table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER,
      guest_id INTEGER,
      check_in_date TEXT NOT NULL,
      check_out_date TEXT NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY(room_id) REFERENCES rooms(id),
      FOREIGN KEY(guest_id) REFERENCES guests(id)
    )`);

    // Insert Seed Data if empty
    db.get("SELECT COUNT(*) as count FROM rooms", [], (err, row) => {
      if (row && row.count === 0) {
        const stmt = db.prepare("INSERT INTO rooms (room_number, type, price_per_night, status) VALUES (?, ?, ?, ?)");
        stmt.run("101", "Standard", 80.00, "Available");
        stmt.run("102", "Deluxe", 150.00, "Available");
        stmt.run("201", "Suite", 250.00, "Occupied");
        stmt.finalize();
        console.log("Seed data injected.");
      }
    });
  });
}

// --- API ROUTES ---

// Get all rooms
app.get('/api/rooms', (req, res) => {
  db.all("SELECT * FROM rooms", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update room status
app.put('/api/rooms/:id', (req, res) => {
  const { status } = req.body;
  db.run("UPDATE rooms SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Get all bookings with details
app.get('/api/bookings', (req, res) => {
  const query = `
    SELECT b.id, r.room_number, r.type, g.name as guest_name, b.check_in_date, b.check_out_date, b.total_price 
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN guests g ON b.guest_id = g.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create a booking
app.post('/api/bookings', (req, res) => {
  const { room_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, total_price } = req.body;

  db.serialize(() => {
    // 1. Insert or find guest
    db.run("INSERT OR IGNORE INTO guests (name, email, phone) VALUES (?, ?, ?)", [guest_name, guest_email, guest_phone], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT id FROM guests WHERE email = ?", [guest_email], (err, guestRow) => {
        if (err || !guestRow) return res.status(500).json({ error: "Failed to resolve guest." });
        const guest_id = guestRow.id;

        // 2. Create booking
        db.run(
          "INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, total_price) VALUES (?, ?, ?, ?, ?)",
          [room_id, guest_id, check_in_date, check_out_date, total_price],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // 3. Mark room as occupied
            db.run("UPDATE rooms SET status = 'Occupied' WHERE id = ?", [room_id], (err) => {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({ message: "Booking successful!", bookingId: this.lastID });
            });
          }
        );
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});