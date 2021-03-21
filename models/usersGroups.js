const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UsersGroupsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    groups: {
        type: [ Schema.Types.ObjectId],
        ref: 'Groups',
        required: false
    }
})


module.exports = mongoose.model('UserGroups',UsersGroupsSchema);