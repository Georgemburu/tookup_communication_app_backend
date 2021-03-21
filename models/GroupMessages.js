const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const GroupMessageSchema = new Schema({
    from : {
        type: Schema.Types.ObjectId, // UserId
        required: true,
        ref: 'Users'
    },
    to: {
        type: Schema.Types.ObjectId, // GroupId
        required: true
    },
    messageText: {
        type: String,
    },
    hasAttachment: {
        type: Boolean,
        default: false
    },
    attachmentUrl: {
        type: String,
        required: false
    },
    hasContact: {
        type: Boolean,
        required: true,
    },
    contactId: {
        type: String,
        required: false
    },
    contactName: {
        type: String,
        required: false
    },
    contactEmail: {
        type: String,
        required: false
    },
    contactPhoneNumber: {
         type: String,
         required: false
    },
    status: {
        type: String,
        required: true
    },
    timeStamp: {
        type: Date,
        required: true,
        default: Date.now()
    },
    year: {
        type: String,
        required: true,
    },
    month: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
    
})


module.exports = mongoose.model('GroupMessages',GroupMessageSchema);