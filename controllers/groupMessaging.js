const GroupMessages = require('../models/GroupMessages');
const Users = require('../models/User');

exports.sendGroupMessage = function(req,res){
    let idOfSender = req.user.id;
    
    let currentDateTime = Date.now();
    let dateTimeString = new Date(currentDateTime).toString()
    let day = dateTimeString.split(' ')[0];
    let month = dateTimeString.split(' ')[1];
    let date = dateTimeString.split(' ')[2];
    let year = dateTimeString.split(' ')[3];
    let time = dateTimeString.split(' ')[4];

    let groupMessageInfoToSave = {
        from: idOfSender,
        to: req.body.to,
        messageText: req.body.messageText,
        hasAttachment: false,
        attachmentUrl: null,
        hasContact: false,
        contactId: null,
        contactName: null,
        contactEmail: null,
        contactPhoneNumber: null,
        status:  !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
        year: year,
        month: month,
        date: date,
        day: day,
        time:time
    }

    // TO DO: Checks

    // save to db
    // GET THE USER who sent it
    Users.findById(idOfSender,(error,senderInfoObject)=>{
        if(error){
            // handle error
            groupMessageInfoToSave.status ='failed';
            res.json({
                success: false,
                message: 'DB Error:Failed to send Message',
                messageStatus: 'failed',
                failedMessage: groupMessageInfoToSave 
            })
        }else {
            // save message
            GroupMessages.create(groupMessageInfoToSave,(error,msg)=>{
                if(error){
                    // handle error
                    groupMessageInfoToSave.status ='failed';
                    res.json({
                        success: false,
                        message: 'DB Error: Failed to send message',
                        messageStatus: 'failed',
                        sentMessage: groupMessageInfoToSave 
                    })
                }else {
                    let msgObject = msg.toObject();
                    msgObject.from = senderInfoObject;
                    res.json({
                        success: true,
                        message: 'Successfully sent message',
                        messageStatus: !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
                        sentMessage: msgObject
                    })
                }
            }) 
        }
    })
   

}


exports.sendGroupMessageWithFile = function(req,res){
    console.log('Reached sendGroupMessageWithFile route')
    let currentUserId = req.user.id;
    
    let currentDateTime = Date.now();
    let dateTimeString = new Date(currentDateTime).toString()
    let day = dateTimeString.split(' ')[0];
    let month = dateTimeString.split(' ')[1];
    let date = dateTimeString.split(' ')[2];
    let year = dateTimeString.split(' ')[3];
    let time = dateTimeString.split(' ')[4];

    let savedFilePathUrl = req.file.path.replace('public/','');

    let groupMessageInfoToSave = {
        from: currentUserId,
        to: req.body.to,
        messageText: req.body.messageText,
        hasAttachment: req.body.hasAttachment,
        attachmentUrl: savedFilePathUrl,
        hasContact: false,
        contactId: null,
        contactName: null,
        contactEmail: null,
        contactPhoneNumber: null,
        status:  !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
        year: year,
        month: month,
        date: date,
        day: day,
        time:time
    }

    // TO DO: Checks

    // save to db
    Users.findById(currentUserId,(err,senderInfoObject)=>{
        if(err){
            res.json({
                success: false,
                message: 'Failed to send message',
                messageStatus: 'failed',
                sentMessage: null
            })
        }else {
            GroupMessages.create(groupMessageInfoToSave,(error,msg)=>{
                if(error){
                    // handle error
                    res.json({
                        success: false,
                        message: 'DB Error: Failed to save message',
                        messageStatus: 'failed',
                        sentMessage: null
                    })
                }else {
                    let msgObject = msg.toObject();
                    msgObject.from = senderInfoObject;
                    res.json({
                        success: true,
                        message: 'Successfully save message',
                        messageStatus: !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
                        sentMessage: msgObject
                    })
                }
            }) 
        }
    })
    

}



