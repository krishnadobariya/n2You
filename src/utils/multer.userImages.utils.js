const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },


});



var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only jpg or jpeg allowed'));
        }
    }
});


module.exports = upload;