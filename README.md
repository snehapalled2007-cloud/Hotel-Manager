Backend: Express.js + SQLite (better-sqlite3)
Frontend: React + Vite
Database: SQLite (hotel.db)

Project structure:

hotel-manager/
│
├── backend/
│   ├── index.js
│   └── hotel.db
│
└── frontend/
    └── src/
        ├── App.jsx
        └── App.css
Features
Hotel Room Management
Add Room
View Rooms
Update Room
Delete Room
Guest Management
Register Guest
View Guests
Booking Management
Book Room
View Bookings
Update Booking
Cancel Booking
Dashboard
Total Rooms
Available Rooms
Booked Rooms
Total Guests
Database Tables
rooms
Column	Type
id	INTEGER
roomNo	TEXT
type	TEXT
price	REAL
status	TEXT
guests
Column	Type
id	INTEGER
name	TEXT
phone	TEXT
email	TEXT
bookings
Column	Type
id	INTEGER
guestId	INTEGER
roomId	INTEGER
checkIn	TEXT
checkOut	TEXT
REST APIs
Rooms
GET
GET /rooms

Returns all rooms.

GET by ID
GET /rooms/:id
POST
POST /rooms

Body

{
  "roomNo":"101",
  "type":"Deluxe",
  "price":2500,
  "status":"Available"
}
PUT
PUT /rooms/:id
DELETE
DELETE /rooms/:id
Guests
GET
GET /guests
POST
POST /guests

Body

{
"name":"Sneha",
"phone":"9876543210",
"email":"abc@gmail.com"
}
DELETE
DELETE /guests/:id
Bookings
GET
GET /bookings

Returns booking with guest and room details.

POST
POST /bookings
{
"guestId":1,
"roomId":2,
"checkIn":"2026-07-10",
"checkOut":"2026-07-15"
}

Room status automatically changes to Booked.

PUT
PUT /bookings/:id
DELETE
DELETE /bookings/:id

Room status automatically becomes Available.

Dashboard
GET /dashboard

Response

{
"totalRooms":25,
"availableRooms":18,
"bookedRooms":7,
"totalGuests":14
}
React Frontend

Single page application containing

Dashboard cards
Room Form
Guest Form
Booking Form
Rooms Table
Guests Table
Bookings Table

Each table supports

Edit
Delete
Refresh
Validation
Room number required
Price > 0
Guest name required
Phone required
Email required
Check-in required
Check-out required
Cannot book already booked room
Technologies

Backend

Express
CORS
better-sqlite3

Frontend

React
Vite
CSS

Database

SQLite
