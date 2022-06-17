const userModel = require("../model/user.model");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const cloudinary = require("../utils/cloudinary.utils");
const requestsModel = require("../model/requests.model");

exports.userRegister = async (req, res, next) => {
    try {
        const cloudinaryImageUploadMethod = async file => {
            return new Promise(resolve => {
                cloudinary.uploader.upload(file, (err, res) => {
                    if (err) return res.status(500).send("upload image error")
                    resolve({
                        res: res.secure_url
                    })
                }
                )
            })
        }


        const urls = []
        const files = req.files

        for (const file of files) {
            const { path } = file

            const newPath = await cloudinaryImageUploadMethod(path)
            urls.push(newPath)
        }

        const findEmail = await userModel.findOne({ email: req.body.email });
        console.log(findEmail);
        if (findEmail) {
            res.status(status.NOT_ACCEPTABLE).json(
                new APIResponse("Not Allowed, Email Already Exist", false, 406)
            )
        } else {
            const phoneNum = req.body.phoneNum;

            const countryCode = req.body.countryCode
            console.log(`${countryCode}${phoneNum}`);
            const findNumber = await userModel.findOne({ phoneNumber: `${countryCode}${phoneNum}` });
            console.log("findnumber", findNumber);
            if (findNumber) {
                res.status(status.NOT_ACCEPTABLE).json(
                    new APIResponse("Number Already Exist, It must be Unique", false, 406)
                )
            } else {
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
                    photo: urls,
                    hopingToFind: req.body.hopingToFind,
                    jobTitle: req.body.jobTitle,
                    wantChildren: req.body.wantChildren,
                    extraAtrribute: {
                        bodyType: req.body.bodyType,
                        height: req.body.height,
                        smoking: req.body.smoking,
                        drinking: req.body.drinking,
                        hobbies: req.body.hobbies
                    },
                    phoneNumber: `${countryCode}${phoneNum}`
                })

                const saveData = await user.save();
                res.status(status.CREATED).json(
                    new APIResponse("User Register", true, 201, saveData)
                )
            }

        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}


// Search Friend

exports.serchFriend = async (req, res, next) => {
    try {
        const Regexname = new RegExp(req.body.searchKey, 'i');
        const searchName = await userModel.find({ firstName: Regexname });
        const reaquestedAllEmail = [];
        searchName.map((result, index) => {
            console.log(result.email);
            reaquestedAllEmail.push(result.email)
        })



        const RequestedEmailExiestInUser = await requestsModel.find(
            {
                userEmail: req.params.userEmail,
                RequestedEmails: {
                    $elemMatch: {
                        requestedEmail: {
                            $in: reaquestedAllEmail
                        }
                    }
                }
            }
        )

        if (RequestedEmailExiestInUser[0] == undefined) {
            const UserNotAcceptedReuestedandNOtUseFriend = {
                status: 3
            }
            res.status(status.NOT_FOUND).json(
                new APIResponse("not user friend and not requested", true, 404, UserNotAcceptedReuestedandNOtUseFriend)
            )
        } else {


            const statusByEmail = [];
            const allRequestedEmail = RequestedEmailExiestInUser[0].RequestedEmails
            const requestedEmailWitchIsInuserRequeted = [];
            allRequestedEmail.map((result, next) => {
                const resultEmail = result.requestedEmail
                requestedEmailWitchIsInuserRequeted.push(resultEmail);
            })


            const meageAllTable = await userModel.aggregate([{
                $match: {
                    email: {
                        $in: requestedEmailWitchIsInuserRequeted
                    }
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'req_data'
                }
            },
            {
                $lookup: {
                    from: 'requests',
                    let: {

                        userEmail: req.params.userEmail,
                        email: "$email"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$userEmail", "$$userEmail"
                                            ]
                                        },
                                        {
                                            $in:
                                                [
                                                    "$$email", "$RequestedEmails.requestedEmail"
                                                ]
                                        }
                                    ]
                                }
                            }
                        },
                    ],
                    as: 'form_data'
                }
            },
            {
                $project: {
                    polyDating: "$polyDating",
                    HowDoYouPoly: "$HowDoYouPoly",
                    loveToGive: "$loveToGive",
                    polyRelationship: "$polyRelationship",
                    firstName: "$firstName",
                    email: "$email",
                    firstName: "$firstName",
                    relationshipSatus: "$relationshipSatus",
                    Bio: "$Bio",
                    hopingToFind: "$hopingToFind",
                    jobTitle: "$jobTitle",
                    wantChildren: "$wantChildren",
                    posts: "$req_data",
                    result: "$form_data.RequestedEmails",
                }
            }])

            const emailDataDetail = meageAllTable[0].result;

            for (const emailData of emailDataDetail) {

                for (const requestEmail of emailData) {

                    for (const meageAllTableEmail of meageAllTable) {
                        if (requestEmail.requestedEmail == meageAllTableEmail.email) {
                            console.log(requestEmail.accepted);
                            if (requestEmail.accepted == 1) {
                                var status1 = 1
                                statusByEmail.push(status1)
                            } else {
                                var status2 = 2
                                statusByEmail.push(status2)
                            }
                        }
                    }
                }
            }

            const final_data = [];

            for (const [key, finalData] of meageAllTable.entries()) {
                console.log(key);
                const response = {
                    details: finalData._id,
                    polyDating: finalData.polyDating,
                    HowDoYouPoly: finalData.HowDoYouPoly,
                    loveToGive: finalData.loveToGive,
                    polyRelationship: finalData.polyRelationship,
                    firstName: finalData.firstName,
                    email: finalData.email,
                    relationshipSatus: finalData.relationshipSatus,
                    Bio: finalData.Bio,
                    hopingToFind: finalData.hopingToFind,
                    jobTitle: finalData.jobTitle,
                    wantChildren: finalData.wantChildren,
                    posts: finalData.posts,
                    status: statusByEmail[key]
                }
                final_data.push(response);
            }
            // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];

            res.status(status.OK).json(
                new APIResponse("show all erecord searchwise", true, 201, final_data)
            )
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}
