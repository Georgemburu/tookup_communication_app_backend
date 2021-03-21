'use strict';

const GroupNotifications = require('../models/GroupNotification');

exports.getGroupNotifications = function(req,res){
    // gets a list of notifications that are from a group to a user
    // current user
    let currentUserId = req.user.Id;

    GroupNotifications.find({to:currentUserId}).populate('from').populate('to').populate('forGroup').sort('-createdAt').exec((error,groupNotifs)=>{
        if(error){
            // handle error
            res.json({
                success: false,
                message: 'DB Error: Failed to query group notifications'
            })
        }else {
            // handle success
            res.json({
                success: true,
                message: 'Successfully retreived group notifications',
                groupNotifications: groupNotifs
            })
        }
    })

}


exports.deleteGroupNotification = function(req,res){
    let currentUserId = req.user.id;
    let notificationId = req.body.notificationId;

    GroupNotifications.deleteOne({_id: notificationId },(error,success)=>{
        if(error){
            // handle error 
            res.json({
                success: false,
                message: 'Failed to delete group notification'
            })
        }else {
            // handle success
            res.json({
                success: true,
                message: 'Successfully deleted notification'
            })
        }
    })
}