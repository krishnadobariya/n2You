const admin = require('./firebase-config')

exports.sendPushNotificationFCM = (registrationToken, title, body, text, sendBy, flag) => {
 

    var payload = {
        data: {
            title: title,
            body: body,
            text: text,
            sendBy: sendBy,
        }
    };
    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };


    if (flag == true) {


        admin.messaging().sendToDevice(registrationToken, payload, options)
            .then(function (response) {

                console.log("Successfully sent message:", response.results[0].error);
            })
            .catch(function (error) {
                console.log("Error sending message:", error);
            });
    } else {
        console.log("False Flage");
    }
}