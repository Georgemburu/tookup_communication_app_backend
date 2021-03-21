const OneOnOneNotifications = require('../models/OneOnNotification');
const GroupNotifications = require('../models/GroupNotification');

exports.getAllNotifications = function(req,res){
    let currentUserId = req.user.id;

    GroupNotifications.find({to:currentUserId}).populate('from').populate('to').populate('forGroup').sort('-createdAt').exec((error,groupNotifs)=>{
        if(error){
            // handle error
            res.json({
                success: false,
                message: 'DB Error: Failed to query group notifications'
            })
        }else {
            // handle success
            OneOnOneNotifications.find({to:currentUserId}).populate('from').populate('to').sort('-createdAt').exec((error,oneOnONeNotifs)=>{
                if(error){
                    // handle error
                    res.json({
                        success: false,
                        message: 'Error: failed to get notifications from db'
                    })
                }else {
                    // handle success
                    
                    // append the two notifications
                    let allNotifsArr = []
                    groupNotifs.forEach((gn)=>{
                        allNotifsArr.push(gn)
                    })
                    oneOnONeNotifs.forEach((oNn)=>{
                        allNotifsArr.push(oNn)
                    })

                    // send response
                    res.json({
                        success: true,
                        message: 'Successfully retrieved notifications',
                        notifications: allNotifsArr
                    })
                }
            })
            
        }
    })
}