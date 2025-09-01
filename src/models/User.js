const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: { type:String, required:true, unique:true },
    password: { type:String, required:true},
    name: {type:Strung, required:true}

});
// db골격구조


UserSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
// 상태값 훅 /밥크립트 암호화

UserSchema.method.compare = function(pw){
    return bcrypt.compare(pw,this.password);
}
module.exports = mongoose.model('User',UserSchema)

// 암호화 한거 보여주는거

