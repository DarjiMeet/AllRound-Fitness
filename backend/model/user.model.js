import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    Fullname:{
        type:String,
        required:true
    },
    UserName:{
        type:String,
        required:true,
        unique:true,
    },
    Email:{
        type:String,
        required:true,
        unique:true,  
    },
    Mobile: {
        type: String,
        required: true,
    },
    password:{
        type:String,
        required:true
    },
    Bio:{
        type:String
    },
    GymMember:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Gym'
        }
    ],
    EventParticipated:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Event'
        }
    ],
    profilePic:{
        type:String
    }
    
},{timestamps:true})

const User = mongoose.model('User',UserSchema)

export default User