const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Make sure the path matches your user model
const Post = require('../models/post');
const Topic = require('../models/topic');

// User info route
router.get('/', async (req, res) => {
    
    const token = req.cookies.userToken;
    if (!token) {
        return res.redirect('/');
    }
    const userID = Buffer.from(token, 'base64').toString('ascii');
    
    try {
        const user = await User.findOne({ userID: userID });
        if (!user) {
            console.error("User not found with ID:", userID);
            return res.status(404).send('User not found.');
        }
        // Fetch 3 random posts including topic details
        const randomPosts = await Post.aggregate([
            { $sample: { size: 3 } },
            { $lookup: {
                from: "topics",  // Adjust this if your collection name differs
                localField: "topic",
                foreignField: "_id",
                as: "topicDetails"
            }}
        ]);

        // Fetch subscribed topics
        const subscribedTopics = await Topic.find({
            subscribers: user._id
        }).populate('creator', 'userID');  // Populate creator details if needed

        // Display user info along with random posts and subscribed topics
        res.render('user-info', { userID: userID, posts: randomPosts, subscribedTopics: subscribedTopics });
    } catch (error) {
        console.error("Failed to fetch data:", error);
        res.render('user-info', { userID: userID, posts: [], subscribedTopics: [], error: "Failed to fetch data." });
    }

});

module.exports = router;
