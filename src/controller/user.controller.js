const userModel = require("../model/user.model");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const cloudinary = require("../utils/cloudinary.utils");
const requestsModel = require("../model/requests.model");
const { default: mongoose, get } = require("mongoose");
const commentModel = require("../model/comment.model");
const basketModel = require("../model/setting.model");
const relationShipHistoryModel = require("../model/polyamorous/relationShipHistory.model");
const chatRoomModel = require("../webSocket/models/chatRoom.model");
const notificationModel = require("../model/polyamorous/notification.model");
const likeModel = require("../model/like.model");
const thumbUpModel = require("../model/thumbUp.model");
const thumbDownModel = require("../model/thumDown.model");
var nodemailer = require('nodemailer');
const querystring = require("querystring");
const { updateOne } = require("../model/user.model");
const blockuserModel = require("../model/blockuser.model");
const { url } = require("../utils/cloudinary.utils");
const { log } = require("console");

exports.userRegister = async (req, res, next) => {
    try {
        const cloudinaryImageUploadMethod = async file => {
            return new Promise(resolve => {
                cloudinary.uploader.upload(file, (err, res) => {
                    if (err) return res.send("upload image error")
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
            res.status(status.ALREADY_REPORTED).json(
                new APIResponse("Not Allowed, Email Already Exist", "false", 208, "0")
            )
        } else {
            const phoneNum = req.body.phone_num;

            const findNumber = await userModel.findOne({ phoneNumber: `${phoneNum}` });


            if (findNumber) {
                res.status(status.ALREADY_REPORTED).json(
                    new APIResponse("Number Already Exist, It must be Unique", "false", 208, "0")
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
                    phoneNumber: phoneNum,
                    countryCode: req.body.country_code,
                    password: req.body.password
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
                    phoneNumber: phoneNum,
                    countryCode: req.body.country_code,
                    password: req.body.password
                }
                if (findUser.polyDating == 1) {
                    const storeInHistory = relationShipHistoryModel({
                        userId: findUser._id,
                        relastionShipHistory: {
                            message: "You got registered in N2You"
                        }
                    })
                    await storeInHistory.save()
                }

                res.status(status.CREATED).json(
                    new APIResponse("User Register", true, 201, 1, data)
                )

                next()


                const find_User = await userModel.findOne({
                    email: req.body.email
                })

                const findUsers = await userModel.findOne({
                    _id: find_User._id,
                    polyDating: 0
                })

                if (findUsers == null) {

                } else {

                    const findUsers = await userModel.findOne({
                        email: req.body.email
                    })
                    var matchUser = await userModel.find({
                        _id: {
                            $ne: findUsers._id
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


                        if (matchProfile >= 50 && matchProfile <= 100) {
                            const addInUser = await userModel.updateOne({
                                _id: findUsers._id
                            }, {
                                $push: {
                                    yesBasket: {
                                        match: profileMatch,
                                        userId: chechUser._id
                                    }
                                }
                            })


                            const updateINExistUser = await userModel.updateOne({
                                _id: chechUser._id
                            }, {
                                $push: {
                                    yesBasket: {
                                        match: profileMatch,
                                        userId: findUsers._id
                                    }
                                }
                            })
                        } else {
                            const addInUser = await userModel.updateOne({
                                _id: findUsers._id
                            }, {
                                $push: {
                                    noBasket: {
                                        match: profileMatch,
                                        userId: chechUser._id
                                    }
                                }
                            })


                            const updateINExistUser = await userModel.updateOne({
                                _id: chechUser._id
                            }, {
                                $push: {
                                    noBasket: {
                                        match: profileMatch,
                                        userId: findUsers._id
                                    }
                                }
                            })
                        }

                    }
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

exports.userLogin = async (req, res, next) => {
    try {


        const data = await userModel.updateOne({
            email: req.body.email
        }, {
            $set: {
                fcm_token: req.body.fcm_token
            }
        })

        const findUser = await userModel.findOne({
            email: req.body.email
        })

        if (findUser) {

            if (req.body.password == findUser.password) {


                const data = {
                    _id: findUser._id,
                    polyDating: findUser.polyDating,
                    HowDoYouPoly: findUser.HowDoYouPoly,
                    loveToGive: findUser.loveToGive,
                    polyRelationship: findUser.polyRelationship,
                    email: findUser.email,
                    firstName: findUser.firstName,
                    birthDate: findUser.birthDate,
                    identity: findUser.identity,
                    relationshipSatus: findUser.relationshipSatus,
                    IntrestedIn: findUser.IntrestedIn,
                    Bio: findUser.Bio,
                    photo: findUser.photo,
                    longitude: findUser.location.coordinates[0],
                    latitude: findUser.location.coordinates[1],
                    fcm_token: findUser.fcm_token,
                    hopingToFind: findUser.hopingToFind,
                    jobTitle: findUser.jobTitle,
                    wantChildren: findUser.wantChildren,
                    bodyType: findUser.extraAtrribute.bodyType,
                    height: findUser.extraAtrribute.height,
                    smoking: findUser.extraAtrribute.smoking,
                    drinking: findUser.extraAtrribute.drinking,
                    hobbies: findUser.extraAtrribute.hobbies,
                    phoneNumber: findUser.phoneNumber,
                    countryCode: findUser.countryCode,
                    password: findUser.password
                }
                res.status(status.OK).json(

                    new APIResponse("login success", "true", 200, "1", data)
                )

            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("not match credential", "false", 404, "0")
                )
            }

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not Found", "false", 404, "0")
            )
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

        if (files[0] == undefined) {
            const findUser = await userModel.findOne({
                _id: req.params.user_id
            })

            urls.push(...findUser.photo)

        } else {

            const findUser = await userModel.findOne({
                _id: req.params.user_id
            })

            urls.push(...findUser.photo)

            for (const file of files) {

                const url = req.body.images
                console.log("req.body.images", req.body.images[0]);
                JSON.parse(url)

                // if (url) {

                //     const { path } = file;
                //     const newPath = await cloudinaryImageUploadMethod(path)
                //     urls.push(newPath)

                // } else {

                //     console.log("aleardy add", urls);
                //     console.log("remove url", url);

                //     for (const data of url) {

                //         console.log("data is", data);
                //         const indexOfObject = urls.findIndex(object => {
                //             return object.res == data;
                //         });

                //         console.log(indexOfObject);
                //         urls.splice(indexOfObject, 1);
                //     }

                //     console.log("after remove", urls);
                //     const { path } = file;
                //     const newPath = await cloudinaryImageUploadMethod(path)
                //     urls.push(newPath)

                //     console.log("final url is", urls);


                // }

            }
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

                if (findvalidNumber.phoneNumber == phoneNum) {
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
                res.status(status.ALREADY_REPORTED).json(
                    new APIResponse("Number Already Exist, It must be Unique", "false", 208, "0")
                )
            } else if (resultForEmail) {
                res.status(status.ALREADY_REPORTED).json(
                    new APIResponse("Not Allowed, Email Already Exist", "false", 208, "0")
                )
            } else {

                console.log("urls", urls);

                if (files[0] == undefined) {

                    const findUser = await userModel.findOne({
                        email: req.body.email
                    })

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
                            photo: findUser.photo,
                            Bio: req.body.bio,
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
                            phoneNumber: phoneNum,
                            countryCode: req.body.country_code
                        }
                    })
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
                            location: {
                                type: "Point",
                                coordinates: [
                                    parseFloat(req.body.longitude),
                                    parseFloat(req.body.latitude),
                                ],
                            },
                            photo: urls,
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
                            phoneNumber: phoneNum,
                            countryCode: req.body.country_code
                        }
                    })
                }
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
                    phoneNumber: phoneNum,
                    countryCode: req.body.country_code
                }


                res.status(status.OK).json(
                    new APIResponse("User Successfully updated!", "true", 200, "1", data)
                )


                // next();

                // const find_User = await userModel.findOne({
                //     email: req.body.email
                // })


                // const findUsers = await userModel.findOne({
                //     _id: find_User._id,
                //     polyDating: 0
                // })


                // if (findUsers == null) {

                // } else {


                //     const findUsers = await userModel.findOne({
                //         email: req.body.email
                //     })

                //     var matchUser = await userModel.find({
                //         _id: {
                //             $ne: findUsers._id
                //         },
                //         polyDating: 0
                //     })


                //     const identity = findUsers.identity
                //     const relationshipSatus = findUsers.relationshipSatus
                //     const IntrestedIn = findUsers.IntrestedIn
                //     const hopingToFind = findUsers.hopingToFind
                //     const wantChildren = findUsers.wantChildren


                //     for (const chechUser of matchUser) {

                //         console.log("chechUser", chechUser._id);
                //         var local = 0;
                //         if (chechUser.identity == identity) {
                //             var local = local + 1
                //         } else {
                //             var local = local + 0
                //         }

                //         if (chechUser.relationshipSatus == relationshipSatus) {
                //             var local = local + 1
                //         } else {
                //             var local = local + 0
                //         }


                //         if (chechUser.IntrestedIn == IntrestedIn) {
                //             var local = local + 1
                //         } else {
                //             var local = local + 0
                //         }

                //         if (chechUser.hopingToFind == hopingToFind) {
                //             var local = local + 1
                //         } else {
                //             var local = local + 0
                //         }

                //         if (chechUser.wantChildren == wantChildren) {
                //             var local = local + 1
                //         } else {
                //             var local = local + 0
                //         }


                //         const matchProfile = local / 5 * 100;

                //         const profileMatch = `${parseInt(matchProfile)}`



                //         if (matchProfile >= 50 && matchProfile <= 100) {

                //             const findInNoBasket1 = await userModel.findOne({
                //                 _id: findUsers._id,
                //                 "noBasket.userId": chechUser._id
                //             })

                //             const findInNoBasket2 = await userModel.findOne({
                //                 _id: chechUser._id,
                //                 "noBasket.userId": findUsers._id
                //             })

                //             if (findInNoBasket1) {
                //                 await userModel.updateOne({
                //                     _id: findUsers._id,
                //                 }, {
                //                     $pull: {
                //                         noBasket: {
                //                             userId: chechUser._id
                //                         }
                //                     }
                //                 })

                //                 await userModel.updateOne({
                //                     _id: findUsers._id,
                //                     "yesBasket.userId": chechUser._id
                //                 },
                //                     {
                //                         $set: {
                //                             "yesBasket.$.match": profileMatch
                //                         }
                //                     })

                //             } else {

                //                 const findInYesBasket1 = await userModel.findOne({
                //                     _id: findUsers._id,
                //                     "yesBasket.userId": chechUser._id
                //                 })


                //                 if (findInYesBasket1) {

                //                     const addInUser = await userModel.updateOne({
                //                         _id: findUsers._id,
                //                         "yesBasket.userId": req.body.id
                //                     }, {
                //                         $set: {
                //                             "yesBasket.$.match": profileMatch
                //                         }
                //                     })

                //                 } else {
                //                     const addInUser = await userModel.updateOne({
                //                         _id: findUsers._id
                //                     }, {
                //                         $push: {
                //                             yesBasket: {
                //                                 match: profileMatch,
                //                                 userId: chechUser._id
                //                             }
                //                         }
                //                     })
                //                 }
                //             }

                //             if (findInNoBasket2) {

                //                 await userModel.updateOne({
                //                     _id: chechUser._id,
                //                 }, {
                //                     $pull: {
                //                         noBasket: {
                //                             userId: findUsers._id
                //                         }
                //                     }
                //                 })
                //             } else {

                //                 const findInYesBasket1 = await userModel.findOne({
                //                     _id: chechUser._id,
                //                     "yesBasket.userId": findUsers._id
                //                 })

                //                 if (findInYesBasket1) {
                //                     const addInUser = await userModel.updateOne({
                //                         _id: chechUser._id,
                //                         "yesBasket.userId": findUsers._id
                //                     }, {
                //                         $set: {
                //                             "yesBasket.$.match": profileMatch
                //                         }
                //                     })

                //                 } else {

                //                     const addInUser = await userModel.updateOne({
                //                         _id: chechUser._id
                //                     }, {
                //                         $push: {
                //                             yesBasket: {
                //                                 match: profileMatch,
                //                                 userId: findUsers._id
                //                             }
                //                         }
                //                     })
                //                 }
                //             }

                //         } else {

                //             const findInYesBasket1 = await userModel.findOne({
                //                 _id: findUsers._id,
                //                 "yesBasket.userId": chechUser._id
                //             })


                //             const findInYesBasket2 = await userModel.findOne({
                //                 _id: chechUser._id,
                //                 "yesBasket.userId": findUsers._id
                //             })


                //             if (findInYesBasket1) {

                //                 await userModel.updateOne({
                //                     _id: findUsers._id,
                //                 }, {
                //                     $pull: {
                //                         yesBasket: {
                //                             userId: chechUser._id
                //                         }
                //                     }
                //                 })


                //                 await userModel.updateOne({
                //                     _id: findUsers._id,
                //                     "noBasket.userId": chechUser._id
                //                 },
                //                     {
                //                         $set: {
                //                             "noBasket.$.match": profileMatch
                //                         }
                //                     })

                //             } else {
                //                 const findInNoBasket1 = await userModel.findOne({
                //                     _id: findUsers._id,
                //                     "noBasket.userId": chechUser._id
                //                 })


                //                 if (findInNoBasket1) {
                //                     const addInUser = await userModel.updateOne({
                //                         _id: findUsers._id,
                //                         "noBasket.userId": chechUser._id
                //                     }, {
                //                         $set: {
                //                             "noBasket.$.match": profileMatch
                //                         }
                //                     })

                //                 } else {

                //                     const addInUser = await userModel.updateOne({
                //                         _id: findUsers._id
                //                     }, {
                //                         $push: {
                //                             noBasket: {
                //                                 match: profileMatch,
                //                                 userId: chechUser._id
                //                             }
                //                         }
                //                     })
                //                 }
                //             }


                //             if (findInYesBasket2) {

                //                 await userModel.updateOne({
                //                     _id: chechUser._id,
                //                 }, {
                //                     $pull: {
                //                         yesBasket: {
                //                             userId: findUsers._id
                //                         }
                //                     }
                //                 })
                //             } else {
                //                 const findInNoBasket1 = await userModel.findOne({
                //                     _id: chechUser._id,
                //                     "noBasket.userId": findUsers._id
                //                 })

                //                 if (findInNoBasket1) {
                //                     const addInUser = await userModel.updateOne({
                //                         _id: chechUser._id,
                //                         "noBasket.userId": findUsers._id
                //                     }, {
                //                         $set: {
                //                             "noBasket.$.match": profileMatch
                //                         }
                //                     })
                //                 } else {
                //                     const addInUser = await userModel.updateOne({
                //                         _id: chechUser._id
                //                     }, {
                //                         $push: {
                //                             noBasket: {
                //                                 match: profileMatch,
                //                                 userId: findUsers._id
                //                             }
                //                         }
                //                     })

                //                 }
                //             }


                //         }

                //     }
                // }
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

        const id = await userModel.findOne({
            _id: req.params.user_id
        }).select('_id')


        if (id == null) {
            res.status(status.OK).json(
                new APIResponse("all friend!", "true", 201, "1", [])
            )
        } else {

            const Regexname = new RegExp(req.body.search_key, 'i');
            const searchName = await userModel.find({ firstName: Regexname, polyDating: 0 }).maxTimeMS(10);
            // console.log("searchName", searchName);
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
                        userId: req.params.user_id,
                        RequestedEmails: {
                            $elemMatch: {
                                requestedEmail: {
                                    $in: reaquestedAllEmail
                                }
                            }
                        }
                    }
                ).maxTimeMS(10)

                console.log("RequestedEmailExiestInUser", RequestedEmailExiestInUser);
                if (reaquestedAllEmail && RequestedEmailExiestInUser == null) {
                    const finalData = [];
                    const responseData = [];
                    // console.log("reaquestedAllEmail", reaquestedAllEmail);
                    // console.log("RequestedEmailExiestInUser", RequestedEmailExiestInUser);
                    for (const allrequestedDataNotAcceptedRequestAndNotFriend of reaquestedAllEmail) {

                        const FindLocation = await userModel.find()
                            // .aggregate([
                            //     {
                            //         $geoNear: {
                            //             near: {
                            //                 type: "Point",
                            //                 coordinates: [
                            //                     parseFloat(req.query.lat),
                            //                     parseFloat(req.query.long) ||  parseFloat(req.query.long) == 0
                            || parseFloat(req.query.long) == 0
                        //                 ],
                        //             },
                        //             distanceField: "distanceFrom",
                        //             maxDistance: 10000,
                        //             minDistance: 0,
                        //             uniqueDoc: true,
                        //             spherical: true
                        //         },
                        //     }]);


                        for (const uniqueDistance of FindLocation) {

                            if (uniqueDistance.email == allrequestedDataNotAcceptedRequestAndNotFriend) {
                                finalData.push(uniqueDistance)
                            }
                        }
                    }
                    const UniqueEmail = [];
                    const chatRoomId = [];
                    for (const getOriginalData of finalData) {

                        const findAllUserWithIchat1 = await chatRoomModel.findOne({
                            $and: [{
                                user1: getOriginalData._id
                            }, {
                                user2: id._id
                            }]
                        }).select("_id")


                        const findAllUserWithIchat2 = await chatRoomModel.findOne({
                            $and: [{
                                user1: id._id
                            }, {
                                user2: getOriginalData._id
                            }]
                        }).select("_id")


                        if (findAllUserWithIchat1) {
                            chatRoomId.push(findAllUserWithIchat1._id)
                            const response = {
                                chatRoomId: chatRoomId[0],
                                _id: getOriginalData._id,
                                email: getOriginalData.email,
                                firstName: getOriginalData.firstName,
                                profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                status: 3
                            }

                            UniqueEmail.push(response);

                        } else if (findAllUserWithIchat2) {
                            chatRoomId.push(findAllUserWithIchat2._id)
                            const response = {
                                chatRoomId: chatRoomId[0],
                                _id: getOriginalData._id,
                                email: getOriginalData.email,
                                firstName: getOriginalData.firstName,
                                profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                status: 3
                            }

                            UniqueEmail.push(response);
                        } else {

                            const response = {
                                _id: getOriginalData._id,
                                email: getOriginalData.email,
                                firstName: getOriginalData.firstName,
                                profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                status: 3
                            }

                            UniqueEmail.push(response);
                        }

                    }

                    res.status(status.OK).json(
                        new APIResponse("show all record searchwise", true, 201, 1, UniqueEmail)
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
                        const FindLocation = await userModel.find()



                        for (const uniqueDistance of FindLocation) {

                            if (uniqueDistance.email == uniqueEmail) {
                                finalData.push(uniqueDistance)
                            }
                        }

                    }
                    const chatRoomId = [];
                    for (const getOriginalData of finalData) {
                        const findAllUserWithIchat1 = await chatRoomModel.findOne({
                            $and: [{
                                user1: getOriginalData._id
                            }, {
                                user2: id._id
                            }]
                        }).select("_id")


                        const findAllUserWithIchat2 = await chatRoomModel.findOne({
                            $and: [{
                                user1: id._id
                            }, {
                                user2: getOriginalData._id
                            }]
                        }).select("_id")




                        if (findAllUserWithIchat1) {
                            chatRoomId.push(findAllUserWithIchat1._id)
                            const response = {
                                chatRoomId: chatRoomId[0],
                                _id: getOriginalData._id,
                                email: getOriginalData.email,
                                firstName: getOriginalData.firstName,
                                profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                status: 3
                            }

                            UniqueEmail.push(response);

                            // console.log(chatRoomId[0]);
                        } else if (findAllUserWithIchat2) {
                            chatRoomId.push(findAllUserWithIchat2._id)
                            const response = {
                                chatRoomId: chatRoomId[0],
                                _id: getOriginalData._id,
                                email: getOriginalData.email,
                                firstName: getOriginalData.firstName,
                                profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                status: 3
                            }

                            UniqueEmail.push(response);
                        } else {

                            const response = {
                                _id: getOriginalData._id,
                                email: getOriginalData.email,
                                firstName: getOriginalData.firstName,
                                profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                status: 3
                            }

                            UniqueEmail.push(response);
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
                            photo: "$photo",
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

                        // console.log("finalData", finalData);

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
                            profile: finalData.photo[0] ? finalData.photo[0].res : "",
                            hopingToFind: finalData.hopingToFind,
                            jobTitle: finalData.jobTitle,
                            wantChildren: finalData.wantChildren,
                            posts: finalData.posts,
                            status: finalStatus[key]
                        }


                        const chatRoomId = [];
                        const findAllUserWithIchat1 = await chatRoomModel.findOne({
                            $and: [{
                                user1: finalData._id
                            }, {
                                user2: id._id
                            }]
                        }).select("_id")

                        const findAllUserWithIchat2 = await chatRoomModel.findOne({
                            $and: [{
                                user1: id._id
                            }, {
                                user2: finalData._id
                            }]
                        }).select("_id")


                        if (findAllUserWithIchat1) {
                            chatRoomId.push(findAllUserWithIchat1._id)

                            const getDetail = {
                                _id: finalData._id,
                                firstName: finalData.firstName,
                                email: finalData.email,
                                profile: finalData.photo[0] ? finalData.photo[0] : "",
                                status: finalStatus[key]
                            }

                            final_data.push(getDetail);
                        } else if (findAllUserWithIchat2) {
                            chatRoomId.push(findAllUserWithIchat2._id)
                            const getDetail = {
                                chatRoomId: chatRoomId[0],
                                _id: finalData._id,
                                firstName: finalData.firstName,
                                email: finalData.email,
                                profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                status: finalStatus[key]
                            }

                            final_data.push(getDetail);
                        } else {

                            const getDetail = {
                                chatRoomId: chatRoomId[0],
                                _id: finalData._id,
                                firstName: finalData.firstName,
                                email: finalData.email,
                                profile: finalData.photo[0] ? finalData.photo[0].res : "",
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

        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.getAllUser = async (req, res, next) => {
    try {

        const id = await userModel.findOne({
            _id: req.params.user_id
        }).select('_id')


        const searchName = await userModel.find({ polyDating: 0, _id: { $ne: req.params.user_id } }).maxTimeMS(10);

        const reaquestedAllEmail = [];
        searchName.map((result, index) => {
            console.log(result.email);
            reaquestedAllEmail.push(result.email)
        })


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
            ).maxTimeMS(10)


            if (reaquestedAllEmail && RequestedEmailExiestInUser == null) {
                const finalData = [];
                const responseData = [];
                const UniqueEmail = [];
                for (const allrequestedDataNotAcceptedRequestAndNotFriend of reaquestedAllEmail) {

                    const FindUser = await userModel
                        .aggregate([
                            {
                                $geoNear: {
                                    near: {
                                        type: "Point",
                                        coordinates: [
                                            parseFloat(req.query.long) || 0,
                                            parseFloat(req.query.lat) || 0
                                        ]
                                    },
                                    distanceField: "distance",
                                    spherical: true
                                }
                            }
                        ]);


                    for (const uniqueUser of FindUser) {

                        if (uniqueUser.email == allrequestedDataNotAcceptedRequestAndNotFriend) {
                            finalData.push(uniqueUser)
                        }
                    }
                }
                const chatRoomId = [];
                for (const getOriginalData of finalData) {

                    const findAllUserWithIchat1 = await chatRoomModel.findOne({
                        $and: [{
                            user1: getOriginalData._id
                        }, {
                            user2: id._id ? id._id : null
                        }]
                    })
                    const findAllUserWithIchat2 = await chatRoomModel.findOne({
                        $and: [{
                            user1: id._id
                        }, {
                            user2: getOriginalData._id
                        }]
                    })

                    if (findAllUserWithIchat1) {
                        chatRoomId.push(findAllUserWithIchat1._id)
                        const km = getOriginalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const response = {
                            chatRoomId: chatRoomId[0],
                            _id: getOriginalData._id,
                            email: getOriginalData.email,
                            firstName: getOriginalData.firstName,
                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: 3
                        }

                        UniqueEmail.push(response);

                    } else if (findAllUserWithIchat2) {
                        chatRoomId.push(findAllUserWithIchat2._id)
                        const km = getOriginalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const response = {
                            chatRoomId: chatRoomId[0],
                            _id: getOriginalData._id,
                            email: getOriginalData.email,
                            firstName: getOriginalData.firstName,
                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: 3
                        }
                        UniqueEmail.push(response);
                    } else {
                        const km = getOriginalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const response = {
                            _id: getOriginalData._id,
                            email: getOriginalData.email,
                            firstName: getOriginalData.firstName,
                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: 3
                        }
                        UniqueEmail.push(response);
                    }
                }

                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const data = UniqueEmail.length;
                const pageCount = Math.ceil(data / limit);

                res.status(status.OK).json({
                    "message": "show all User",
                    "status": true,
                    "code": 200,
                    "statusCode": 1,
                    "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                    "data": (startIndex).toString() == (NaN) ? UniqueEmail : UniqueEmail.slice(startIndex, endIndex)

                })
            } else {

                const emailGet = [];
                const finalData = [];
                for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                    emailGet.push(getEmail.requestedEmail)
                }

                var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);


                const UniqueEmail = [];
                for (const uniqueEmail of difference) {
                    const FindUser = await userModel
                        .aggregate([
                            {
                                $geoNear: {
                                    near: {
                                        type: "Point",
                                        coordinates: [
                                            parseFloat(req.query.long) || 0,
                                            parseFloat(req.query.lat) || 0
                                        ]
                                    },
                                    distanceField: "distance",
                                    spherical: true
                                }
                            }
                        ]);


                    for (const uniqueUser of FindUser) {

                        if (uniqueUser.email == uniqueEmail) {
                            finalData.push(uniqueUser)
                        }
                    }

                }
                const chatRoomId = [];
                for (const getOriginalData of finalData) {
                    const findAllUserWithIchat1 = await chatRoomModel.findOne({
                        $and: [{
                            user1: getOriginalData._id
                        }, {
                            user2: id._id
                        }]
                    }).select("_id")


                    const findAllUserWithIchat2 = await chatRoomModel.findOne({
                        $and: [{
                            user1: id._id
                        }, {
                            user2: getOriginalData._id
                        }]
                    }).select("_id")




                    if (findAllUserWithIchat1) {
                        chatRoomId.push(findAllUserWithIchat1._id)
                        const km = getOriginalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const response = {
                            chatRoomId: chatRoomId[0],
                            _id: getOriginalData._id,
                            email: getOriginalData.email,
                            firstName: getOriginalData.firstName,
                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: 3
                        }

                        UniqueEmail.push(response);

                    } else if (findAllUserWithIchat2) {
                        chatRoomId.push(findAllUserWithIchat2._id)
                        const km = getOriginalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const response = {
                            chatRoomId: chatRoomId[0],
                            _id: getOriginalData._id,
                            email: getOriginalData.email,
                            firstName: getOriginalData.firstName,
                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: 3
                        }

                        UniqueEmail.push(response);
                    } else {
                        const km = getOriginalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const response = {
                            _id: getOriginalData._id,
                            email: getOriginalData.email,
                            firstName: getOriginalData.firstName,
                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: 3
                        }

                        UniqueEmail.push(response);
                    }


                }
                const statusByEmail = [];
                const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
                const requestedEmailWitchIsInuserRequeted = [];
                allRequestedEmail.map((result, next) => {
                    const resultEmail = result.requestedEmail
                    requestedEmailWitchIsInuserRequeted.push(resultEmail);
                })

                const meageAllTable = await userModel.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: [
                                    parseFloat(req.query.long) || 0,
                                    parseFloat(req.query.lat) || 0
                                ]
                            },
                            distanceField: "distance",
                            spherical: true
                        }
                    },
                    {
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
                            photo: "$photo",
                            hopingToFind: "$hopingToFind",
                            jobTitle: "$jobTitle",
                            wantChildren: "$wantChildren",
                            distance: "$distance",
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
                                        status: requestEmail.accepted,
                                        email: requestEmail.requestedEmail
                                    }
                                    statusByEmail.push(status1)
                                }
                                if (requestEmail.accepted == 4) {
                                    var status2 = {
                                        status: requestEmail.accepted,
                                        email: requestEmail.requestedEmail,
                                    }
                                    statusByEmail.push(status2)
                                } else {

                                    var status3 = {
                                        status: requestEmail.accepted,
                                        email: requestEmail.requestedEmail
                                    }
                                    statusByEmail.push(status3)
                                }
                            }
                        }
                    }
                }

                const final_data = [];

                const finalStatus = []

                const uniqueObjArray = [...new Map(statusByEmail.map((item) => [item["email"], item])).values()];
                for (const [key, finalData] of meageAllTable.entries()) {
                    for (const [key, final1Data] of uniqueObjArray.entries()) {
                        if (finalData.email === final1Data.email) {
                            console.log(finalData.email, final1Data.email);
                            finalStatus.push({ status: final1Data.status })
                        }
                    }
                }


                for (const [key, finalData] of finalExistUser.entries()) {

                    const km = finalData.distance / 1000;
                    const distance = km.toFixed(2) + " km";
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
                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                        hopingToFind: finalData.hopingToFind,
                        jobTitle: finalData.jobTitle,
                        wantChildren: finalData.wantChildren,
                        posts: finalData.posts,
                        distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                        status: finalStatus[key].status
                    }



                    const chatRoomId = [];
                    const findAllUserWithIchat1 = await chatRoomModel.findOne({
                        $and: [{
                            user1: finalData._id
                        }, {
                            user2: id._id
                        }]
                    }).select("_id")

                    const findAllUserWithIchat2 = await chatRoomModel.findOne({
                        $and: [{
                            user1: id._id
                        }, {
                            user2: finalData._id
                        }]
                    }).select("_id")
                    if (findAllUserWithIchat1) {
                        chatRoomId.push(findAllUserWithIchat1._id)
                        const km = finalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const getDetail = {
                            chatRoomId: chatRoomId[0],
                            _id: finalData._id,
                            firstName: finalData.firstName,
                            email: finalData.email,
                            profile: finalData.photo[0] ? finalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: finalStatus[key].status
                        }

                        final_data.push(getDetail);
                    } else if (findAllUserWithIchat2) {

                        console.log("charoom 2");
                        chatRoomId.push(findAllUserWithIchat2._id)
                        const km = finalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const getDetail = {
                            chatRoomId: chatRoomId[0],
                            _id: finalData._id,
                            firstName: finalData.firstName,
                            email: finalData.email,
                            profile: finalData.photo[0] ? finalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: finalStatus[key].status
                        }

                        console.log("getDetail", getDetail);
                        final_data.push(getDetail);
                    } else {
                        const km = finalData.distance / 1000;
                        const distance = km.toFixed(2) + " km";
                        const getDetail = {
                            chatRoomId: chatRoomId[0],
                            _id: finalData._id,
                            firstName: finalData.firstName,
                            email: finalData.email,
                            profile: finalData.photo[0] ? finalData.photo[0].res : "",
                            distance: (req.query.long && req.query.lat) == undefined ? "no distance found" : distance,
                            status: finalStatus[key].status
                        }

                        final_data.push(getDetail);
                    }
                }

                console.log("final_data", final_data);
                const final_response = [...final_data, ...UniqueEmail]

                // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];

                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const data = final_response.length;
                const pageCount = Math.ceil(data / limit);
                res.status(status.OK).json({
                    "message": "show all record searchwise",
                    "status": true,
                    "code": 201,
                    "statusCode": 1,
                    "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                    "data": (startIndex).toString() == (NaN) ? final_response : final_response.slice(startIndex, endIndex)
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
                        jobTitle: '$jobTitle',
                        location: '$location',
                        wantChildren: '$wantChildren',
                        phoneNumber: '$phoneNumber',
                        countryCode: '$countryCode',
                        extraAtrribute: '$extraAtrribute',
                        posts: '$datas',
                        fcm_token: '$fcm_token'
                    }
                }])

            const getAllPosts = [];
            for (const userAllData of data) {

                for (const userPost of userAllData.posts) {

                    for (const getPost of userPost.posts) {


                        const userPostDate = getPost.createdAt;
                        const userId = req.params.user_id;
                        const postId = getPost._id;

                        const findUserInLike = await likeModel.findOne({
                            postId: postId,
                            userId: userId
                        })
                        const postShowStatus = []

                        if (findUserInLike) {
                            postShowStatus.push(1)
                        } else {
                            postShowStatus.push(0)
                        }
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
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModel.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModel.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date

                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }
                        if (days > 0 && days < 30) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            finalPostedTime.push(`${days} days`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModel.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModel.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date

                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (hours > 0 && days == 0) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            finalPostedTime.push(`${hours} hours`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModel.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModel.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date

                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (minutes > 0 && hours == 0) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            finalPostedTime.push(`${minutes} minute`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModel.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModel.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date

                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                            const getComment = await commentModel.findOne({ postId: getPost._id });
                            finalPostedTime.push(`${seconds} second`);

                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModel.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModel.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date

                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }

                        const response = {
                            getPost,
                            finalPostedTime,
                            commentData: commentData[0] == null ? [] : commentData,
                            postShowStatus: postShowStatus[0]
                        }
                        getAllPosts.push(response);
                    }
                }
            }



            const findUser = await requestsModel.findOne({
                userId: req.params.req_user_id
            })

            const statusCode = [];

            if ((req.params.req_user_id).toString() == (req.params.user_id).toString()) {

                statusCode.push({ status: 10 })

            } else {

                if (findUser) {

                    if (findUser.RequestedEmails[0] == undefined) {
                        statusCode.push({ status: 3 })
                    } else {

                        for (const findStatus of findUser.RequestedEmails) {
                            if (findStatus.userId == req.params.req_user_id) {
                                statusCode.push({ status: 10 })
                            } else {
                                if ((findStatus.userId).toString() == (req.params.user_id).toString()) {
                                    console.log("true");
                                    if (findStatus.accepted == 4) {

                                        console.log("indStatus.accepted", findStatus.accepted);
                                        statusCode.push({ status: findStatus.accepted })
                                    } else {
                                        console.log("indStatus.accepted", findStatus.accepted);
                                        statusCode.push({ status: findStatus.accepted })
                                    }

                                } else {

                                }

                            }
                        }
                    }

                } else {
                    // statusCode.push({ status: 3 })
                }



            }

            console.log("statusCode", statusCode);
            let birthDate = new Date(data[0].birthDate);
            birthDate = birthDate.getFullYear();
            let currentDate = new Date(Date.now());
            currentDate = currentDate.getFullYear();

            const age = currentDate - birthDate;

            const chatRoomId = [];
            const findChatRoomId1 = await chatRoomModel.findOne({
                user1: req.params.user_id,
                user2: req.params.req_user_id
            }).select("_id")

            const findChatRoomId2 = await chatRoomModel.findOne({
                user1: req.params.req_user_id,
                user2: req.params.user_id
            }).select("_id")

            if (findChatRoomId1) {

                chatRoomId.push(findChatRoomId1._id)
            } else if (findChatRoomId2) {

                chatRoomId.push(findChatRoomId2._id)
            } else {

                chatRoomId.push()
            }

            const basketSetting = await basketModel.findOne({
                userId: req.params.user_id
            })
            const response = {
                userId: data[0]._id,
                polyDating: data[0].polyDating,
                email: data[0].email,
                loveToGive: data[0].loveToGive,
                polyRelationship: data[0].polyRelationship,
                firstName: data[0].firstName,
                birthDate: data[0].birthDate,
                age: age,
                identity: data[0].identity,
                relationshipSatus: data[0].relationshipSatus,
                IntrestedIn: data[0].IntrestedIn,
                Bio: data[0].Bio,
                photo: data[0].photo,
                fcm_token: data[0].fcm_token,
                hopingToFind: data[0].hopingToFind,
                longitude: data[0].location.coordinates[0],
                latitude: data[0].location.coordinates[1],
                jobTitle: data[0].jobTitle,
                wantChildren: data[0].wantChildren,
                countryCode: data[0].countryCode,
                phoneNumber: data[0].phoneNumber,
                extraAtrribute: data[0].extraAtrribute,
                Posts: getAllPosts,
                friendStatus: statusCode[0] == undefined ? 3 : statusCode[0].status,
                chatRoomId: chatRoomId[0] == undefined ? "" : chatRoomId[0],
                fullAccess: basketSetting == null ? true : basketSetting.fullAccess,
                thumbUpDownAccess: basketSetting == null ? false : basketSetting.thumpsUpAndDown,
            }




            res.status(status.OK).json(
                new APIResponse("show UserWise get", "true", 201, "1", response)
            )
        }

    } catch (error) {
        console.log(error);
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

                const findUser = await userModel.findOne({
                    _id: req.params.user_id,
                    "yesBasket.userId": chechUser._id
                })

                // if (findUser == null) {

                if (profileMatch > 50 && profileMatch < 100) {
                    const addInUser = await userModel.updateOne({
                        _id: req.params.user_id
                    }, {
                        $push: {
                            yesBasket: {
                                match: profileMatch,
                                userId: chechUser._id
                            }
                        }
                    })
                } else {
                    const addInUser = await userModel.updateOne({
                        _id: req.params.user_id
                    }, {
                        $push: {
                            noBasket: {
                                match: profileMatch,
                                userId: chechUser._id
                            }
                        }
                    })
                }

                // } else {
                //     const updateUser = await userModel.updateOne({
                //         _id: req.params.user_id,
                //         "basket.userId": chechUser._id
                //     }, {
                //         basket: {
                //             match: profileMatch,
                //         }
                //     })
                // }

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
                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const data = findUser.yesBasket
                const final = data.slice(startIndex, endIndex)

                for (const allBakest of final) {
                    const findInBlockUserModel1 = await blockuserModel.findOne({
                        userId: req.params.request_user_id,
                        "blockUnblockUser.blockUserId": allBakest.userId
                    })

                    const findInBlockUserModel2 = await blockuserModel.findOne({
                        userId: allBakest.userId,
                        "blockUnblockUser.blockUserId": req.params.request_user_id
                    })

                    if (findInBlockUserModel1 || findInBlockUserModel2) {

                    } else {
                        YesBasketData.push((allBakest.userId).toString())
                    }

                }

                for (const allyesBasketData of YesBasketData) {

                    const meargeData = await userModel.findOne({
                        _id: allyesBasketData,
                    })
                    if (meargeData) {
                        reaquestedAllEmail.push((meargeData._id).toString())
                    } else {
                        reaquestedAllEmail.push()

                    }
                }

                if (reaquestedAllEmail[0] == undefined) {
                    res.status(status.OK).json({
                        "message": "show all post When accept by the user",
                        "status": true,
                        "code": 201,
                        "statusCode": 1,
                        "pageCount": "0",
                        "data": []
                    })

                } else {

                    console.log("hellooo");
                    const RequestedEmailExiestInUser = await requestsModel.findOne(
                        {
                            userId: req.params.user_id,
                            RequestedEmails: {
                                $elemMatch: {
                                    userId: {
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
                            const userDetail = await userModel.findOne({ _id: mongoose.Types.ObjectId(allrequestedDataNotAcceptedRequestAndNotFriend) });
                            finalData.push(userDetail)
                        }

                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })


                        for (const getOriginalData of finalData) {

                            const data = findThumbUp.yesBasket

                            for (const findThumb of data) {

                                const findInThumbUp = await thumbUpModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })


                                const findInThumbDown = await thumbDownModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })


                                if (findInThumbUp) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            firstName: getOriginalData.firstName,
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 1,
                                            thumbDownStatus: 0
                                        }


                                        responseData.push(response);
                                    }
                                } else if (findInThumbDown) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            firstName: getOriginalData.firstName,
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1
                                        }


                                        responseData.push(response);
                                    }
                                } else {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            firstName: getOriginalData.firstName,
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 0
                                        }


                                        responseData.push(response);
                                    }
                                }

                            }


                        }


                        let uniqueObjArray = [...new Map(responseData.map((item) => [item["_id"], item])).values()];
                        const pagecount = data.length;
                        const pageCount = Math.ceil(pagecount / limit);

                        res.status(status.OK).json({
                            "message": "show all yes basket record",
                            "status": true,
                            "code": 201,
                            "statusCode": 1,
                            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                            "data": uniqueObjArray
                        })


                    } else {
                        const emailGet = [];
                        const finalData = [];
                        for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                            emailGet.push((getEmail.userId).toString())
                        }

                        var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);

                        console.log("difference", difference);
                        const UniqueEmail = [];

                        for (const uniqueEmail of difference) {
                            const userDetail = await userModel.findOne({ _id: uniqueEmail });
                            finalData.push(userDetail)
                        }


                        console.log("finalData", finalData);

                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })

                        for (const getOriginalData of finalData) {

                            const data = findThumbUp.yesBasket
                            for (const findThumb of data) {


                                const findInThumbUp = await thumbUpModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })


                                const findInThumbDown = await thumbDownModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })


                                if (findInThumbUp) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 1,
                                            thumbDownStatus: 0
                                        }

                                        UniqueEmail.push(response);
                                    }
                                } else if (findInThumbDown) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1
                                        }

                                        UniqueEmail.push(response);
                                    }
                                } else {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 0
                                        }

                                        UniqueEmail.push(response);
                                    }
                                }

                            }
                        }
                        const statusByEmail = [];
                        const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
                        const requestedEmailWitchIsInuserRequeted = [];
                        allRequestedEmail.map((result, next) => {
                            const resultEmail = result.userId
                            requestedEmailWitchIsInuserRequeted.push(resultEmail);
                        })

                        const meageAllTable = await userModel.aggregate([{
                            $match: {
                                _id: {
                                    $in: requestedEmailWitchIsInuserRequeted
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'posts',
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'req_data'
                            }
                        },
                        {
                            $lookup: {
                                from: 'requests',
                                let: {

                                    userId: mongoose.Types.ObjectId(req.params.user_id),
                                    id: "$_id"
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
                                                                "$$id", "$RequestedEmails.userId"
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
                                photo: "$photo",
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
                                if ((DataDetail._id).toString(0) == (reqEmail).toString()) {
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

                                        const data = findThumbUp.yesBasket
                                        const final = data.slice(startIndex, endIndex)

                                        for (const findThumb of final) {


                                            const findInThumbUp = await thumbUpModel.findOne({
                                                adminUserId: req.params.user_id,
                                                thumbDetail: {
                                                    $elemMatch: {
                                                        reqUserId: req.params.request_user_id,
                                                        userId: findThumb.userId
                                                    }
                                                }
                                            })

                                            const findInThumbDown = await thumbDownModel.findOne({
                                                adminUserId: req.params.user_id,
                                                thumbDetail: {
                                                    $elemMatch: {
                                                        reqUserId: req.params.request_user_id,
                                                        userId: findThumb.userId
                                                    }
                                                }
                                            })

                                            if (findInThumbUp) {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {


                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 1,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 1,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
                                                }
                                            } else if (findInThumbDown) {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {



                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {

                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 1
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 1,
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
                                                }
                                            } else {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {



                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
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
                                        thumbDown: final1Data.thumbDown,
                                        thumbUpStatus: final1Data.thumbUpStatus,
                                        thumbDownStatus: final1Data.thumbDownStatus,
                                    }
                                    finalStatus.push(response)
                                }
                        }
                        for (const [key, finalData] of finalExistUser.entries()) {

                            const findAllUserWithIchat1 = await chatRoomModel.findOne({
                                $and: [{
                                    user1: finalData._id
                                }, {
                                    user2: req.params.user_id
                                }]
                            })

                            console.log("findAllUserWithIchat1", findAllUserWithIchat1);
                            const findAllUserWithIchat2 = await chatRoomModel.findOne({
                                $and: [{
                                    user1: req.params.user_id
                                }, {
                                    user2: finalData._id
                                }]
                            })


                            console.log("findAllUserWithIchat2", findAllUserWithIchat2);
                            if (findAllUserWithIchat1) {

                                if (finalStatus[key].status == 2) {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbDown: responses.statusAndTumbCount.thumbDown,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus,
                                    }

                                    final_data.push(response);
                                } else {
                                    const responses = {
                                        _id: finalData._id,
                                        chatRoomId: findAllUserWithIchat1 ? findAllUserWithIchat1._id : "",
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        chatRoomId: responses.chatRoomId,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbDown: responses.statusAndTumbCount.thumbDown,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus,
                                    }

                                    final_data.push(response);
                                }

                            } else {

                                if (finalStatus[key].status == 2) {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbDown: responses.statusAndTumbCount.thumbDown,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus,
                                    }

                                    final_data.push(response);
                                } else {
                                    const responses = {
                                        _id: finalData._id,
                                        chatRoomId: findAllUserWithIchat2 ? findAllUserWithIchat2._id : "",
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        chatRoomId: responses.chatRoomId,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbDown: responses.statusAndTumbCount.thumbDown,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus,
                                    }

                                    final_data.push(response);
                                }

                            }

                        }



                        const final_response = [...final_data, ...UniqueEmail]

                        let uniqueObjArray = [...new Map(final_response.map((item) => [item["_id"], item])).values()];
                        const pagecount = data.length;
                        const pageCount = Math.ceil(pagecount / limit);

                        console.log("page", page);
                        res.status(status.OK).json({
                            "message": "show all yes basket record",
                            "status": true,
                            "code": 201,
                            "statusCode": 1,
                            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                            "data": uniqueObjArray
                        })
                    }
                }

            }

        } else {


            // const findUserInBasket = await basketModel.findOne({
            //     userId: req.params.request_user_id
            // })

            // if (findUserInBasket == null) {
            //     res.status(status.NOT_FOUND).json(
            //         new APIResponse("Not In Basket", "false", 404, "0")
            //     )
            // } else {

            // const accessBasket = findUserInBasket.fullAccess

            // if (accessBasket == true) {
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
                const YesBasketData = [];
                const data = findUser.yesBasket;
                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const final = data.slice(startIndex, endIndex)

                for (const allBakest of final) {

                    const findInBlockUserModel1 = await blockuserModel.findOne({
                        userId: req.params.request_user_id,
                        "blockUnblockUser.blockUserId": allBakest.userId
                    })

                    const findInBlockUserModel2 = await blockuserModel.findOne({
                        userId: allBakest.userId,
                        "blockUnblockUser.blockUserId": req.params.request_user_id,
                    })
                    if (findInBlockUserModel1 || findInBlockUserModel2) {

                    } else {
                        YesBasketData.push((allBakest.userId).toString())
                    }
                }

                for (const allyesBasketData of YesBasketData) {
                    const meargeData = await userModel.findOne({
                        _id: allyesBasketData,
                    })

                    if (meargeData) {
                        reaquestedAllEmail.push((meargeData._id).toString())
                    } else {
                        reaquestedAllEmail.push()

                    }
                }

                if (reaquestedAllEmail[0] == undefined) {
                    res.status(status.OK).json({
                        "message": "show all post When accept by the user",
                        "status": true,
                        "code": 201,
                        "statusCode": 1,
                        "pageCount": "0",
                        "data": []
                    })
                } else {

                    const RequestedEmailExiestInUser = await requestsModel.findOne(
                        {
                            userId: req.params.user_id,
                            RequestedEmails: {
                                $elemMatch: {
                                    userId: {
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
                            const userDetail = await userModel.findOne({ _id: allrequestedDataNotAcceptedRequestAndNotFriend });
                            finalData.push(userDetail)
                        }


                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })

                        for (const getOriginalData of finalData) {

                            const data = findThumbUp.yesBasket
                            const final = data.slice(startIndex, endIndex)

                            for (const findThumb of final) {

                                const findInThumbUp = await thumbUpModel.findOne({
                                    adminUserId: req.params.request_user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })

                                const findInThumbDown = await thumbUpModel.findOne({
                                    adminUserId: req.params.request_user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })

                                if (findInThumbUp) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 1,
                                            thumbDownStatus: 0
                                        }

                                        responseData.push(response);
                                    }
                                } else if (findInThumbDown) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1
                                        }

                                        responseData.push(response);
                                    }
                                } else {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 0
                                        }

                                        responseData.push(response);
                                    }
                                }
                            }

                        }
                        let uniqueObjArray = [...new Map(responseData.map((item) => [item["_id"], item])).values()];
                        const pagecount = data.length;
                        const pageCount = Math.ceil(pagecount / limit);

                        res.status(status.OK).json({
                            "message": "show all yes basket record",
                            "status": true,
                            "code": 201,
                            "statusCode": 1,
                            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                            "data": uniqueObjArray
                        })

                    } else {

                        const emailGet = [];
                        const finalData = [];
                        for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                            emailGet.push((getEmail.userId).toString(0))
                        }

                        var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);

                        const UniqueEmail = [];

                        for (const uniqueEmail of difference) {
                            const userDetail = await userModel.findOne({ _id: uniqueEmail });
                            finalData.push(userDetail)
                        }

                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })

                        for (const getOriginalData of finalData) {
                            const data = findThumbUp.yesBasket

                            for (const findThumb of data) {

                                const findInThumbUp = await thumbUpModel.findOne({
                                    adminUserId: req.params.request_user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })

                                const findInThumbDown = await thumbUpModel.findOne({
                                    adminUserId: req.params.request_user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })

                                if (findInThumbUp) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 1,
                                            thumbDownStatus: 0
                                        }

                                        UniqueEmail.push(response);
                                    }
                                } else if (findInThumbDown) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1
                                        }

                                        UniqueEmail.push(response);
                                    }
                                } else {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 0
                                        }

                                        UniqueEmail.push(response);
                                    }
                                }

                            }

                        }

                        const statusByEmail = [];
                        const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
                        const requestedEmailWitchIsInuserRequeted = [];
                        allRequestedEmail.map((result, next) => {
                            const resultEmail = result.userId
                            requestedEmailWitchIsInuserRequeted.push(resultEmail);
                        })

                        console.log("requestedEmailWitchIsInuserRequeted", requestedEmailWitchIsInuserRequeted);

                        const meageAllTable = await userModel.aggregate([{
                            $match: {
                                _id: {
                                    $in: requestedEmailWitchIsInuserRequeted
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'posts',
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'req_data'
                            }
                        },
                        {
                            $lookup: {
                                from: 'requests',
                                let: {

                                    userId: mongoose.Types.ObjectId(req.params.user_id),
                                    id: "$_id"
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
                                                                "$$id", "$RequestedEmails.userId"
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
                                photo: "$photo",
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
                                if ((DataDetail._id).toString() == (reqEmail).toString()) {
                                    finalExistUser.push(DataDetail)
                                }
                            }
                        }

                        for (const emailData of finalExistUser[0].result) {

                            for (const requestEmail of emailData) {

                                for (const meageAllTableEmail of finalExistUser) {

                                    if ((requestEmail.userId).toString() == (meageAllTableEmail._id).toString()) {
                                        const findThumbUp = await userModel.findOne({
                                            _id: req.params.request_user_id,
                                            polyDating: 0
                                        })

                                        const data = findThumbUp.yesBasket
                                        const final = data.slice(startIndex, endIndex)
                                        for (const findThumb of final) {


                                            const findInThumbUp = await thumbUpModel.findOne({
                                                adminUserId: req.params.request_user_id,
                                                thumbDetail: {
                                                    $elemMatch: {
                                                        reqUserId: req.params.user_id,
                                                        userId: findThumb.userId
                                                    }
                                                }
                                            })

                                            const findInThumbDown = await thumbUpModel.findOne({
                                                adminUserId: req.params.request_user_id,
                                                thumbDetail: {
                                                    $elemMatch: {
                                                        reqUserId: req.params.user_id,
                                                        userId: findThumb.userId
                                                    }
                                                }
                                            })
                                            if (findInThumbUp) {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 1,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 1,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
                                                }
                                            } else if (findInThumbDown) {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 1
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 1
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
                                                }
                                            } else {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
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
                                if ((finalData._id).toString() === (final1Data._id).toString()) {
                                    const response = {
                                        status: final1Data.status,
                                        thumbUp: final1Data.thumbUp,
                                        thumbUpStatus: final1Data.thumbUpStatus,
                                        thumbDownStatus: final1Data.thumbDownStatus
                                    }
                                    finalStatus.push(response)
                                }
                        }
                        for (const [key, finalData] of finalExistUser.entries()) {

                            const findAllUserWithIchat1 = await chatRoomModel.findOne({
                                $and: [{
                                    user1: finalData._id
                                }, {
                                    user2: req.params.user_id
                                }]
                            })

                            const findAllUserWithIchat2 = await chatRoomModel.findOne({
                                $and: [{
                                    user1: req.params.user_id
                                }, {
                                    user2: finalData._id
                                }]
                            })

                            if (findAllUserWithIchat1) {

                                if (finalStatus[key].status == 2) {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus
                                    }

                                    final_data.push(response);
                                } else {
                                    const responses = {
                                        _id: finalData._id,
                                        chatRoomId: findAllUserWithIchat1 ? findAllUserWithIchat1._id : "",
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        chatRoomId: responses.chatRoomId,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus
                                    }

                                    final_data.push(response);
                                }

                            } else {

                                if (finalStatus[key].status == 2) {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus
                                    }

                                    final_data.push(response);
                                } else {
                                    const responses = {
                                        _id: finalData._id,
                                        chatRoomId: findAllUserWithIchat2 ? findAllUserWithIchat2._id : "",
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        chatRoomId: responses.chatRoomId,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus
                                    }

                                    final_data.push(response);
                                }

                            }
                        }

                        const final_response = [...final_data, ...UniqueEmail]

                        let uniqueObjArray = [...new Map(final_response.map((item) => [item["_id"], item])).values()];
                        const pagecount = data.length;
                        const pageCount = Math.ceil(pagecount / limit);

                        res.status(status.OK).json({
                            "message": "show all yes basket record",
                            "status": true,
                            "code": 201,
                            "statusCode": 1,
                            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                            "data": uniqueObjArray
                        })
                    }
                }

            }
            // } else {
            //     res.status(status.NOT_ACCEPTABLE).json(
            //         new APIResponse("Not have Any Access, All Access Lock By User", "false", 406, "0")
            //     );
            // }
            // }
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
                    new APIResponse("User not Found and not Social Meida & Dating type user", "false", 404, "0")
                )

            } else {
                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;

                const reaquestedAllEmail = [];
                const allMeargeData = [];
                const NoBasketData = [];

                const data = findUser.noBasket
                const final = data.slice(startIndex, endIndex)
                for (const allBakest of final) {
                    const findInBlockUserModel1 = await blockuserModel.findOne({
                        userId: req.params.request_user_id,
                        "blockUnblockUser.blockUserId": allBakest.userId
                    })

                    const findInBlockUserModel2 = await blockuserModel.findOne({
                        userId: allBakest.userId,
                        "blockUnblockUser.blockUserId": req.params.request_user_id
                    })
                    if (findInBlockUserModel1 || findInBlockUserModel2) {

                    } else {
                        NoBasketData.push((allBakest.userId).toString())
                    }
                }

                for (const allNoBasketData of NoBasketData) {

                    const meargeData = await userModel.findOne({
                        _id: allNoBasketData,
                    })
                    if (meargeData) {

                        reaquestedAllEmail.push((meargeData._id).toString())
                    } else {
                        reaquestedAllEmail.push()

                    }
                }

                if (reaquestedAllEmail[0] == undefined) {
                    res.status(status.OK).json({
                        "message": "show all post When accept by the user",
                        "status": true,
                        "code": 201,
                        "statusCode": 1,
                        "pageCount": "0",
                        "data": []
                    })
                } else {


                    const RequestedEmailExiestInUser = await requestsModel.findOne(
                        {
                            userId: req.params.user_id,
                            RequestedEmails: {
                                $elemMatch: {
                                    userId: {
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
                            const userDetail = await userModel.findOne({ _id: allrequestedDataNotAcceptedRequestAndNotFriend });
                            finalData.push(userDetail)
                        }

                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })


                        for (const getOriginalData of finalData) {

                            const data = findThumbUp.noBasket

                            for (const findThumb of data) {

                                const findInThumbUp = await thumbUpModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })


                                const findInThumbDown = await thumbDownModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })


                                if (findInThumbUp) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            firstName: getOriginalData.firstName,
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 1,
                                            thumbDownStatus: 0
                                        }


                                        responseData.push(response);
                                    }

                                } else if (findInThumbDown) {

                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            firstName: getOriginalData.firstName,
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1
                                        }


                                        responseData.push(response);
                                    }
                                } else {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            firstName: getOriginalData.firstName,
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 0
                                        }


                                        responseData.push(response);
                                    }

                                }

                            }


                        }


                        let uniqueObjArray = [...new Map(responseData.map((item) => [item["_id"], item])).values()];
                        const pagecount = data.length;
                        const pageCount = Math.ceil(pagecount / limit);

                        res.status(status.OK).json({
                            "message": "show all no basket record",
                            "status": true,
                            "code": 201,
                            "statusCode": 1,
                            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                            "data": uniqueObjArray
                        })

                    } else {

                        const emailGet = [];
                        const finalData = [];
                        for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                            emailGet.push((getEmail.userId).toString())
                        }


                        var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);



                        const UniqueEmail = [];


                        for (const uniqueEmail of difference) {
                            const userDetail = await userModel.findOne({ _id: uniqueEmail });
                            finalData.push(userDetail)
                        }


                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })

                        for (const getOriginalData of finalData) {

                            const data = findThumbUp.noBasket

                            for (const findThumb of data) {


                                const findInThumbUp = await thumbUpModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })

                                const findInThumbDown = await thumbDownModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })


                                if (findInThumbUp) {

                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 1,
                                            thumbDownStatus: 0
                                        }

                                        UniqueEmail.push(response);
                                    }
                                } else if (findInThumbDown) {

                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1
                                        }

                                        UniqueEmail.push(response);
                                    }
                                } else {

                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbDown: findThumb.thumbDown,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 0
                                        }

                                        UniqueEmail.push(response);
                                    }
                                }

                            }


                        }



                        const statusByEmail = [];
                        const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
                        const requestedEmailWitchIsInuserRequeted = [];
                        allRequestedEmail.map((result, next) => {
                            const resultEmail = result.userId
                            requestedEmailWitchIsInuserRequeted.push(resultEmail);
                        })

                        const meageAllTable = await userModel.aggregate([{
                            $match: {
                                _id: {
                                    $in: requestedEmailWitchIsInuserRequeted
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'posts',
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'req_data'
                            }
                        },
                        {
                            $lookup: {
                                from: 'requests',
                                let: {

                                    userId: mongoose.Types.ObjectId(req.params.user_id),
                                    id: "$_id"
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
                                                                "$$id", "$RequestedEmails.userId"
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
                                photo: "$photo",
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
                                if ((DataDetail._id).toString() == (reqEmail).toString()) {
                                    finalExistUser.push(DataDetail)
                                }
                            }
                        }

                        for (const emailData of finalExistUser[0].result) {



                            for (const requestEmail of emailData) {

                                for (const meageAllTableEmail of finalExistUser) {

                                    if ((requestEmail.userId).toString() == (meageAllTableEmail._id).toString()) {

                                        const findThumbUp = await userModel.findOne({
                                            _id: req.params.request_user_id,
                                            polyDating: 0
                                        })

                                        const data = findThumbUp.noBasket

                                        for (const findThumb of data) {

                                            const findInThumbUp = await thumbUpModel.findOne({
                                                adminUserId: req.params.user_id,
                                                thumbDetail: {
                                                    $elemMatch: {
                                                        reqUserId: req.params.request_user_id,
                                                        userId: findThumb.userId
                                                    }
                                                }
                                            })

                                            const findInThumbDown = await thumbDownModel.findOne({
                                                adminUserId: req.params.user_id,
                                                thumbDetail: {
                                                    $elemMatch: {
                                                        reqUserId: req.params.request_user_id,
                                                        userId: findThumb.userId
                                                    }
                                                }
                                            })

                                            if (findInThumbUp) {

                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 1,
                                                            thumbDownStatus: 0

                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 1,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
                                                }
                                            } else if (findInThumbDown) {

                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 1
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 1,
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
                                                }
                                            } else {

                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 0
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            email: requestEmail.requestedEmail,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbDown: findThumb.thumbDown,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 0,
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
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
                                if ((finalData._id).toString() === (final1Data._id).toString()) {
                                    const response = {
                                        status: final1Data.status,
                                        thumbUp: final1Data.thumbUp,
                                        thumbDown: final1Data.thumbDown,
                                        thumbUpStatus: final1Data.thumbUpStatus,
                                        thumbDownStatus: final1Data.thumbDownStatus,
                                    }
                                    finalStatus.push(response)
                                }
                        }
                        for (const [key, finalData] of finalExistUser.entries()) {


                            const findAllUserWithIchat1 = await chatRoomModel.findOne({
                                $and: [{
                                    user1: finalData._id
                                }, {
                                    user2: req.params.user_id
                                }]
                            })

                            const findAllUserWithIchat2 = await chatRoomModel.findOne({
                                $and: [{
                                    user1: req.params.user_id
                                }, {
                                    user2: finalData._id
                                }]
                            })


                            if (findAllUserWithIchat1) {

                                if (finalStatus[key].status == 2) {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbDown: responses.statusAndTumbCount.thumbDown,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus,
                                    }

                                    final_data.push(response);
                                } else {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        chatRoomId: findAllUserWithIchat1 ? findAllUserWithIchat1._id : "",
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbDown: responses.statusAndTumbCount.thumbDown,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus,
                                    }

                                    final_data.push(response);
                                }

                            } else {
                                if (finalStatus[key].status == 2) {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbDown: responses.statusAndTumbCount.thumbDown,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus,
                                    }

                                    final_data.push(response);
                                } else {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        chatRoomId: findAllUserWithIchat2 ? findAllUserWithIchat2._id : "",
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbDown: responses.statusAndTumbCount.thumbDown,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus,
                                    }

                                    final_data.push(response);
                                }
                            }

                        }



                        const final_response = [...final_data, ...UniqueEmail]


                        let uniqueObjArray = [...new Map(final_response.map((item) => [item["_id"], item])).values()];
                        const pagecount = data.length;
                        const pageCount = Math.ceil(pagecount / limit);

                        res.status(status.OK).json({
                            "message": "show all no basket record",
                            "status": true,
                            "code": 201,
                            "statusCode": 1,
                            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                            "data": uniqueObjArray

                        })
                    }
                }

            }

        } else {


            // const findUserInBasket = await basketModel.findOne({
            //     userId: req.params.request_user_id
            // })

            // if (findUserInBasket == null) {
            //     res.status(status.NOT_FOUND).json(
            //         new APIResponse("Not In Basket", "false", 404, "0")
            //     )
            // } else {

            // const accessBasket = findUserInBasket.fullAccess

            // if (accessBasket == true) {
            const findUser = await userModel.findOne({
                _id: req.params.request_user_id,
                polyDating: 0
            })

            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("user not Found", "false", 404, "0")
                )
            } else {

                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const reaquestedAllEmail = [];
                const allMeargeData = [];
                const NoBasketData = [];

                const data = findUser.noBasket
                const final = data.slice(startIndex, endIndex)

                for (const allBakest of final) {
                    const findInBlockUserModel1 = await blockuserModel.findOne({
                        userId: req.params.request_user_id,
                        "blockUnblockUser.blockUserId": allBakest.userId
                    })

                    const findInBlockUserModel2 = await blockuserModel.findOne({
                        userId: allBakest.userId,
                        "blockUnblockUser.blockUserId": req.params.request_user_id
                    })
                    if (findInBlockUserModel1 || findInBlockUserModel2) {

                    } else {
                        NoBasketData.push((allBakest.userId).toString())
                    }
                }

                console.log("NoBasketData", NoBasketData);
                for (const allNoBasketData of NoBasketData) {
                    const meargeData = await userModel.findOne({
                        _id: allNoBasketData,
                    })

                    if (meargeData) {

                        reaquestedAllEmail.push((meargeData._id).toString())
                    } else {
                        reaquestedAllEmail.push()

                    }
                }


                console.log("reaquestedAllEmail", reaquestedAllEmail);

                if (reaquestedAllEmail[0] == undefined) {
                    res.status(status.OK).json({
                        "message": "show all post When accept by the user",
                        "status": true,
                        "code": 201,
                        "statusCode": 1,
                        "pageCount": "0",
                        "data": []
                    })
                } else {

                    const RequestedEmailExiestInUser = await requestsModel.findOne(
                        {
                            userId: req.params.user_id,
                            RequestedEmails: {
                                $elemMatch: {
                                    userId: {
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
                            const userDetail = await userModel.findOne({ _id: allrequestedDataNotAcceptedRequestAndNotFriend });
                            finalData.push(userDetail)
                        }


                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })

                        for (const getOriginalData of finalData) {

                            const data = findThumbUp.noBasket

                            for (const findThumb of data) {

                                const findInThumbUp = await thumbUpModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })

                                const findInThumbDown = await thumbUpModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })

                                if (findInThumbUp) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 1,
                                            thumbDownStatus: 0
                                        }

                                        responseData.push(response);
                                    }
                                } else if (findInThumbDown) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1
                                        }

                                        responseData.push(response);
                                    }
                                } else {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 0
                                        }

                                        responseData.push(response);
                                    }
                                }

                            }

                        }



                        // const page = parseInt(req.query.page)
                        // const limit = parseInt(req.query.limit)
                        // const startIndex = (page - 1) * limit;
                        // const endIndex = page * limit;
                        let uniqueObjArray = [...new Map(responseData.map((item) => [item["_id"], item])).values()];
                        const pagecount = data.length;
                        const pageCount = Math.ceil(pagecount / limit);

                        res.status(status.OK).json({
                            "message": "show all no basket record",
                            "status": true,
                            "code": 201,
                            "statusCode": 1,
                            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                            "data": uniqueObjArray

                        })
                    } else {

                        const emailGet = [];
                        const finalData = [];
                        for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                            emailGet.push((getEmail.userId).toString())
                        }

                        var difference = reaquestedAllEmail.filter(x => emailGet.indexOf(x) === -1);

                        const UniqueEmail = [];

                        for (const uniqueEmail of difference) {
                            const userDetail = await userModel.findOne({ _id: uniqueEmail });
                            finalData.push(userDetail)
                        }

                        const findThumbUp = await userModel.findOne({
                            _id: req.params.request_user_id,
                            polyDating: 0
                        })

                        for (const getOriginalData of finalData) {

                            const data = findThumbUp.noBasket

                            for (const findThumb of data) {

                                const findInThumbUp = await thumbUpModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })

                                const findInThumbDown = await thumbUpModel.findOne({
                                    adminUserId: req.params.user_id,
                                    thumbDetail: {
                                        $elemMatch: {
                                            reqUserId: req.params.request_user_id,
                                            userId: findThumb.userId
                                        }
                                    }
                                })


                                if (findInThumbUp) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 1,
                                            thumbDownStatus: 0
                                        }

                                        UniqueEmail.push(response);
                                    }
                                } else if (findInThumbDown) {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 1
                                        }

                                        UniqueEmail.push(response);
                                    }
                                } else {
                                    const findThumbData = findThumb.userId
                                    const orginalData = getOriginalData._id

                                    if (orginalData.toString() == findThumbData.toString()) {
                                        const response = {
                                            _id: getOriginalData._id,
                                            email: getOriginalData.email,
                                            firstName: getOriginalData.firstName,
                                            profile: getOriginalData.photo[0] ? getOriginalData.photo[0].res : "",
                                            status: 3,
                                            thumbUp: findThumb.thumbUp,
                                            thumbUpStatus: 0,
                                            thumbDownStatus: 0
                                        }

                                        UniqueEmail.push(response);
                                    }
                                }

                            }

                        }

                        const statusByEmail = [];
                        const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails
                        const requestedEmailWitchIsInuserRequeted = [];
                        allRequestedEmail.map((result, next) => {
                            const resultEmail = result.userId
                            requestedEmailWitchIsInuserRequeted.push(resultEmail);
                        })

                        const meageAllTable = await userModel.aggregate([{
                            $match: {
                                _id: {
                                    $in: requestedEmailWitchIsInuserRequeted
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'posts',
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'req_data'
                            }
                        },
                        {
                            $lookup: {
                                from: 'requests',
                                let: {

                                    userId: mongoose.Types.ObjectId(req.params.user_id),
                                    id: "$_id"
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
                                                                "$$id", "$RequestedEmails.userId"
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
                                photo: "$photo",
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
                                if ((DataDetail._id).toString() == (reqEmail).toString()) {
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

                                        const data = findThumbUp.noBasket
                                        const final = data.slice(startIndex, endIndex)

                                        for (const findThumb of final) {


                                            const findInThumbUp = await thumbUpModel.findOne({
                                                adminUserId: req.params.user_id,
                                                thumbDetail: {
                                                    $elemMatch: {
                                                        reqUserId: req.params.request_user_id,
                                                        userId: findThumb.userId
                                                    }
                                                }
                                            })

                                            const findInThumbDown = await thumbUpModel.findOne({
                                                adminUserId: req.params.user_id,
                                                thumbDetail: {
                                                    $elemMatch: {
                                                        reqUserId: req.params.request_user_id,
                                                        userId: findThumb.userId
                                                    }
                                                }
                                            })
                                            if (findInThumbUp) {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 1,
                                                            thumbDownStatus: 0,
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 1,
                                                            thumbDownStatus: 0,
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
                                                }
                                            } else if (findInThumbDown) {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 1
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 1
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
                                                }
                                            } else {
                                                const findThumbData = findThumb.userId
                                                const originalData = requestEmail.userId

                                                if (originalData.toString() == findThumbData.toString()) {
                                                    if (requestEmail.accepted == 1) {
                                                        var status1 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 0,
                                                        }
                                                        statusByEmail.push(status1)
                                                    } else {
                                                        var status3 = {
                                                            _id: requestEmail.userId,
                                                            status: requestEmail.accepted,
                                                            firstName: findThumbUp.firstName,
                                                            profile: findThumbUp.photo[0] ? findThumbUp.photo[0].res : "",
                                                            email: requestEmail.requestedEmail,
                                                            thumbUp: findThumb.thumbUp,
                                                            thumbUpStatus: 0,
                                                            thumbDownStatus: 0,
                                                        }
                                                        statusByEmail.push(status3)
                                                    }
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
                                if ((finalData._id).toString() === (final1Data._id).toString()) {
                                    const response = {
                                        status: final1Data.status,
                                        thumbUp: final1Data.thumbUp,
                                        thumbUpStatus: final1Data.thumbUpStatus,
                                        thumbDownStatus: final1Data.thumbDownStatus
                                    }
                                    finalStatus.push(response)
                                }
                        }
                        for (const [key, finalData] of finalExistUser.entries()) {

                            const findAllUserWithIchat1 = await chatRoomModel.findOne({
                                $and: [{
                                    user1: finalData._id
                                }, {
                                    user2: req.params.user_id
                                }]
                            })

                            const findAllUserWithIchat2 = await chatRoomModel.findOne({
                                $and: [{
                                    user1: req.params.user_id
                                }, {
                                    user2: finalData._id
                                }]
                            })


                            if (findAllUserWithIchat1) {
                                if (finalStatus[key].status == 2) {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus
                                    }

                                    final_data.push(response);
                                } else {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        chatRoomId: findAllUserWithIchat1 ? findAllUserWithIchat1._id : "",
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus
                                    }

                                    final_data.push(response);
                                }

                            } else {
                                if (finalStatus[key].status == 2) {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus
                                    }

                                    final_data.push(response);
                                } else {
                                    const responses = {
                                        _id: finalData._id,
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        statusAndTumbCount: finalStatus[key]
                                    }
                                    const response = {
                                        _id: finalData._id,
                                        chatRoomId: findAllUserWithIchat2 ? findAllUserWithIchat2._id : "",
                                        // polyDating: finalData.polyDating,
                                        // HowDoYouPoly: finalData.HowDoYouPoly,
                                        // loveToGive: finalData.loveToGive,
                                        // polyRelationship: finalData.polyRelationship,
                                        firstName: finalData.firstName,
                                        email: finalData.email,
                                        profile: finalData.photo[0] ? finalData.photo[0].res : "",
                                        // relationshipSatus: finalData.relationshipSatus,
                                        // Bio: finalData.Bio,
                                        // hopingToFind: finalData.hopingToFind,
                                        // jobTitle: finalData.jobTitle,
                                        // wantChildren: finalData.wantChildren,
                                        // posts_data: finalData.posts,
                                        status: responses.statusAndTumbCount.status,
                                        thumbUp: responses.statusAndTumbCount.thumbUp,
                                        thumbUpStatus: responses.statusAndTumbCount.thumbUpStatus,
                                        thumbDownStatus: responses.statusAndTumbCount.thumbDownStatus
                                    }

                                    final_data.push(response);
                                }
                            }


                        }

                        const final_response = [...final_data, ...UniqueEmail]

                        // const page = parseInt(req.query.page)
                        // const limit = parseInt(req.query.limit)
                        // const startIndex = (page - 1) * limit;
                        // const endIndex = page * limit;
                        let uniqueObjArray = [...new Map(final_response.map((item) => [item["_id"], item])).values()];
                        const pagecount = data.length;
                        const pageCount = Math.ceil(pagecount / limit);

                        res.status(status.OK).json({
                            "message": "show all no basket record",
                            "status": true,
                            "code": 201,
                            "statusCode": 1,
                            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                            "data": uniqueObjArray
                        })

                    }
                }

            }
            // } else {
            //     res.status(status.NOT_ACCEPTABLE).json(
            //         new APIResponse("Not have Any Access, All Access Lock By User", "false", 406, "0")
            //     );
            // }
        }
        // }
    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}


