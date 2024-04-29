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
    const userId = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');
    try {
        const user = await User.findOne({ userID: userId });
        if (!user) {
            return res.status(404).send("User not found.");
        }
        const topics = await Topic.find().populate('creator', 'userID');
        const subscribedTopics = await Topic.find({ subscribers: user._id })
            .populate('creator', 'userID');

        const topicsWithRecentPosts = await Promise.all(subscribedTopics.map(async (topic) => {
            const recentPosts = await Post.find({ topic: topic._id })
                .sort({ createdAt: -1 })
                .limit(2)
                .populate('author', 'userID');  

            return {
                ...topic._doc,
                recentPosts: recentPosts
            };
        }));

        res.render('topics', { allTopics: topics, topicsWithRecentPosts: topicsWithRecentPosts });

    } catch (error) {
        console.error("Error fetching subscribed topics: " + error.message);
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
            creator: user._id,
            subscribers: [user._id]
        });
        await newTopic.save();
        console.log(newTopic);

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
    
    const userId = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');  

    try {
        const user = await User.findOne({ userID: userId });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const topic = await Topic.findById(req.params.topicId)
            .populate('creator', 'userID') 
            .populate({
                path: 'posts',
                populate: { path: 'author', select: 'userID' } 
            });

        if (!topic) {
            return res.status(404).send('Topic not found');
        }

        console.log("User ID:", user._id.toString());
        console.log("Subscribers:", topic.subscribers.map(sub => sub.toString()));

        res.render('topic-detail', { topic: topic, posts: topic.posts, userID: user._id.toString() });
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

router.post('/:topicId/subscribe', isAuthenticated, async (req, res) => {
    const userId = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');

    try {
        const user = await User.findOne({ userID: userId });
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const topic = await Topic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).send("Topic not found.");
        }

        // Add user to subscribers if not already subscribed
        if (!topic.subscribers.includes(user._id)) {
            topic.subscribers.push(user._id);
            await topic.save();
        }

        res.redirect(`/topics/${req.params.topicId}`);
    } catch (error) {
        res.status(500).send("Error subscribing to topic: " + error.message);
    }
});

router.post('/:topicId/unsubscribe', isAuthenticated, async (req, res) => {
    const userId = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');

    try {
        const user = await User.findOne({ userID: userId });
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const topic = await Topic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).send("Topic not found.");
        }

        // Remove user from subscribers
        topic.subscribers = topic.subscribers.filter(subscriberId => !subscriberId.equals(user._id));
        await topic.save();

        res.redirect(`/topics/${req.params.topicId}`);
    } catch (error) {
        res.status(500).send("Error unsubscribing from topic: " + error.message);
    }
});

router.post('/:topicId/posts/:postId/delete', isAuthenticated, async (req, res) => {
    const userId = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');
    const { topicId, postId } = req.params;

    try {
        const post = await Post.findById(postId);
        const user = await User.findOne({ userID: userId });

        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Check if the logged-in user is the author of the post
        if (post.author.toString() !== user._id.toString()) {
            return res.status(403).send("You can only delete your own posts.");
        }

        await Post.findByIdAndDelete(postId);

        res.redirect(`/topics/${topicId}`);
    } catch (error) {
        res.status(500).send("Error deleting post: " + error.message);
    }
});

router.post('/:topicId/posts/:postId/update', isAuthenticated, async (req, res) => {
    const { content } = req.body;
    const { topicId, postId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        const user = await User.findOne({ userID: Buffer.from(req.cookies.userToken, 'base64').toString('ascii') });
        if (!post.author.equals(user._id)) {
            return res.status(403).send("You can only update your own posts.");
        }

        post.content = content;
        await post.save();
        res.json({ message: "Post updated successfully", content });
    } catch (error) {
        res.status(500).json({ error: "Error updating post" });
    }
});

router.post('/:topicId/delete', isAuthenticated, async (req, res) => {
    const { topicId } = req.params;
    const userId = Buffer.from(req.cookies.userToken, 'base64').toString('ascii');

    try {
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).send('Topic not found');
        }
        
        const user = await User.findOne({ userID: userId });
        if (!user) {
            return res.status(404).send("User not found.");
        }

        // Check if the logged-in user is the creator of the topic
        if (!topic.creator.equals(user._id)) {
            return res.status(403).send("You can only delete topics that you have created.");
        }

        // Delete the topic
        await Topic.findByIdAndDelete(topicId);
        // Optionally, delete all posts associated with this topic or handle them differently
        await Post.deleteMany({ topic: topicId });

        res.redirect('/topics'); // Redirect to the topics listing or dashboard
    } catch (error) {
        res.status(500).send("Error deleting topic: " + error.message);
    }
});

module.exports = router;