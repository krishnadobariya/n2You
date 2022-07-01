const cloudinary = require("cloudinary").v2


cloudinary.config({
    cloud_name: 'justhire',
    api_key: '625429692641811',
    api_secret: 'rRqC1PYNpYNxVccJQqcjr5e8oc0'
})


module.exports = cloudinary;