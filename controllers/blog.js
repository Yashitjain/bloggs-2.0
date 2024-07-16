const blogs = require("../models/blog");
const comments = require("../models/comment");
const {user} = require("../models/user");
const {getUser} = require("../service/authentication");
const mongoose = require("mongoose");


async function handleCreateNewPost(req,res,fileName){
        const token = req.cookies.token;
        const userDetails = getUser(token);
        const entry = await user.findOne({userEmail:userDetails.userEmail,userName:userDetails.userName});
        const post = {
            "message":req.body.blogPost,
            "createdBy":entry._id,
            "title":req.body.title,
            'thumbnail':fileName
        }
        
        blogs.create(post);
        // const loggedInUserpastBlogs = await blogs.find({createdBy:entry._id});
        return res.redirect("/blog");
    
}

async function handleBlogPage(req,res){
    const token = req.cookies.token;
    const userDetails = getUser(token);
    const entry = await user.findOne({userName:userDetails.userName,userEmail:userDetails.userEmail});
    
    const friend = (await user.findOne(entry)).friend;
    const idToName = new Map();
    friend.push(req.user.userName);
    const allusers = await user.find({})
    for(let i=0;i<friend.length;i++){
        idToName.set(((await user.findOne({userName:friend[i]}))._id).toString(),friend[i]);
        friend[i]=(await user.findOne({userName:friend[i]}))._id;
    }
    allusers.forEach(element => {
        idToName.set((element._id).toString(),element.userName);
    });
    console.log(idToName);
    const friendsBlogsToDisplay = await blogs.find({createdBy:{$in:friend}});
    const othersBlogsToDisplay = await blogs.find({createdBy:{$nin:friend}})
    const blogsToDisplay=othersBlogsToDisplay.concat(friendsBlogsToDisplay);
    console.log(typeof blogsToDisplay);
    let allblogs=[];

    console.log(idToName);
    blogsToDisplay.forEach(async blog => {
        blog["userName"] =  idToName.get((blog.createdBy).toString());
        allblogs.push(blog);
    });

    return res.render("blogs",{
        allBlogs:allblogs,
        blogCreater: await user.findById(entry._id),
        user:req.user,
    });
}

async function handleBlogId(req,res){
    if(mongoose.Types.ObjectId.isValid(req.params.blogId)){
        const blog = await blogs.findById(req.params.blogId);
        // console.log(await blog.populate("createdBy"));
        const obj = await blog.populate("createdBy");
        console.log(obj.userName);
        console.log(await blog.createdBy);

        const blogCreator = await user.findById(blog.createdBy);
        const allcomments = await comments.find({blogId:blog._id});
        
        return res.render("viewComment",{
            blog:blog,
            creator:blogCreator,
            user:req.user,
            allcomments:allcomments
        });
    }else{
        return res.redirect("/blog");
    }
  

} 

async function handleBlogComment(req,res){
    if(!req.query.comment || !notEmpty(req.query.comment)){
        return res.redirect("/blog/"+req.params.blogId);
    }
    if(mongoose.Types.ObjectId.isValid(req.params.blogId)){
        const blog = await blogs.findById(req.params.blogId);
        console.log(await blog.populate("createdBy"))
        const doc = {
        comment:req.query.comment,
        blogId:blog._id,
        createdBy:req.user.userName,
        }
        await comments.create(doc);
        return res.redirect("/blog/"+blog._id);
    }else{
        return res.redirect("/blog");
    }
    
}

function notEmpty(content){
    for(let i=0;i<content.length;i++){
        if(content[i]!=' '){
            return true;
        }
    }
    return false;
}

module.exports = {handleCreateNewPost,handleBlogPage,handleBlogId,handleBlogComment}