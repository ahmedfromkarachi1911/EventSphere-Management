# EventSphere Management

EventSphere Management is a full-stack MERN web application designed to manage expos, exhibitions, and trade shows through a centralized platform.

The system provides separate functionality for three main user roles:

- Admin
- Exhibitor
- Attendee

It allows organizers to manage expos, exhibitor applications, booths, schedules, documents, registrations, communication, and other expo-related activities.

---

## 🚀 Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security
- JSON Web Token (JWT)
- bcryptjs
- Protected Routes
- Role-Based Authorization

### Additional Technologies
- Multer
- Nodemailer
- Socket.IO
- REST APIs

---

## 👥 User Roles

### Admin

The Admin manages the overall EventSphere platform.

Main functionality includes:

- Admin dashboard
- Create and manage expos
- Manage exhibitor applications
- Approve or reject applications
- Verify exhibitor documents
- Manage booths
- Manage expo schedules and sessions
- View registrations
- View analytics
- Manage messages
- Manage notifications
- Manage profile

---

### Exhibitor

Exhibitors can participate in available expos and manage their expo presence.

Main functionality includes:

- Register and login
- Manage exhibitor profile
- Explore available expos
- Apply for an expo
- Upload required documents
- Track application status
- View available booths
- Reserve booths
- View assigned booth
- Manage products and services
- Manage staff
- Send and receive messages
- Receive notifications

---

### Attendee

Attendees can discover expos and participate in expo activities.

Main functionality includes:

- Register and login
- Explore expos
- View expo details
- Register for expos
- Browse exhibitors
- View exhibitor profiles
- View booth information
- Browse expo schedules
- Register for sessions
- Bookmark sessions
- Receive notifications
- Send and receive messages
- Manage profile

---

## 🔐 Authentication

EventSphere uses JWT-based authentication.

Passwords are securely hashed using `bcryptjs` before being stored in the database.

Protected backend routes verify the JWT token and role-based authorization controls access to functionality intended for Admin, Exhibitor, or Attendee users.

---

## 🗄️ Database

EventSphere uses MongoDB with Mongoose.

The application stores data related to:

- Users
- Expos
- Applications
- Booths
- Registrations
- Sessions
- Session Registrations
- Bookmarks
- Products
- Staff
- Documents
- Messages
- Notifications

---

## 📁 Project Structure

```text
EventSphere/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md