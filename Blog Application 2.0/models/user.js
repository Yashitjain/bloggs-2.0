const mongoose = require("mongoose");
const {setToken,getUser} = require("../service/authentication")
const {createHmac,randomBytes} = require("crypto");
const schema = {
    userName:{
        type:String,
        require:true,
        unique:true
    },
    userEmail:{
        type:String,
        require:true,
        unique:true
    },
    userPassword:{
        type:String,
        require:true
    },
    salt:{
        type:String,
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER"
    },
    profilePicture:{
        type : String,
        default:"default_avatar.png"
    },
    friend:[
            {
                type:String,
                require:false,
            },
        ],
    friendRequests:[
        {
            type:String,
            require:false,
        },
    ]

}

const userSchema = new mongoose.Schema(schema,{timeStamp:true});
userSchema.pre("save",function(next){
    const user = this;
    if(!user.isModified("userPassword")) return ;
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256',salt).update(user.userPassword).digest("hex");

    this.salt=salt;
    this.userPassword=hashedPassword;
    next();
})


userSchema.static("matchPasswordAndGenerateToken",async function (userEmail,userPassword){
    const user = await this.findOne({userEmail}); 
    if(!user) throw new Error("Incorrect Email");
    const hashPassword = user.userPassword;
    const salt = user.salt;

    const providPasswordHash = createHmac('sha256',salt).update(userPassword).digest("hex");
    if(providPasswordHash.localeCompare(hashPassword)!=0) {
        throw new Error("Incorrect Password");
    }
    const token = setToken(user);

    return token;
})

const user = mongoose.model("blogUsers",userSchema);


module.exports = {user,mongoose};