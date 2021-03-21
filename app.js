'use strict'

console.log(require('dotenv').config());

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app)
const io = require('socket.io')(server,{ path: '/chat/socket.io' });
const multer = require('multer');
const PORT = 3200||process.env.PORT;
const path = require('path');

const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session)
//passport
const passport = require('passport');
const passport_FACEBOOK = require('passport-facebook');
const passport_GOOGLE = require('passport-google-oauth20');
const passport_TWITTER = require('passport-twitter');
const passport_LOCAL = require('passport-local');
const passport_REMEMBER_ME = require('passport-remember-me');

const cors =  require('./cors')

// db
const mongoose = require('mongoose');


/*************
 * DATABASE: -> mongodb connect
************/
let DBURI = null;
if(process.env.NODE_ENV=='production'){
    DBURI = 'mongodb://localhost/tookup';
}else {
    DBURI = `mongodb+srv://george:${process.env.MONGODB_PWD}@chitchat-pxcqt.mongodb.net/test?retryWrites=true&w=majority`;
}
mongoose.connect(DBURI,{useNewUrlParser:true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false})
let db = mongoose.connection;
db.on('error', (error)=>{
    console.log('DB connection Error:',error)
    // close db on error
    // TODO: remove this
    db.close((err)=>{
        console.log('Failed to close db:',err)
    })
});
db.once('open',()=> console.log('Database Connected ...'))


/*************
 * middleware setup
************/
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// serve static files
app.use(express.static(path.join(__dirname,'/public')));



// sessions
let sessionOptions = {
    secret:'noitsabirdnoitsaplane',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}
// set secure cookies on production for https only
// if (app.get('env') === 'production') {
//     app.set('trust proxy', 1) // trust first proxy
//     sessionOptions.cookie.secure = true // serve secure cookies
//   }
app.use(session(sessionOptions))

app.use(passport.initialize())
app.use(passport.session())

require('./config/passport');


/*************
 * ROUTES
************/

let corss = require('cors') 

// app.use(cors({}))
app.use(corss({origin: 'http://localhost:'+PORT, credentials: true }));


// cors(app);
const upload = require('./config/multer')(multer) 

  

// require('./routes')(app,passport,upload,io)

require('./routes')(app,passport,upload,io)

// Setup Socket io
require('./socket/index')(io);


// run server
server.listen(PORT,()=>{
    console.log('Server running on port ',PORT)
})