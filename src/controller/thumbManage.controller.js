const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const userModel = require("../model/user.model");
const thumbUpModel = require("../model/thumbUp.model");
const thumbDownModel = require("../model/thumDown.model");
const basketModel = require("../model/basket.model");

exports.thumbCount = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.admin_user_id,
            polyDating: 0
        })
        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found and not Social Meida & Dating type user", "false", 404, "0")
            )
        } else {

            const findExistUser = await userModel.findOne({
                _id: req.params.user_id,
                polyDating: 0
            })


            const findExistUserInUser = await userModel.findOne({
                _id: req.params.req_user_id,
                polyDating: 0
            })

            if (findExistUser == null && findExistUserInUser == null) {


                res.status(status.NOT_FOUND).json(
                    new APIResponse("User not found and not Social Meida & Dating type user", "false", 404, "0")
                )

            } else {

                if (req.query.value == 1) {                          
                            const checkInThumbModel = await thumbUpModel.find({
                                adminUserId: req.params.admin_user_id,
                            })

                            console.log("checkInThumbModel" , checkInThumbModel);
                            if (checkInThumbModel[0] == undefined) {



                                const findData =  await thumbDownModel.findOne(
                                    { 
                                        adminUserId: req.params.admin_user_id,
                                        "thumbDetail.reqUserId": req.params.req_user_id,
                                        "thumbDetail.userId": req.params.user_id
                                    }
                                );

                            
        
                                if(findData){
        
                                    await thumbDownModel.updateOne(
                                        {
                                            adminUserId: req.params.admin_user_id
                                        },
                                        {
                                            $pull: {
                                                thumbDetail: {
                                                    reqUserId: req.params.req_user_id,
                                                    userId: req.params.user_id
            
                                                }
                                            }
                                        }
                                    );
        
                                    const updateThumbYes = await userModel.updateOne(
                                        {
                                            _id: req.params.admin_user_id, "yesBasket.userId": req.params.user_id
                                        },
            
                                        { $inc: { "yesBasket.$.thumbDown": -1 } }
                                    )
            
                                   
                                    const updateThumbNo = await userModel.updateOne(
                                        {
                                            _id: req.params.admin_user_id, "noBasket.userId": req.params.user_id
                                        },
            
                                        { $inc: { "noBasket.$.thumbDown": -1 } }
                                    )
        
                                }else{
        
                                }
        

                                const insertThumbUp = thumbUpModel({
                                    adminUserId: req.params.admin_user_id,
                                    thumbDetail: {
                                        reqUserId: req.params.req_user_id,
                                        userId: req.params.user_id
                                    }
                                });

                                await insertThumbUp.save();
                              
                                const updateThumbYes = await userModel.updateOne(
                                    {
                                        _id: req.params.admin_user_id, "yesBasket.userId": req.params.user_id
                                    },
    
                                    { $inc: { "yesBasket.$.thumbUp": 1 } }
                                )
    
                               
                                const updateThumbNo = await userModel.updateOne(
                                    {
                                        _id: req.params.admin_user_id, "noBasket.userId": req.params.user_id
                                    },
    
                                    { $inc: { "noBasket.$.thumbUp": 1 } }
                                )


                                const findThumb = await userModel.findOne({
                                    _id: req.params.admin_user_id
                                })

                                const thumb = []
                                for(const data of findThumb.yesBasket){
                                    if((data.userId).toString() == (req.params.user_id)){
                                        thumb.push(data.thumbUp)
                                    }
                                }

                                for(const data of findThumb.noBasket){
                                    if((data.userId).toString() == (req.params.user_id)){
                                        thumb.push(data.thumbUp)
                                    }
                                }


                                
                                res.status(status.CREATED).json(
                                    new APIResponse("thumbUp Added", "true", 201, "1", {thumUp: thumb[0]})
                                );
                            } else {

                                const checkExiestReqUserId = await thumbUpModel.findOne({
                                    adminUserId: req.params.admin_user_id,
                                    "thumbDetail.reqUserId": req.params.req_user_id,
                                    "thumbDetail.userId": req.params.user_id
                                })

                                if (checkExiestReqUserId == null) {


                                    const updateThumbYes = await userModel.updateOne(
                                        {
                                            _id: req.params.admin_user_id, "yesBasket.userId": req.params.user_id
                                        },
        
                                        { $inc: { "yesBasket.$.thumbUp": 1 } }
                                    )
        
                                   
                                    const updateThumbNo = await userModel.updateOne(
                                        {
                                            _id: req.params.admin_user_id, "noBasket.userId": req.params.user_id
                                        },
        
                                        { $inc: { "noBasket.$.thumbUp": 1 } }
                                    )

                                    const findData =  await thumbDownModel.findOne(
                                        { 
                                            adminUserId: req.params.admin_user_id,
                                            "thumbDetail.reqUserId": req.params.req_user_id,
                                            "thumbDetail.userId": req.params.user_id
                                        }
                                    );
            
                                    if(findData){
            
                                        await thumbDownModel.updateOne(
                                            {
                                                adminUserId: req.params.admin_user_id
                                            },
                                            {
                                                $pull: {
                                                    thumbDetail: {
                                                        reqUserId: req.params.req_user_id,
                                                        userId: req.params.user_id
                
                                                    }
                                                }
                                            }
                                        );
            
                                        const updateThumbYes = await userModel.updateOne(
                                            {
                                                _id: req.params.admin_user_id, "yesBasket.userId": req.params.user_id
                                            },
                
                                            { $inc: { "yesBasket.$.thumbDown": -1 } }
                                        )
                
                                       
                                        const updateThumbNo = await userModel.updateOne(
                                            {
                                                _id: req.params.admin_user_id, "noBasket.userId": req.params.user_id
                                            },
                
                                            { $inc: { "noBasket.$.thumbDown": -1 } }
                                        )
            
                                    }else{
            
                                    }
            

                                        const thumbAdd = await thumbUpModel.updateOne({ adminUserId: req.params.admin_user_id },
                                            {
                                                $push: {
                                                    thumbDetail: {
                                                        reqUserId: req.params.req_user_id,
                                                        userId: req.params.user_id
                                                    }
                                                }
                                            })

                                            const findThumb = await userModel.findOne({
                                                _id: req.params.admin_user_id
                                            })

                                            const thumb = []
                                for(const data of findThumb.yesBasket){
                                    if((data.userId).toString() == (req.params.user_id)){
                                        thumb.push(data.thumbUp)
                                    }
                                }

                                for(const data of findThumb.noBasket){
                                    if((data.userId).toString() == (req.params.user_id)){
                                        thumb.push(data.thumbUp)
                                    }
                                }

                                    res.status(status.CREATED).json(
                                        new APIResponse("ThumbUp added", "true", 201, "1" , {thumbup : thumb[0]})
                                    );

                                } else {
                                    res.status(status.CREATED).json(
                                        new APIResponse("Already add ThumbUp", "true", 201, "1")
                                    );
                                }


                            }
                } else if (req.query.value == 0) {


                    const checkDownThumbModel = await thumbDownModel.find({
                        adminUserId: req.params.admin_user_id,
                    })

                    if (checkDownThumbModel[0] == undefined) {


                        const findData =  await thumbUpModel.findOne(
                            { 
                                adminUserId: req.params.admin_user_id,
                                "thumbDetail.reqUserId": req.params.req_user_id,
                                "thumbDetail.userId": req.params.user_id
                            }
                        );

                        if(findData){

                            await thumbUpModel.updateOne(
                                {
                                    adminUserId: req.params.admin_user_id
                                },
                                {
                                    $pull: {
                                        thumbDetail: {
                                            reqUserId: req.params.req_user_id,
                                            userId: req.params.user_id
    
                                        }
                                    }
                                }
                            );

                            const updateThumbYes = await userModel.updateOne(
                                {
                                    _id: req.params.admin_user_id, "yesBasket.userId": req.params.user_id
                                },
    
                                { $inc: { "yesBasket.$.thumbUp": -1 } }
                            )
    
                           
                            const updateThumbNo = await userModel.updateOne(
                                {
                                    _id: req.params.admin_user_id, "noBasket.userId": req.params.user_id
                                },
    
                                { $inc: { "noBasket.$.thumbUp": -1 } }
                            )

                        }else{

                        }

                        const insertThumbDown = thumbDownModel({
                            adminUserId: req.params.admin_user_id,
                            thumbDetail: {
                                reqUserId: req.params.req_user_id,
                                userId: req.params.user_id
                            }
                        });

                        await insertThumbDown.save();
                      
                        const updateThumbYes = await userModel.updateOne(
                            {
                                _id: req.params.admin_user_id, "yesBasket.userId": req.params.user_id
                            },

                            { $inc: { "yesBasket.$.thumbDown": 1 } }
                        )

                       
                        const updateThumbNo = await userModel.updateOne(
                            {
                                _id: req.params.admin_user_id, "noBasket.userId": req.params.user_id
                            },

                            { $inc: { "noBasket.$.thumbDown": 1 } }
                        )


                        const findThumb = await userModel.findOne({
                            _id: req.params.admin_user_id
                        })

                        const thumb = []
            for(const data of findThumb.yesBasket){
                if((data.userId).toString() == (req.params.user_id)){
                    thumb.push(data.thumbDown)
                }
            }

            for(const data of findThumb.noBasket){
                if((data.userId).toString() == (req.params.user_id)){
                    thumb.push(data.thumbDown)
                }
            }

                        
                        res.status(status.CREATED).json(
                            new APIResponse("thumbDown Added", "true", 201, "1", {thumbDown : thumb[0]})
                        );
                    } else {

                        const checkExiestReqUserId = await thumbDownModel.findOne({
                            adminUserId: req.params.admin_user_id,
                            "thumbDetail.reqUserId": req.params.req_user_id,
                            "thumbDetail.userId": req.params.user_id
                        })

                        if (checkExiestReqUserId == null) {


                            const updateThumbYes = await userModel.updateOne(
                                {
                                    _id: req.params.admin_user_id, "yesBasket.userId": req.params.user_id
                                },

                                { $inc: { "yesBasket.$.thumbDown": 1 } }
                            )

                           
                            const updateThumbNo = await userModel.updateOne(
                                {
                                    _id: req.params.admin_user_id, "noBasket.userId": req.params.user_id
                                },

                                { $inc: { "noBasket.$.thumbDown": 1 } }
                            )
                            const findData =  await thumbUpModel.findOne(
                                { 
                                    adminUserId: req.params.admin_user_id,
                                    "thumbDetail.reqUserId": req.params.req_user_id,
                                    "thumbDetail.userId": req.params.user_id
                                }
                            );
    
                            if(findData){
    
                                await thumbUpModel.updateOne(
                                    {
                                        adminUserId: req.params.admin_user_id
                                    },
                                    {
                                        $pull: {
                                            thumbDetail: {
                                                reqUserId: req.params.req_user_id,
                                                userId: req.params.user_id
        
                                            }
                                        }
                                    }
                                );
    
                                const updateThumbYes = await userModel.updateOne(
                                    {
                                        _id: req.params.admin_user_id, "yesBasket.userId": req.params.user_id
                                    },
        
                                    { $inc: { "yesBasket.$.thumbUp": -1 } }
                                )
        
                               
                                const updateThumbNo = await userModel.updateOne(
                                    {
                                        _id: req.params.admin_user_id, "noBasket.userId": req.params.user_id
                                    },
        
                                    { $inc: { "noBasket.$.thumbUp": -1 } }
                                )
    
                            }else{
    
                            }

                                const thumbAdd = await thumbDownModel.updateOne({ adminUserId: req.params.admin_user_id },
                                    {
                                        $push: {
                                            thumbDetail: {
                                                reqUserId: req.params.req_user_id,
                                                userId: req.params.user_id
                                            }
                                        }
                                    })


                                    const findThumb = await userModel.findOne({
                                        _id: req.params.admin_user_id
                                    })
            
                                    const thumb = []
                        for(const data of findThumb.yesBasket){
                            if((data.userId).toString() == (req.params.user_id)){
                                thumb.push(data.thumbDown)
                            }
                        }
            
                        for(const data of findThumb.noBasket){
                            if((data.userId).toString() == (req.params.user_id)){
                                thumb.push(data.thumbDown)
                            }
                        }
            
                        res.status(status.CREATED).json(
                            new APIResponse("thumbDown Added", "true", 201, "1", {thumbDown : thumb[0]})
                        );

                        } else {
                            res.status(status.CREATED).json(
                                new APIResponse("Already add ThumbDown", "true", 201, "1")
                            );
                        }


                    }
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
