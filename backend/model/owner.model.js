import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
      },
    contactNumber: {
          type: String,
          required: true,
      },
    profile:{
        type:String
    },
    gyms: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Gym',
        },
      ],
    isVerified:{
        type:String,
        default:false
    }

},{timestamps:true})

const Owner = mongoose.model('Owner',OwnerSchema)

export default Owner