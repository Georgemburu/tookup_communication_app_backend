'use strict';
const path = require('path');
const fs = require('fs');

exports.create =  function (req,res){
    // console.log(req.url)
    var path = require('path')
    
    res.sendFile(path.join(__dirname,'../public/index.html'))
}

exports.allStaticRoutes = function(req,res){
    let filePath = path.join(__dirname,'public',req.url)
    if(fs.exists(filePath)){
        res.sendFile(filePath)
    }else {
        console.log('File not found:',filePath)
        res.json({
            status: 404,
            message: `${filePath} not found` 
        })
    }
}