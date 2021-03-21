const Groups = require('../models/Group');
const Users  = require('../models/User')
const OneOnOneNotifications = require('../models/OneOnNotification');
const GroupNotifications = require('../models/GroupNotification')

exports.createGroup = function(req,res){
    console.log('Reached create Group route')
    let loggedInUserId = req.user.id;
    let newGroupName = req.body.groupName;

    // create Group
    let groupToSaveData = {
        groupName: newGroupName,
        participants: loggedInUserId,
        createdBy: loggedInUserId
    }
    Groups.create(groupToSaveData,(error,_group)=>{
        if(error){
            // handle error
            // console.log('Error saving group:',error)
            res.json({
                success: false,
                message: 'DB error: Failed to save group'
            })
        }else {
            // handle success
            // console.log('Saved group')
            // save group in the creator data
            Users.findById(loggedInUserId,(err,_user)=>{
                if(err){
                    // handle error
                    // console.log('Error retriving user form db');
                    res.json({
                        success: false,
                        message: 'DB error: Failed to retrieve user'
                    })
                }else {
                    // handle success
                    _user.groups.push(_group._id)
                    _user.save().then((suc)=>{
                        // final success
                        res.json({
                            success: true,
                            message: 'Successfully Created Group',
                            createdGroup: _group
                        })
                    }).catch((error2)=>{
                        res.json({
                            success: false,
                            message: 'Error failed to save group to user\'s groups '
                        })
                    })
                }
            })
        }
    })
    
}

exports.getCurrentUserGroups = function(req,res){
    let currentUserId = req.user.id;

    // get user the get groups array 

    Users.findById(currentUserId,(error,userObj)=>{
        if(error){
            res.json({
                success: false,
                message: 'DB error: Failed to query current user'
            })
        }else {
            // handle success 
            let userGroupsIds = userObj.groups;
            // fiind groups with the ids
            Groups.find({_id:{$in:userGroupsIds}}).populate('createdBy').exec().then((groups)=>{
                // handle success
                res.json({
                    success: true,
                    message: 'Successfully found groups',
                    groups: groups
                })
            }).catch(error_ => {
                // handle error
                res.json({
                    success: false,
                    message: 'Failed to retrieve groups'
                })
            })
        }
    })
    // Groups.find({},(error,groups)=>{
    //     console.log(groups)
    //     if(error){
    //         // handle error
    //         res.json({
    //             success: false,
    //             message: 'DB Error: Failed to query groups'
    //         })
    //     }else {
    //         let arrayOfGroupsTheUserIsAParticipantIn = [];
    //         // loop through groups
    //         groups.forEach((group)=>{
    //             // find group that has current user as a participant
    //             if(groups.participants){
    //                let indexOfUserInParticipantsArray = groups.participants.indexOf(currentUserId);
    //                 if(indexOfUserInParticipantsArray!=-1){
    //                     // found#
    //                     arrayOfGroupsTheUserIsAParticipantIn.push(group);
    //                 } 
    //             }
                
    //         })
            
    //         // array populated / empty
    //         // send as response
    //         res.json({
    //             success: true,
    //             message: 'Successfully queried groups',
    //             groups: arrayOfGroupsTheUserIsAParticipantIn
    //         })
    //     }
    // })
}



exports.createGroupInvitationNotification = function(req,res){
    let currentUserId = req.user.id;
    let currentUserFullName = req.body.currentUserFullName;
    let notificationReciepientId = req.body.receipientId;
    let groupName = req.body.groupName;
    let groupId = req.body.groupId;
    let notificationType = 'group_invitation';

    // check whether the receipient is available on db
    Users.findById(notificationReciepientId,(error,notificationReciepientUserObj)=>{
        if(error){
            // handle error
            res.json({
                success: false,
                message: 'DB Error: Failed to query supplient receipient user'
            })
        }else if(!notificationReciepientUserObj){
            // handle no user found
            res.json({
                success: false,
                message: 'Error: The supplied receipient was not found on DB',
                statusCode: 404
            })
        }else {
            // handle success: user found

            // Create One On One notification
            let notifDataToSave = {
                from: currentUserId,
                forGroup: groupId,
                to: notificationReciepientId,
                read: false,
                title: `(${groupName}) Group Invitation`,
                message: `You have a group invitation from (${currentUserFullName}) `,
                type: notificationType
            }
            GroupNotifications.create(notifDataToSave).then((notif)=>{
                // handle success
                res.json({
                    success: true,
                    message: 'Successfully sent group invitation'
                })
            }).catch((err)=>{
                // handle error
                res.json({
                    success: false,
                    message: 'Error: Failed to create notification'
                })
            })
        }
    })
    
    

}


exports.acceptGroupInvitationRequest = function(req,res){
    console.log('Reached acceptGroupInvitationRequest route',req.body)
    let currentUserId = req.user.id;

    // add the group to users groups and 
    // add the user to group participants

    /**
     * NB: for Group request, notification.groupId == group Id
     */
    let groupId = req.body.forGroup._id;
    let userToJoinGroupId = currentUserId;

    Groups.findById(groupId,(error,groupObj)=>{
        if(error){
            // handle error
            res.json({
                success: false,
                message: 'DB Error: Failed to query group from id'
            })
        }else if(!groupObj){
            // handle no group found
            res.json({
                success: false,
                message: 'Failed to add you to the group. Group not found on DB'
            })
        }
        else if(groupObj.participants.indexOf(userToJoinGroupId)!=-1){
            // handle user already a participant in group
            res.json({
                success: true,
                message: 'Error: You are already a participant in the group'
            })
        }else {
            // success
            // handle adding participant
            groupObj.participants.push(userToJoinGroupId)
            groupObj.save().then((group_)=>{
                // handle success
                //  save group id in users groups array
                Users.findById(userToJoinGroupId,(error2,userObj_)=>{
                    if(error2){
                        // handle error
                        // delet saved user from group participants
                        
                        if(groupObj && groupObj.participants.indexOf(userToJoinGroupId)!=-1){
                            let indexOfParticipant = groupObj.participants.indexOf(userToJoinGroupId);
                            groupObj.participants.splice(indexOfParticipant,1)
                            groupObj.save().then((s)=>{
                                res.json({
                                    success: false,
                                    message: 'Failed to add you in group'
                                })
                            }).catch((e)=>{
                                res.json({
                                    success: false,
                                    message: 'Failed to add you in group'
                                })
                            })
                        }else {
                            res.json({
                                success: false,
                                message: 'Failed to add you in group'
                            })
                        }

                        
                    }else {
                        // handle success
                        userObj_.groups.push(groupObj._id);
                        userObj_.save().then((user__)=>{
                            res.json({
                                success: true,
                                message: 'Success fully added you to group',
                                group: groupObj
                            })
                        }).catch((err__)=>{
                            // handle error
                            res.json({
                                success: false,
                                mesage: 'Failed to add you in group'
                            })
                        })
                    }
                })
            }).catch((error_)=>{
                // hande error
                res.json({
                    success: false,
                    message: 'Failed to add you in group'
                })
            })
        }
    })
}