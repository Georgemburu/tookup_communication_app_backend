module.exports = function(io){
    // console.log('CALLED SOCKET ENTRY INDEX WITH:',io)
    /***
     * @param io passed from app.js
     */
    // detect connection
    let connectedUsersArray = []
    let socketIdToReqUserIdObject = {}
    global.connectedUserIdtoSocketIdObject = {} // key==userDBid: value==userSocketId
    io.on('connection',(socket)=>{
        console.log('One socket connected:',socket.id)
        // add connected user to connectedUsers array
        connectedUsersArray.push(socket.id);
        // add to socketIdToReqUserId
        socketIdToReqUserIdObject[socket.id] = null;
        // listen for user sending user Id
        socket.on('sendConnectedUserId',(connectedUserId)=>{
            console.log('Received connected user id:',connectedUserId)
            // save to connected user object
            connectedUserIdtoSocketIdObject[connectedUserId] = socket.id;
            // update to socketIdToReqUserId
            socketIdToReqUserIdObject[socket.id] = connectedUserId;
        })

        // MESSAGING SOCKET
        require('./messagingSocket')(socket,io,connectedUserIdtoSocketIdObject)
        // GROUP MESSAGING SOCKET
        require('./groupMessagingSocket')(socket,io,connectedUserIdtoSocketIdObject)
        // NOTIFICATION SOCKET
        require('./oneOnOneNotificationSocket')(socket,io,connectedUserIdtoSocketIdObject)
        require('./groupNotificationSocket')(socket,io,connectedUserIdtoSocketIdObject)
        /***
         * handle disconnect
         */
        socket.on('disconnect',(data)=>{
            let disconnectedSocketId = socket.id;
            // remove the id from the arrays of ids
            let indexOfDisconnectedId = connectedUsersArray.indexOf(disconnectedSocketId);
            if(indexOfDisconnectedId!==-1){
                connectedUsersArray.splice(indexOfDisconnectedId,1)
                // remove from both user objects
                let dbUserId = socketIdToReqUserIdObject[indexOfDisconnectedId];
                delete connectedUserIdtoSocketIdObject[dbUserId];
                delete socketIdToReqUserIdObject[indexOfDisconnectedId];
                dbUserId = null;
                console.log('Successfully disconnected user:',disconnectedSocketId)
            }else {
                console.log('Error: Could not find the disconnected user from the array of previously connected')
            }
            
            // console.log('Socket disconnected id:',disconnectedSocketId)

        })
    })
}