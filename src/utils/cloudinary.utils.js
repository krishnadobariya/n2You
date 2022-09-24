const cloudinary = require("cloudinary").v2


cloudinary.config({
    cloud_name: 'tcloud',
    api_key: '691732984517939',
    api_secret: '9GQ_ExlgyIARoxknsPyWTFWEs9k'
})

module.exports = cloudinary;