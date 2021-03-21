const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const OneOnOneNotificationSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    read: {
        type: Boolean,
        required: true,
        default: false
    },
    // to: {
    //     type: Number,
    //     required: true
    // },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'friend_request','profile_picture_update'
        required: true
    },
    createdAt: {
        type: Date,
        defalt: Date.now()
    }
})



module.exports = mongoose.model('OneOnOneNotifications',OneOnOneNotificationSchema);