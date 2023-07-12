const mongoose=require("mongoose")

const userschema=mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    number:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:false,
    },
    is_verified:{
        type:Boolean,
        default:false       
    },
    address:[{
        name:{
            type:String,
            required:true,

        },
        phone:{
            type:String,
            required:true,
        },
        conutry:{
            type:String,
            required:true,
        },
        town:{
            type:String,
            required:true,
        },
        street: {
            type: String,
            required: true,
        },
        district:{
            type:String,
            required:true,
        },
        postcode:{
            type:String,
            required:true,
        },
    
    }],
    wallet:{
        type:Number,
        default:0,
    },
    wallehistory:[{
        peramount:{
            type:Number,

        },
        date:{
            type:String
        }
    }]
})

userschema.statics.isExistingEmail = async function (email) {

    try {

        const user = await this.findOne({ email });
        if (user) return false;

        return true;

    } catch (error) {
        console.log('error is inside isExistingEmail', error.message);
        return false;
    }


}
userschema.statics.isExistingUserName = async function (userName) {

    try {

        const user = await this.findOne({ name: userName });

        if (user) return false;

        return true;

    } catch (error) {
        console.log('the error is in isExistingUsername function', error.message);
    }
}

//user collection and export-------------------
module.exports=mongoose.model("user",userschema)