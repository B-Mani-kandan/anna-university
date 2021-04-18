const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Ans = require('./answer');

const qsSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    answer:[
        {
            type:Schema.Types.ObjectId,
            ref:'Ans',
            required:true
        }
    ],
    question:{
        type:String,
        required: true
    }
});


qsSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Ans.deleteMany({
            _id: {
                $in: doc.answer
            }
        })
    }
})

module.exports = mongoose.model("Qus", qsSchema);
