'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// var bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema({
  fullName: {
      type: String,
      required: true,
  },
  email: {
      type: String,
      required: true,
      unique: true
  },
  phoneNumber: {
      type: String,
      required: true,
      unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  password: {
      type: String,
      required: true
  },
  contacts: {
      type: [Schema.Types.ObjectId],
      required: false,
      ref: 'Users',
    //   autopopulate: true
  },
  chattingWith: {
    type: [Schema.ObjectId],
    required: false,
    ref:'Users'
  },
  groups: {
    type: [Schema.ObjectId],
    required: false,
    ref: 'Groups'
  },
  profilePictureUrl: {
    type: String,
    required: false
  },
//   userGroups: {
//       type: Schema.Types.ObjectId,
//       required: false,
//       ref: 'UserGroups',
//       autopopulate: true
//   },
  createdAT: {
      type: Date,
      required: true,
      default: Date.now()
  }



})


/**
 * autopopulate plugin
 */
// UserSchema.plugin(require('mongoose-autopopulate'));


// userSchema.methods.encryptPassword = function(password){
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null )
// };

// userSchema.methods.validPassword = function(user) {
//     return bcrypt.compareSync(user.password, this.password)
// }
UserSchema.methods.validPassword = function(pwd){
    console.log('cOMPARING:',pwd,this.pwd)
    return pwd === this.password;
}

module.exports = mongoose.model('Users',UserSchema); 



