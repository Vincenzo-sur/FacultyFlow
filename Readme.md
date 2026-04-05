# 🎓 FacultyFlow

FacultyFlow is a full-stack web application designed to eliminate the friction of student-teacher scheduling at academic institutions. It provides dedicated dashboards for both faculty and students, allowing for seamless appointment booking, real-time availability tracking, and automated schedule management.

## ✨ Features

### For Teachers
* **Slot Management:** Easily add available meeting slots using graphical date and time pickers.
* **"Free Now" Real-Time Status:** A one-click toggle to broadcast immediate availability to all students.
* **Request Management:** Review, approve, or decline incoming appointment requests from students.
* **Smart Dashboards:** Automatically categorizes meetings into "Pending", "Upcoming Confirmed", and "Past Meetings" based on the current time.

### For Students
* **Live Faculty Directory:** Browse registered faculty and see their real-time "Free Now" status (auto-updates without refreshing).
* **Seamless Booking:** Click on a teacher to view their explicitly available slots and send a booking request with a custom reason.
* **Status Tracking:** Track the status of all requests (Pending, Approved, Declined) and view a history of past appointments.

## 🛠️ Tech Stack

* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript, Fetch API
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Authentication:** JSON Web Tokens (JWT), bcryptjs for password hashing

## 📂 Project Structure

```text
facultyflow/
├── frontend/
│   ├── login.html      # Authentication and Registration
│   ├── teacher.html    # Teacher Dashboard
│   └── student.html    # Student Dashboard
└── backend/
    ├── config/
    │   └── db.js       # MongoDB connection
    ├── middleware/
    │   └── auth.js     # JWT verification and role checking
    ├── models/
    │   ├── User.js     
    │   ├── Appointment.js 
    │   └── CalendarSlot.js 
    ├── routes/
    │   ├── auth.js     # Login/Signup endpoints
    │   ├── teacher.js  # Teacher-specific endpoints
    │   └── student.js  # Student-specific endpoints
    ├── .env            # Environment variables
    ├── package.json
    └── server.js       # Main application entry point