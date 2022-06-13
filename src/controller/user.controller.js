const userModel = require("../model/user.model");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");


exports.userRegister = async (req, res, next) => {
    try {

        const data = []
        const images = req.files;
        images.map((name, index) => {
            data.push(req.files[index].filename)
        });

        const user = userModel({
            polyDating: req.body.polyDating,
            HowDoYouPoly: req.body.HowDoYouPoly,
            loveToGive: req.body.loveToGive,
            polyRelationship: req.body.polyRelationship,
            email: req.body.email,
            firstName: req.body.firstName,
            birthDate: req.body.birthDate,
            identity: req.body.identity,
            relationshipSatus: req.body.relationshipSatus,
            IntrestedIn: req.body.IntrestedIn,
            Bio: req.body.Bio,
            photo: data,
            hopingToFind: req.body.hopingToFind,
            jobTitle: req.body.jobTitle,
            wantChildren: req.body.wantChildren,
            extraAtrribute: {
                bodyType: req.body.bodyType,
                height: req.body.height,
                smoking: req.body.smoking,
                drinking: req.body.drinking,
                hobbies: req.body.hobbies
            }
        })

        const saveData = await user.save();
        res.status(status.CREATED).json(
            new APIResponse("User Register", true, 200, saveData)
        )
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", true, 500, error.message)
        )
    }
}

