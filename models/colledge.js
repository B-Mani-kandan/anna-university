const mongoose = require('mongoose');
const s=mongoose.Schema;
const Review = require('./review')
const Qus = require('./question');
const opts = { toJSON: { virtuals: true } };


const colledgeSchema= new s({
    NameoftheCollege:String,
    Address:String,
    NameofthePrincipal:String,
    PhoneNumber:String,
    location:String,
    FaxNumber : String,
    Latitude:String,
    Longitude:String,
    geometry: {
        type: {
            type: String,
            enum: ['point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    img:[{
        url:String,
        filename:String
    }],
    WebSite :String,
    EmailID:String,
    YearofEstablishment:Number,
    Type:String,
    MinorityStatus:String,
    ExistingCourses:Array,
    author: {
        type: s.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: s.Types.ObjectId,
            ref: 'Review'
        }
    ],
    question:[
        {
            type:s.Types.ObjectId,
            ref:'Qus'
        }
    ]
},opts);


colledgeSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/colledge/${this._id}">${this.NameoftheCollege}</a><strong>`
});

colledgeSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('colledge',colledgeSchema);