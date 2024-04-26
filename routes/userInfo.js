const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Make sure the path matches your user model

// User info route
router.get('/', async (req, res) => {
    
    const token = req.cookies.userToken;
    if (!token) {
        return res.redirect('/');
    }
    const userID = Buffer.from(token, 'base64').toString('ascii');
    
    // Display user info
    res.render('user-info', { userID: userID });

});

module.exports = router;
