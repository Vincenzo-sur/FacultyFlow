const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const CalendarSlot = require('../models/CalendarSlot');
const { protect, teacherOnly } = require('../middleware/auth');

// @route   POST /api/teacher/calendar
// @desc    Add/update a calendar slot (class, busy, meeting, free)
router.post('/calendar', protect, teacherOnly, async (req, res) => {
    const { date, timeSlot, slotType, note } = req.body;
    try {
        // Upsert: update if exists, create if not
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

// @route   GET /api/teacher/calendar
// @desc    Get all calendar slots for logged-in teacher
router.get('/calendar', protect, teacherOnly, async (req, res) => {
    try {
        const slots = await CalendarSlot.find({ user: req.user._id });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/teacher/calendar/:id
// @desc    Delete a calendar slot
router.delete('/calendar/:id', protect, teacherOnly, async (req, res) => {
    try {
        await CalendarSlot.findByIdAndDelete(req.params.id);
        res.json({ message: 'Slot removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/teacher/free-now
// @desc    Toggle "Free Now" status with optional duration
router.put('/free-now', protect, teacherOnly, async (req, res) => {
    const { freeNow, durationMinutes } = req.body;
    try {
        let freeUntil = null;
        if (freeNow && durationMinutes) {
            freeUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
        }
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { freeNow, freeUntil },
            { new: true }
        ).select('-password');
        res.json({ freeNow: user.freeNow, freeUntil: user.freeUntil });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/teacher/requests
// @desc    Get all pending appointment requests for the teacher
router.get('/requests', protect, teacherOnly, async (req, res) => {
    try {
        const requests = await Appointment.find({
            teacher: req.user._id,
            status: { $in: ['pending', 'approved'] }
        }).populate('student', 'fullName universityId department');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/teacher/requests/:id
// @desc    Approve or decline an appointment request
router.put('/requests/:id', protect, teacherOnly, async (req, res) => {
    const { status } = req.body; // "approved" or "declined"
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Request not found' });

        appointment.status = status;
        await appointment.save();

        // If approved, auto-add to teacher's calendar
        if (status === 'approved') {
            await CalendarSlot.findOneAndUpdate(
                { user: req.user._id, date: appointment.date, timeSlot: appointment.timeSlot },
                { slotType: 'meeting', note: `Appointment with student` },
                { upsert: true, new: true }
            );
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/teacher/students/search?q=name_or_id
// @desc    Teacher searches for a student
router.get('/students/search', protect, teacherOnly, async (req, res) => {
    const { q } = req.query;
    try {
        const students = await User.find({
            role: 'student',
            $or: [
                { fullName: { $regex: q, $options: 'i' } },
                { universityId: { $regex: q, $options: 'i' } }
            ]
        }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/teacher/students/:id/timetable
// @desc    View a specific student's timetable
router.get('/students/:id/timetable', protect, teacherOnly, async (req, res) => {
    try {
        const slots = await CalendarSlot.find({ user: req.params.id });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/teacher/invite/:studentId
// @desc    Teacher invites a student to a meeting
router.post('/invite/:studentId', protect, teacherOnly, async (req, res) => {
    const { date, timeSlot, reason } = req.body;
    try {
        const appointment = await Appointment.create({
            student: req.params.studentId,
            teacher: req.user._id,
            date,
            timeSlot,
            reason: reason || 'Teacher Invitation',
            status: 'approved'  // teacher-initiated = auto approved
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;