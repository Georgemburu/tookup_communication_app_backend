'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const GroupSchema = new Schema({
    groupName: {
        type: String,
        required: true
    },
    participants: {
        type: [ Schema.Types.ObjectId ],
        ref: 'Users',
        required: false
    },
    createdAt: {
        type: Date,
        required: false,
        default: Date.now()
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
 
});


module.exports = mongoose.model('Groups',GroupSchema);