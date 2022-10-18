const admin = require('./firebase-config')

exports.sendPushNotificationFCM = (registrationToken, title, body, sendBy, flag) => {
    console.log("registrationToken::", registrationToken);
    console.log("title::", title);
    console.log("body::", body);
    console.log("sendBy::", sendBy);
    console.log("flag::", flag);

    var payload = {
        notification: {
            title: title,
            body: body
        },

        data: {
            title: title,
            body: body,
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
                console.log("Successfully sent message:", response);

            })
            .catch(function (error) {
                console.log("Error sending message:", error);
            });
    } else {
        console.log("False Flage");
    }
}

