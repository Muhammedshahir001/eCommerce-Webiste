const notLogged = (req, res, next) => {
    try {
        if (req.session.userIn) {
            res.redirect('/')
        }
        else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logged = (req, res, next) => {
    try {

        if (req.session.userIn) {
            next()
        }
        else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    logged,
    notLogged,
}