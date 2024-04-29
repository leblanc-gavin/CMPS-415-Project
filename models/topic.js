const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;