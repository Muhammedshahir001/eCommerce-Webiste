const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const productschema = new mongoose.Schema({
    productname:{
        type:String,
       
    },
    brand:{
        type:String,
       
    },
    price:{
        type:Number,
        
    },
    offerPrice: {
        type: Number,

    },
    description:{
        type:String,
        
    },
    quantity:{
        type:Number,
       
    },
    category:{
        type:ObjectId,
        ref:"Category",
        
    },
    image:{
        type:Array,
       
    },
    // deleted:{
    //     type:Boolean,
    //     default:true
    // },
    status: {
        type: Boolean,
        default: false,
    },

});

module.exports = mongoose.model('products',productschema)




