const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const userModel = require("../../model/user.model");
const conflictModel = require("../../model/polyamorous/conflict.model");
const groupChatRoomModels = require("../../webSocket/models/groupChatRoom.models");
const { default: mongoose } = require("mongoose");
const linkProfileModel = require("../../model/polyamorous/linkProfile.model");



exports.updateConflictOfIntrest = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })



        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("no User Found..!", "false", 404, "0")
            );
        } else {
            const findNotAcceptedUserInConflictModel = await conflictModel.findOne({
                conflictUserId: req.params.conflict_id,
                "notAcceptedUserId.userId": req.params.user_id
            })



            const findAcceptedUserInConflictModel = await conflictModel.findOne({
                conflictUserId: req.params.conflict_id,
                "acceptedUserId.userId": req.params.user_id
            })


            if (findNotAcceptedUserInConflictModel) {

                if (req.query.status == 1) {
                    await conflictModel.updateOne({
                        conflictUserId: req.params.conflict_id,
                        "notAcceptedUserId.userId": req.params.user_id

                    }, {
                        $set: {
                            "notAcceptedUserId.$.status": 1
                        },
                        $inc: { aggreeCount: 1 }
                    })



                    const findInLinkProfile = await linkProfileModel.findOne({
                        $and: [
                            {
                                $or: [
                                    {
                                        user1: req.params.user_id
                                    },
                                    {
                                        user2: req.params.user_id
                                    },
                                    {
                                        user3: req.params.user_id
                                    },
                                    {
                                        user4: req.params.user_id
                                    }
                                ]
                            },
                            {
                                _id: req.params.linkprofile_id
                            }
                        ]
                    })


                    if (findInLinkProfile) {

                    } else {
                        const findInLinkProfile = await linkProfileModel.findOne({
                            _id: req.params.linkprofile_id
                        })

                        if (findInLinkProfile.user1 == null || findInLinkProfile.user1 == undefined) {
                            await linkProfileModel.updateOne({
                                _id: req.params.linkprofile_id
                            }, {
                                $set: {
                                    user1: req.params.user_id
                                }
                            })
                        } else if (findInLinkProfile.user2 == null || findInLinkProfile.user2 == undefined) {
                            await linkProfileModel.updateOne({
                                _id: req.params.linkprofile_id
                            }, {
                                $set: {
                                    user2: req.params.user_id
                                }
                            })
                        } else if (findInLinkProfile.user3 == null || findInLinkProfile.user3 == undefined) {
                            await linkProfileModel.updateOne({
                                _id: req.params.linkprofile_id
                            }, {
                                $set: {
                                    user3: req.params.user_id
                                }
                            })
                        } else if (findInLinkProfile.user4 == null || findInLinkProfile.user4 == undefined) {
                            await linkProfileModel.updateOne({
                                _id: req.params.linkprofile_id
                            }, {
                                $set: {
                                    user4: req.params.user_id
                                }
                            })
                        }
                    }

                    const chatRoomModel = await groupChatRoomModels.findOne({
                        $and: [
                            {
                                $or: [
                                    {
                                        user1: req.params.user_id
                                    },
                                    {
                                        user2: req.params.user_id
                                    },
                                    {
                                        user3: req.params.user_id
                                    },
                                    {
                                        user4: req.params.user_id
                                    }
                                ]
                            },
                            {
                                _id: req.params.group_room_id
                            }
                        ]
                    })

                    console.log(chatRoomModel);
                    if (chatRoomModel) {

                    } else {


                        const chatRoomModel = await groupChatRoomModels.findOne({
                            _id: req.params.group_room_id
                        })

                        if (chatRoomModel.user1 == null || chatRoomModel.user1 == undefined) {
                            await groupChatRoomModels.updateOne({
                                _id: req.params.group_room_id
                            }, {
                                $set: {
                                    user1: req.params.user_id
                                }
                            })
                        } else if (chatRoomModel.user2 == null || chatRoomModel.user2 == undefined) {
                            await groupChatRoomModels.updateOne({
                                _id: req.params.group_room_id
                            }, {
                                $set: {
                                    user2: req.params.user_id
                                }
                            })
                        } else if (chatRoomModel.user3 == null || chatRoomModel.user3 == undefined) {

                            await groupChatRoomModels.updateOne({
                                _id: req.params.group_room_id
                            }, {
                                $set: {
                                    user3: req.params.user_id
                                }
                            })
                        } else if (chatRoomModel.user4 == null || chatRoomModel.user4 == undefined) {
                            await groupChatRoomModels.updateOne({
                                _id: req.params.group_room_id
                            }, {
                                $set: {
                                    user4: req.params.user_id
                                }
                            })
                        }
                    }

                    const findNotAccepted = await conflictModel.findOne({
                        conflictUserId: req.params.conflict_id,
                        "notAcceptedUserId.status": 0

                    })

                    const findAccepted = await conflictModel.findOne({
                        conflictUserId: req.params.conflict_id,
                        "acceptedUserId.status": 0

                    })

                    if (findNotAccepted == null && findAccepted == null) {
                        await conflictModel.deleteOne({
                            groupId: req.params.group_room_id,
                            conflictUserId: req.params.conflict_id
                        })

                    }

                    res.status(status.OK).json(
                        new APIResponse("finaliy aggree", true, 200, "1")
                    );

                } else if (req.query.status == 2) {

                    await conflictModel.updateOne({
                        conflictUserId: req.params.conflict_id,
                        "notAcceptedUserId.userId": req.params.user_id
                    }, {
                        $set: {
                            "notAcceptedUserId.$.status": 2
                        },
                        $inc: { disAggreeCount: 1 }
                    })



                    const findInLinkProfile = await linkProfileModel.findOne({
                        _id: req.params.linkprofile_id
                    })

                    if (findInLinkProfile.user1 == req.params.user_id) {
                        await linkProfileModel.updateOne({
                            _id: req.params.linkprofile_id
                        }, {
                            $unset: {
                                user1: {
                                    $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                },

                            }
                        })
                    } else if (findInLinkProfile.user2 == req.params.user_id) {
                        await linkProfileModel.updateOne({
                            _id: req.params.linkprofile_id
                        }, {
                            $unset: {
                                user2: {
                                    $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                },

                            }
                        })
                    } else if (findInLinkProfile.user3 == req.params.user_id) {
                        await linkProfileModel.updateOne({
                            _id: req.params.linkprofile_id
                        }, {
                            $unset: {
                                user3: {
                                    $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                },

                            }
                        })
                    } else if (findInLinkProfile.user4 == req.params.user_id) {
                        await linkProfileModel.updateOne({
                            _id: req.params.linkprofile_id
                        }, {
                            $unset: {
                                user4: {
                                    $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                },

                            }
                        })

                    }


                    const findInGroupRoom = await groupChatRoomModels.findOne({
                        _id: req.params.group_room_id
                    })

                    if (findInGroupRoom.user1 == req.params.user_id) {
                        await groupChatRoomModels.updateOne({
                            _id: req.params.group_room_id,
                        },
                            {
                                $unset: {
                                    user1: {
                                        $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                    },
                                },
                            })
                    } else if (findInGroupRoom.user2 == req.params.user_id) {
                        await groupChatRoomModels.updateOne({
                            _id: req.params.group_room_id,
                        },
                            {
                                $unset: {
                                    user2: {
                                        $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                    },
                                },
                            })
                    } else if (findInGroupRoom.user3 == req.params.user_id) {
                        await groupChatRoomModels.updateOne({
                            _id: req.params.group_room_id,
                        },
                            {
                                $unset: {
                                    user3: {
                                        $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                    },
                                },
                            })
                    } else if (findInGroupRoom.user4 == req.params.user_id) {
                        await groupChatRoomModels.updateOne({
                            _id: req.params.group_room_id,
                        },
                            {
                                $unset: {
                                    user4: {
                                        $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                    },
                                },
                            })
                    }

                    const findNotAccepted = await conflictModel.findOne({
                        conflictUserId: req.params.conflict_id,
                        "notAcceptedUserId.status": 0

                    })

                    const findAccepted = await conflictModel.findOne({
                        conflictUserId: req.params.conflict_id,
                        "acceptedUserId.status": 0

                    })

                    if (findNotAccepted == null && findAccepted == null) {
                        await conflictModel.deleteOne({
                            groupId: req.params.group_room_id,
                            conflictUserId: req.params.conflict_id
                        })

                    }
                    res.status(status.OK).json(
                        new APIResponse("final dicition disaggree", true, 200, "1")
                    );

                }

            } else if (findAcceptedUserInConflictModel) {
                if (req.query.status == 1) {
                    await conflictModel.updateOne({
                        conflictUserId: req.params.conflict_id,
                        "acceptedUserId.userId": req.params.user_id
                    }, {
                        $set: {
                            "acceptedUserId.$.status": 1
                        },
                        $inc: { aggreeCount: 1 }
                    })

                    const findInLinkProfile = await linkProfileModel.findOne({
                        $and: [
                            {
                                $or: [
                                    {
                                        user1: req.params.user_id
                                    },
                                    {
                                        user2: req.params.user_id
                                    },
                                    {
                                        user3: req.params.user_id
                                    },
                                    {
                                        user4: req.params.user_id
                                    }
                                ]
                            },
                            {
                                _id: req.params.linkprofile_id
                            }
                        ]
                    })

                    if (findInLinkProfile) {

                    } else {
                        const findInLinkProfile = await linkProfileModel.findOne({
                            _id: req.params.linkprofile_id
                        })

                        if (findInLinkProfile.user1 == null || findInLinkProfile.user1 == undefined) {
                            await linkProfileModel.updateOne({
                                _id: req.params.linkprofile_id
                            }, {
                                $set: {
                                    user1: req.params.user_id
                                }
                            })
                        } else if (findInLinkProfile.user2 == null || findInLinkProfile.user2 == undefined) {
                            await linkProfileModel.updateOne({
                                _id: req.params.linkprofile_id
                            }, {
                                $set: {
                                    user2: req.params.user_id
                                }
                            })
                        } else if (findInLinkProfile.user3 == null || findInLinkProfile.user3 == undefined) {
                            await linkProfileModel.updateOne({
                                _id: req.params.linkprofile_id
                            }, {
                                $set: {
                                    user3: req.params.user_id
                                }
                            })
                        } else if (findInLinkProfile.user4 == null || findInLinkProfile.user4 == undefined) {
                            await linkProfileModel.updateOne({
                                _id: req.params.linkprofile_id
                            }, {
                                $set: {
                                    user4: req.params.user_id
                                }
                            })
                        }
                    }

                    const chatRoomModel = await groupChatRoomModels.findOne({
                        $and: [
                            {
                                $or: [
                                    {
                                        user1: req.params.user_id
                                    },
                                    {
                                        user2: req.params.user_id
                                    },
                                    {
                                        user3: req.params.user_id
                                    },
                                    {
                                        user4: req.params.user_id
                                    }
                                ]
                            },
                            {
                                _id: req.params.group_room_id
                            }
                        ]
                    })

                    if (chatRoomModel) {

                    } else {
                        const chatRoomModel = await groupChatRoomModels.findOne({
                            _id: req.params.group_room_id
                        })

                        if (chatRoomModel.user1 == null || chatRoomModel.user1 == undefined) {
                            await groupChatRoomModels.updateOne({
                                _id: req.params.group_room_id
                            }, {
                                $set: {
                                    user1: req.params.user_id
                                }
                            })
                        } else if (chatRoomModel.user2 == null || chatRoomModel.user2 == undefined) {
                            await groupChatRoomModels.updateOne({
                                _id: req.params.group_room_id
                            }, {
                                $set: {
                                    user2: req.params.user_id
                                }
                            })
                        } else if (chatRoomModel.user3 == null || chatRoomModel.user3 == undefined) {
                            await groupChatRoomModels.updateOne({
                                _id: req.params.group_room_id
                            }, {
                                $set: {
                                    user3: req.params.user_id
                                }
                            })
                        } else if (chatRoomModel.user4 == null || chatRoomModel.user4 == undefined) {
                            await groupChatRoomModels.updateOne({
                                _id: req.params.group_room_id
                            }, {
                                $set: {
                                    user4: req.params.user_id
                                }
                            })
                        }
                    }

                    const findNotAccepted = await conflictModel.findOne({
                        conflictUserId: req.params.conflict_id,
                        "notAcceptedUserId.status": 0

                    })

                    const findAccepted = await conflictModel.findOne({
                        conflictUserId: req.params.conflict_id,
                        "acceptedUserId.status": 0

                    })

                    if (findNotAccepted == null && findAccepted == null) {
                        await conflictModel.deleteOne({
                            groupId: req.params.group_room_id,
                            conflictUserId: req.params.conflict_id
                        })

                    }


                    res.status(status.OK).json(
                        new APIResponse("finaliy aggree", true, 200, "1")
                    );

                } else if (req.query.status == 2) {
                    await conflictModel.updateOne({
                        conflictUserId: req.params.conflict_id,
                        "acceptedUserId.userId": req.params.user_id
                    }, {
                        $set: {
                            "acceptedUserId.$.status": 2
                        },
                        $inc: { disAggreeCount: 1 }
                    })

                    await linkProfileModel.updateOne({
                        _id: req.params.linkprofile_id
                    }, {
                        $unset: {
                            user1: {
                                $in: [mongoose.Types.ObjectId(req.params.user_id)]
                            },

                        }
                    })

                    await linkProfileModel.updateOne({
                        _id: req.params.linkprofile_id
                    }, {
                        $unset: {
                            user2: {
                                $in: [mongoose.Types.ObjectId(req.params.user_id)]
                            },

                        }
                    })
                    await linkProfileModel.updateOne({
                        _id: req.params.linkprofile_id
                    }, {
                        $unset: {
                            user3: {
                                $in: [mongoose.Types.ObjectId(req.params.user_id)]
                            },

                        }
                    })
                    await linkProfileModel.updateOne({
                        _id: req.params.linkprofile_id
                    }, {
                        $unset: {
                            user4: {
                                $in: [mongoose.Types.ObjectId(req.params.user_id)]
                            },

                        }
                    })

                    await groupChatRoomModels.updateOne({
                        _id: req.params.group_room_id,
                    },
                        {
                            $unset: {
                                user1: {
                                    $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                },
                            },
                        })
                    await groupChatRoomModels.updateOne({
                        _id: req.params.group_room_id,
                    },
                        {
                            $unset: {
                                user2: {
                                    $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                },
                            },
                        })
                    await groupChatRoomModels.updateOne({
                        _id: req.params.group_room_id,
                    },
                        {
                            $unset: {
                                user3: {
                                    $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                },
                            },
                        })
                    await groupChatRoomModels.updateOne({
                        _id: req.params.group_room_id,
                    },
                        {
                            $unset: {
                                user4: {
                                    $in: [mongoose.Types.ObjectId(req.params.user_id)]
                                },
                            },
                        })

                    const findNotAccepted = await conflictModel.findOne({
                        conflictUserId: req.params.conflict_id,
                        "notAcceptedUserId.status": 0
                    })

                    const findAccepted = await conflictModel.findOne({
                        conflictUserId: req.params.conflict_id,
                        "acceptedUserId.status": 0
                    })

                    if (findNotAccepted == null && findAccepted == null) {
                        await conflictModel.deleteOne({
                            groupId: req.params.group_room_id,
                            conflictUserId: req.params.conflict_id
                        })

                    }

                    res.status(status.OK).json(
                        new APIResponse("final dicition disaggree", true, 200, "1")
                    );
                }
            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("not Found user", "false", 404, "0")
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