exports.moveBasket = async (req, res, next) => {

    try {


        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser) {

            const findYesBasketUser = await userModel.findOne({
                _id: req.params.user_id,
                "yesBasket.userId": req.params.request_user_id
            })

            const findNoBasketUser = await userModel.findOne({
                _id: req.params.user_id,
                "noBasket.userId": req.params.request_user_id
            })

            if (findYesBasketUser) {
                const yesData = [];
                for (const dataFind of findYesBasketUser.yesBasket) {
                    if ((dataFind.userId).toString() == (req.params.request_user_id).toString()) {
                        yesData.push(dataFind)
                    }
                }

                await userModel.updateOne(
                    {
                        _id: req.params.user_id
                    },
                    {
                        $pull: {
                            yesBasket: {
                                userId: req.params.request_user_id
                            }
                        }
                    });


                await userModel.updateOne(
                    {
                        _id: req.params.user_id
                    },
                    {
                        $push: {
                            noBasket: {
                                match: yesData[0].match,
                                userId: yesData[0].userId,
                                thumbUp: yesData[0].thumbUp,
                                thumbDown: yesData[0].thumbDown,
                            }

                        }
                    });


                res.status(status.OK).json(
                    new APIResponse("move in no basket", true, 200, "1")
                );

            } else if (findNoBasketUser) {

                const noData = [];


                for (const dataFind of findNoBasketUser.noBasket) {
                    if ((dataFind.userId).toString() == (req.params.request_user_id).toString()) {
                        noData.push(dataFind)
                    }
                }



                await userModel.updateOne(
                    {
                        _id: req.params.user_id
                    },
                    {
                        $pull: {
                            noBasket: {
                                userId: req.params.request_user_id
                            }
                        }
                    });


                await userModel.updateOne(
                    {
                        _id: req.params.user_id,

                    },
                    {
                        $push: {
                            yesBasket: {
                                match: noData[0].match,
                                userId: noData[0].userId,
                                thumbUp: noData[0].thumbUp,
                                thumbDown: noData[0].thumbDown,
                            }

                        }
                    });

                res.status(status.OK).json(
                    new APIResponse("move in yes basket", true, 200, "1")
                );

            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("not in basket", false, 404, "0")
                );
            }

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found", false, 404, "0")
            );
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}

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


                        var userNotificationDate = new Date(getNotification.createdAt);
                        now = new Date();
                        var sec_num = (now - userNotificationDate) / 1000;
                        var days = Math.floor(sec_num / (3600 * 24));
                        var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                        var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                        var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                        if (hours < 10) { hours = "0" + hours; }
                        if (minutes < 10) { minutes = "0" + minutes; }
                        if (seconds < 10) { seconds = "0" + seconds; }

                        if (days > 28) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: new Date(userNotificationDate).toDateString()
                            }
                            allNotification.push(response)
                        } else if (days > 21 && days < 28) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: '4 week ago'
                            }
                            allNotification.push(response)
                        } else if (days > 14 && days < 21) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: '3 week ago'
                            }
                            allNotification.push(response)
                        } else if (days > 7 && days < 14) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: '2 week ago'
                            }
                            allNotification.push(response)
                        } else if (days > 0 && days < 7) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: '1 week ago'
                            }
                            allNotification.push(response)
                        } else if (hours > 0 && days == 0) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: `${hours} hourse ago`
                            }
                            allNotification.push(response)
                        } else if (minutes > 0 && hours == 0) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: `${minutes} minutes ago`
                            }
                            allNotification.push(response)
                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: `${seconds} seconds ago`
                            }
                            allNotification.push(response)
                        } else if (seconds == 0 && minutes == 0 && hours == 0 && days === 0) {
                            const response = {
                                _id: getNotification.userId,
                                notification: getNotification.notifications,
                                name: findUserDetail.firstName,
                                profile: findUserDetail.photo[0] ? findUserDetail.photo[0].res : "",
                                status: getNotification.status,
                                time: `just now`
                            }
                            allNotification.push(response)
                        }




                    } else {

                        const response = {

                            notification: getNotification.notifications,
                            profile: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                        }

                        allNotification.push(response)
                    }
                }

                res.status(status.OK).json(
                    new APIResponse("show all notification", "true", 200, "1", allNotification.reverse())
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


exports.forGetPassword = async (req, res) => {
    try {

        const findUser = await userModel.findOne({
            email: req.params.email
        })

        if (findUser) {

            var chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var passwordLength = 7;
            var password = "";
            for (var i = 0; i <= passwordLength; i++) {
                var randomNumber = Math.floor(Math.random() * chars.length);
                password += chars.substring(randomNumber, randomNumber + 1);
            }


            const email = req.params.email
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: 'dobariyakrishna79@gmail.com',
                    pass: 'cqcalljcuizvnath',
                }
            });

            var mailOptions = {
                from: `dobariyakrishna79@gmail.com`,
                to: `${email}`,
                subject: 'n2you forget password mail',
                html: `
                <html>
                <body> 
                <h4> Hello ${findUser.firstName},</h4>

                <p>Did you forgot your password? Don't worry we have reset your password.</p>
            
                <p>Your new password is : <b>${password}</b></p>
            
                <p>Please use above password to login in to the app.</p>
            
                <p>If you did not request a new password, please let us know immediately by replying to this email.</p>
            
                <p>Thanks</p>
                <p>The N2You team</p>
                </body>
                </html>`
            };

            await userModel.updateOne({
                email: req.params.email
            }, {
                $set: {
                    password: password
                }
            })

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.status(status.OK).json(
                new APIResponse("successfully message send", "true", 200, "1")
            );
        } else {
            res.status(status.OK).json(
                new APIResponse("email not found", "true", 200, "1")
            );
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, error.message)
        );
    }
}

