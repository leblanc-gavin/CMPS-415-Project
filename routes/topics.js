const express = require('express');
const router = express.Router();
const Topic = require('../models/topic'); 
const User = require('../models/user');
const Post = require('../models/post');

function isAuthenticated(req, res, next) {
    if (!req.cookies.userToken) {
        return res.redirect('/');
    }
    next();
}

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const topics = await Topic.find().populate('creator', 'userID'); // Fetch all topics with creator details
        res.render('topics', { topics: topics });
    } catch (error) {
        res.status(500).send("Error fetching topics: " + error.message);
    }
});



router.get('/create', isAuthenticated, (req, res) => {
    const userID = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');
    res.render('create-topic', { userID }); // Assuming you have a view setup for this
});

router.post('/create', async (req, res) => {
    const token = req.cookies.userToken;
    if (!token) {
        return res.status(403).send("No user logged in.");
    }
    const userID = Buffer.from(token, 'base64').toString('ascii');

    try {
        const user = await User.findOne({ userID });
        if (!user) {
            return res.status(404).send("User not found.");
        }

        // Create the new topic
        const newTopic = new Topic({
            title: req.body.title,
            creator: user._id
        });
        await newTopic.save();

        // Create the initial post
        const newPost = new Post({
            content: req.body.content,
            author: user._id,
            topic: newTopic._id
        });
        await newPost.save();

        res.redirect(`/topics/${newTopic._id}`); // Redirect to the new topic page
    } catch (error) {
        res.status(500).send("Error creating topic and post: " + error.message);
    }
});

router.get('/:topicId', async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId)
            .populate({
                path: 'posts',
                populate: { path: 'author', select: 'username' }
            });

        if (!topic) {
            return res.status(404).send('Topic not found');
        }

        res.render('topic-detail', { topic: topic, posts: topic.posts });
    } catch (error) {
        res.status(500).send("Error accessing topic: " + error.message);
    }
});

router.post('/:topicId/posts', async (req, res) => {
    const { content } = req.body;
    const topicId = req.params.topicId;
    const userId = Buffer.from(req.cookies.userToken, 'base64').toString('ascii'); 

    try {
        const user = await User.findOne({ userId });
        const newPost = new Post({
            content: content,
            author: user._id,
            topic: topicId
        });
        await newPost.save();

        await Topic.findByIdAndUpdate(topicId, { $push: { posts: newPost._id } });

        res.redirect(`/topics/${topicId}`);
    } catch (error) {
        res.status(500).send("Error posting message: " + error.message);
    }
});

module.exports = router;