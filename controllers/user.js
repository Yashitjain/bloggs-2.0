const {user} = require("../models/user");
const blogs = require("../models/blog");
const {setToken,getUser} = require("../service/authentication");
const cookie = require("cookie-parser");
const { verify } = require("jsonwebtoken");
var genereateOTP = 0;
var newUser = {};
async function handleCreateNewUser(req,res){
    newUser = {"userName":req.body.userName,
                    "userEmail":req.body.userEmail,
                    "userPassword":req.body.userPassword
                }
    const alluser = await user.find({});

    if(!await user.findOne({userName:req.body.userName}) && !await user.findOne({userEmail:req.body.userEmail})){
        const OTP = Math.floor(Math.random(0,1)*10000);
        genereateOTP = OTP;
        console.log(OTP);
        sendMail(req.body.userEmail,OTP,req.body.userEmail);
        return res.render("verifyOTP");
    }else{
        console.log("error");
        return res.render("signup",{
            error:"username already exists",
        });
    }
    return res.render("signin");
}

async function handleUserLogin(req,res){
    try{
        const token = await user.matchPasswordAndGenerateToken(req.query.userEmail,req.query.userPassword);
        const entry = getUser(token);
        const loggedInUserpastBlogs = await blogs.find({createdBy:entry._id});
        return res.cookie("token",token).redirect("/blog");
    }catch(error){
        console.log(error);
        return res.render("signin",{
            error:"Incorrect Password or Email",
            user:req.user,    
        });
    }
}

async function verifyOTP(req,res){
    const userOTP = req.body.otp;
    if(userOTP!=genereateOTP){
        return res.render("verifyOTP",{
            error:"Incorrect OTP"
        });
    }else{
        await user.create(newUser);
        return res.redirect("/bloggs");
    }
}

function sendMail(userEmail,OTP,userEmail){
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yashitvictus2022@gmail.com',
        pass: 'gsgq gkrv jprj rtxn'
    }
    });

    var mailOptions = {
    from: 'yashitvictus2022@gmail.com',
    to: userEmail,
    subject: 'Welcome to Bloggs',
    text: 'Hi welcome to Bloggs Family.Share your daily interesting and exciting Blogs with your friendsa nad family.\nhere is your one time password (OTP): '+OTP+'\n\n\nRegards\nBloggs'
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

async function handleFriendRequest(req,res){
    const requestToUserName = req.body.friendUserName;
    const requestFromUserName = req.user.userName;
    const requestToUserNameUser = await user.findOne({userName:requestToUserName});
    if(!requestToUserNameUser){
        return res.render("friend",{
            error:"UserName Do Not Exist",
            user:req.user
        })
    }
    const requestToUserNameFriendList=requestToUserNameUser.friend;
    const requestToUserNameFriendRequest=requestToUserNameUser.friendRequests;
    
    if(requestToUserNameFriendList.includes(requestFromUserName)) {
        return res.render("friend",{
            error:"Already Friend",
            user:req.user
        })
    }if(requestToUserNameFriendRequest.includes(requestFromUserName)) {
        return res.render("friend",{
            error:"Request Already Sent ",
            user:req.user
        })
    }
    if(requestToUserName && requestFromUserName){
        await user.findOneAndUpdate(
            {userName:requestToUserName},
            { $push: { friendRequests: requestFromUserName} });
    }

    return res.redirect("/user/friend");
}

async function handleFriend(req,res){
    
        const currentUser = await user.findOne({userName:req.user.userName});
        const friendRequests = currentUser.friendRequests;
        const currentUserFriendList = currentUser.friend;
    
    return res.render("friend",{
        pendingFriendRequest:friendRequests,
        friendList:currentUserFriendList,
        user:req.user,
        friend:"addFriend"

    })
}


async function handleAcceptFriendRequest(req,res){
    console.log(req.params.friend,typeof(req.params.friend));

    await user.findOneAndUpdate(
        {userName:req.user.userName},
        {$push:{
            friend:req.params.friend,
        }}
    );
    await user.findOneAndUpdate(
        {userName:req.params.friend},
        {$push:{
            friend:req.user.userName,
        }}
    );
    await user.findOneAndUpdate(
        {userName:req.user.userName},
        {$pull:{
            friendRequests:(req.params.friend).toString(),
        }}
    );
    await user.findOneAndUpdate(
        {userName:req.params.friend},
        {$pull:{
            friendRequests:(req.user.userName).toString(),
        }}
    );
    return res.redirect("/user/friend");
}


async function handleRejectFriendRequest(req,res){
    await user.findOneAndUpdate(
        {userName:req.user.userName},
        {$pull:{
            friendRequests:req.params.friend,
        }}
    );
    return res.redirect("/user/friend");

}
module.exports={
    handleCreateNewUser,
    handleUserLogin,
    verifyOTP,
    handleFriendRequest,
    handleFriend,
    handleAcceptFriendRequest,
    handleRejectFriendRequest
}
