const express = require('express');
const router = express.Router();
const Topic = require('../models/topic'); 
const User = require('../models/user');

function isAuthenticated(req, res, next) {
    if (!req.cookies.userToken) {
        return res.redirect('/');
    }
    next();
}

router.get('/create', isAuthenticated, (req, res) => {
    const userID = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');
    res.render('create-topic', { userID }); // Assuming you have a view setup for this
});

router.post('/create', isAuthenticated, async (req, res) => {
    const userID = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');

    try {
        const user = await User.findOne({ userID });
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const newTopic = new Topic({
            title: req.body.title,
            creator: user._id  // Link the topic to the user who created it
        });
        await newTopic.save();
        res.redirect('/topics');  // Redirect to a page that lists all topics
    } catch (error) {
        res.status(500).send("Error creating topic: " + error.message);
    }
});

module.exports = router;