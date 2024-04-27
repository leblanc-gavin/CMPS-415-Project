const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subbedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true }],
});

const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

module.exports = UserSubscription;
