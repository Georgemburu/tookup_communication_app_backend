const Users = require('../models/User');
const passport = require('passport');
const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

// const nodemailerTransporter = require('../config/nodemailer_');
const nodemailer = require('nodemailer');

const nodemailerTransporter  = nodemailer.createTransport({    
    service: "gmail",
    auth: {
        user: `${process.env.emailUsername}`,
        pass: `${process.env.emailPassword}` 
        // user: 'donotrelpy@tookup.in',
        // pass:'tookup@951'
    },
    debug: true, // show debug output
    logger: true // log information in console
});


function sendVerifyMailNow(link,mailAddress){
    console.log('Called send Verify Mail now')
    var transporter = nodemailerTransporter;

    // setup email
    var mailOptions = {
        from: `"TookUP" <${process.env.emailUsername}>`, // sender address
        to: mailAddress, // list of receivers
        subject: 'Confirm Email Address', // Subject line
        text: 'Verify identity', // plaintext body
        html: '<div><b>Confirm you email address by clicking on the link </b> <a href='+link+'>'+link+'</a></div>' // html body
    };
    
    // send mail with defined transport object
    // transporter.sendMail(mailOptions, function(error, info){
    //     if(error){
    //         return console.log(error);
    //     }
    //     console.log('Message sent: ' + info.response);
    // });
    console.log('Returning send verifyMail now promise')
    return transporter.sendMail(mailOptions)

}

function sendResetPasswordMailNow(link,mailAddress){
    var transporter = nodemailerTransporter;

    // setup email
    var mailOptions = {
        from: `"TookUP" <${process.env.emailUsername}>`, // sender address
        to: mailAddress, // list of receivers
        subject: 'Reset Your Password', // Subject line
        text: 'Hello '+mailAddress, // plaintext body
        html: '<div><b>click the link to reset your password </b> <a href='+link+'>'+link+'</a></div> ' // html body
    };
    
    // send mail with defined transport object
    // transporter.sendMail(mailOptions, function(error, info){
    //     if(error){
    //         return console.log(error);
    //         res.json({
    //             success: false,
    //             message: 'Could not send email, Check your email address'
    //         })
    //     }
    //     console.log('Message sent: ' + info.response);
    // });

    return transporter.sendMail(mailOptions)
}


exports.createAccount = function(req,res){
    console.log('REACHED CREATE ACCOUNT URL HANDLER')
    res.set('Access-Control-Allow-Credentials', 'true')
    // console.log('req.url=>',req.url)
    // console.log('req.passport',req.passport)
    // console.log('req.user',req.user,req.session)
    // check if nodemailer is working
    
    // nodemailerTransporter.verify(function(error, success) {
    //     console.log('Veryifying if nodemailer is working')
    //     if (error) {
    //         console.log('Node mailer not workin')
    //         console.log(error);
    //         res.json({
    //             success: false,
    //             message: 'Server error: (mailer)'
    //         })
    //     } else {
    //         console.log('SUCCESS: Node mailer is working')
            console.log('Execting passport create user')
                passport.authenticate('strategy_LOCAL_$createUser',{session: true},(passportErrorObject,passportUser,passportMessage,statusCode)=>{
                // direct to confirm email page
                    console.log('returned from passport create user')
                req.login(passportUser, function(err) {
                    console.log('Inside req login function')
                    if(err){
                        console.log('Error occured loggingin user',error)
                        // console.log('Handle tgis error')
                        // send back the error to client
                        // console.log('PASSMESSANGE',passportMessage)
                        // console.log('ERROR',err)
                        res.json({
                            success: false, 
                            message1: 'Server error. Could not login user',
                            message: passportMessage,
                            errorMsg: passportErrorObject && passportErrorObject.errmsg? passportErrorObject.errmsg: passportErrorObject,
                            statusCode: 500,
                            passStatusCode: statusCode,
                            userObj: passportUser
                            
                        })
                    }else{
                        console.log('PASSED req login')
                        // remove password from user object if present
                        passportUser && passportUser.password? passportUser.password='' : null;
                        let resObj = {
                            errorMsg: passportErrorObject && passportErrorObject.errmsg? passportErrorObject.errmsg: passportErrorObject,
                            userObj: passportUser,
                            message: passportMessage,
                            statusCode: statusCode
                        }
                        // console.log('from callback:',resObj)

                        // send verification email 
                        // 1. Generate a jwt token
                        // let jwtPayloadVerificationCode = process.env.emailVerificationJWT_Payload_verificationCode;
                        console.log('Signing JWT')
                        let privateKey = process.env.emailVerificationJWT_PrivateKey;
                        jwt.sign({ 
                            exp: Math.floor(Date.now() / 1000) + (60 * 20),
                            data: passportUser._id },
                            privateKey,
                            { algorithm: 'HS256' },
                            function(err,token){
                                if(err){
                                    // handle token geeneration error
                                    // console.log('Error generating token',err)
                                    console.log('Error signing jwt:',err)
                                    req.logout()
                                    res.json({
                                        success: false,
                                        message: 'Failed to create user (JWT sign)'
                                    })
                                }else {
                                    console.log('PASS create JWT')
                                    // console.log('token',token)
                                    // 2. create nodemailer transport
                                    // 3. send email
                                    // sendVerifyMailNow(`http://localhost:3200/verifyUserEmail/${token}`)
                                    

                                    // return res.json(resObj)
                                    let userEmail = passportUser.email
                                    console.log('Sending Email')
                                    let verifyMailURL = '';
                                    if(process.env.HOST_DOMAIN){
                                        verifyMailURL = `${process.env.HOST_DOMAIN}/api/verifyUserEmail/${token}`
                                    }else {
                                        verifyMailURL = `/api/verifyUserEmail/${token}` 
                                    }
                                    sendVerifyMailNow(verifyMailURL,userEmail)
                                        .then(()=>{
                                            console.log('Success mail sent')
                                            res.json(resObj)
                                        })
                                        .catch((error)=>{
                                            console.log('eRROR MAIL not sent:',error)
                                            // delete alredy created user
                                            Users.findById(passportUser._id,(error,user_)=>{
                                                if(error){
                                                    res.json({
                                                        success: false,
                                                        message: 'Could not send email, Check your email address'
                                                    })
                                                }else {
                                                    res.json({
                                                        success: false,
                                                        message: 'Could not send email, Check your email address'
                                                    })
                                                }
                                            })
                                            
                                        })

                                }

                        })

                        



                        

                    }
                });

                // end
                
            })(req,res)
        // }
    // });
   
}

