const userModel = require("../model/user.model");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const cloudinary = require("../utils/cloudinary.utils");
const requestsModel = require("../model/requests.model");
const { default: mongoose } = require("mongoose");
const commentModel = require("../model/comment.model");

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
        if (findEmail) {
            res.status(status.NOT_ACCEPTABLE).json(
                new APIResponse("Not Allowed, Email Already Exist", "false", 406, "0")
            )
        } else {
            const phoneNum = req.body.phoneNum;

            const countryCode = req.body.countryCode

            const findNumber = await userModel.findOne({ phoneNumber: `${countryCode}${phoneNum}` });


            if (findNumber) {
                res.status(status.NOT_ACCEPTABLE).json(
                    new APIResponse("Number Already Exist, It must be Unique", "false", 406, "0")
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
                    new APIResponse("User Register", true, 201, 1, saveData)
                )
            }

        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}


// Search Friend

exports.searchFriend = async (req, res, next) => {
    try {
        const Regexname = new RegExp(req.body.searchKey, 'i');
        const searchName = await userModel.find({ firstName: Regexname });
        const reaquestedAllEmail = [];
        searchName.map((result, index) => {
            reaquestedAllEmail.push(result.email)
        })

        console.log("HRTHGRT");
        console.log("reaquestedAllEmail", reaquestedAllEmail);

        if (reaquestedAllEmail[0] == undefined) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("No User Found", 'false', 404, '0')
            )
        } else {
            const RequestedEmailExiestInUser = await requestsModel.findOne(
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
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Requested Email Not Exiest In User or User not Found", "false", 404, "0")
                )
            } else {

                const emailGet = [];



                for (const emailExist of RequestedEmailExiestInUser) {


                    for (const getEmail of emailExist.RequestedEmails) {
                        emailGet.push(getEmail.requestedEmail)
                    }
                }

                var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);

                const UniqueEmail = [];
                for (const uniqueEmail of difference) {
                    const userDetail = await userModel.findOne({ email: uniqueEmail });
                    console.log("userDetail", userDetail);
                    const response = {
                        _id: userDetail._id,
                        email: uniqueEmail,
                        firstName: userDetail.firstName,
                        status: 3
                    }

                    UniqueEmail.push(response);
                }


                if (RequestedEmailExiestInUser[0] == undefined) {
                    const responseData = [];
                    for (const allrequestedDataNotAcceptedRequestAndNotFriend of reaquestedAllEmail) {
                        const userDetail = await userModel.findOne({ email: allrequestedDataNotAcceptedRequestAndNotFriend });
                        const response = {
                            _id: userDetail._id,
                            email: allrequestedDataNotAcceptedRequestAndNotFriend,
                            firstName: userDetail.firstName,
                            status: 3
                        }

                        responseData.push(response);
                    }
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



                    const finalExistUser = [];

                    const emailDataDetail = meageAllTable;
                    for (const DataDetail of emailDataDetail) {
                        for (const reqEmail of reaquestedAllEmail) {
                            if (DataDetail.email == reqEmail) {
                                finalExistUser.push(DataDetail)
                            }
                        }
                    }


                    console.log("finalExistUser", finalExistUser);
                    console.log("emailDataDetail", emailDataDetail);
                    for (const emailData of finalExistUser[0].result) {

                        for (const requestEmail of emailData) {

                            for (const meageAllTableEmail of finalExistUser) {

                                if (requestEmail.requestedEmail == meageAllTableEmail.email) {


                                    if (requestEmail.accepted == 1) {
                                        var status1 = {
                                            status: 1,
                                            email: requestEmail.requestedEmail
                                        }
                                        statusByEmail.push(status1)
                                    } else {
                                        var status2 = {
                                            status: 2,
                                            email: requestEmail.requestedEmail
                                        }
                                        statusByEmail.push(status2)
                                    }
                                }
                            }
                        }
                    }

                    const final_data = [];

                    const finalStatus = []
                    for (const [key, finalData] of meageAllTable.entries()) {
                        for (const [key, final1Data] of statusByEmail.entries())
                            if (finalData.email === final1Data.email) {
                                finalStatus.push(final1Data.status)
                            }
                    }
                    for (const [key, finalData] of finalExistUser.entries()) {

                        const response = {
                            _id: finalData._id,
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
                            status: finalStatus[key]
                        }
                        final_data.push(response);
                    }



                    const final_response = [...final_data, ...UniqueEmail]
                    console.log(final_data, ...UniqueEmail);
                    // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];

                    res.status(status.OK).json(
                        new APIResponse("show all record searchwise", true, 201, 1, final_response)
                    )
                }
            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.getDataUserWise = async (req, res, next) => {
    try {

        const userFind = await userModel.findOne({ _id: req.params.UserId })

        if (userFind == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("user not Found", "false", 404, "0")
            )
        } else {

            const data = await userModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.params.UserId)
                    }
                },
                {
                    $lookup: {
                        from: "posts",
                        localField: "_id",
                        foreignField: "userId",
                        as: "datas"
                    }
                }, {
                    $project: {
                        polyDating: '$polyDating',
                        email: "$email",
                        polyDating: '$polyDating',
                        loveToGive: '$loveToGive',
                        polyRelationship: '$polyRelationship',
                        firstName: '$firstName',
                        birthDate: '$birthDate',
                        identity: '$identity',
                        relationshipSatus: '$relationshipSatus',
                        IntrestedIn: '$IntrestedIn',
                        Bio: '$Bio',
                        photo: '$photo',
                        hopingToFind: '$hopingToFind',
                        jobTitle: 'jobTitle',
                        wantChildren: '$wantChildren',
                        phoneNumber: '$phoneNumber',
                        extraAtrribute: '$extraAtrribute',
                        posts: '$datas'
                    }
                }])

            const getAllPosts = [];
            for (const userAllData of data) {
           
                for (const userPost of userAllData.posts) {
                  
                    for (const getPost of userPost.posts) {

                        const userPostDate = getPost.createdAt;


                        datetime = userPostDate;
                        var userPostedDate = new Date(datetime);
                        now = new Date();
                        var sec_num = (now - userPostedDate) / 1000;
                        var days = Math.floor(sec_num / (3600 * 24));
                        var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                        var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                        var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                        if (hours < 10) { hours = "0" + hours; }
                        if (minutes < 10) { minutes = "0" + minutes; }
                        if (seconds < 10) { seconds = "0" + seconds; }

                        const finalPostedTime = [];
                        const commentData = [];

                        if (days > 30) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            let whenUserPosted = userPostedDate;
                            const fullDate = new Date(whenUserPosted).toDateString()
                            finalPostedTime.push(`${fullDate}`);
                            commentData.push(getComment)
                        }
                        if (days > 0 && days < 30) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            finalPostedTime.push(`${days} days`);
                            commentData.push(getComment)
                        } else if (hours > 0 && days == 0) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            finalPostedTime.push(`${hours} hours`);
                            commentData.push(getComment)
                        } else if (minutes > 0 && hours == 0) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            finalPostedTime.push(`${minutes} minute`);
                            commentData.push(getComment)
                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            finalPostedTime.push(`${seconds} second`);
                            commentData.push(getComment)
                        }


                        const response = {
                            getPost,
                            finalPostedTime,
                            commentData
                        }
                        getAllPosts.push(response);
                    }
                }
            }

            const response = {
                polyDating: data[0].polyDating,
                email: data[0].email,
                loveToGive: data[0].loveToGive,
                polyRelationship: data[0].polyRelationship,
                firstName: data[0].firstName,
                birthDate: data[0].birthDate,
                identity: data[0].identity,
                relationshipSatus: data[0].relationshipSatus,
                IntrestedIn: data[0].IntrestedIn,
                Bio: data[0].Bio,
                photo: data[0].photo,
                hopingToFind: data[0].hopingToFind,
                jobTitle: data[0].jobTitle,
                wantChildren: data[0].wantChildren,
                phoneNumber: data[0].phoneNumber,
                extraAtrribute: data[0].extraAtrribute,
                getAllPosts
            }
            res.status(status.OK).json(
                new APIResponse("show UserWise get", "true", 201, "1", response)
            )
        }


    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}


