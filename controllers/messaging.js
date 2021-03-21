const Messages  = require('../models/Message');
const Users = require('../models/User');

// Util functions
const appends = require('../utils/appends');

const messaging_ = require('../socketToDb/messaging')

exports.sendDirectMessage = function(req,res){
    console.log('You reached send direct message route')

    let dataPayload = {
        from: req.body.from,
        to: req.body.to,
        messageText: req.body.messageText,
        hasAttachment: false,
        attachmentUrl: null,
        status: !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
        hasContact: false,
        contactId: null,
        contactName: null,
        contactEmail: null,
        contactPhoneNumber: null
    }

    // UTILITY CALLBACKS
    function errorCallback(errorObj){
        res.json(errorObj)
    }
    function successCallback(successObj){
        // emit the message to receipient
        let toUserSocketId = global.connectedUserIdtoSocketIdObject[dataPayload.to]
        console.log('toUserSocketId:::',toUserSocketId)
        if(!toUserSocketId){
            console.log('Receipient is not active')
        }else {
            console.log('Receipient is active')
            dataPayload.userFromObj = successObj.userFromObj;
            let io = req.locals.io;
            io.to(toUserSocketId).emit('receiveMessage',dataPayload);
        }
        res.json(successObj)

    }

    messaging_.saveOneOnOneChat(dataPayload,errorCallback,successCallback) 

}

exports.sendMessageWithFile = function(req,res,io){
    console.log('You reached sendMessage With File')
    console.log('File:',req.file)
    console.log('BODY:',req.body)

    let savedFilePathUrl = req.file.path.replace('public/','');
    // let reqBody = req.body;
    // reqBody.attachmentUrl = savedFilePathUrl

    // get the message
    let dataPayload = { 
        from: req.body.from,
        to: req.body.to,
        messageText: req.body.messageText,
        hasAttachment: req.body.hasAttachment,
        attachmentUrl: savedFilePathUrl,
        status: !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
        hasContact: false,
        contactId: null,
        contactName: null,
        contactEmail: null,
        contactPhoneNumber: null
        // contactsArrayStringiFiedObject: null
    }

     // UTILITY CALLBACKS
     function errorCallback(errorObj){
        res.json(errorObj)
    }
    function successCallback(successObj){
        // emit the message to receipient
        let toUserSocketId = global.connectedUserIdtoSocketIdObject[dataPayload.to]
        console.log('toUserSocketId:::',toUserSocketId)
        if(!toUserSocketId){
            console.log('Receipient is not active')
        }else {
            console.log('Receipient is active')
            dataPayload.userFromObj = successObj.userFromObj;
            let io = req.locals.io;
            io.to(toUserSocketId).emit('receiveMessage',dataPayload);
        }
        res.json(successObj)

    }

    messaging_.saveOneOnOneChat(dataPayload,errorCallback,successCallback) 

   
} 

exports.sendContactToDirectChat = function(req,res){
    console.log('You reached send contact to direct chat route')
    let currentUserId = req.user.id;
    // let contactsArrayCleaned = [];
    // req.body.contactsArray.forEach((contact)=>{
    //     contactsArrayCleaned.push({
    //         fullName: contact.fullName,
    //         email: contact.email,
    //         phoneNumber: contact.phoneNumber,
    //         id: contact._id
    //     })
    // })

    let dataPayload = {
        from: req.body.fromId,
        to: req.body.toId,
        messageText: req.body.messageText,
        hasAttachment: req.body.hasAttachment,
        attachmentUrl: null,
        status: !global.connectedUserIdtoSocketIdObject[req.body.toId]?'sent':'delivered',
        hasContact: req.body.hasContact,
        contactId: req.body.contactId,
        contactName: req.body.contactName,
        contactEmail: req.body.contactEmail,
        contactPhoneNumber: req.body.contactPhoneNumber
        // contactsArrayStringiFiedObject: JSON.stringify(contactsArrayCleaned)
    }


      // UTILITY CALLBACKS
     function errorCallback(errorObj){
        res.json(errorObj)
    }
    function successCallback(successObj){
        // emit the message to receipient
        let toUserSocketId = global.connectedUserIdtoSocketIdObject[dataPayload.to]
        console.log('toUserSocketId:::',toUserSocketId)
        if(!toUserSocketId){
            console.log('Receipient is not active')
        }else {
            console.log('Receipient is active')
            dataPayload.userFromObj = successObj.userFromObj;
            let io = req.locals.io
            io.to(toUserSocketId).emit('receiveMessage',dataPayload);
        }
        res.json(successObj)

    }

    messaging_.saveOneOnOneChat(dataPayload,errorCallback,successCallback)


} 
/**
 * @returns {[chattingWith:userId]:messages[]}
 */
