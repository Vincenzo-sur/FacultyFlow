const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const CalendarSlot = require('../models/CalendarSlot');
const { protect, studentOnly } = require('../middleware/auth');

// @route   GET /api/student/faculty
// @desc    Get all registered teachers (with Free Now status)
router.get('/faculty', protect, studentOnly, async (req, res) => {
    try {
        let teachers = await User.find({ role: 'teacher' })
            .select('-password')
            .lean();

        // Auto-expire freeNow if freeUntil has passed
        const now = new Date();
        teachers = teachers.map(t => {
            if (t.freeUntil && new Date(t.freeUntil) < now) {
                t.freeNow = false;
            }
            return t;
        });

        // Sort: freeNow teachers appear first
        teachers.sort((a, b) => (b.freeNow ? 1 : 0) - (a.freeNow ? 1 : 0));

        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/student/faculty/search?q=name_or_dept
// @desc    Search faculty by name or department
router.get('/faculty/search', protect, studentOnly, async (req, res) => {
    const { q } = req.query;
    try {
        const teachers = await User.find({
            role: 'teacher',
            $or: [
                { fullName: { $regex: q, $options: 'i' } },
                { department: { $regex: q, $options: 'i' } },
                { subjects: { $elemMatch: { $regex: q, $options: 'i' } } }
            ]
        }).select('-password');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/student/faculty/:id/calendar
// @desc    Get a specific teacher's calendar (to see free slots)
router.get('/faculty/:id/calendar', protect, studentOnly, async (req, res) => {
    try {
        const slots = await CalendarSlot.find({ user: req.params.id });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/student/appointments
// @desc    Student sends an appointment request to a teacher
router.post('/appointments', protect, studentOnly, async (req, res) => {
    const { teacherId, date, timeSlot, reason } = req.body;
    try {
        // Check if that slot is already booked
        const conflict = await Appointment.findOne({
            teacher: teacherId,
            date,
            timeSlot,
            status: 'approved'
        });
        if (conflict) {
            return res.status(400).json({ message: 'This slot is already booked' });
        }

        const appointment = await Appointment.create({
            student: req.user._id,
            teacher: teacherId,
            date,
            timeSlot,
            reason
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/student/appointments
// @desc    Get all appointments for logged-in student
router.get('/appointments', protect, studentOnly, async (req, res) => {
    try {
        const appointments = await Appointment.find({ student: req.user._id })
            .populate('teacher', 'fullName department designation')
            .sort({ date: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/student/calendar
// @desc    Student adds their own class to personal calendar
router.post('/calendar', protect, studentOnly, async (req, res) => {
    const { date, timeSlot, slotType, note } = req.body;
    try {
        const slot = await CalendarSlot.findOneAndUpdate(
            { user: req.user._id, date, timeSlot },
            { slotType, note },
            { upsert: true, new: true }
        );
        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/student/calendar
// @desc    Get student's own calendar slots
router.get('/calendar', protect, studentOnly, async (req, res) => {
    try {
        const slots = await CalendarSlot.find({ user: req.user._id });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;