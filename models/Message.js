'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const MessageSchema = new Schema({
    identity: {
        type: String, // userid1<userid2
        required: true
    },
   from: {
       type: Schema.Types.ObjectId,
       ref: 'Users',
       required: true
   },
   to: {
       type: Schema.Types.ObjectId,
       ref: 'Users',
       required: true
   },
   messageText: {
        type: String,
        required: false
   },
   hasAttachment: {
       type: Boolean,
       required: true,
   },
   attachmentUrl: {
       type: String,
       required: false
   },
   hasContact: {
       type: Boolean,
       required: true
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
       required: true,
       default: 'sent'
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
});


module.exports = mongoose.model('Messages',MessageSchema);