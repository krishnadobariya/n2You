const userModel = require("../model/user.model");
const requestModel = require("../model/requests.model");
const status = require("http-status");
const APIResponse = require("../helper/APIResponse");

exports.sendRequest = async (req, res, next) => {
    try {

        const data = await userModel.find({ email: req.params.userEmail, email: req.params.RequestedEmail });
        console.log(data);
        if (data) {

            const request = requestModel({
                userEmail: req.params.userEmail,
                RequestedEmail: req.params.RequestedEmail,
                accepted: 0
            })

            const saveData = await request.save();
        } else {

        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", true, 500, error.message)
        )
    }
}
