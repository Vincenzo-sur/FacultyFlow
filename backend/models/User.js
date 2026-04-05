const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    universityId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher'],
        required: true
    },
    department: {
        type: String,
        default: ''
    },
    // Teacher-specific fields
    subjects: {
        type: [String],
        default: []
    },
    designation: {
        type: String,
        default: ''
    },
    // Teacher free-now status
    freeNow: {
        type: Boolean,
        default: false
    },
    freeUntil: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords on login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);