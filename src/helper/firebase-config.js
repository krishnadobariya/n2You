var admin = require("firebase-admin");
var serviceAccount = require("../helper/n2you-db406-firebase-adminsdk-2j24j-e9727d5713.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports = admin


