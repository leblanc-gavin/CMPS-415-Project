const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Make sure the path matches your user model

// Login Endpoint
router.post('/login', async (req, res) => {
    const { userID, password } = req.body;

    try {
        const user = await User.findOne({ userID, password });
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }
        res.cookie('userID', userID, { maxAge: 900000 }); // Set cookie for 15 minutes
        res.redirect('/user-info'); // Redirect to user info page after successful login
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Registration Endpoint
router.post('/register', async (req, res) => {
    const { userID, password } = req.body;

    try {
        const existingUser = await User.findOne({ userID });
        if (existingUser) {
            return res.status(409).send('Username already exists');
        }
        const newUser = new User({ userID, password });
        await newUser.save();
        res.cookie('userID', userID); // Automatically log in the user
        res.redirect('/user-info'); // Redirect to user info page after successful registration
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Logout Endpoint
router.post('/logout', (req, res) => {
    res.clearCookie('userID');
    res.redirect('/'); // Redirect back to the homepage or login page
});

module.exports = router;
