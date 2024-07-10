const {user} = require("../models/user");
const {getUser} = require("../service/authentication")
async function handlePasswordMatchConfirmPassword(req,res,next){
    if(!req.body.userPassword || !req.body.userConfirmPassword ){
        return res.redirect("/signup");
    } 
    else if(req.body.userPassword!= req.body.userConfirmPassword ){
        return res.redirect("/signup");
    } 
    else {
        return next()
    };
} 


function checkForAuthentication(cookieName){
    return function(req,res,next) {
        const token = req.cookies[cookieName];
        if(!token){
            return next();
        }

        try{
            if(token) {
                const payLoad = getUser(token);
                req.user = payLoad;
            }
        }catch(error){

            console.log(error);
            return next();
        }

        return next();
    }   
}

module.exports = {handlePasswordMatchConfirmPassword,checkForAuthentication}