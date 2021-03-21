'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// models
const Users = require('../models/User');


passport.serializeUser(function(user,done){
    console.log('Serializing:',user)
    done(null,user.id)
})

passport.deserializeUser(function(id,done){
    console.log('DESerializing:',id)

    Users.findById(id, function(err,user){
        done(err,user);
    })
})


/*********
 * LOCAL STRATEGY
 ********/
passport.use('strategy_LOCAL_$loginUser',new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req,email,password,done){
        // find if user exists
        Users.findOne({email:email},(error,user)=>{
            if(error){
                console.log('Error retreiving user from db:',error)
                return done(error,null,{message: 'Error retrieving user from db',success:false})
            }else {
                if(!user){
                    console.log('No User found with same email:',email)
                    return done(null,null,{ message: 'Incorrect email',success:false});
                }else {
                    if(user.validPassword(password)==false) {
                        return done(null,false, { message: 'Incorrect password.', success:false });
                    }else {
                        return done(null, user, { message: 'User logged in successfully', success: true});

                    }
                }
            }

        })
    })
)

passport.use('strategy_LOCAL_$createUser',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    function (req,email,password,done){
        // find if user exists
        console.log('REACHED LOCAL SIGNUP:',email,password)
        Users.findOne({email:email},(error,user)=>{
            if(error){
                console.log('Error retreiving user from db:')
                return done(error,null,{message: 'Error retrieving user from db', success: false})
            }

            if(user){
                console.log('Email arleady taken:',email)
                return done(null,false,{ message: 'User arleady exists', success: false});
            }else {
                console.log('Creating user, info given good')
                let userInfo = {
                    fullName: req.body.fullName,
                    phoneNumber: req.body.phoneNumber,
                    email: email,
                    password: password
                }
                Users.create(userInfo).then((user)=>{
                    console.log('User created successfully:',user)
                    return done(null,user,{ message: 'Account created successfully', success: true})
                }).catch((error)=>{
                    console.log('Error writing user to db:')
                    console.log(error)
                    return done(error,null, {
                        message: 'Error creating user, please try again later',
                        dbErrorMsg: error && error.errmsg? error.errmsg : null,
                        keyPattern: error && error.keyPattern?error.keyPattern : null,
                        keyValue: error && error.keyValue? error.keyValue : null,
                        success: false
                }) 
                })
            }

            
            })
    })
)