const Mongoose = require("mongoose");
const Schema = Mongoose.Schema

let UserInfo = new Schema({
    user_id:{
        type: String
    },
    user_name:{
        type:String
    },

    user_email:{
        type:String
    },
    user_password:{
        type:String
    },
    user_subscribers:{
        type:Array
    },
    user_subscribed:{
        type:Array
    }


});

module.exports = Mongoose.model('UserInfos',UserInfo)