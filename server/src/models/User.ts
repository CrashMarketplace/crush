import {Schema, model } from "mongoose";

const UserSchema = new Schema(
    {
        userId: {type: String, required: true,unique:true },
        passwordHash: {type: String,required:true },
        email: {type: String,required: true, unique: true},
        emailVerified: {type: Boolean,default: false},
    },
    {timestamps: true}
);
export default model("User",UserSchema);
