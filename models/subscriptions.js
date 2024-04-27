const mongoose = require('mongoose');

const subscriptionsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subbedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true }],
});

const Subscriptions = mongoose.model('subscriptions', subscriptionsSchema);

module.exports = Subscriptions;
