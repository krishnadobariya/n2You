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
        const Regexname = new RegExp(req.body.name, 'i');
        const searchName = await userModel.find({ firstName: Regexname });
        console.log("serchname is", searchName[0].email);
        const data2 = [];
        const data = searchName.map((result, index) => {
            console.log(result.email);
            data2.push(result.email)
        })

        console.log("data is", data2);

        const data1 = await requestsModel.find(
            {
                userEmail: req.params.userEmail,
                RequestedEmails: {
                    $elemMatch: {
                        requestedEmail: {
                            $in: data2
                        }
                    }
                }
            }
        )

        if (data1[0] == undefined) {
            const f = {
                status: 3
            }
            res.status(status.NOT_FOUND).json(
                new APIResponse("not user friend and not requested", true, 404, f)
            )


        } else {
            console.log("data1", data1);
            const data4 = data1[0].RequestedEmails
            const b = [];
            data4.map((result, next) => {
                const a = result.requestedEmail
                b.push(a);
            })

            const c = await userModel.aggregate([{
                $match: {
                    email: {
                        $in: b
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
                    localField: 'RequestedEmails.requestedEmail',
                    foreignField: 'email',
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
                    request: "$form_data"
                }
            }])




            res.status(status.OK).json(
                new APIResponse("show all erecord searchwise", true, 201, c)
            )


        }


        // const data3 = await userModel.aggregate([{
        //     $match: {

        //     }
        // }])

        // console.log(data3);
        // console.log(data1[0]);
        // if (data1[0] == undefined) {
        //     const data = {
        //         status: 3,
        //         message: "Not requested and not User Friend"
        //     }
        //     res.status(status.CREATED).json(
        //         new APIResponse("not Found", true, 201, data)
        //     )
        // } else {

        //     const data1 = await requestsModel.find({
        //         userEmail: req.params.userEmail,
        //         "RequestedEmails.requestedEmail": {
        //             $in: data2
        //         },
        //         "RequestedEmails.accepted": 1
        //     })

        //     if (data1) {
        //         console.log(data1);
        //         const data = {
        //             status: 1,
        //             message: "User Friend"
        //         }
        //         res.status(status.CREATED).json(
        //             new APIResponse("not Found", true, 201, data)
        //         )
        //     } else {
        //         const data = {
        //             status: 1,
        //             message: "User requested but not Accepted"
        //         }
        //         res.status(status.CREATED).json(
        //             new APIResponse("not Found", true, 201, data)
        //         )
        //     }

        // }

        // console.log("data", data);
        // const checkCondition = await userModel.aggregate([{
        //     $match: {
        //         firstName: {
        //             $regex: Regexname
        //         }
        //     }
        // },
        // {
        //     $lookup: {
        //         from: "requests",
        //         localField: 'userEmail',
        //         foreignField: 'email',
        //         as: 'final_data'
        //     }
        // },
        // {
        //     $unwind: '$final_data'
        // }
        // ])

        // console.log(checkCondition);
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}