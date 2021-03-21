const Users = require('../models/User');
const Groups = require('../models/Group');
const OneOnOneNotification = require('../models/OneOnNotification');


// get logged in user data info
exports.getLoggedInUserInfo = function(req,res){
    console.log('Reached getInUserInfo route')
    // check if current user is logged in
    if(!req.user){
        // handle user not logged in
        res.json({
            success: false,
            message: 'Current user is not logged in',
            userObj: null
        })
    }else {
        // user is logged in, get userObj
        let currentUserId = req.user.id;
        // console.log('currentUserId:',currentUserId)
        // query db for current user
        Users.findById(currentUserId).populate({path:'contacts',model:'Users'}).populate('chattingWith').exec((error,user)=>{
            if(error){
                // handle error res
                res.json({
                    success: false,
                    message: 'Failed to query db for current user object',
                    userObj: null
                })
            }else if(user.groups && user.groups.length>0 &&  typeof !user.groups[0].groupName ){
                    user.password = '';

                    Groups.find({}).where('participants').in(user._id).exec((error,groups)=>{
                        if(error){
                            // handle error
                            console.log('Error getting groups to poplate')
                        }else {
                            // console.log('Groups FOUND::',groups)
                            // user.groups = [...groups]
                            let userObj_ = user.toObject();
                            delete userObj_.groups;
                            userObj_.groups = groups
                            // user.groups = groups
                            res.json({
                                success: true,
                                message: 'Succesfully found current logged in user obj',
                                userObj: userObj_
                            })
                        }
                    })
            }else {
                // console.log('User info groups is an object of arrays GOOD',typeof user.groups[0]=== 'string',typeof user.groups[0], user.groups[0])
                res.json({
                    success: true,
                    message: 'Succesfully found current logged in user obj',
                    userObj: user
                })
            }
                
        
        })
    }
}

// add contact
// handles adding contact request to the OneOneNotifications collection#
exports.addContact = function(req,res){
    console.log('reached add contact route')
    console.log(req.body)
    // get payload
    let contact_usernameORemail = req.body.emailORusername;
    console.log('contact_usernameORemail::',contact_usernameORemail)
    let contact_phoneNumber = req.body.phoneNumber;
    console.log('contact_phoneNumber:',contact_phoneNumber)

    // get current user id
    let currentUserId = req.user.id;

    // utility function
    function checkIfPhoneNumbersMatch(foundUserphoneNumber,supliedContactPhoneNumber){
        return foundUserphoneNumber==supliedContactPhoneNumber;
    }
    // access db
    // contact_usernameORemail
    Users.findOne({'email':contact_usernameORemail},(error,contactTobeAddedData)=>{
        if(error){
            res.json({
                success: false,
                message: 'Error querying user by email from DB'
            })
        }else {
            console.log('contact to be added OBJ:',contactTobeAddedData)
            if(!contactTobeAddedData){
                // TODO: search by username
                res.json({
                    success: false,
                    message: 'No user found (Please supply email instead of username)'
                })
            }else {
                // success found user
                if(!checkIfPhoneNumbersMatch(contactTobeAddedData.phoneNumber,contact_phoneNumber)){
                    // dont match
                    res.json({
                        success: false,
                        message: 'The phone number supplied does not match of the user'
                    })
                }else {
                    // CHECK TO SEE IF contact IS ALREADY IN CONTACT LIST
                    Users.findById(currentUserId,(error_,currentUserInfoObj)=>{
                        if(error_){
                            // handle error
                            res.json({
                                success:  false,
                                message: 'Error: Failed to retrieve user from db'
                            })
                        }else {
                            // check if wants to add his/her self as contact
                            if(contactTobeAddedData.id==currentUserInfoObj.id){
                                res.json({
                                    success: false,
                                    message: 'Failed: You cannot add yourself'
                                })
                            }else if(currentUserInfoObj.contacts.includes(contactTobeAddedData._id)){
                                // handle contact already in contact lis
                                res.json({
                                    success: false,
                                    message: 'Failed: Contact is already in your contact list'
                                })
                            }else {                       
                                // add to notifications of receipient that he/she has been requested to accept or decline 
                                // to be added as contact
                                let notifDataToSave = {
                                    from: currentUserId,
                                    to: contactTobeAddedData._id,
                                    read: false,
                                    title: 'Friend Request',
                                    message: `${currentUserInfoObj.fullName} sent you a freind request`,
                                    type: 'friend_request'
                                }
                                OneOnOneNotification.create(notifDataToSave,(error_,success_)=>{
                                    if(error_){
                                        // handle error
                                        res.json({
                                            success: false,
                                            message: 'Error: Failed to add contact'
                                        })
                                    }else {
                                        // handle success
                                        // notification created
                                        res.json({
                                            success: true,
                                            message: 'Request sent Successfully',
                                            contactToBeAdded_Id: contactTobeAddedData._id
                                        })
                                    }
                                })
                                
                            }
                        }
                    })
                    
                    

                }
            }
        }
    })


}

