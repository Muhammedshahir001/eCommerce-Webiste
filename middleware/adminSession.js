const notLogged = (req,res,next) =>{
    try {
        if(req.session.login){
            res.redirect('admin/home')
        }
        else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logged = (req,res,next) =>{
    try {
        
        if(req.session.login){
            next()
        }
        else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    logged,
    notLogged,
}