const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const userModel = require("../../model/user.model");
const notificationModel = require("../../model/polyamorous/notification.model");

exports.getAllNotification = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })
        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not Found..!", "false", 404, "0")
            );
        } else {

            const findUserInNotificationModel = await notificationModel.findOne({
                userId: req.params.user_id
            })

            if (findUserInNotificationModel == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User not have any Notification..!", "false", 404, "0")
                );
            } else {
                const allNotification = [];
                for (const getNotification of findUserInNotificationModel.notifications) {
                    if (getNotification.userId) {
                        const findUserDetail = await userModel.findOne({
                            _id: getNotification.userId
                        })

                        const response = {
                            _id: getNotification.userId,
                            notification: getNotification.notifications,
                            name: findUserDetail.firstName,
                            profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                        }

                        allNotification.push(response)

                    } else {

                        const response = {

                            notification: getNotification.notifications,
                            profile: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                        }

                        allNotification.push(response)
                    }
                }


                res.status(status.OK).json(
                    new APIResponse("show all notification", "true", 200, "1", arr1)
                );

            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}