// handle when add contact request is accepted
exports.handleAddContactRequestAccepted = function(req,res){
    let currentUserId = req.user.id;
    let requestFromId = req.body.notificationFromId;

    // Add contacts to each
    // start with the requesting User
    Users.findById(requestFromId,(error,requestFrom_User)=>{
        if(error){
            // handle error
            res.json({
                success: false,
                message: 'DB error: Failed to query requesting User'
            })
        }else {
            // handle no user
            if(!requestFrom_User){
                res.json({
                    success: false,
                    message: 'Error: Did not find requesting user on our db'
                })
             }
            else if(requestFrom_User.contacts.indexOf(currentUserId)!=-1){ 
                // constcat already added
                res.json({
                    success: true,
                    message: 'Contact is already in contact list'
                })
            }else {
                // success: user found
                // add contact to list of contacts
                requestFrom_User.contacts.push(currentUserId)
                // save
                requestFrom_User.save().then((succ)=>{
                    // success fully added one contact:
                    // do for the Other 
                    // 2nd SAVE
                    Users.findById(currentUserId,(error2,currentUser_User)=>{
                        if(error2){
                            // handle error
                            
                            // delet for the save 1
                            let contactToDelete_Index = requestFrom_User.contacts.indexOf(currentUserId);
                            if(contactToDelete_Index!=-1){
                                requestFrom_User.contacts.splice(contactToDelete_Index,1)
                                requestFrom_User.save().then((succ__)=>{
                                    res.json({
                                        success: false,
                                        message: 'Error: Couldnot find user on db'
                                    })
                                }).catch((err__)=>{
                                    res.json({
                                        success: false,
                                        message: 'Error: Couldnot find user on db'
                                    })
                                })
                            }else {
                                res.json({
                                    success: false,
                                    message: 'Error: Couldnot find user on db'
                                })
                            }
                            
                        }else {
                            // successfully retrieved user:
                            // add to the contact list 
                            currentUser_User.contacts.push(requestFromId);
                            // save
                            currentUser_User.save().then((succ3)=>{
                                // handle complete success
                                res.json({
                                    success: true,
                                    message: 'Successfully added contact'
                                })
                            }).catch((err3)=>{
                                // handle  error
                                let contactToDelete_Index = requestFrom_User.contacts.indexOf(currentUserId);
                                if(contactToDelete_Index!=-1){
                                    requestFrom_User.contacts.splice(contactToDelete_Index,1)
                                    requestFrom_User.save().then((succ__)=>{
                                        res.json({
                                            success: false,
                                            message: 'Error: Couldnot find user on db'
                                        })
                                    }).catch((err__)=>{
                                        res.json({
                                            success: false,
                                            message: 'Error: Couldnot find user on db'
                                        })
                                    })
                                }else {
                                    res.json({
                                        success: false,
                                        message: 'Error: Couldnot find user on db'
                                    })
                                }

                            })
                        }
                    })
                }).catch((err)=>{
                    // handle error
                    res.json({
                        success: false,
                        message: 'Error: failed to add contact'
                    })
                })
            }
        }
    })
}
