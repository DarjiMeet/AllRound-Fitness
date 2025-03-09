import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    eventName: { type: String, required: true },
    description: { type: String, required:true  },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    displayPhoto:{
        type:String
    },
    userType:{
        type:String,
        required:true
    },
    priceMember:{
        type:Number,
        required:true
    },
    priceNon_member:{
        type:Number,
        required:true
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
    },
    startDate: {
        type: Date, // Represents the day of the event
        required: true,
    },
    endDate: {
        type: Date, // Represents the day of the event
        required: true,
    },
    startTime: {
        type: String, // Example: '09:00 AM'
        required: true,
    },
    endTime: {
        type: String, // Example: '11:00 AM'
        required: true,
    },
    contactInfoQuery:{
        type:String,
        required:true
    },
    organizedBy:{
        type:String,
        required:true
    },
    registraionEnd:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        default:'Active'
    },
    MaxUser:{
        type:Number,
        required:true
    },
    totalParticipants:{
        type:Number,
        default:0
    },
    totalRevenue:{
        type:Number,
        default:0
    }
  },{timestamps:true});

const Event = mongoose.model('Event',EventSchema)

export default Event