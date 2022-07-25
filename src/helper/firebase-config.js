var admin = require("firebase-admin");
var serviceAccount = require("../helper/n2you-5422f-firebase-adminsdk-bzxoh-86da4bf0a7.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports = admin


