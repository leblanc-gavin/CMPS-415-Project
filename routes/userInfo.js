const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Make sure the path matches your user model
const Post = require('../models/post');

// User info route
router.get('/', async (req, res) => {
    
    const token = req.cookies.userToken;
    if (!token) {
        return res.redirect('/');
    }
    const userID = Buffer.from(token, 'base64').toString('ascii');
    
    try {
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

        // Display user info along with random posts
        res.render('user-info', { userID: userID, posts: randomPosts });
    } catch (error) {
        console.error("Failed to fetch random posts:", error);
        res.render('user-info', { userID: userID, posts: [], error: "Failed to fetch posts." });

    }

});

try {
    // Fetch user's subscriptions
    const subscriptions = await Subscription.find({ userID: userID });

    // Extract topic IDs from subscriptions
    const topicIDs = subscriptions.map(subscription => subscription.topic);

    // Fetch the two most recent posts for each subscribed topic
    const recentPosts = await Promise.all(topicIDs.map(async (topicID) => {
        return Post.aggregate([
            { $match: { topic: topicID } },
            { $sort: { createdAt: -1 } }, // Sort by creation date, newest first
            { $limit: 2 } // Limit to 2 most recent posts
        ]);
    }));

    // Flatten the array of arrays into a single array of posts
    const posts = recentPosts.flat();

    // Display user info along with recent posts
    res.render('user-info', { userID: userID, posts: posts });
} catch (error) {
    console.error("Failed to fetch recent posts:", error);
    res.render('user-info', { userID: userID, posts: [], error: "Failed to fetch posts." });
}

module.exports = router;
