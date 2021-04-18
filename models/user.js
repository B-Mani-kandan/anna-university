const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalmongoose=require('passport-local-mongoose');


const uS=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:String
});

uS.plugin(passportLocalmongoose);

module.exports=mongoose.model('User',uS);