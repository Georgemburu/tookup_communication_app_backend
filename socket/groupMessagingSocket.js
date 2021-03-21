// import socket to DB handlers
// const messaging = require('../socketToDb/messaging');

module.exports = function groupMessagingSocket(socket,io,connectedUserIdtoSocketIdObject){

    /***
     * handle messages
     */
    socket.on('sendReceiveGroupMessage',(data)=>{
        let receipientsIdArray = data.receipientsIdArr;
        console.log('sendReceiveGroupMessage received',data)
        // check to see if receipient is active
        receipientsIdArray.forEach((receipientId)=>{
            let receipientSocketId = connectedUserIdtoSocketIdObject[receipientId];
            if(!receipientSocketId){
                // user is not active
                console.log('Receipent of receiveGroupMessage is offline')

            }else {
                // user is active send notification
                console.log('Receipent of receiveGroupMessage is online')
                console.log('Sending notification ...')
                io.to(receipientSocketId).emit('receiveGroupMessage',data);

            }
        })
        
        // END
        
    })
}
  
