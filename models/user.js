const mongoose = require('mongoose');

// Define the User schema and model
const userSchema = new mongoose.Schema({
    userID: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
