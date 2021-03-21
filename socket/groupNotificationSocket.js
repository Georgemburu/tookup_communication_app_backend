const GroupNotifications = require('../models/GroupNotification');


module.exports = function messagingSocket (socket,io,connectedUserIdtoSocketIdObject){

  

    socket.on('sendGroupInvitationRequest',(data)=>{
        let receipientId = data.receipientId;
        console.log('Received send group invitation request :',data)
        // check if the receipient is active
        let receipientSocketId = connectedUserIdtoSocketIdObject[receipientId];
        if(!receipientSocketId){
            // user is not active
            console.log('Receipent of group notification is offline')

        }else {
            // user is active send notification
            console.log('Receipent of group notification is online')
            console.log('Sending notification ...')
            io.to(receipientSocketId).emit('checkGroupNotifications',data);

        }
    })

    // refresh user info
    socket.on('send_refresh_ALL_USER_INFO',(data)=>{
        let receipientId = data.receipientId;
        // check if online
        let receipientSocketId = connectedUserIdtoSocketIdObject[receipientId];
        if(!receipientSocketId){
            // user is not active
            console.log('Receipent of send_refresh_ALL_USER_INFO is offline')

        }else {
            // user is active send notification
            console.log('Receipent of send_refresh_ALL_USER_INFO is online')
            console.log('Sending notification ...')
            io.to(receipientSocketId).emit('refresh_ALL_USER_INFO',data);

        }
    })

    



}