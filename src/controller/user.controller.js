const userModel = require("../model/user.model");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const cloudinary = require("../utils/cloudinary.utils");
const requestsModel = require("../model/requests.model");
const { default: mongoose } = require("mongoose");
const commentModel = require("../model/comment.model");
const basketModel = require("../model/basket.model");

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
            const phoneNum = req.body.phone_num;

            const countryCode = req.body.country_code

            const findNumber = await userModel.findOne({ phoneNumber: `${countryCode}${phoneNum}` });


            if (findNumber) {
                res.status(status.NOT_ACCEPTABLE).json(
                    new APIResponse("Number Already Exist, It must be Unique", "false", 406, "0")
                )
            } else {
                const user = userModel({
                    polyDating: req.body.poly_dating,
                    HowDoYouPoly: req.body.how_do_you_poly,
                    loveToGive: req.body.love_to_give,
                    polyRelationship: req.body.poly_relationship,
                    email: req.body.email,
                    firstName: req.body.first_name,
                    birthDate: req.body.birth_date,
                    identity: req.body.identity,
                    relationshipSatus: req.body.relationship_satus,
                    IntrestedIn: req.body.intrested_in,
                    Bio: req.body.bio,
                    photo: urls,
                    location: {
                        type: "Point",
                        coordinates: [
                            parseFloat(req.body.longitude),
                            parseFloat(req.body.latitude),
                        ],
                    },
                    fcm_token: req.body.fcm_token,
                    hopingToFind: req.body.hoping_to_find,
                    jobTitle: req.body.job_title,
                    wantChildren: req.body.want_children,
                    extraAtrribute: {
                        bodyType: req.body.body_type,
                        height: req.body.height,
                        smoking: req.body.smoking,
                        drinking: req.body.drinking,
                        hobbies: req.body.hobbies
                    },
                    phoneNumber: `${countryCode}${phoneNum}`
                })

                const saveData = await user.save();

                const findUser = await userModel.findOne({
                    email: req.body.email
                })

                const data = {
                    _id: findUser._id,
                    polyDating: req.body.poly_dating,
                    HowDoYouPoly: req.body.how_do_you_poly,
                    loveToGive: req.body.love_to_give,
                    polyRelationship: req.body.poly_relationship,
                    email: req.body.email,
                    firstName: req.body.first_name,
                    birthDate: req.body.birth_date,
                    identity: req.body.identity,
                    relationshipSatus: req.body.relationship_satus,
                    IntrestedIn: req.body.intrested_in,
                    Bio: req.body.bio,
                    photo: urls,
                    longitude: req.body.longitude,
                    latitude: req.body.latitude,
                    fcm_token: req.body.fcm_token,
                    hopingToFind: req.body.hoping_to_find,
                    jobTitle: req.body.job_title,
                    wantChildren: req.body.want_children,
                    bodyType: req.body.body_type,
                    height: req.body.height,
                    smoking: req.body.smoking,
                    drinking: req.body.drinking,
                    hobbies: req.body.hobbies,
                    phoneNumber: `${countryCode}${phoneNum}`
                }


                res.status(status.CREATED).json(
                    new APIResponse("User Register", true, 201, 1, data)
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

// user profile update
exports.userUpdate = async (req, res, next) => {
    try {

        const userFind = await userModel.findOne({
            _id: req.params.user_id
        })

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


        if (userFind == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not Found", "false", 404, "0")
            )
        } else {


            const phoneNum = req.body.phone_num;

            const countryCode = req.body.country_code;

            const findNumber = await userModel.find(
                {
                    _id:
                    {
                        $ne: req.params.user_id
                    }
                }
            );
            const findNumberUnique = [];
            for (const findvalidNumber of findNumber) {

                if (findvalidNumber.phoneNumber == `${countryCode}${phoneNum}`) {
                    findNumberUnique.push("yes")
                } else {
                    findNumberUnique.push("no")
                }
            }


            const findEmailUnique = [];
            const findEmail = await userModel.find(
                {
                    _id:
                    {
                        $ne: req.params.user_id
                    }
                }
            );


            for (const findvalidEmail of findEmail) {

                if (findvalidEmail.email == req.body.email) {
                    findEmailUnique.push("yes")
                } else {
                    findEmailUnique.push("no")
                }
            }

            const resultForNumber = findNumberUnique.includes("yes");
            const resultForEmail = findEmailUnique.includes("yes")

            if (resultForNumber) {
                res.status(status.NOT_ACCEPTABLE).json(
                    new APIResponse("Number Already Exist, It must be Unique", "false", 406, "0")
                )
            } else if (resultForEmail) {
                res.status(status.NOT_ACCEPTABLE).json(
                    new APIResponse("Not Allowed, Email Already Exist", "false", 406, "0")
                )
            } else {
                const updateUser = await userModel.updateOne({
                    _id: req.params.user_id
                }, {
                    $set: {
                        polyDating: req.body.poly_dating,
                        HowDoYouPoly: req.body.how_do_you_poly,
                        loveToGive: req.body.love_to_give,
                        polyRelationship: req.body.poly_relationship,
                        email: req.body.email,
                        firstName: req.body.first_name,
                        birthDate: req.body.birth_date,
                        identity: req.body.identity,
                        relationshipSatus: req.body.relationship_satus,
                        IntrestedIn: req.body.intrested_in,
                        Bio: req.body.bio,
                        photo: urls,
                        location: {
                            type: "Point",
                            coordinates: [
                                parseFloat(req.body.longitude),
                                parseFloat(req.body.latitude),
                            ],
                        },
                        fcm_token: req.body.fcm_token,
                        hopingToFind: req.body.hoping_to_find,
                        jobTitle: req.body.job_title,
                        wantChildren: req.body.want_children,
                        extraAtrribute: {
                            bodyType: req.body.body_type,
                            height: req.body.height,
                            smoking: req.body.smoking,
                            drinking: req.body.drinking,
                            hobbies: req.body.hobbies
                        },
                        phoneNumber: `${countryCode}${phoneNum}`
                    }
                }).then((() => {
                    res.status(status.OK).json(
                        new APIResponse("User Successfully updated!", "true", 200, "1")
                    )
                })).catch((error) => {
                    res.status(status.NOT_MODIFIED).json(
                        new APIResponse("User not updated!", "false", 304, "0")
                    )
                })
            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}


// token update

exports.tokenUpdate = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not Found", "false", 404, "0")
            )
        } else {
            const updateToken = await userModel.updateOne({
                _id: req.params.user_id
            }, {
                $set: {
                    fcm_token: req.body.fcm_token
                }
            }).then(() => {
                res.status(status.OK).json(
                    new APIResponse("Token Successfully updated!", "true", 200, "1")
                )
            }).catch((error) => {
                res.status(status.NOT_MODIFIED).json(
                    new APIResponse("Toekn not updated!", "false", 304, "0")
                )
            })
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
        const Regexname = new RegExp(req.body.search_key, 'i');
        const searchName = await userModel.find({ firstName: Regexname, polyDating: 0 });
        const reaquestedAllEmail = [];
        searchName.map((result, index) => {
            reaquestedAllEmail.push(result.email)
        })


        if (reaquestedAllEmail[0] == undefined) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("No User Found", 'false', 404, '0')
            )
        } else {
            const RequestedEmailExiestInUser = await requestsModel.findOne(
                {
                    userEmail: req.params.user_email,
                    RequestedEmails: {
                        $elemMatch: {
                            requestedEmail: {
                                $in: reaquestedAllEmail
                            }
                        }
                    }
                }
            )


            if (reaquestedAllEmail && RequestedEmailExiestInUser == null) {
                const finalData = [];
                const responseData = [];
                for (const allrequestedDataNotAcceptedRequestAndNotFriend of reaquestedAllEmail) {

                    const userDetail = await userModel.findOne({ email: allrequestedDataNotAcceptedRequestAndNotFriend });

                    const FindLocation = await userModel.aggregate([
                        {
                            $geoNear: {
                                near: {
                                    type: "Point",
                                    coordinates: [
                                        parseFloat(req.query.long),
                                        parseFloat(req.query.lat)

                                    ],
                                },
                                distanceField: "distanceFrom",
                                maxDistance: 10000,
                                minDistance: 0,
                                uniqueDoc: true,
                                spherical: true
                            },
                        }]);

                    for (const uniqueDistance of FindLocation) {

                        if (uniqueDistance.email == allrequestedDataNotAcceptedRequestAndNotFriend) {
                            finalData.push(uniqueDistance)
                        }
                    }
                }

                for (const getOriginalData of finalData) {
                    const response = {
                        _id: getOriginalData._id,
                        email: getOriginalData.email,
                        firstName: getOriginalData.firstName,
                        status: 3
                    }

                    responseData.push(response);
                }

                res.status(status.OK).json(
                    new APIResponse("show all record searchwise", true, 201, 1, responseData)
                )


            } else {

                const emailGet = [];
                const finalData = [];
                for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                    emailGet.push(getEmail.requestedEmail)
                }

                var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);


                const UniqueEmail = [];
                for (const uniqueEmail of difference) {
                    const userDetail = await userModel.findOne({ email: uniqueEmail });

                    const FindLocation = await userModel.aggregate([
                        {
                            $geoNear: {
                                near: {
                                    type: "Point",
                                    coordinates: [
                                        parseFloat(req.query.long),
                                        parseFloat(req.query.lat)

                                    ],
                                },
                                distanceField: "distanceFrom",
                                maxDistance: 10000,
                                minDistance: 0,
                                uniqueDoc: true,
                                spherical: true
                            },
                        }]);



                    for (const uniqueDistance of FindLocation) {

                        if (uniqueDistance.email == uniqueEmail) {
                            finalData.push(uniqueDistance)
                        }
                    }

                }

                for (const getOriginalData of finalData) {
                    const response = {
                        _id: getOriginalData._id,
                        email: getOriginalData.email,
                        firstName: getOriginalData.firstName,
                        profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : null,
                        status: 3
                    }

                    UniqueEmail.push(response);
                }

                const statusByEmail = [];
                const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
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

                            userEmail: req.params.user_email,
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
                        photo: finalData.photo,
                        hopingToFind: finalData.hopingToFind,
                        jobTitle: finalData.jobTitle,
                        wantChildren: finalData.wantChildren,
                        posts: finalData.posts,
                        status: finalStatus[key]
                    }


                    if (response.status == 1) {
                        const getDetail = {
                            _id: finalData._id,
                            polyDating: finalData.polyDating,
                            HowDoYouPoly: finalData.HowDoYouPoly,
                            loveToGive: finalData.loveToGive,
                            polyRelationship: finalData.polyRelationship,
                            firstName: finalData.firstName,
                            email: finalData.email,
                            relationshipSatus: finalData.relationshipSatus,
                            Bio: finalData.Bio,
                            photo: finalData.photo,
                            hopingToFind: finalData.hopingToFind,
                            jobTitle: finalData.jobTitle,
                            wantChildren: finalData.wantChildren,
                            posts: finalData.posts[0].posts,
                            status: finalStatus[key]
                        }

                        final_data.push(getDetail);
                    } else {

                        const getDetail = {
                            _id: finalData._id,
                            polyDating: finalData.polyDating,
                            HowDoYouPoly: finalData.HowDoYouPoly,
                            loveToGive: finalData.loveToGive,
                            polyRelationship: finalData.polyRelationship,
                            firstName: finalData.firstName,
                            email: finalData.email,
                            relationshipSatus: finalData.relationshipSatus,
                            Bio: finalData.Bio,
                            photo: finalData.photo,
                            hopingToFind: finalData.hopingToFind,
                            jobTitle: finalData.jobTitle,
                            wantChildren: finalData.wantChildren,
                            status: finalStatus[key]
                        }

                        final_data.push(getDetail);
                    }

                }

                const final_response = [...final_data, ...UniqueEmail]

                // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];

                res.status(status.OK).json(
                    new APIResponse("show all record searchwise", true, 201, 1, final_response)
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

exports.getDataUserWise = async (req, res, next) => {
    try {

        const userFind = await userModel.findOne({ _id: req.params.user_id, polyDating: 0 })

        if (userFind == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("user not Found and not Social Meida & Dating type user", "false", 404, "0")
            )
        } else {

            const data = await userModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.params.user_id)
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
                            commentData: commentData[0] == null ? [] : commentData
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
                Posts: getAllPosts
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


exports.storeBasketValue = async (req, res, next) => {
    try {

        const allUserWithProfileMatch = [];
        const findUser = await userModel.findOne({
            _id: req.params.user_id,
            polyDating: 0
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("user not Found and not Social Meida & Dating type user", "false", 404, "0")
            )
        } else {

            // var matchCordinates = await userModel.aggregate(
            //     [
            //         {
            //             $geoNear: {
            //                 near: {
            //                     type: "Point",
            //                     coordinates: [
            //                         parseFloat(findUser.location.coordinates[0]),
            //                         parseFloat(findUser.location.coordinates[1])

            //                     ],
            //                 },
            //                 distanceField: "distanceFrom",
            //                 maxDistance: 10000,
            //                 minDistance: 0,
            //                 uniqueDoc: true,
            //                 spherical: true
            //             },
            //         },
            //     ]
            // );

            var matchUser = await userModel.find({
                _id: {
                    $ne: req.params.user_id
                },
                polyDating: 0
            })

            const identity = findUser.identity
            const relationshipSatus = findUser.relationshipSatus
            const IntrestedIn = findUser.IntrestedIn
            const hopingToFind = findUser.hopingToFind
            const wantChildren = findUser.wantChildren


            for (const chechUser of matchUser) {

                var local = 0;

                if (chechUser.identity == identity) {
                    var local = local + 1
                } else {
                    var local = local + 0
                }

                if (chechUser.relationshipSatus == relationshipSatus) {
                    var local = local + 1
                } else {
                    var local = local + 0
                }


                if (chechUser.IntrestedIn == IntrestedIn) {
                    var local = local + 1
                } else {
                    var local = local + 0
                }

                if (chechUser.hopingToFind == hopingToFind) {
                    var local = local + 1
                } else {
                    var local = local + 0
                }

                if (chechUser.wantChildren == wantChildren) {
                    var local = local + 1
                } else {
                    var local = local + 0
                }


                const matchProfile = local / 5 * 100;

                const profileMatch = `${parseInt(matchProfile)}`

                // console.log("chechUser", chechUser);

                const findUser = await userModel.findOne({
                    _id: req.params.user_id,
                    "basket.userId": chechUser._id
                })

                if (findUser == null) {
                    const addInUser = await userModel.updateOne({
                        _id: req.params.user_id
                    }, {
                        $push: {
                            basket: {
                                match: profileMatch,
                                userId: chechUser._id
                            }
                        }
                    })
                } else {
                    const updateUser = await userModel.updateOne({
                        _id: req.params.user_id,
                        "basket.userId": chechUser._id
                    }, {
                        basket: {
                            match: profileMatch,
                        }
                    })
                }

                const response = {
                    chechUser,
                    profileMatch
                }
                allUserWithProfileMatch.push(response)
            }
            res.status(status.OK).json(
                new APIResponse("show User With ProfileMatch", "true", 201, "1", allUserWithProfileMatch)
            )
        }

    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}


exports.yesBasket = async (req, res, next) => {
    try {

        // const findYesBasket = await userModel.find({
        //     basket: { $lt: 100 }, basket: { $gt: 50 }
        // })


        const user_id = req.params.user_id;
        const request_user_id = req.params.request_user_id;

        if (user_id.toString() == request_user_id.toString()) {


            const findUser = await userModel.findOne({
                _id: req.params.user_id,
                polyDating: 0
            })

            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("user not Found and not Social Meida & Dating type user", "false", 404, "0")
                )
            } else {
                const reaquestedAllEmail = [];
                const allMeargeData = [];
                const YesBasketData = [];
                for (const allBakest of findUser.basket) {

                    if (allBakest.match > 50) {
                        YesBasketData.push(allBakest.userId)

                    }

                }

                for (const allYesBasketData of YesBasketData) {
                    const meargeData = await userModel.findOne({
                        _id: allYesBasketData,
                    })


                    reaquestedAllEmail.push(meargeData.email)
                }



                if (reaquestedAllEmail[0] == undefined) {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("No User Found", 'false', 404, '0')
                    )
                } else {

                    const RequestedEmailExiestInUser = await requestsModel.findOne(
                        {
                            userId: req.params.user_id,
                            RequestedEmails: {
                                $elemMatch: {
                                    requestedEmail: {
                                        $in: reaquestedAllEmail
                                    }
                                }
                            }
                        }
                    )


                    if (reaquestedAllEmail && RequestedEmailExiestInUser == null) {
                        const finalData = [];
                        const responseData = [];
                        for (const allrequestedDataNotAcceptedRequestAndNotFriend of reaquestedAllEmail) {
                            const userDetail = await userModel.findOne({ email: allrequestedDataNotAcceptedRequestAndNotFriend });
                            finalData.push(userDetail)
                        }

                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id
                        })

                        for (const getOriginalData of finalData) {

                            for (const findThumb of findThumbUp.basket) {
                                const findThumbData = findThumb.userId
                                const orginalData = getOriginalData._id

                                if (orginalData.toString() == findThumbData.toString()) {

                                    const response = {
                                        _id: getOriginalData._id,
                                        email: getOriginalData.email,
                                        firstName: getOriginalData.firstName,
                                        status: 3,
                                        thumbUp: findThumb.thumbUp,
                                        thumbDown: findThumb.thumbDown
                                    }

                                    responseData.push(response);
                                }

                            }
                        }

                        res.status(status.OK).json(
                            new APIResponse("show all yes basket Record", true, 201, 1, responseData)
                        )

                    } else {

                        const emailGet = [];
                        const finalData = [];
                        for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                            emailGet.push(getEmail.requestedEmail)
                        }


                        var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);



                        const UniqueEmail = [];


                        for (const uniqueEmail of difference) {
                            const userDetail = await userModel.findOne({ email: uniqueEmail });
                            finalData.push(userDetail)
                        }

                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id
                        })

                        for (const getOriginalData of finalData) {

                            for (const findThumb of findThumbUp.basket) {
                                const findThumbData = findThumb.userId
                                const orginalData = getOriginalData._id

                                if (orginalData.toString() == findThumbData.toString()) {
                                    const response = {
                                        _id: getOriginalData._id,
                                        email: getOriginalData.email,
                                        firstName: getOriginalData.firstName,
                                        status: 3,
                                        thumbUp: findThumb.thumbUp,
                                        thumbDown: findThumb.thumbDown
                                    }

                                    UniqueEmail.push(response);
                                }

                            }
                        }


                        const statusByEmail = [];
                        const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
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

                                    userId: mongoose.Types.ObjectId(req.params.user_id),
                                    email: "$email"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$userId", "$$userId"
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

                        for (const emailData of finalExistUser[0].result) {



                            for (const requestEmail of emailData) {

                                for (const meageAllTableEmail of finalExistUser) {

                                    if (requestEmail.requestedEmail == meageAllTableEmail.email) {

                                        const findThumbUp = await userModel.findOne({
                                            _id: req.params.request_user_id
                                        })

                                        for (const findThumb of findThumbUp.basket) {

                                            const findThumbData = findThumb.userId
                                            const originalData = requestEmail.userId

                                            if (originalData.toString() == findThumbData.toString()) {
                                                if (requestEmail.accepted == 1) {
                                                    var status1 = {
                                                        status: 1,
                                                        email: requestEmail.requestedEmail,
                                                        thumbUp: findThumb.thumbUp,
                                                        thumbDown: findThumb.thumbDown
                                                    }
                                                    statusByEmail.push(status1)
                                                } else {
                                                    var status2 = {
                                                        status: 2,
                                                        email: requestEmail.requestedEmail,
                                                        thumbUp: findThumb.thumbUp,
                                                        thumbDown: findThumb.thumbDown
                                                    }
                                                    statusByEmail.push(status2)
                                                }
                                            }

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
                                    const response = {
                                        status: final1Data.status,
                                        thumbUp: final1Data.thumbUp,
                                        thumbDown: final1Data.thumbDown
                                    }
                                    finalStatus.push(response)
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
                                statusAndTumbCount: finalStatus[key]
                            }
                            final_data.push(response);
                        }



                        const final_response = [...final_data, ...UniqueEmail]

                        // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];

                        res.status(status.OK).json(
                            new APIResponse("show all yes basket record", true, 201, 1, final_response)
                        )
                    }
                }

            }



        } else {

            const findUserInBasket = await basketModel.findOne({
                userId: req.params.request_user_id
            })

            if (findUserInBasket == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not In Basket", "false", 404, "0")
                )
            } else {

                const accessBasket = findUserInBasket.fullAccess

                if (accessBasket == true) {
                    const findUser = await userModel.findOne({
                        _id: req.params.request_user_id
                    })

                    if (findUser == null) {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("user not Found", "false", 404, "0")
                        )
                    } else {
                        const reaquestedAllEmail = [];
                        const allMeargeData = [];
                        const YesBasketData = [];

                        for (const allBakest of findUser.basket) {

                            if (allBakest.match > 50) {
                                YesBasketData.push(allBakest.userId)
                            }
                        }

                        for (const allYesBasketData of YesBasketData) {


                            const meargeData = await userModel.findOne({
                                _id: allYesBasketData,
                            })
                            reaquestedAllEmail.push(meargeData.email)
                        }



                        if (reaquestedAllEmail[0] == undefined) {
                            res.status(status.NOT_FOUND).json(
                                new APIResponse("No User Found", 'false', 404, '0')
                            )
                        } else {

                            const RequestedEmailExiestInUser = await requestsModel.findOne(
                                {
                                    userId: req.params.user_id,
                                    RequestedEmails: {
                                        $elemMatch: {
                                            requestedEmail: {
                                                $in: reaquestedAllEmail
                                            }
                                        }
                                    }
                                }
                            )


                            if (reaquestedAllEmail && RequestedEmailExiestInUser == null) {
                                const finalData = [];
                                const responseData = [];
                                for (const allrequestedDataNotAcceptedRequestAndNotFriend of reaquestedAllEmail) {
                                    const userDetail = await userModel.findOne({ email: allrequestedDataNotAcceptedRequestAndNotFriend });
                                    finalData.push(userDetail)
                                }


                                const findThumbUp = await userModel.findOne({
                                    _id: req.params.request_user_id,
                                    polyDating: 0
                                })

                                for (const getOriginalData of finalData) {

                                    for (const findThumb of findThumbUp.basket) {
                                        const findThumbData = findThumb.userId
                                        const orginalData = getOriginalData._id

                                        if (orginalData.toString() == findThumbData.toString()) {
                                            const response = {

                                                _id: getOriginalData._id,
                                                email: getOriginalData.email,
                                                firstName: getOriginalData.firstName,
                                                status: 3,
                                                thumbUp: findThumb.thumbUp
                                            }

                                            responseData.push(response);
                                        }
                                    }
                                }
                                res.status(status.OK).json(
                                    new APIResponse("show all yes basket record", true, 201, 1, responseData)
                                )

                            } else {

                                const emailGet = [];
                                const finalData = [];
                                for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                                    emailGet.push(getEmail.requestedEmail)
                                }


                                var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);



                                const UniqueEmail = [];


                                for (const uniqueEmail of difference) {
                                    const userDetail = await userModel.findOne({ email: uniqueEmail });
                                    finalData.push(userDetail)
                                }

                                const findThumbUp = await userModel.findOne({
                                    _id: req.params.request_user_id,
                                    polyDating: 0
                                })



                                for (const getOriginalData of finalData) {

                                    for (const findThumb of findThumbUp.basket) {
                                        const findThumbData = findThumb.userId
                                        const orginalData = getOriginalData._id

                                        if (orginalData.toString() == findThumbData.toString()) {
                                            const response = {
                                                _id: getOriginalData._id,
                                                email: getOriginalData.email,
                                                firstName: getOriginalData.firstName,
                                                status: 3,
                                                thumbUp: findThumb.thumbUp
                                            }

                                            UniqueEmail.push(response);
                                        }
                                    }

                                }

                                const statusByEmail = [];
                                const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
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

                                            userId: mongoose.Types.ObjectId(req.params.user_id),
                                            email: "$email"
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: [
                                                                    "$userId", "$$userId"
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


                                for (const emailData of finalExistUser[0].result) {

                                    for (const requestEmail of emailData) {

                                        for (const meageAllTableEmail of finalExistUser) {

                                            if (requestEmail.requestedEmail == meageAllTableEmail.email) {

                                                const findThumbUp = await userModel.findOne({
                                                    _id: req.params.request_user_id,
                                                    polyDating: 0
                                                })


                                                for (const findThumb of findThumbUp.basket) {
                                                    const findThumbData = findThumb.userId
                                                    const originalData = requestEmail.userId

                                                    if (originalData.toString() == findThumbData.toString()) {

                                                        if (requestEmail.accepted == 1) {

                                                            var status1 = {
                                                                status: 1,
                                                                email: requestEmail.requestedEmail,
                                                                thumbUp: findThumb.thumbUp
                                                            }
                                                            statusByEmail.push(status1)

                                                        } else {

                                                            var status2 = {
                                                                status: 2,
                                                                email: requestEmail.requestedEmail,
                                                                thumbUp: findThumb.thumbUp
                                                            }
                                                            statusByEmail.push(status2)
                                                        }
                                                    }
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
                                            const response = {
                                                status: final1Data.status,
                                                thumbUp: final1Data.thumbUp
                                            }
                                            finalStatus.push(response)
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
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    final_data.push(response);
                                }



                                const final_response = [...final_data, ...UniqueEmail]

                                // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];

                                res.status(status.OK).json(
                                    new APIResponse("show all yes basket record", true, 201, 1, final_response)
                                )
                            }
                        }

                    }
                } else {
                    res.status(status.NOT_ACCEPTABLE).json(
                        new APIResponse("Not have Any Access, All Access Lock By User", "false", 406, "0")
                    );
                }

            }




        }


    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }












}



