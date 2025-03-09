import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    gym:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
    },
    userName:{
        type:String,
        required:true
    },
    comment:{
        type:String,
        required:true,
    },
    star:{
        type:Number,
        required:true
    }
})

const Review = mongoose.model('Review',reviewSchema)
export default Review