const express = require('express');
const router = express.Router();
const Subscriptions = require('../models/subscriptions');

router.get('/subscriptions', isAuthenticated, async (req, res) => {
    const token = req.cookies.userToken;
    if (!token) {
        return res.redirect('/');
    }
    const userID = Buffer.from(token, 'base64').toString('ascii');

    try {
        // Find subscriptions whose userId matches the current user's id
        const subscriptions = await Subscriptions.findOne({ userId: userID }).populate('subbedTopics');

        if (!subscriptions) {
            return res.status(404).send('Subscriptions not found');
        }

        res.render('subscriptions', { subscriptions: subscriptions });
    } catch (error) {
        res.status(500).send("Error fetching user subscriptions: " + error.message);
    }
});

module.exports = router;
