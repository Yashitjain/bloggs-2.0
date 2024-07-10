const JWT = require("jsonwebtoken");
const secret = "fidsfiusbc$#%@fdskfnq#$%W#%2ndsiw3%w3";

function setToken(user){
    const payload = {
                    "id":user._id,
                    "userName":user.userName,
                    "userEmail":user.userEmail,
                    "role":user.role,
                    "profilePicture":user.profilePicture
                }
    return JWT.sign(payload,secret);

}

function getUser(token){
    const user = JWT.verify(token,secret.toString());
    return user;
}

module.exports = {setToken,getUser};