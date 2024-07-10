const blogs = require("../models/blog");
const {user} = require("../models/user");
const express = require("express");
const blogRoute = express.Router();
const path = require("path");
const multer = require("multer");
const {getUser} = require("../service/authentication");
const {handleCreateNewPost,handleBlogPage,handleBlogId,handleBlogComment} = require("../controllers/blog");
var fileName = '';

blogRoute.use(express.static(path.join(__dirname,"../views")));
blogRoute.use(express.static(path.resolve("public")));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
      const user = getUser(req.cookies.token);
      console.log("originalname",file.originalname);
      fileName=file.fieldname + '_' + user.userName + '_' + Date.now()+'_'+file.originalname.replace(/ /gi,"_");
      console.log("storage",fileName);
      cb(null, fileName);
    }
  })
  
const upload = multer({ storage: storage })

blogRoute.get("/",handleBlogPage);
blogRoute.post("/post",upload.single('thumbnail'),(req,res)=>{
    console.log("img uploaded in db");
    handleCreateNewPost(req,res,fileName);
    fileName='';
});

blogRoute.get("/:blogId",handleBlogId);

blogRoute.get("/comment/:blogId",handleBlogComment);

module.exports = blogRoute;