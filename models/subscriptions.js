const mongoose = require('mongoose');

const subscriptionsSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Change the type to String
    subbedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true }],
});

const Subscriptions = mongoose.model('subscriptions', subscriptionsSchema);

module.exports = Subscriptions;