exports.loginUser = function(req,res){
    // res.set('Access-Control-Allow-Credentials', 'true')
    console.log('req.url=>',req.url)
    console.log('req.passport',req.credentials)

    console.log('req.user',req.user,req.session)

    passport.authenticate('strategy_LOCAL_$loginUser',{session: true},(passportErrorObject,passportUser,passportMessage,statusCode)=>{
       console.log('LOGGING IN',passportUser)

        req.login(passportUser, function(err) {
            if(err){
                // return responce with error message
                res.json({
                    success: passportMessage.success,
                    userObj: passportUser,
                    message: passportMessage.message,
                    statusCode: statusCode,
                    errorMsg: passportErrorObject && passportErrorObject.errmsg? passportErrorObject.errmsg: passportErrorObject,

                })
            }else{
                 // remove password from user object if present
                passportUser && passportUser.password? passportUser.password='' : null;
                let resObj = {
                    success: passportMessage.success,
                    errorMsg: passportErrorObject && passportErrorObject.errmsg? passportErrorObject.errmsg: passportErrorObject,
                    userObj: passportUser,
                    message: passportMessage.message,
                    statusCode: statusCode
                }
                console.log('from callback:',resObj)
                return res.json(resObj)

            }
          });
        // send back response
        // return res.json(resObj)
        
        
        
        
    })(req,res)

}


exports.logoutUser = function(req,res,d){
    console.log(req,res,d)
    
}



exports.verifyUserEmail = function(req,res){
    console.log('Acces verify user email:',req.params)
    // console.log('req.params2',req.params)

    const token = req.params.token;

    // verify token
    let jwtPayloadVerificationCode = process.env.emailVerificationJWT_Payload_verificationCode;
    let privateKey = process.env.emailVerificationJWT_PrivateKey;
    jwt.verify(token,privateKey, function(err,decoded){
        if(err){
            // handle verify error
            console.log('error veriing',err)
            res.json({
                success: false,
                message: 'Error: Failed to verify your email address'
            })
        }else {
            let userId = jwt.decode(token).data;
            console.log('token',token)
            console.log('userId',userId)

            // update users isVerified details to true
            Users.findByIdAndUpdate(userId,{isVerified:true},(error,userData)=>{
                if(error){
                    // handle error finding user
                    console.log('Error updatiing user data',error)
                    res.json({})

                }else {
                    // update user isVerified data
                    console.log('User data has been updated',userData)
                    // res.json({})
                    if(process.env.HOST_DOMAIN){
                        res.redirect(`${process.env.HOST_DOMAIN}/accountVerify`)
                    }else {
                         res.redirect(`/accountVerify`)
                    }
                   
                }
            })
        }
    })

}


