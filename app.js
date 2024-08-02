const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser");
const app = express();
const {checkForAuthentication} = require("./middlewares/user")

require('dotenv').config()


//middlewares
app.use(cookieParser());
app.use(express.urlencoded({extends:false}));
app.use('/',express.static(path.resolve('/public')))
app.use(express.static(path.join(__dirname,"views")))
app.use(checkForAuthentication("token"));

//connection
const {user,mongoose} = require("./models/user");
mongoose.connect(process.env.MONGO_URL).then(console.log("DB connected")).catch((err) => console.log(err));

//views
app.set("view engine","ejs");
app.set("views","views");

//routes
app.get("/",(req,res)=>{
    res.render("home.ejs",{
        user:req.user,
    })
})
app.get("/bloggs",(req,res)=>{    
    res.render("signin",{
        user:req.user,
    });
})
app.get("/signup",(req,res)=>{
    res.render("signup",{
        user:req.user,
    });

})

const route  = require("./routes/user");
app.use("/user",route);

const blogRoute = require("./routes/blog");
app.use("/blog",blogRoute);


PORT = process.env.PORT || 8000
app.listen(PORT,console.log("server started",PORT));
