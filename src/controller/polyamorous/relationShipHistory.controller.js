const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const relationShipHistoryModel = require("../../model/polyamorous/relationShipHistory.model");
const userModel = require("../../model/user.model");

exports.relationShipHistory = async (req, res, next) => {
    try {

        const findUserInHistory = await relationShipHistoryModel.findOne({
            userId: req.params.user_id
        })

        if (findUserInHistory == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User don't have any relationship history", "false", 404, "0")
            );
        } else {

            const finalResponse = [];
            for (const response of findUserInHistory.relastionShipHistory) {

                const date = response.createdAt
                let dates = date.getDate();
                let month = date.toLocaleString('en-us', { month: 'long' });
                let year = date.getFullYear();
                let hours = date.getHours();
                let minutes = date.getMinutes();
                let ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12;
                minutes = minutes.toString().padStart(2, '0');
                let strTime = 'At' + ' ' + hours + ':' + minutes + ' ' + ampm + ' ' + 'on' + ' ' + month + ' ' + dates + ',' + year;

                const relationShipHistory = {
                    message: response.message,
                    date: strTime
                }

                finalResponse.push(relationShipHistory)
            }

            const findUser = await userModel.findOne({
                _id: req.params.user_id
            })


            const data = {
                _id: findUser._id,
                name: findUser.firstName,
                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                hisoty: finalResponse
            }

            res.status(status.OK).json(
                new APIResponse("get all relationship history", true, 200, "1", data)
            );

        }


    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}