exports.noBasket = async (req, res, next) => {
    try {

        // const findYesBasket = await userModel.find({
        //     basket: { $lt: 100 }, basket: { $gt: 50 }
        // })

        const user_id = req.params.user_id;
        const request_user_id = req.params.request_user_id;

        if (user_id.toString() == request_user_id.toString()) {

            const findUser = await userModel.findOne({
                _id: req.params.user_id,
                polyDating: 0
            })

            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("user not Found and not Social Meida & Dating type user", "false", 404, "0")
                )
            } else {
                const reaquestedAllEmail = [];
                const allMeargeData = [];
                const NoBasketData = [];
                for (const allBakest of findUser.basket) {

                    if (allBakest.match < 50 || allBakest.match > 100) {
                        NoBasketData.push(allBakest.userId)

                    }
                }

                for (const allNoBasketData of NoBasketData) {

                    const meargeData = await userModel.findOne({
                        _id: allNoBasketData,
                    })

                    reaquestedAllEmail.push(meargeData.email)
                }




                if (reaquestedAllEmail[0] == undefined) {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("No User Found", 'false', 404, '0')
                    )
                } else {

                    const RequestedEmailExiestInUser = await requestsModel.findOne(
                        {
                            userId: req.params.user_id,
                            RequestedEmails: {
                                $elemMatch: {
                                    requestedEmail: {
                                        $in: reaquestedAllEmail
                                    }
                                }
                            }
                        }
                    )


                    if (reaquestedAllEmail && RequestedEmailExiestInUser == null) {
                        const finalData = [];
                        const responseData = [];
                        for (const allrequestedDataNotAcceptedRequestAndNotFriend of reaquestedAllEmail) {
                            const userDetail = await userModel.findOne({ email: allrequestedDataNotAcceptedRequestAndNotFriend });
                            finalData.push(userDetail)
                        }

                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })


                        for (const getOriginalData of finalData) {

                            for (const findThumb of findThumbUp.basket) {
                                const findThumbData = findThumb.userId
                                const orginalData = getOriginalData._id

                                if (orginalData.toString() == findThumbData.toString()) {
                                    const response = {
                                        _id: getOriginalData._id,
                                        email: getOriginalData.email,
                                        firstName: getOriginalData.firstName,
                                        status: 3,
                                        thumbUp: findThumb.thumbUp,
                                        thumbDown: findThumb.thumbDown
                                    }

                                    responseData.push(response);
                                }
                            }

                        }

                        res.status(status.OK).json(
                            new APIResponse("show all no basket record", true, 201, 1, responseData)
                        )

                    } else {

                        const emailGet = [];
                        const finalData = [];
                        for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                            emailGet.push(getEmail.requestedEmail)
                        }


                        var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);



                        const UniqueEmail = [];


                        for (const uniqueEmail of difference) {
                            const userDetail = await userModel.findOne({ email: uniqueEmail });
                            finalData.push(userDetail)
                        }


                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })

                        for (const getOriginalData of finalData) {

                            for (const findThumb of findThumbUp.basket) {
                                const findThumbData = findThumb.userId
                                const orginalData = getOriginalData._id

                                if (orginalData.toString() == findThumbData.toString()) {
                                    const response = {
                                        _id: getOriginalData._id,
                                        email: getOriginalData.email,
                                        firstName: getOriginalData.firstName,
                                        status: 3,
                                        thumbUp: findThumb.thumbUp,
                                        thumbDown: findThumb.thumbDown
                                    }

                                    UniqueEmail.push(response);
                                }
                            }


                        }



                        const statusByEmail = [];
                        const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
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

                                    userId: mongoose.Types.ObjectId(req.params.user_id),
                                    email: "$email"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$userId", "$$userId"
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





                        for (const emailData of finalExistUser[0].result) {



                            for (const requestEmail of emailData) {

                                for (const meageAllTableEmail of finalExistUser) {

                                    if (requestEmail.requestedEmail == meageAllTableEmail.email) {

                                        const findThumbUp = await userModel.findOne({
                                            _id: req.params.request_user_id,
                                            polyDating: 0
                                        })


                                        for (const findThumb of findThumbUp.basket) {

                                            const findThumbData = findThumb.userId
                                            const originalData = requestEmail.userId

                                            if (originalData.toString() == findThumbData.toString()) {
                                                if (requestEmail.accepted == 1) {
                                                    var status1 = {
                                                        status: 1,
                                                        email: requestEmail.requestedEmail,
                                                        thumbUp: findThumb.thumbUp,
                                                        thumbDown: findThumb.thumbDown
                                                    }
                                                    statusByEmail.push(status1)
                                                } else {
                                                    var status2 = {
                                                        status: 2,
                                                        email: requestEmail.requestedEmail,
                                                        thumbUp: findThumb.thumbUp,
                                                        thumbDown: findThumb.thumbDown
                                                    }
                                                    statusByEmail.push(status2)
                                                }
                                            }
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
                                    const response = {
                                        status: final1Data.status,
                                        thumbUp: final1Data.thumbUp,
                                        thumbDown: final1Data.thumbDown
                                    }
                                    finalStatus.push(response)
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
                                statusAndTumbCount: finalStatus[key]
                            }
                            final_data.push(response);
                        }



                        const final_response = [...final_data, ...UniqueEmail]

                        // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];

                        res.status(status.OK).json(
                            new APIResponse("show all no basket record", true, 201, 1, final_response)
                        )
                    }
                }

            }

        } else {


            const findUserInBasket = await basketModel.findOne({
                userId: req.params.request_user_id
            })

            if (findUserInBasket == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not In Basket", "false", 404, "0")
                )
            } else {

                const accessBasket = findUserInBasket.fullAccess

                if (accessBasket == true) {
                    const findUser = await userModel.findOne({
                        _id: req.params.request_user_id,
                        polyDating: 0
                    })

                    if (findUser == null) {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("user not Found", "false", 404, "0")
                        )
                    } else {
                        const reaquestedAllEmail = [];
                        const allMeargeData = [];
                        const NoBasketData = [];
                        for (const allBakest of findUser.basket) {

                            if (allBakest.match < 50 || allBakest.match > 100) {
                                NoBasketData.push(allBakest.userId)

                            }

                        }

                        for (const allNoBasketData of NoBasketData) {
                            const meargeData = await userModel.findOne({
                                _id: allNoBasketData,
                            })


                            reaquestedAllEmail.push(meargeData.email)
                        }




                        if (reaquestedAllEmail[0] == undefined) {
                            res.status(status.NOT_FOUND).json(
                                new APIResponse("No User Found", 'false', 404, '0')
                            )
                        } else {

                            const RequestedEmailExiestInUser = await requestsModel.findOne(
                                {
                                    userId: req.params.user_id,
                                    RequestedEmails: {
                                        $elemMatch: {
                                            requestedEmail: {
                                                $in: reaquestedAllEmail
                                            }
                                        }
                                    }
                                }
                            )


                            if (reaquestedAllEmail && RequestedEmailExiestInUser == null) {
                                const finalData = [];
                                const responseData = [];
                                for (const allrequestedDataNotAcceptedRequestAndNotFriend of reaquestedAllEmail) {
                                    const userDetail = await userModel.findOne({ email: allrequestedDataNotAcceptedRequestAndNotFriend });
                                    finalData.push(userDetail)
                                }


                                const findThumbUp = await userModel.findOne({
                                    _id: req.params.request_user_id,
                                    polyDating: 0
                                })

                                for (const getOriginalData of finalData) {

                                    for (const findThumb of findThumbUp.basket) {
                                        const findThumbData = findThumb.userId
                                        const orginalData = getOriginalData._id

                                        if (orginalData.toString() == findThumbData.toString()) {
                                            const response = {
                                                _id: getOriginalData._id,
                                                email: getOriginalData.email,
                                                firstName: getOriginalData.firstName,
                                                status: 3,
                                                thumbUp: findThumb.thumbUp
                                            }

                                            responseData.push(response);
                                        }
                                    }

                                }

                                res.status(status.OK).json(
                                    new APIResponse("show all No Basket Record", true, 201, 1, responseData)
                                )

                            } else {

                                const emailGet = [];
                                const finalData = [];
                                for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                                    emailGet.push(getEmail.requestedEmail)
                                }


                                var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);



                                const UniqueEmail = [];


                                for (const uniqueEmail of difference) {
                                    const userDetail = await userModel.findOne({ email: uniqueEmail });
                                    finalData.push(userDetail)
                                }

                                const findThumbUp = await userModel.findOne({
                                    _id: req.params.request_user_id,
                                    polyDating: 0
                                })

                                for (const getOriginalData of finalData) {

                                    for (const findThumb of findThumbUp.basket) {
                                        const findThumbData = findThumb.userId
                                        const orginalData = getOriginalData._id

                                        if (orginalData.toString() == findThumbData.toString()) {
                                            const response = {
                                                _id: getOriginalData._id,
                                                email: getOriginalData.email,
                                                firstName: getOriginalData.firstName,
                                                status: 3,
                                                thumbUp: findThumb.thumbUp
                                            }

                                            UniqueEmail.push(response);
                                        }
                                    }

                                }

                                const statusByEmail = [];
                                const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
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

                                            userId: mongoose.Types.ObjectId(req.params.user_id),
                                            email: "$email"
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: [
                                                                    "$userId", "$$userId"
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



                                for (const emailData of finalExistUser[0].result) {

                                    for (const requestEmail of emailData) {

                                        for (const meageAllTableEmail of finalExistUser) {

                                            if (requestEmail.requestedEmail == meageAllTableEmail.email) {
                                                const findThumbUp = await userModel.findOne({
                                                    _id: req.params.request_user_id,
                                                    polyDating: 0
                                                })

                                                for (const findThumb of findThumbUp.basket) {
                                                    const findThumbData = findThumb.userId
                                                    const originalData = requestEmail.userId

                                                    if (originalData.toString() == findThumbData.toString()) {
                                                        if (requestEmail.accepted == 1) {
                                                            var status1 = {
                                                                status: 1,
                                                                email: requestEmail.requestedEmail,
                                                                thumbUp: findThumb.thumbUp
                                                            }
                                                            statusByEmail.push(status1)
                                                        } else {
                                                            var status2 = {
                                                                status: 2,
                                                                email: requestEmail.requestedEmail,
                                                                thumbUp: findThumb.thumbUp
                                                            }
                                                            statusByEmail.push(status2)
                                                        }
                                                    }
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
                                            const response = {
                                                status: final1Data.status,
                                                thumbUp: final1Data.thumbUp
                                            }
                                            finalStatus.push(response)
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
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    final_data.push(response);
                                }



                                const final_response = [...final_data, ...UniqueEmail]

                                // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];

                                res.status(status.OK).json(
                                    new APIResponse("show all No Basket Record", true, 201, 1, final_response)
                                )
                            }
                        }

                    }
                } else {
                    res.status(status.NOT_ACCEPTABLE).json(
                        new APIResponse("Not have Any Access, All Access Lock By User", "false", 406, "0")
                    );
                }

            }

        }



    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}




// exports.add = async (req, res, next) => {
//     try {


//         await userModel.updateMany({
//             relationshipSatus: "swinger",
//         }, {
//             relationshipSatus: 2
//         })

//     } catch (error) {

//     }
// }