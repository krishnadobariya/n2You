const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DBURL).then(() => {
    console.log('mongodb connected...!');
}).catch((error) => {
    console.log(`error ==> ${error}`);
})
