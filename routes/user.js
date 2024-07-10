const express = require("express")
const route = express.Router();
const {
    handleCreateNewUser,
    handleUserLogin,
    verifyOTP,
    handleFriendRequest,
    handleFriend,
    handleAcceptFriendRequest,
    handleRejectFriendRequest
} = require("../controllers/user");
const {handlePasswordMatchConfirmPassword} = require("../middlewares/user")

const path = require("path");
const exp = require("constants");

route.use(express.static(path.join(__dirname,"../views")));
route.use(express.static(path.resolve("public")));

route.get("/friend",handleFriend);
route.post("/addFriend",handleFriendRequest);
route.post("/verification",verifyOTP)
route.post("/signup",handlePasswordMatchConfirmPassword,handleCreateNewUser);
route.get("/signin",handleUserLogin);
route.get("/acceptFriendRequest/:friend",handleAcceptFriendRequest);
route.get("/rejectFriendRequest/:friend",handleRejectFriendRequest);

route.get("/logout",(req,res)=>{
    return res.clearCookie("token").render("home");
})
module.exports = route;   