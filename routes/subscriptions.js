const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Subscriptions = require('../models/subscriptions');

function isAuthenticated(req, res, next) {
    if (!req.cookies.userToken) {
        return res.redirect('/');
    }
    next();
}

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const token = req.cookies.userToken;
        const userId = Buffer.from(token, 'base64').toString('ascii');
        const user = await User.findOne({ userID: userId }); // Find the user based on userID
        console.log("User:", user); 

        // Query subscriptions for the current user
        const subscriptions = await Subscriptions.findOne({ userId: userId }).populate('subbedTopics');

        if (!subscriptions) {
            return res.status(404).send('Subscriptions not found');
        }

        res.render('subscriptions', { subscriptions: subscriptions });
    } catch (error) {
        res.status(500).send("Error fetching subscriptions: " + error.message);
    }
});


module.exports = router;