exports.verifyForgotPasswordResetUser = function(req,res){
    console.log('Acces forgot password reset user:',req.user)

    const token = req.params.token;

    // verify token
    // let jwtPayloadVerificationCode = process.env.emailVerificationJWT_Payload_verificationCode;
    let privateKey = process.env.forgotPasswordVerificationJWT_PrivateKey;
    jwt.verify(token,privateKey, function(err,decoded){
        if(err){
            // handle verify error
            console.log('error veriing',err)
            res.json({
                success: false,
                message: 'could not verify user'
            })
        }else {
            let tokenData = jwt.decode(token).data;
            if(tokenData=='accessGranted'){
                res.json({
                    success: true,
                    message: 'user verified successfully'
                })
            }else {
                res.json({
                    success: false,
                    message: 'could not verify user'
                })
            }

          
        }
    })

}


exports.forgotUserPassword = function(req,res){
    console.log('Acces forgot password:',req.user)
    if(!req.user){
        res.json({
            success: false,
            message: 'You have to be logged in to access this '
        })
    }

   
        let userEmail = req.body.email;

        // query db to see if User exists
        Users.findOne({email:userEmail}).then((user)=>{
            if(!user){
                // no user found
                res.json({
                    success: false,
                    message: 'No user found with that email'
                })
            }else {


    
            // user found
            // send email to reset password
            // 1. Generate a jwt token
            // let jwtPayloadVerificationCode = process.env.emailVerificationJWT_Payload_verificationCode;
            let privateKey = process.env.forgotPasswordVerificationJWT_PrivateKey;
            jwt.sign({ 
                exp: Math.floor(Date.now() / 1000) + (60 * 20),
                data: user.id},
                privateKey,
                { algorithm: 'HS256' },
                function(err,token){
                    if(err){
                        // handle token geeneration error
                        console.log('Error generating token',err)
                        res.json({
                            success: false,
                            message: 'Error generating jwt token'
                        })
                    }else {
                        console.log('token',token)
                        console.log('Receipient',userEmail)
                        // 2. create nodemailer transport
                        // 3. send email
                        let resetPasswordURL = '';
                        if(process.env.HOST_DOMAIN){
                            resetPasswordURL = `${process.env.HOST_DOMAIN}/resetUserPassword/${token}`
                        }else {
                            resetPasswordURL = `/resetUserPassword/${token}` 
                        }
                        sendResetPasswordMailNow(resetPasswordURL,userEmail)
                            .then(()=>{
                                console.log('Success mail sent')
                                res.json({
                                    success: true,
                                    message: 'Reset password messenge sent to emai',
                                    receipientEmail: userEmail
                                })
                            })
                            .catch((error)=>{
                                console.log('eRROR MAIL not sent:',error)
                                res.json({
                                    success: false,
                                    message: 'Could not send email, Check your email address'
                                })
                            })
                        

                        

                    }

                    })

                }
            
            }).catch((error)=>{
                res.json({
                    success: false,
                    message: 'User not found',
                    userObj: null,
                    statusCode: 404
                })
            })  

    
     
}



exports.resetUserPassword = function(req,res){
    console.log('Acces reset user password:',req.user)

    console.log(req.body)
    let token = req.body.token;
    let newPassword = req.body.newPassword;

    // verify the token then decode the token to get the password
    let privateKey = process.env.forgotPasswordVerificationJWT_PrivateKey;
    jwt.verify(token,privateKey, function(err,decoded){
        if(err){
            // handle verify error
            console.log('error veriing',err)
            res.json({
                success: false,
                message: 'Error verifying the jwt token'
            })
        }else {
            let userId = jwt.decode(token).data;
            console.log('token',token)
            console.log('userId',userId)

            // update users isVerified details to true
            // TODO: crypt the password
            Users.findByIdAndUpdate(userId,{password:newPassword},(error,userData)=>{
                if(error){
                    // handle error finding user
                    // console.log('Error updatiing user data',error)
                    res.json({
                        success: false,
                        message: 'Error updating users password'
                    })

                }else {
                    // update user isVerified data
                    // console.log('User data has been updated',userData)
                    res.json({
                        success: true,
                        message: 'Password has been updated successffully'
                    })
                }
            })
        }
    })
}