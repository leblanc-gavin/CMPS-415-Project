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

        // Encode userID or create a token (simple encoding example here)
        const userToken = Buffer.from(userID).toString('base64');
        res.cookie('userToken', userToken, { httpOnly: true, secure: false, maxAge: 900000 });

        res.redirect('/user-info'); // Redirect to user info page after successful login
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Registration Endpoint
router.post('/register', async (req, res) => {
    //console.log(req.body);
    const { userID, password } = req.body;

    try {
        const existingUser = await User.findOne({ userID });
        if (existingUser) {
            return res.status(409).send('Username already exists');
        }
        const newUser = new User({ userID, password });
        console.log(newUser);
        await newUser.save();
        
        const userToken = Buffer.from(newUser.userID).toString('base64');
        res.cookie('userToken', userToken, { httpOnly: true, secure: false, maxAge: 900000 });
        
        res.redirect('/user-info'); // Redirect to user info page after successful registration
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

// Logout Endpoint
router.post('/logout', (req, res) => {
    res.clearCookie('userToken');
    res.redirect('/'); // Redirect back to the homepage or login page
});

module.exports = router;
