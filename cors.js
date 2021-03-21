module.exports = function(app){
    const cors = require('cors');
    const corsOptions = {
        Origin: function(origin,callback){
            if(process.env.CORS_WHITELIST.split(' ').indexOf(origin)!== -1){
                callback(null,true);
            }else {
                callback(new Error('Not allowed by CORS configuration'))
            }
        },
        credentials: true,
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE'
    }


    var publicOptions = {
        origin: function (origin,callback){
           
                callback(null, true)
        
        },
        Method: 'GET, PUT, PATCH, DELETE, POST, UPDATE'
    }

    app.use('/public',cors(publicOptions))
    app.options('*', cors(corsOptions))
    app.use(cors(corsOptions))
}