exports.sendContactToGroupChat = function(req,res){
    console.log('reached sendContactToGroupChat route')
    let idOfSender = req.user.id;
    
    let currentDateTime = Date.now();
    let dateTimeString = new Date(currentDateTime).toString()
    let day = dateTimeString.split(' ')[0];
    let month = dateTimeString.split(' ')[1];
    let date = dateTimeString.split(' ')[2];
    let year = dateTimeString.split(' ')[3];
    let time = dateTimeString.split(' ')[4];

    // let contactsArrayCleaned = [];
    // req.body.contactsArray.forEach((contact)=>{
    //     contactsArrayCleaned.push({
    //         fullName: contact.fullName,
    //         email: contact.email,
    //         phoneNumber: contact.phoneNumber,
    //         id: contact._id
    //     })
    // })

    let groupMessageInfoToSave = {
        from: req.body.fromId,
        to: req.body.toId,
        messageText: req.body.messageText,
        hasAttachment: false,
        attachmentUrl: null,
        hasContact: req.body.hasContact,
        contactId: req.body.contactId,
        contactName: req.body.contactName,
        contactEmail: req.body.contactEmail,
        contactPhoneNumber: req.body.contactPhoneNumber,
        status:  !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
        year: year,
        month: month,
        date: date,
        day: day,
        time:time
    }

    // TO DO: Checks

    // save to db
    GroupMessages.create(groupMessageInfoToSave,(error,msg)=>{
        if(error){
            console.log(error)
            // handle error
            groupMessageInfoToSave.status = 'failed'
            res.json({
                success: false,
                message: 'DB Error: Failed to save message',
                messageStatus: 'failed',
                failedMessage: groupMessageInfoToSave
            })
        }else {
            res.json({
                success: true,
                message: 'Successfully save message',
                messageStatus: !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
                sentMessage:msg
            })
        }
    })
}


exports.getAllUserGroupMessages = function(req,res){
    console.log('Reached getAllUserGroupMessages route')
    let currentUserId = req.user.id;
    // find the user and get his groups array (the groups he/she is a participant)
    Users.findById(currentUserId,(error,user_)=>{
        if(error){
            // handle error
            // console.log('DB Error',error)
            res.json({
                success: false,
                message: 'DB Error: Failed to query current user'
            })
        }else if(!user_){
            // handle no user
            // console.log('No user found',user_)
            res.json({
                success: false,
                message: 'Error: Found no current user'
            })
        }else if(user_.groups.length<=0) {
            // handle no groups
            // console.log('No groups found',user_.groups)
            res.json({
                success: false,
                message: 'User has no groups'
            })
        }else {
            // handle success : found user
            // console.log('Groups found!!')
            let userGroupsIds = user_.groups;
            let promissesArray = []
            // handle if  no groups 
            // get the messages for the groups
            userGroupsIds.forEach((groupId_)=>{
                // console.log('Looping group arrays',groupId_)
                promissesArray.push(GroupMessages.find({}).where({to:groupId_}).sort('+timeStamp').populate('from').exec())
            })
            // resolve the promises
            
            Promise.all(promissesArray).then((groupsMessagesArray)=>{
                // console.log('groupsMessagesArray:::',groupsMessagesArray)
                let GroupMessagesObject = {};
                for(let i=0;i<userGroupsIds.length; i++){
                    GroupMessagesObject[userGroupsIds[i]] = groupsMessagesArray[i]
                    // console.log('GroupMessagesObject:',GroupMessagesObject)
                }
                // return response
                // console.log('fOUND GROUP MESSAGES:',GroupMessagesObject)
                res.json({
                    success: true,
                    message: 'Successfully retrieved All user  groups messages ',
                    groupMessagesObject: GroupMessagesObject
                })
            }).catch((error_)=>{
                // handle error
                // console.log('Error couldnot find group messages',error_)
                res.json({
                    success: false,
                    message: 'Error: Failed to retrieve all user groups messages'
                })
            })
        }
    })
}