const Users = require('../models/User');
const OneOnOneNotifications = require('../models/OneOnNotification');

exports.getOneOnOneNotifications = function(req,res){
    let currentUserId = req.user.id;

    // get from db
    OneOnOneNotifications.find({to:currentUserId}).populate('from').populate('to').sort('-createdAt').exec((error,notifs)=>{
        if(error){
            // handle error
            res.json({
                success: false,
                message: 'Error: failed to get notifications from db'
            })
        }else {
            // handle success
            res.json({
                success: true,
                message: 'Successfully retrieved notifications',
                notifications: notifs
            })
        }
    })
}


exports.deleteOneOnOneNotification = function(req,res){
    // let currentUserId = req.user.id;
    let notificationId = req.body.notificationId;

    OneOnOneNotifications.findOneAndDelete({_id:notificationId},(error,success)=>{
        if(error){
            // handle error
            res.json({
                success: false,
                message: 'DB Error: failled to delete notification'
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


