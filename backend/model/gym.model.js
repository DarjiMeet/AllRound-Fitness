import mongoose from "mongoose";

const GymSchema = new mongoose.Schema({
            ownerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Owner',
                required: true,
            },
            gymName: { type: String, required: true },
            description:{type: String},
            location: {
                address: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                zipCode: { type: String, required: true },
            },
            gymUniqueId:{
                type: String,
                required:true,
                unique: true
            },
            photos:[
                {
                    name:{type:String},
                    photo:{type:String},
                    photoId:{type:String}
                }
            ],
            profileImage:{
                type:String
            },
            aminities:{
                type:[String],
                default:['']
            },
            activities:{
                type:[String],
                default:['']
            },
            membershipPlans: [
                {
                    planName: { type: String },
                    price: { type: Number},
                    duration: { type: String},
                },
            ],
            trainers: [
                {
                    name: { type: String},
                    email: { type: String},
                    contactNumber: { type: String },
                    role: { type: String}, // e.g., 'Personal Trainer', 'Zumba Trainer'
                    profilePicture: { type: String },
                    experience:{type:Number},
                    achievements:{type:String}
                },
            ],
            events: [
                {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event',
                },
            ],
            equipment: [
                {
                name: { type: String},
                photo: { type: String }, 
                quantity: { type:Number}
                },
            ],
            members: [
                {
                    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true},
                    membershipStatus: { type: String, default: 'Active' },
                    attendance: [
                        {
                            date: { type: Date },
                            weight:{type:Number},
                            workout:[
                                {
                                    exerciseName:{type:String},
                                    set:[
                                        {
                                            setNumber:{type:Number},
                                            reps:{type:Number},
                                            wt:{type:Number},
                                            unit:{type:String}
                                        }
                                    ]
                                }
                            ]
                        },
                    ],
                    totalAttendance:{
                        type:Number,
                        default:0
                    },
                    planName:{
                        type:String
                    },
                    duration:{
                        type:String
                    },
                    amountPaid:{
                        type:Number
                    },
                    startDate:{
                        type:Date,
                        required:true
                    },
                    endDate:{
                        type:Date,
                        required:true
                    },
                    profilepic:{
                        type:String
                    }
                },
            ],
            gymcontactNumber :{
                type:String,
            },
            gymEmail :{
                type:String,
            },
            gymTimings:[
                {
                   days:[String],
                   startTime: {type:String},
                   endTime: {type:String}
                }
            ],
            gymReview:[
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Review',
                },
            ],
            totalRevenue:{
                type:Number,
                default:0
            },
            avgReview:{
                type:Number,
            },
            List:{
                type:Boolean,
                default:false
            }

},{timestamps:true})

const Gym = mongoose.model('Gym',GymSchema)

export default Gym