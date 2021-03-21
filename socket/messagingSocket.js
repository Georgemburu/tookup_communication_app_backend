// import socket to DB handlers
const messaging = require('../socketToDb/messaging');

module.exports = function messagingSocket (socket,io,connectedUserIdtoSocketIdObject){

    /***
     * handle messages
     */
    socket.on('sendMessage',(data)=>{
        /**
         * param {
         *  from: userId,
         *  to: userId,
         *  messageText: String,
         *  hasAttachment: Boolean,
         *  attachment: FILE
         * }
         */
        console.log('Message received',data)
        // UTILITY CALLBACKS
        function errorCallback(errorObj){

        }
        function successCallback(successObj){
            // emit the message to receipient
            let toUserSocketId = connectedUserIdtoSocketIdObject[data.to]
            console.log('toUserSocketId:::',toUserSocketId)
            if(!toUserSocketId){
                console.log('Receipient is not active')
            }else {
                console.log('Receipient is active')
                data.userFromObj = successObj.userFromObj;
                io.to(toUserSocketId).emit('receiveMessage',data);
            }

        }
        // save the message to DB
        // START
        messaging.saveOneOnOneChat(data,errorCallback,successCallback)
        
  

        // END
        // // broadcast the message
        // socket.broadcast.emit('receiveMessage',data)
        
    })


    socket.on('send_ReceiveDirectMessage',(contactId)=>{
        // emit the message to receipient
        let toUserSocketId = connectedUserIdtoSocketIdObject[contactId]
        console.log('toUserSocketId:::',toUserSocketId)
        if(!toUserSocketId){
            console.log('Receipient is not active')
        }else {
            console.log('Receipient is active')
            // data.userFromObj = successObj.userFromObj;
            io.to(toUserSocketId).emit('getMessagesAgain',{});
        }
    })
}
  
