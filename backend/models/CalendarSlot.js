const mongoose = require('mongoose');

const calendarSlotSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,   // "YYYY-MM-DD"
        required: true
    },
    timeSlot: {
        type: String,   // "09:00 AM - 10:00 AM"
        required: true
    },
    slotType: {
        type: String,
        enum: ['class', 'busy', 'meeting', 'free'],
        required: true
    },
    note: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('CalendarSlot', calendarSlotSchema);