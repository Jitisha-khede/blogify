const {validateToken} = require('../services/authentication');
const User = require('../modals/user');

function checkForAuthenticationCookie(cookieName){
    return async(req,res,next)=>{
        const tokenCookieValue = req.cookies[cookieName];
        if(!tokenCookieValue) {
            return next();
        }
    
    try{
        const userPayload = validateToken(tokenCookieValue);
        const user = await User.findById(userPayload._id);
        req.user = user;
    }
    catch(e){}
    
    next();
}
}

module.exports = {checkForAuthenticationCookie};