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

module.exports = router;
