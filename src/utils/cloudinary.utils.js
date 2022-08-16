const cloudinary = require("cloudinary").v2


cloudinary.config({
    cloud_name: 'dts1dlmxw',
    api_key: '414977289425792',
    api_secret: 'CDkm4O9NuMlBe6KAEapRX5gDm5o'
})

module.exports = cloudinary;