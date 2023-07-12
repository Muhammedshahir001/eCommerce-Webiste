const user = require("../models/usermodel")

const  blockfunction  =  async (req,res,next)=>{
    const userData = await user.findOne({email:req.body.email})
    if(userData?.status == true){
        res.render("user/Login",{message:"your blocked"})
    }else{
        next()
    }
}


module.exports = blockfunction

