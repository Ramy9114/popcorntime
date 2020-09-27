module.exports = {
    ensureNotAuthenticated: function(req, res, next){
        if(!req.isAuthenticated()){
            return next()
        }

        res.flash('error_msg', 'you are already logged in')
    }
}