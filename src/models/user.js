const { Schema, model } = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const bcrypt = require("bcrypt");

// Schema
const userSchema = new Schema({
    gid:{
        type:String
    },
    fid:{
        type:String
    },
    fname:{
        type:String,
        trim:true,
        required:true
    },
    lname:{
        type:String,
        trim:true
    },
    age:{
        type:Number
    },
    gender:{
        type:String,
        enum:["Male", "Female", "Other"],
        trim:true
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
        unique:true,
        required:true,
    },
    username:{
        type:String,
        trim:true,
        lowercase:true,
        unique:true,
        index:true,
        required:true
    },
    password:{
        type:String,
        trim:true,
        required:true
    },
    role:{
        type:String,
        enum:["Admin", "User"],
        default:"User",
        required:true
    },
    profile_image:{
        type:String
    }    
}, { timestamps:true });

// Inject paginate plugin
userSchema.plugin(aggregatePaginate);

// Hash password
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    try 
    {
        this.password = await bcrypt.hash(this.password, 10);
        return next();
    } 
    catch (error) 
    {
        console.log(error.message);
        return next();
    }
});

// Match password
userSchema.methods.matchPassword = async function(password) {
    if(!password) return false;
    try 
    {
       return await bcrypt.compare(password, this.password); 
    } 
    catch (error) 
    {
        console.log(error.message);
        return false;
    }
}

// Is user exist
userSchema.static("isUserExist", async function(email, username) {
    try 
    {
        const user = await this.findOne({ $or:[{ email }, { username }] });
        if(!user) return null;
        return user;
    } 
    catch (error) 
    {
        console.log(error.message);
        return null;
    }
});

// Model
const User = model("User", userSchema);

module.exports = User;