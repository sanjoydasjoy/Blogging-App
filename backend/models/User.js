const mongoose = require('mongoose')
const {Schema,model} = mongoose

const UserSchema = new Schema({
    username: {type:String, required: true, minlength:4, maxlength:40, lowercase: true, trim: true, unique:true},
    password: {type:String, required: true}
})

const UserModel = model('User',UserSchema)


module.exports = UserModel