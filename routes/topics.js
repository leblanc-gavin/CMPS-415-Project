const express = require('express');
const router = express.Router();
const Topic = require('../models/topic'); 
const User = require('../models/user');
const Post = require('../models/post');
const Subscriptions = require('../models/subscriptions');


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
        
         // Update user's subbedTopics array
        await Subscriptions.findOneAndUpdate(
            { userId: user._id },
            { $addToSet: { subbedTopics: newTopic.title } }, // Add the new topic title to subbedTopics array
            { upsert: true } // Create a new document if it doesn't exist
        );


        // Create the initial post
        const newPost = new Post({
            content: req.body.content,
            author: user._id,
            topic: newTopic._id
        });
        await newPost.save();
        
        await Topic.findByIdAndUpdate(newTopic._id, { $push: { posts: newPost._id } });
        
        res.redirect(`/topics/${newTopic._id}`); // Redirect to the new topic page
    } catch (error) {
        res.status(500).send("Error creating topic and post: " + error.message);
    }
});

router.get('/:topicId', async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId)
            .populate('creator', 'userID') 
            .populate({
                path: 'posts',
                populate: { path: 'author', select: 'userID' } 
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
    console.log("Extracted userID from token: ", userId); // Debugging line

    try {
        const user = await User.findOne({ userID: userId });
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