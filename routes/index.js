
const path = require('path')
module.exports = function(app,passport,upload,io){
    
    // console.log('CALLED ROUTES ENTRY INDEX')
    /*************
     *  CONTROLLERS
    ************/
   // ->. Apps First Display Page
   const homePageController = require('../controllers/homepage');

   /*******
    ****** APIS ******
    ********/
   // ->. Authentication
   const authController = require('../controllers/auth');
    // -> . Logged In User
    const userController = require('../controllers/user')
    // -> . Messaging
    const messagingController = require('../controllers/messaging');
    // -> . Group Messaging
    const groupMessagingController = require('../controllers/groupMessaging');
    // -> . Group
    const groupController = require('../controllers/group');
    // -> . Notification
    const oneOnOneNotificationController = require('../controllers/oneOnOneNotification');
    const groupNotificationController = require('../controllers/groupNotification');
    const allNotificationsController = require('../controllers/allNotifications');

   

    /***
     * REQUEST HANDLER FUNCTIONS OBJECT
     */
    let GET_urls_request_handler_Object = {};
    let POST_urls_request_handler_Object = {};

    let AccessOnlyIfAuthenticatedRoutesArray = [];

    let PerformUploadSingleFileRoutesArray = []; // routes pushed here perfom upload.single('file')

    let RoutesThatAcceptsParamsArray = [];
    /*************
     * handle APIS
    ************/
    // ->. Auth
    // app.post('api/createAccount',authController.createAccount)
    POST_urls_request_handler_Object['/api/createAccount'] = authController.createAccount;


    // app.post('api/loginUser',authController.loginUser)
    POST_urls_request_handler_Object['/api/loginUser'] = authController.loginUser;


    // app.route('/logoutUser')
    //     .get(authController.logoutUser)
    GET_urls_request_handler_Object['/api/logoutUser'] = authController.logoutUser;

    // app.route('/verifyUserEmail/:token')
    //     .get(authController.verifyUserEmail)
    GET_urls_request_handler_Object['/api/verifyUserEmail/:token'] = authController.verifyUserEmail;
    RoutesThatAcceptsParamsArray.push('/api/verifyUserEmail/:token');

    // app.route('/forgotUserPassword')
        // .post(authController.forgotUserPassword)
    POST_urls_request_handler_Object['/api/forgotUserPassword'] = authController.forgotUserPassword;


    // app.route('/resetUserPassword')
    //     .post(authController.resetUserPassword)
    POST_urls_request_handler_Object['/api/resetUserPassword'] = authController.resetUserPassword;


    
    // LOGGED IN USER ROUTES
    // app.route('/getLoggedInUserInfo')
    //     .get(isAuthenticated,userController.getLoggedInUserInfo)
    GET_urls_request_handler_Object['/api/getLoggedInUserInfo'] = userController.getLoggedInUserInfo;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/getLoggedInUserInfo');
    // app.route('/addContact')
    //     .post(isAuthenticated,userController.addContact)
    POST_urls_request_handler_Object['/api/addContact'] = userController.addContact;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/addContact');


    // app.route('/addContactRequestAccepted')
    //     .post(isAuthenticated,userController.handleAddContactRequestAccepted)
    POST_urls_request_handler_Object['/api/addContactRequestAccepted'] = userController.handleAddContactRequestAccepted;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/addContactRequestAccepted');


    


    // MESSAGING
    // app.route('/sendDirectMessage')
    //     .post(isAuthenticated,messagingController.sendDirectMessage)
    POST_urls_request_handler_Object['/api/sendDirectMessage'] = messagingController.sendDirectMessage;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/sendDirectMessage');

    // app.route('/sendMessageWithFile')
    //     .post(isAuthenticated,upload.single('file'),messagingController.sendMessageWithFile)
    POST_urls_request_handler_Object['/api/sendMessageWithFile'] = messagingController.sendMessageWithFile;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/sendMessageWithFile');
    PerformUploadSingleFileRoutesArray.push('/api/sendMessageWithFile');

    // app.route('/getChatMessages')
    //     .get(isAuthenticated,messagingController.getChatMessages)
    GET_urls_request_handler_Object['/api/getChatMessages'] = messagingController.getChatMessages;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/getChatMessages');

    // app.route('/sendContactToDirectChat')
    //     .post(isAuthenticated,messagingController.sendContactToDirectChat)
    POST_urls_request_handler_Object['/api/sendContactToDirectChat'] = messagingController.sendContactToDirectChat;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/sendContactToDirectChat');


    // GROUP MESSAGING
    // app.route('/sendGroupMessage')
    //     .post(isAuthenticated,groupMessagingController.sendGroupMessage)
    POST_urls_request_handler_Object['/api/sendGroupMessage'] = groupMessagingController.sendGroupMessage;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/sendGroupMessage');

    // app.route('/getAllUserGroupMessages')
    //     .get(isAuthenticated,groupMessagingController.getAllUserGroupMessages)
    GET_urls_request_handler_Object['/api/getAllUserGroupMessages'] = groupMessagingController.getAllUserGroupMessages;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/getAllUserGroupMessages');

    // app.route('/sendContactToGroupChat')
    //     .post(isAuthenticated,groupMessagingController.sendContactToGroupChat)
    POST_urls_request_handler_Object['/api/sendContactToGroupChat'] = groupMessagingController.sendContactToGroupChat;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/sendContactToGroupChat');

    // app.route('/sendGroupMessageWithFile')
    //     .post(isAuthenticated,upload.single('file'),groupMessagingController.sendGroupMessageWithFile)
    POST_urls_request_handler_Object['/api/sendGroupMessageWithFile'] = groupMessagingController.sendGroupMessageWithFile;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/sendGroupMessageWithFile');
    PerformUploadSingleFileRoutesArray.push('/api/sendGroupMessageWithFile');


    // GROUP
    // app.route('/createGroup')
    //     .post(isAuthenticated,groupController.createGroup)
    POST_urls_request_handler_Object['/api/createGroup'] = groupController.createGroup;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/createGroup');

    // app.route('/getCurrentUserGroups')
    //     .get(isAuthenticated,groupController.getCurrentUserGroups)
    GET_urls_request_handler_Object['/api/getCurrentUserGroups'] = groupController.getCurrentUserGroups;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/getCurrentUserGroups');

    // app.route('/createGroupInvitationNotification')
    //     .post(isAuthenticated,groupController.createGroupInvitationNotification)
    POST_urls_request_handler_Object['/api/createGroupInvitationNotification'] = groupController.createGroupInvitationNotification;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/createGroupInvitationNotification');

    // app.route('/acceptGroupInvitationRequest')
    //     .post(isAuthenticated,groupController.acceptGroupInvitationRequest)
    POST_urls_request_handler_Object['/api/acceptGroupInvitationRequest'] = groupController.acceptGroupInvitationRequest;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/acceptGroupInvitationRequest');



    // ONE ON ONE NOTIFICATION
    // app.route('/getOneOnOneNotifications')
    //     .get(isAuthenticated,oneOnOneNotificationController.getOneOnOneNotifications)
    GET_urls_request_handler_Object['/api/getOneOnOneNotifications'] = oneOnOneNotificationController.getOneOnOneNotifications;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/getOneOnOneNotifications');

    // app.route('/deleteOneOnOneNotification')
    //     .post(isAuthenticated,oneOnOneNotificationController.deleteOneOnOneNotification)
    POST_urls_request_handler_Object['/api/deleteOneOnOneNotification'] = oneOnOneNotificationController.deleteOneOnOneNotification;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/deleteOneOnOneNotification');



    // GROUP NOTIFICATIONS
    // app.route('/getAllNotifications')
    //     .get(isAuthenticated,allNotificationsController.getAllNotifications)
    GET_urls_request_handler_Object['/api/getAllNotifications'] = allNotificationsController.getAllNotifications;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/getAllNotifications');

    // app.route('/getGroupNotifications')
    //     .get(isAuthenticated,groupNotificationController.getGroupNotifications)
    GET_urls_request_handler_Object['/api/getGroupNotifications'] = groupNotificationController.getGroupNotifications;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/getGroupNotifications');

    // app.route('/deleteGroupNotification')
    //     .post(isAuthenticated,groupNotificationController.deleteGroupNotification)
    POST_urls_request_handler_Object['/api/deleteGroupNotification'] = groupNotificationController.deleteGroupNotification;
    AccessOnlyIfAuthenticatedRoutesArray.push('/api/deleteGroupNotification');

    // checks whether the user accessing the route is authenticated
    // function isAuthenticated(req,res,next){
    //     if(!req.user){
    //         console.log('Error: User not authenticated')
    //         // user not authenticated
    //         res.json({
    //             success: false,
    //             message: 'User not authenticated'
    //         })
    //     }else {
    //         console.log('Passing: user is authenticated')
    //         // user is authenticated
    //         // TODO: do more checks
    //         req.locals = {}
    //         req.locals.io = io;
    //         next()
    //     }
    // }


    function checkAndHandleIfRoutesNeedUploadSingleFile(handlerFunction_,req,res){
        if(PerformUploadSingleFileRoutesArray.includes(req.url)){
            // needs upload single file
            upload.single('file')(req,res,()=>{
                handlerFunction_(req,res)
            });
        }else {
            // does not need upload single file
            handlerFunction_(req,res)
        }
    }

    function handleCheckIfUserIsAuthenticated(handlerFunction_,req,res){
        if(!req.user || !req.user.id){
            console.log('Error: User not authenticated')
            // user not authenticated
            res.json({
                success: false,
                message: 'User not authenticated'
            });
        }else {
            console.log('Passing: user is authenticated')
            // user is authenticated
            // TODO: do more checks
            req.locals = {}
            req.locals.io = io;
            
            // run handler function
            // handlerFunction_(req,res);
            checkAndHandleIfRoutesNeedUploadSingleFile(handlerFunction_,req,res)
        }
    }



    function sendRouteToAngular(res){
        res.sendFile(path.join(__dirname,'..','public/index.html'))
    }
//  function checkIfUserIsAuthenticated(req,res){
//      if(req.user){
//          return true
//      }
//  }

/***
 * Handles well if the route carries only one paramater token
 */
 function checkIfRouteAcceptsParams(req){
     let incommingUrl = req.url;
     let acceptsParams = false;
     let routeToHandle = null
    RoutesThatAcceptsParamsArray.forEach(route_=> {
        let routeWithoutTheTokenIdentifier = route_.split(':')[0];
        console.log('routeWithoutTheTokenIdentifier:',routeWithoutTheTokenIdentifier)
        let passedInParamValue = incommingUrl.replace(routeWithoutTheTokenIdentifier,'');
        let paramsId = route_.split(':')[1];
        if(incommingUrl.includes(routeWithoutTheTokenIdentifier)){
            acceptsParams = true;
            routeToHandle = route_ // url api
            if(!req.params[paramsId]){
                if(!req.params){
                    req.params = {}
                }
                req.params[paramsId] = passedInParamValue;
            }
        }
    })
    return {
        acceptsParams,
        routeToHandle
    }

 }

 function checkIfURLContains_API_word_InIt(req,res){
    if(req.url.includes('api')){
        // good handle as api
        return
    }else{
        // handle by angular
        sendRouteToAngular(res)
    }
 }


 function handleGET_urls(req,res){
     console.log('HANDLE GT URLS Called:',req.url)
     console.log('params: ',req.params)
    // check if has 'api'
    checkIfURLContains_API_word_InIt(req,res);
    // handler function
    let handlerFunction = null;
    // check if accepts params
    let checkIfRouteAcceptsParamsReturnObject = checkIfRouteAcceptsParams(req);
    if(checkIfRouteAcceptsParamsReturnObject.acceptsParams){
        handlerFunction = GET_urls_request_handler_Object[checkIfRouteAcceptsParamsReturnObject.routeToHandle];   
    }else {
        handlerFunction = GET_urls_request_handler_Object[req.url];
    }

    console.log('GET:',req.url)
    
    // check if handlerFuntion 
    if(!handlerFunction){
        sendRouteToAngular(res)
    }else {
        // check if route needs authenticated access
        if(AccessOnlyIfAuthenticatedRoutesArray.includes(req.url)){
            // needs authentication
            // check if user authenticated
            handleCheckIfUserIsAuthenticated(handlerFunction,req,res)
        }else {
            // doesnot need authentication
             handlerFunction(req,res);

        }
    }


    
 }

 function handlePOST_urls(req,res){
    // check if has 'api'
    checkIfURLContains_API_word_InIt(req,res);

     console.log('POST:',req.url)
    let handlerFunction = POST_urls_request_handler_Object[req.url];

    // check if handlerFuntion 
    if(!handlerFunction){
        sendRouteToAngular(res)
    }else {
        // check if route needs authenticated access
        if(AccessOnlyIfAuthenticatedRoutesArray.includes(req.url)){
            // needs authentication
            // check if user authenticated
            handleCheckIfUserIsAuthenticated(handlerFunction,req,res)
        }else {
            // doesnot need authentication
             handlerFunction(req,res);

        }
    }

 }

  app.route('*')
    .get(handleGET_urls)
    .post(handlePOST_urls)





}
