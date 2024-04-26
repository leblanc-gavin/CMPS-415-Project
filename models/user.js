const mongoose = require('mongoose');

// Define the User schema and model
const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
