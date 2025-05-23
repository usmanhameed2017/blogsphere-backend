const { Schema, model } = require("mongoose");

// Schema
const otpCodesSchema = new Schema({
    code:{
        type:String,
        trim:true,
        unique:true,
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
}, { timestamps:true });

// Model
const OtpCode = model("OtpCode", otpCodesSchema);

module.exports = OtpCode;