/**
 * @ params (from userid1,to userId2)
 * @returns   (String) the less than userId _ the greater then userid
 */
exports.lessThanGreaterThanUserIdAppender =  function lessThanGreaterThanUserIdAppender(fromUserId,toUserId){
    if(fromUserId<toUserId){
        return `${fromUserId}_${toUserId}`;
    }else {
        return `${toUserId}_${fromUserId}`;
    }
}
