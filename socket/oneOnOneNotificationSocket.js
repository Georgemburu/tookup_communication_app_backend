const OneOnNotification = require('../models/OneOnNotification');


module.exports = function messagingSocket (socket,io,connectedUserIdtoSocketIdObject){

    
    socket.on('sendAddContactRequest',(data)=>{
        let receipientId = data.receipientId;
        console.log('Received sent add contact request:',data)
        // check to see if receipient is active
        let receipientSocketId = connectedUserIdtoSocketIdObject[receipientId];
        if(!receipientSocketId){
            // user is not active
            console.log('Receipent of One on one notification is offline')

        }else {
            // user is active send notification
            console.log('Receipent of One on one notification is online')
            console.log('Sending notification ...')
            io.to(receipientSocketId).emit('checkOneOnOneNotifications',data);

        }
    })

    socket.on('sendGroupInvitationRequest',(data)=>{
        let receipientId = data.receipientId;
        console.log('Received send group invitation request :',data)
        // check if the receipient is active
        let receipientSocketId = connectedUserIdtoSocketIdObject[receipientId];
        if(!receipientSocketId){
            // user is not active
            console.log('Receipent of One on one notification is offline')

        }else {
            // user is active send notification
            console.log('Receipent of One on one notification is online')
            console.log('Sending notification ...')
            io.to(receipientSocketId).emit('checkOneOnOneNotifications',data);

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