// getChatMessages
exports.getChatMessages = function(req,res){
    console.log('You reached getChatMessages');
    let currentUserId = req.user.id;
    // query db
    //1. Get a list of chattingWith from Users Obj
    Users.findById(currentUserId,(error,userObj)=>{
        if(error){
            // handle error
            res.json({
                succes: false,
                message: 'DB Error: Failed to query db'
            })
        }else {
            if(!userObj){
                // handle no user found
                res.json({
                    success: false,
                    message: 'No user found matching the logged in ID'
                })
            }else {
                // user found
                // get the chatting with list
                let chattingWithList = userObj.chattingWith;
                // handle if empty
                if(chattingWithList.length==0){
                    // no user in list
                    res.json({
                        success: true,
                        message: 'ChattingList is empty'
                    })
                }else {
                    let cachedChatMessages = {} // key==chattingWithUserId value==[Object of messages]
                    // loop throught the list getting messages exchanged
                    let promiseArr = []
                    chattingWithList.forEach((chatingWith_userId)=>{
                        // construct the identity ie 'ahjashh23h2jh_dhsjdshjdhsjdhs' 
                        let identity = appends.lessThanGreaterThanUserIdAppender(currentUserId,chatingWith_userId);
                        // query Message collection using identity
                        promiseArr.push(Messages.find({ identity: identity }).sort('+timeStamp').find())
                        
                    })
                    // end of loop
                    // resolve the primise all
                    Promise.all(promiseArr).then((chatMessagesArrays)=>{
                        // console.log('chatMessagesArrays:',chatMessagesArrays)
                        // retrieved succes
                        // NOTE: Chat messages might be an empty array (Thats fine for now)
                        // cache
                        for(let i=0;i<chatMessagesArrays.length;i++){
                            cachedChatMessages[chattingWithList[i]] = chatMessagesArrays[i];
                        }
                        // console.log('returning to user cachedChatMessages:',cachedChatMessages)
                        /**
                         * FORMAT THE DATA TO [{from: 'id',to:'id',messages:[{msg}] }]
                         *  */ 
                        let contact_chattingWithId = Object.keys(cachedChatMessages);
                        let wholeOrderedObj = {};
                        let contactChattingWithOrderedMessagesArr = [];
                        let lastId = null;
                        let obj = {};
                        contact_chattingWithId.forEach((contactChattingWithId_)=>{
                            cachedChatMessages[contactChattingWithId_].forEach((msg,index)=>{
                                if(!lastId){
                                    obj.from = msg.from;
                                    obj.to = msg.to;
                                    obj.messages = [];
                                    obj.messages.push(msg);

                                    // push if its the last in index
                                    if(cachedChatMessages[contactChattingWithId_].length == index+1){
                                        if(obj.from){
                                            contactChattingWithOrderedMessagesArr.push(obj)
                                            obj ={};
                                        }
                                    }  
                                }else if(lastId==msg.from){
                                    obj.messages.push(msg);
                                }else {
                                    if(obj.from){
                                        contactChattingWithOrderedMessagesArr.push(obj)
                                        obj ={};
                                    }
                                    obj.from = msg.from;
                                    obj.to = msg.to;
                                    obj.messages = [];
                                    obj.messages.push(msg);
                                }
                                lastId = msg.from;
                                if(cachedChatMessages[contactChattingWithId_].length == index+1){
                                    if(obj.from){
                                        contactChattingWithOrderedMessagesArr.push(obj)
                                        obj ={};
                                    }
                                } 
                                
                            })
                            wholeOrderedObj[contactChattingWithId_] = contactChattingWithOrderedMessagesArr;
                        })
                        console.log('CHAT MESAGES RETURNING:',{
                            succes: true,
                            message: 'Successfully retrieved chat messages',
                            chatMessages: cachedChatMessages,
                            orderedObj: wholeOrderedObj}
                        )
                        // return as response
                        res.json({
                            succes: true,
                            message: 'Successfully retrieved chat messages',
                            chatMessages: cachedChatMessages,
                            orderedObj: wholeOrderedObj
                        })
                    }).catch((err)=>{
                        // handle 
                        console.log('ERROR:',err)
                        res.json({
                            success: false,
                            message: 'DB ERROR: Failed to find messages'
                        })
                    })
                    
                }
            }
        }
    })
}

