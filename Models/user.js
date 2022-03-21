import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = mongoose.Schema({

    email: String,
    username: String,
    password:String,
    balance:String
})

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcryptjs.hash(this.password, 12)
})

UserSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password)
}

const User = mongoose.model("users", UserSchema)

export default User;