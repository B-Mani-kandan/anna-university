const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const answerSchema = new Schema({
    answer: {
        type:String,
        required:true
    }
    ,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});


module.exports = mongoose.model("Ans", answerSchema);
