module.exports = function(multer){
    let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()+'-'+file.originalname)
    }
    })
 
    let upload = multer({ storage: storage })
    return upload
}