let newOrderedchatMessagesForDisplay = [];

function getSortedMessages(chatMessagesObject_=null){
    if(chatMessagesObject_){
      chatMessagesObject = chatMessagesObject_;
      console.log('SET CHAT MESSAGES AGAIN in getSortedMessages():',chatMessagesObject)
    }
    console.log('CALLED getSortedMessages')
    // if(!this.clickedContact || !this.clickedContact._id){
    //   console.log('CALLED getSortedMessages returned')
    //   newOrderedchatMessagesForDisplay = []
    //   return;
    // }
    console.log('CALLED getSortedMessages passes')

    let cacheMessages = []
    let lastId = null;
    // let receipientId = this.clickedContact._id;
    let msgNewObj = {

      
    }
    // console.log('CALLED GETSORTEDMESAGES::',this.chatMessagesObject,this.clickedContact._id)
    // check if messages array is
    if(!Array.isArray(chatMessagesObject[this.clickedContact._id])){
      // handle undefined
      console.log('chatMessagesObject[this.clickedContact._id]) is undefined not an array')
    }else {
      chatMessagesObject[this.clickedContact._id].forEach((msg,index)=>{
        console.log('index:index',index)
        // console.log('MSG:::',msg)
        if(!lastId){
          // console.log('No last id initializing')
          // console.log('Last id==',lastId)

          msgNewObj ={};
          // msgNewObj = {}
          msgNewObj.messages = [];
          msgNewObj.from = msg.from;
          msgNewObj.to = msg.to;
          if(!msgNewObj.messages.includes(msg)){
            msgNewObj.messages.push(msg);
          }
          // console.log('pushed one:',msgNewObj)
          if(chatMessagesObject[this.clickedContact._id].length==index+1){
              
            cacheMessages.push(msgNewObj)
            console.log('CHECK:',index)
              console.log('msgObj:',cacheMessages)
          }
        }else {
          if(lastId==msg.from){
            // console.log('last id mathc msg.from')
            if(!msgNewObj.messages.includes(msg)){
              msgNewObj.messages.push(msg);
            }
            // msgNewObj.messages.push(msg)
            // console.log('Pusshed:',msgNewObj)
            if(chatMessagesObject[this.clickedContact._id].length==index+1){

              cacheMessages.push(msgNewObj)
              console.log('CHECK:',index)
              console.log('msgObj:',cacheMessages)
            }
          }else {
            // console.log('ids not same')
            cacheMessages.push(msgNewObj)
            // console.log('Pushed to cache:',cacheMessages)

            msgNewObj ={};
            // msgNewObj = {}
            msgNewObj.messages = [];
            msgNewObj.from = msg.from;
            msgNewObj.to = msg.to;
            msgNewObj.messages.push(msg);
            // console.log('New msgNewObj:',msgNewObj)
          }
        }
        // console.log('Setting lastId')
        lastId=msg.from;
      })

      newOrderedchatMessagesForDisplay =  cacheMessages;
      console.log('newOrderedchatMessagesForDisplay:@@,',newOrderedchatMessagesForDisplay)
    } 
  }