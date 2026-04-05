const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: '*',   // In production, replace * with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'FacultyFlow API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});