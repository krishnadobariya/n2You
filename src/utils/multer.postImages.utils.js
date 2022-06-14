const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/videoImages');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },


});


var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "video/mp4") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only jpg or jpeg or video allowed'));
        }
    }
});


module.exports = upload;