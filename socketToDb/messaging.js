const Messages = require('../models/Message');
const Users = require('../models/User');
const Groups = require('../models/Group');


// utils functions
const append = require('../utils/appends');


exports.saveOneOnOneChat = function(dataPayload,errorCallback,successCallback){
    console.log('CALLED saveOneOnOneChat')
    /**
     * param {
     *  from: userId,
     *  to: userId,
     *  messageText: String,
     *  hasAttachment: Boolean,
     *  attachment: FILE
     * }
     */
    let fromId = dataPayload.from;
    let toId = dataPayload.to;
    let currentDateTime = Date.now();
    let dateTimeString = new Date(currentDateTime).toString()
    let day = dateTimeString.split(' ')[0];
    let month = dateTimeString.split(' ')[1];
    let date = dateTimeString.split(' ')[2];
    let year = dateTimeString.split(' ')[3];
    let time = dateTimeString.split(' ')[4];


    let identity = append.lessThanGreaterThanUserIdAppender(fromId,toId);

    // save message
    let messagesObjectToSave = {
        identity: identity,
        from: fromId,
        to: toId,
        messageText: dataPayload.messageText,
        hasAttachment: dataPayload.hasAttachment,
        attachmentUrl: dataPayload.attachmentUrl,
        status: dataPayload.status,
        hasContact: dataPayload.hasContact,
        contactId: dataPayload.contactId,
        contactName: dataPayload.contactName,
        contactEmail: dataPayload.contactEmail,
        contactPhoneNumber: dataPayload.contactPhoneNumber,
        year: year,
        month: month,
        date: date,
        day: day,
        time: time
    }
    console.log('messagesObjectToSave:',messagesObjectToSave)
    Messages.create(messagesObjectToSave,(error,msg)=>{
        if(error){
            messagesObjectToSave.status = 'failed'
            // handle error
            console.log('Error saving messagesObjectToSave:',error)
            errorCallback({
                success: false,
                mode: 'Save Message',
                message: 'Failed to save message',
                failedMessage: messagesObjectToSave
            })
        }else {
            // handle success
            console.log('Saved message:')
            // save contact as chatting with in from db
            Users.findById(fromId,(error2,userFromObj)=>{
                if(error2){
                    messagesObjectToSave.status = 'failed'
                    // handle error
                    errorCallback({
                        success: false,
                        mode: 'Save Message',
                        message: 'Failed to perform finduser by id query for fromId',
                        failedMessage: messagesObjectToSave
                    })
                }else {
                    // handle success
                    // save to to toUSer as chatting with
                    if(userFromObj.chattingWith.indexOf(toId)==-1){
                        userFromObj.chattingWith.push(toId);
                    
                    }
                    
                    userFromObj.save((error,success)=>{
                        if(error){
                            // handle error
                        }else {

                            Users.findById(toId,(error3,userToObj)=>{
                                if(error3){
                                    messagesObjectToSave.status = 'failed'
                                    //handle error
                                    errorCallback({
                                        success: false,
                                        mode: 'Save Message',
                                        message: 'Failed to perform finduser by id query for toId',
                                        failedMessage: messagesObjectToSave
                                    })
                                }else {
                                    // save fromId to chatting with
                                    if(userToObj.chattingWith.indexOf(fromId)==-1){
                                        // append id
                                        userToObj.chattingWith.push(fromId)
                                    }
                                    // save
                                    userToObj.save((error,suc)=>{
                                        if(error){
                                            // handle error
                                        }else {
                                            console.log('Saved Complete')
                                            // handle COMPLETE success
                                            successCallback({
                                                success: true,
                                                mode: 'Save Message',
                                                message: 'Successfull Complete saved message',
                                                userFromObj: userFromObj,
                                                sentMessage: msg
                                            })
                                        }
                                    })
                                      
                                }
                            })
                        }
                    })
                   
                }
            })
        }
    })



}