exports.checkMailExiesOrNot = async (req, res) => {
    try {

        const findUser = await userModel.findOne({
            email: req.params.email
        }).select("email")


        if (findUser) {
            res.status(status.OK).json(
                new APIResponse("you can't use this email, already exist", "true", 200, "1", { emailExistOrNot: true })
            );
        } else {
            res.status(status.OK).json(
                new APIResponse("you can use this email", "true", 200, "1", { emailExistOrNot: false })
            );
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, error.message)
        );
    }
}

exports.unFriend = async (req, res) => {
    try {

        const userFind = await userModel.findOne({ _id: req.params.user_id, polyDating: 0 });
        if (userFind == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found and not Social Meida & Dating type user", "false", 404, "0")
            );
        } else {
            const unFriendUserFound = await userModel.findOne({ _id: req.params.unfriend_user_id, polyDating: 0 })

            if (unFriendUserFound == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found which is Social Meida & Dating type user", "false", 404, "0")
                );

            } else {
                const findInRequestModel1 = await requestsModel.findOne({
                    userId: req.params.unfriend_user_id
                })

                const findInRequestModel2 = await requestsModel.findOne({
                    userId: req.params.user_id
                })

                await requestsModel.updateOne({
                    userId: findInRequestModel1.userId
                }, {
                    $pull: {
                        RequestedEmails: {
                            userId: findInRequestModel2.userId
                        }
                    }
                })

                await requestsModel.updateOne({
                    userId: findInRequestModel2.userId
                }, {
                    $pull: {
                        RequestedEmails: {
                            userId: findInRequestModel1.userId
                        }
                    }
                })

                await chatRoomModel.deleteOne({
                    user1: findInRequestModel1.userId,
                    user2: findInRequestModel2.userId
                })

                await chatRoomModel.deleteOne({
                    user2: findInRequestModel1.userId,
                    user1: findInRequestModel2.userId
                })

                res.status(status.CREATED).json(
                    new APIResponse("unfriend success", "true", 201, "1")
                )

            }
        }

    } catch (error) {
        console.log(error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, error.message)
        );
    }
}

exports.readNotification = async (req, res) => {
    try {

        const findUserInNotification = await notificationModel.findOne({
            userId: req.params.user_id
        })

        if (findUserInNotification) {

            await notificationModel.updateMany({
                userId: req.params.user_id
            }, {
                $set: {
                    "notifications.$[].read": 0
                }
            })

            res.status(status.OK).json(
                new APIResponse("read all notification", "true", 200, "1")
            )

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("user Not foud", "false", 404, "0")
            )
        }

    } catch (error) {
        console.log(error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, error.message)
        );
    }
}

exports.logout = async (req, res, next) => {
    try {

        const userData = await userModel.findOne({
            _id: req.params.user_id
        })

        if (userData) {
            const data = await userModel.updateOne({
                _id: req.params.user_id
            }, {
                $set: {
                    fcm_token: ""
                }
            })
            res.status(status.OK).json(
                new APIResponse("logout success", "true", 200, "1")
            );
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Uer not found", "false", 404, "0")
            );
        }






    } catch (error) {
        console.log(error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, error.message)
        );
    }
}
