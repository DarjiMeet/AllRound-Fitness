import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import moment from "moment";
import Owner from "../model/owner.model.js"
import Gym from '../model/gym.model.js'
import Event from '../model/event.model.js'
import User from '../model/user.model.js'
import sendVerificationEmail from '../mail/email.js'
import Review from '../model/review.model.js'
import ChatUserOwner from '../model/userOwnerChat.model.js';

export const ownerRegister = async(req,res)=>{
    const{email,fullname,mobile,password,confirmpassword} = req.body

    
    if(!email || !password ||  !mobile || !confirmpassword || !fullname ){
        return res.status(400).json({success:false, message: "All field are required"})
    }
    
    if(password !== confirmpassword){
        return res.status(400).json({success:false, message: "Incorrect password"})
    }
    try {

        const ownerExists = await Owner.findOne({email})
        const ownermobileAlreadyExists = await User.findOne({mobile})

        if(ownerExists && ownerExists.isVerified){
            return res.status(400).json({success:false, message: "User already exist"})
        }
        if(ownerExists && ownerExists.isVerified === false){
            await Owner.deleteOne({ email })
        }
        if(ownermobileAlreadyExists){
            return res.status(400).json({success:false, message: "This mobile number already exists"})
        }

        const hashPassword = await bcryptjs.hash(password,12)


        const owner = new Owner({
            name:fullname,
            email,
            password:hashPassword,
            contactNumber:mobile
        })
        await owner.save()

        const verificationToken = await jwt.sign({ownerId:owner._id},process.env.VERIFY_EMAIL,{expiresIn:'1h'})

        const emailStatus = await sendVerificationEmail(email, verificationToken);

       if (!emailStatus.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email",
            });
        }

        return res.status(201).json({

            success:true,
            message:"User created successfully",
            owner:{
                ...owner._doc,
                password: undefined,
                mobile: undefined
            }
  
        })
    } catch (error) {
        console.log("error in register", error);
        return res.status(500).json({success:false,message:"Server error"})
    }

}

export const verifyEmail = async (req,res) => {
    const {token} = req.body
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.VERIFY_EMAIL); // Use the same secret key

        const owner = await Owner.findById(decoded.ownerId);
        if (!owner) {
            return res.status(400).json({ success: false, message: "Invalid token or user not found" });
        }

        // Update the user's email verification status
        owner.isVerified = true;
        await owner.save();

        return res.status(200).json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        console.log("Error in email verification", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


export const ownerLogin = async (req,res) => {
    const {email,password} = req.body

    try {
        const owner = await Owner.findOne({email})
        if(!owner){
            return res.status(400).json({success:false, message: "User not found"})
        }

        if(owner.isVerified === 'false'){
            return res.status(400).json({success:false, message: "User is not verified"})
        }

        const comparepassword = await bcryptjs.compare(password,owner.password)
        if(!comparepassword){
            return res.status(400).json({success:false,message:"Invalid credentials"})
        }

        const ownerId = owner._id
        const owner_token = await jwt.sign({ownerId},process.env.JWT_SECRET,{
            expiresIn: '7d'
        })

        res.cookie("owner_token",owner_token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            owner:{
                ...owner._doc,
                password:undefined,
                contactNumber:undefined, 
            }
        })
    } catch (error) {
        console.log("error in login", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const checkAuth = async (req,res) => {
    try {
        const owner = await Owner.findById( req.ownerId )
        if(!owner){
            return res.status(400).json({success:false, message:"owner not found"})
        }
        return res.status(200).json({success:true,user:{
            ...owner._doc,
            password:undefined,
            contactNumber:undefined
        }})
    } catch (error) {
        console.log("error in checkAuth", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const ownerLogout = async (req,res) => {
    res.clearCookie("owner_token")
    res.status(200).json({success: true, message:"Logged out successfully"})
}

export const createGym = async (req,res) => {
    const {gymName, gymAddress, gymCity, gymState, gymZipcode, gymNumber, gymEmail, profileUrl, aminities, activities,description, gymTiming} = req.body

    if(!gymName || !gymAddress || !gymCity || !gymState || !gymZipcode || !gymNumber || !gymEmail){
        return res.status(400).json({success:false, message: "Enter required fields"})
    }

    try {
        const ownerId = req.ownerId
        const owner = await Owner.findById(ownerId)
        if(!owner){
            return res.status(400).json({success:false, message: "User not found"})
        }
        
        const uniqueId = nanoid()
       
        const gym = new Gym({
            ownerId:ownerId,
            gymName:gymName,
            description:description,
            gymcontactNumber:gymNumber,
            gymEmail: gymEmail,
            gymUniqueId:uniqueId,
            location:{address:gymAddress, city:gymCity, state:gymState, zipCode:gymZipcode},
            aminities:aminities,
            activities:activities,
            profileImage:profileUrl,
            gymTimings:gymTiming
        })
        
        await gym.save()
       
        
        owner.gyms.push(gym._id)
        await owner.save()

       return res.status(201).json({
            success: true,
            message: "Gym created successfully",
            gymId: uniqueId,
            ownerId:gym.ownerId
        })

    } catch (error) {
        console.log("error in createGym", error);
        res.status(500).json({success:false,message:"Server error"})
    }


}

export const addMemberPlan = async (req,res) => {
    const {gymId,planName,duration,price} = req.body
    if(!gymId || !planName || !duration || !price ){
        return res.status(400).json({success:false, message: "Enter required fields"})
    }
    try {
        const ownerId = req.ownerId
        const owner = await Owner.findById(ownerId)
        if(!owner){
            return res.status(400).json({success:false, message: "User not found"})
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})
        }

        const gymMembership = await Gym.findOne({gymUniqueId:gymId,"membershipPlans.planName": planName })
        if(gymMembership){
            return res.status(400).json({success:false,message:"Membership already exist"})
        }

        gym.membershipPlans.push({planName:planName,duration:duration,price:price})
        await gym.save()

        return res.status(201).json({
            success: true,
            message: "membership plan added successfully",
            membership:gym.membershipPlans
        })
    } catch (error) {
        console.log("error in addMemberPlan", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const addEquipments = async (req,res) => {
    const {gymUniqueId,equipName,quantity,imageUrl} = req.body

    if(!equipName || !quantity || !gymUniqueId){
        return res.status(400).json({success:false, message: "gymUniqueId,equipName,quantity,category are required"})
    }

    try {
        const gym = await Gym.findOne({gymUniqueId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})
        }

        const equip = gym.equipment.some((eq)=>eq.name === equipName)
        if(equip){
            return res.status(400).json({success:false, message: "Equipment is already exists"})
        }

        gym.equipment.push({name:equipName,quantity:quantity,photo:imageUrl})
        await gym.save()

        return res.status(200).json({
            success: true,
            message: "Equipment added successfully",
            equipment:gym.equipment
        })
    } catch (error) {
        console.log("error in addEquipments", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}  

export const increaseQuantity = async (req,res) => {
    const {gymId,name} = req.body
    if(!gymId || !name ){
        return res.status(400).json({success:false, message: "gymUniqueId,equipName are required"})
    }

    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})
        }

        const equip = gym.equipment.find((eq)=>eq.name === name)
        if(!equip){
            return res.status(400).json({success:false, message: "Equipment not found"})
        }

        equip.quantity += 1
        await gym.save()

        return res.status(200).json({
            success: true,
            message: "Equipment quantity updated successfully",
            equipment:gym.equipment
        })
    } catch (error) {
        console.log("error in increaseQuantity", error);
        res.status(500).json({success:false,message:"Server error"})
    }
} 

export const decreaseQuantity = async (req,res) => {
    const {gymId,name} = req.body
    if(!gymId || !name ){
        return res.status(400).json({success:false, message: "gymUniqueId,equipName are required"})
    }

    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})
        }

        const equip = gym.equipment.find((eq)=>eq.name === name)
        if(!equip){
            return res.status(400).json({success:false, message: "Equipment not found"})
        }

        if(equip.quantity === 1){
            return res.status(400).json({success:false, message: "Cannot decrese below than one"})
        }
        
        equip.quantity -=1
        await gym.save()

        return res.status(200).json({
            success: true,
            message: "Equipment quantity updated successfully",
            equipment:gym.equipment
        })
    } catch (error) {
        console.log("error in decreaseQuantity", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}  


export const addTrainers = async (req,res) => {
    const {gymId,trainerName,trainerEmail,trainerNumber,role,profileUrl} = req.body

    if(!gymId || !trainerEmail || !trainerName || !trainerNumber ){
        return res.status(400).json({success:false, message: "Enter required fields"})
    }

    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }


        if (gym.trainers.some((tr) => tr.email === trainerEmail)) {
            return res.status(400).json({success: false, message: "Trainer already exists"});
        }

        gym.trainers.push({name:trainerName, email:trainerEmail, contactNumber:trainerNumber,role:role, profilePicture:profileUrl})

        await gym.save()

        return res.status(200).json({
            success: true,
            message: "Trianer added successfully",
            trainers: gym.trainers
        })


    } catch (error) {
        console.log("error in addTrainers", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}


export const addEvents = async (req,res) => {
    const {gymId,name,description,userType,displayPhoto,priceMember,priceNon_member,address,city,state,zipCode,startDate,startTime,endDate,endTime,contactForQuery,organizedBy,registrationEnds,MaxUser} = req.body

    if(!gymId || !name || !description || !userType || !address || !city || !state || !zipCode || !startDate || !startTime || !endDate || !endTime || !contactForQuery || !organizedBy || !registrationEnds || !MaxUser){

        return res.status(400).json({success:false, message: "Enter required fields"})
    }

    if (isNaN(priceMember) || isNaN(priceNon_member)) {
        return res.status(400).json({ success: false, message: "Invalid price format" });
    }
    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const event = new Event({
            gymId:gym._id,
            eventName:name,
            description:description,
            userType:userType,
            displayPhoto:displayPhoto,
            priceMember:priceMember,
            priceNon_member:priceNon_member,
            location:{address:address,city:city,state:state,zipCode:zipCode},
            startDate:startDate,
            startTime:startTime,
            endDate:endDate,
            endTime:endTime,
            contactInfoQuery:contactForQuery,
            organizedBy:organizedBy,
            registraionEnd:registrationEnds,
            MaxUser:MaxUser
        })
        await event.save()

        gym.events.push(event._id)
        await gym.save()

       return res.status(201).json({
            success: true,
            message: "event created successfully",
            event:event
        })

    } catch (error) {
        console.log("error in addEvents", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const addMembers = async (req,res) => {
    const {gymId, email, planName, duration, amountPaid, startDate, profileUrl} = req.body

    if(!gymId || !email || !duration || !amountPaid || !startDate || !planName){
        return res.status(400).json({success:false, message: "Enter required fields"})  
    }

    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})      
        }

        const user = await User.findOne({Email: email})
        if(!user){
            return res.status(400).json({success:false, message: "User not registered"})  
        }

        const gymuser = await Gym.findOne({gymUniqueId:gymId,"members.memberId":user._id})
        if (gymuser) {
            const existingMember = gymuser.members.find(member => member.memberId.toString() === user._id.toString());
        
            if (existingMember && existingMember.membershipStatus === 'Active') {
                return res.status(400).json({ success: false, message: "Already an active member" });
            }
        }
       
      
        const planExists = gym.membershipPlans.find(plan => plan.planName === planName);

        if (!planExists) {
            return res.status(400).json({ success: false, message: "Plan doesn't exist" });
        }
        
        const durationMatch = planExists.duration.match(/^(\d+)\s*([a-zA-Z]+)$/)

        if (!durationMatch) {
            return res.status(400).json({ success: false, message: "Invalid duration format" });
        }

        const durationValue = parseInt(durationMatch[1])
        const durationUnit = durationMatch[2].toLowerCase()

        const formatStartDate = new Date(startDate)
        
        if (isNaN(formatStartDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid start date" });
        }

        const endDate = new Date(startDate);

        if (durationUnit.startsWith("month")) { // Handles "month" or "months"
            endDate.setMonth(endDate.getMonth() + durationValue);
        } else if (durationUnit.startsWith("day")) { // Handles "day" or "days"
            endDate.setDate(endDate.getDate() + durationValue);
        } else {
            return res.status(400).json({ success: false, message: "Invalid duration unit" });
        }

        // Convert to YYYY-MM-DD format
        const formattedEndDate = endDate.toISOString().split("T")[0];

        const formattedStartDate = formatStartDate.toISOString().split("T")[0]

        if (gymuser) {
            const existingMember = gymuser.members.find(member => member.memberId.toString() === user._id.toString());
        
            if (existingMember && existingMember.membershipStatus !== 'Active') {
                existingMember.membershipStatus = 'Active';
                existingMember.planName = planName;
                existingMember.duration = duration;
                existingMember.amountPaid = amountPaid;
                existingMember.startDate = formattedStartDate;
                existingMember.endDate = formattedEndDate;
                existingMember.profilepic = profileUrl || existingMember.profilepic;
        
                await gymuser.save();
                
                return res.status(200).json({
                    success: true,
                    message: "Member updated successfully",
                    members: gym.members,
                });
            }
        }

        gym.members.push({
            memberId:user._id,
            membershipStatus:'Active',
            planName: planName,
            duration:duration,
            amountPaid:amountPaid,
            startDate:formattedStartDate,
            endDate:formattedEndDate,
            profilepic:profileUrl || user.profilePic
        })

        gym.totalRevenue += parseInt(amountPaid)
        await gym.save()

        user.GymMember.push(gym._id)
        await user.save()

        res.status(201).json({
            success: true,
            message: "member added successfully",
            members: gym.members,
        })
    } catch (error) {
        console.log("error in addMembers", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const addPhotos = async (req,res) => {
    const {gymId,photo,name} = req.body
    try {
        if(!gymId){
            return res.status(400).json({success:false, message: "gymId is required"}) 
        }
        if(!photo ){
            return res.status(400).json({success:false, message: "Photo is required"}) 
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const uniqueId = nanoid(5)

        gym.photos.push({photo:photo,name:name,photoId:uniqueId})
        await gym.save()

        return res.status(200).json({
            success: true,
            message:'Photo added successfully', 
            photos:gym.photos 
        });
    } catch (error) {
        console.log("error in addPhotos", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const addActivity = async (req,res) => {
    const {activities,gymId} = req.body
    try {
        if(!gymId){
            return res.status(400).json({success:false, message: "gymId is required"}) 
        }
        if(!Array.isArray(activities) || activities.length === 0){
            return res.status(400).json({success:false, message: "activities is required"}) 
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const newActivities = [...new Set([...gym.activities, ...activities])];
        gym.activities = newActivities;

        gym.activities = newActivities
        await gym.save()

        return res.status(200).json({
            success: true,
            message:'activities added successfully', 
            activity:gym.activities 
        });
    } catch (error) {
        console.log("error in addActivity", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const addAmenity = async (req,res) => {
    const {amenities,gymId} = req.body
    try {
        if(!gymId){
            return res.status(400).json({success:false, message: "gymId is required"}) 
        }
        if(!Array.isArray(amenities) || amenities.length === 0){
            return res.status(400).json({success:false, message: "amenities is required"}) 
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const newAmenities = [...new Set([...gym.aminities, ...amenities])];
        gym.aminities = newAmenities;

        gym.aminities = newAmenities
        await gym.save()

        return res.status(200).json({
            success: true,
            message:'amenities added successfully',  
            amenities:gym.aminities
        });
    } catch (error) {
        console.log("error in addAmenity", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const deleteGym = async (req,res) => {
    const {password,gymId} = req.body

    if(!password){
        return res.status(400).json({success:false, message: "Password is required"})    
    }

    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const ownerId = req.ownerId
        const owner = await Owner.findById(ownerId)
        if(!owner){    
            return res.status(400).json({success:false, message: "owner not exists"})   
        }

        if(!owner.gyms.includes(gym._id)){
            return res.status(400).json({success:false, message: "owner does not have this gym"}) 
        }

        const isPassword = await bcryptjs.compare(password,owner.password)
        if(!isPassword){
            return res.status(400).json({success:false, message: "Incorrect password"})  
        }

        const deleteFromOwner = await Owner.updateOne(
            {_id: ownerId},
            {$pull:{gyms:gym._id}}
        )

        const result = await Gym.deleteOne({ gymUniqueId: gymId });



        if (deleteFromOwner.modifiedCount > 0 && result.deletedCount > 0) {
            res.status(201).json({
                success: true,
                message: "gym deleted successfully",
                gymId: gymId,
                gymName: gym.gymName
            })
        } else {
            return res.status(400).json({ success: false, message: "Failed to remove the gym" })
        }
    } catch (error) {
        console.log("error in deleteGym", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const deleteTrainer = async (req,res) => {
    const {gymId,Email} = req.body
    if(!Email || !gymId){
        return res.status(400).json({success:false, message: "Trainer Email, password, gymId is required"})    
    }
    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const trainer = gym.trainers.find((t) => t.email === Email);

        if(!trainer){
            return res.status(400).json({
                success: false,
                message: "Trainer not found in this gym",
            });
        }

        const result = await Gym.updateOne(
            {gymUniqueId: gymId , "trainers.email" : Email},
            {$pull:{trainers:{email:Email}}}
        )

        if (result.modifiedCount > 0) {
            return res.status(200).json({ 
                success: true, message: "Trainer deleted successfully", trainerEamil:Email
            });
        } else {
            return res.status(400).json({ success: false, message: "Failed to delete trainer" });
        }

    } catch (error) {
        console.log("error in deleteTrainer", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const deleteEvent = async (req,res) => {
    const {gymId,eventId} = req.body

    if(!gymId || !eventId ){
        return res.status(400).json({success:false, message: "gymId, eventId, password is required"}) 
    }
    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const event = await Event.findById(eventId)
        if(!event){
            return res.status(400).json({success:false, message: "event not found"})  
        }

        if(!gym.events.map(id => id.toString()).includes(eventId.toString()) || event.gymId.toString()  !== gym._id.toString()){
            return res.status(400).json({success:false, message: "gym event not found"})
        }

        const result = await Event.deleteOne({_id:eventId})

        const result2 = await Gym.updateOne(
            {gymUniqueId: gymId},
            {$pull:{events:eventId}}
        )

        if (result.deletedCount > 0 && result2.modifiedCount > 0) {
            return res.status(200).json({ 
                success: true, message: "event deleted successfully", event:eventId
            });
        } else {
            return res.status(400).json({ success: false, message: "Failed to delete event" });
        }

    } catch (error) {
        console.log("error in deleteEvent", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const deleteMember = async (req,res) => {
    const {gymId,email} = req.body

    if(!gymId || !email){
        return res.status(400).json({success:false, message: "gymId, email, password is required"}) 
    }
    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const user = await User.findOne({Email:email})
        if(!user){
            return res.status(400).json({success:false, message: "User not found"})  
        }

        const member = gym.members.find(member => member.memberId.toString() === user._id.toString());
        if (!member) {
            return res.status(400).json({ success: false, message: "Member not found in gym" });
        }

        if (member.membershipStatus === "Active" && member.amountPaid) {
            gym.totalRevenue -= parseInt(member.amountPaid);
        }

        const deleteMem = await Gym.updateOne(
            {gymUniqueId:gymId, "members.memberId": user._id},
            {$pull:{members:{memberId:user._id}}}
        )
        const deleteGym = await User.updateOne(
            {Email:email, GymMember: gym._id},
            {$pull:{GymMember:gym._id}}
        )

        

        if (deleteMem.modifiedCount > 0) {
            return res.status(200).json({ 
                success: true, message: "Member deleted successfully", MemberEamil:email
            });
        } else {
            return res.status(400).json({ success: false, message: "Failed to delete Member" });
        }
    } catch (error) {
        console.log("error in deleteMember", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const deleteEquipment = async (req,res) => {
    const {gymId,equipName} = req.body
    if(!gymId || !equipName){
        return res.status(400).json({success:false, message: "gymId, password, equipName is required"}) 
    }

    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if(!gym){
            return res.status(400).json({success:false, message: "Gym not found"})  
        }

        const equipment = await Gym.findOne({gymUniqueId:gymId, "equipment.name":equipName})

        if(!equipment){
            return res.status(400).json({success:false, message: "Equipment not exists"}) 
        }

        const deleteEquip = await Gym.updateOne(
            {gymUniqueId:gymId, "equipment.name":equipName},
            {$pull:{equipment:{name:equipName}}}
        )

        if (deleteEquip.modifiedCount > 0) {
            return res.status(200).json({ 
                success: true, message: "Equipment deleted successfully", EquipName:equipName
            });
        } else {
            return res.status(400).json({ success: false, message: "Failed to delete Equipment" });
        }
    } catch (error) {
        console.log("error in deleteEquipment", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}   

export const getGym = async (req,res) => {
    try {
        const ownerId = req.ownerId

        const gyms = await Gym.find({ownerId:ownerId})
        if(gyms.length === 0){
            return res.status(400).json({success:false, message: "No gyms found for this owner"})
        }

            // Respond with the list of gyms
        return res.status(200).json({
            success: true,
            data: gyms,
        });

    } catch (error) {
        console.log("error in getGym", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const deleteMembership = async (req,res) => {
    const {planName,gymId} = req.body
    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }

        // Find gym by ID and select only the 'photos' field
        const gym = await Gym.findOne({gymUniqueId:gymId})

        // If no gym found
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const updatedMembershipPlans = gym.membershipPlans.filter(
            (plan) => plan.planName !== planName
        );

        if (updatedMembershipPlans.length === gym.membershipPlans.length) {
            return res.status(400).json({ success: false, message: "Membership not found" });
        }

        // Update the gym document with the new membershipPlans array
        gym.membershipPlans = updatedMembershipPlans;
        await gym.save();

        return res.status(200).json({ success: true, message: "Membership deleted successfully" });

    } catch (error) {
        console.error("Error deleting membership:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deleteActivity = async (req,res) => {
    const{activity,gymId} = req.body

    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }

        // Find gym by ID and select only the 'photos' field
        const gym = await Gym.findOne({gymUniqueId:gymId})

        // If no gym found
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const updateActivity = gym.activities.filter(
            (act) => act !== activity
        )

        if (updateActivity.length === gym.activities.length) {
            return res.status(400).json({ success: false, message: "Activity not found" });
        }

        gym.activities = updateActivity
        await gym.save();

        return res.status(200).json({ success: true, message: "activity deleted successfully" });

    } catch (error) {
        console.error("Error in deleteActivity:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
export const deleteAmenity = async (req,res) => {
    const{amenity,gymId} = req.body

    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }

        // Find gym by ID and select only the 'photos' field
        const gym = await Gym.findOne({gymUniqueId:gymId})

        // If no gym found
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const updateAmenity = gym.aminities.filter(
            (act) => act !== amenity
        )

        if (updateAmenity.length === gym.aminities.length) {
            return res.status(400).json({ success: false, message: "Amenity not found" });
        }

        gym.aminities = updateAmenity
        await gym.save();

        return res.status(200).json({ success: true, message: "amenity deleted successfully" });

    } catch (error) {
        console.error("Error in deleteAmenity:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getEvents = async (req,res) => {
    const {gymId} = req.body
    try {
        const gym = await Gym.findOne({gymUniqueId:gymId})
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }
        const events = await Event.find({gymId:gym._id})
        if(events.length === 0){
            return res.status(400).json({success:false, message: "No events found for this owner"})
        }

        events.forEach(event => {
            const currentTime = Date.now();
            const eventEndDate = new Date(event.endDate).getTime(); // Ensure this field exists in your schema
           
        
            if (currentTime > eventEndDate) {
                event.status = 'Inactive';
            }
        });

        await Promise.all(events.map(event => event.save()));

        const activeEvents = await Event.find({gymId:gym._id,status:"Active"})

        const inActiveEvents = await Event.find({gymId:gym._id,status:"Inactive"})


        return res.status(200).json({
            success: true,
            Active:activeEvents || [] ,
            Inactive:inActiveEvents || []
        });
    } catch (error) {
        console.log("error in getEvents", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const getSingleGym = async (req,res) => {
    const {gymId} = req.body
    if(!gymId){
        return res.status(400).json({
            success: false,
            message: "gymId not found",
        });
    }
    try {

        const gym = await Gym.findOne({gymUniqueId:gymId})
    
        const ownerId = req.ownerId

        const owner = await Owner.findById(ownerId)

        if (!owner) {
            return res.status(400).json({
                success: false,
                message: "Owner not found",
            });
        }


        return res.status(200).json({
            success: true,
            gyms:gym,
            ownerName: owner.name,
            ownerEmail:owner.email
        });
    } catch (error) {
        console.log("error in getGyms", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const deltePhotos = async (req,res) => {
    const {gymId,photoId} = req.body
    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }

        // Find gym by ID and select only the 'photos' field
        const gym = await Gym.findOne({gymUniqueId:gymId})

        // If no gym found
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const updateGymPhoto = gym.photos.filter(
            (photo) => photo.photoId !==photoId
        )

        gym.photos = updateGymPhoto
        await gym.save()
        // Return photos array
        res.status(200).json({ success: true, message:"photo deleted successfully" });
    } catch (error) {
        console.error("Error fetching gym photos:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const editGymDetails = async (req, res) => {
    const { gymId, gymName, gymNumber, gymEmail, description, gymAddress, gymCity, gymState, gymZipcode, profileUrl, totalRevenue, gymTiming } = req.body;

    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }

        let updateData = {}; // Initialize an empty object for dynamic updates

        if (gymName) updateData.gymName = gymName;
        if (gymNumber) updateData.gymcontactNumber = gymNumber;
        if (gymEmail) updateData.gymEmail = gymEmail;
        if (description) updateData.description = description;
        if (profileUrl) updateData.profileImage = profileUrl;
        if (totalRevenue) updateData.totalRevenue = totalRevenue;

        // Only update location if at least one field is provided
        if (gymAddress || gymCity || gymState || gymZipcode) {
            updateData.location = {};
            if (gymAddress) updateData.location.address = gymAddress;
            if (gymCity) updateData.location.city = gymCity;
            if (gymState) updateData.location.state = gymState;
            if (gymZipcode) updateData.location.zipCode = gymZipcode;
        }

        // If gymTiming is provided and it's an array, push all objects into gymTimings array
        if (Array.isArray(gymTiming) && gymTiming.length > 0) {
            updateData.$push = {
                gymTimings: { $each: gymTiming },
            };
        }


        const updatedGym = await Gym.findOneAndUpdate(
            { gymUniqueId: gymId },
            updateData,
            { new: true }
        );

        if (!updatedGym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        return res.status(200).json({ success: true, message: "Gym details updated successfully", gym: updatedGym });

    } catch (error) {
        console.error("Error updating gym details:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const getMembers = async (req, res) => {
    const { gymId } = req.body;

    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }

        const gym = await Gym.findOne({ gymUniqueId: gymId }).populate({
            path: "members.memberId",
            select: "-password -Bio -GymMember -EventParticipated"
        });

       
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        if (gym.members.length === 0) {
            return res.status(400).json({ success: false, message: "No members present" });
        }

        // Filter active and inactive members based on their membership duration
        const currentDate = moment();  // Get current date
        const activeMembers = [];
        const inactiveMembers = [];

        for (const member of gym.members) {
            if (member.memberId && member.endDate) {
                const endDate = moment(member.endDate);
                if (endDate.isAfter(currentDate)) {
                    activeMembers.push(member);
                } else {
                    inactiveMembers.push(member);
                    member.membershipStatus = 'Inactive';
        
                    // Await properly inside a loop
                    await User.updateOne(
                        { _id: member.memberId._id },
                        { $pull: { GymMember: gym._id } }
                    );
                }
            }
        }
        await gym.save()

        return res.status(200).json({
            success: true,
            activeMembers,
            inactiveMembers
        });

    } catch (error) {
        console.error("Error fetching members:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
};

export const getTrainer = async (req,res) => {
    const {gymId} = req.body

    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }


        const gym = await Gym.findOne({ gymUniqueId: gymId })
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

    
      
        return res.status(200).json({
            success: true,
            trainers:gym.trainers,
        });

    } catch (error) {
        console.error("Error fetching members:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }

}

export const getEquipments = async (req,res) => {
    const {gymId} = req.body

    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }


        const gym = await Gym.findOne({ gymUniqueId: gymId })
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

      
        return res.status(200).json({
            success: true,
            equipments:gym.equipment,
        });

    } catch (error) {
        console.error("Error fetching Equipments:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}

export const getReviews = async (req,res) => {
    const {gymId} = req.body

    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }


        const gym = await Gym.findOne({ gymUniqueId: gymId })
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const review = await Review.find({gym:gym._id})
        if(!review){
            return res.status(404).json({ success: false, message: "No reviews yet" });
        }

        const totalReview = review.reduce((acc, review)=> acc + review.star,0)
        const averageRating = (totalReview / review.length).toFixed(1)
        gym.avgReview = parseFloat(averageRating)
        await gym.save()

        return res.status(200).json({
                success: true,
                message: "Reviews retrieved successfully",
                averageRating: parseFloat(averageRating) || 0,
                reviews:review
        });


    } catch (error) {
        console.error("Error fetching Reviews:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}

export const addReviews = async (req,res) => {
    const {gymId,userName,star,comment} = req.body

    try {
        if (!gymId || !userName || !star || !comment) {
            return res.status(400).json({ success: false, message: "Gym ID, star, userName and comment are required." });
        }


        const gym = await Gym.findOne({ gymUniqueId: gymId })
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const review = new Review({
            gym:gym._id,
            userName:userName,
            star:star,
            comment:comment
        })
        await review.save()

        gym.gymReview.push(review._id)
        await gym.save()

        return res.status(200).json({
            success: true,
            message: "Review added successfully successfully",
            review:review
        });
    } catch (error) {
        console.error("Error in addReviews:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}

export const getSingleTrainer = async (req,res) => {
    const {gymId,trainerId} = req.body

    try {
        if(!gymId || !trainerId){
            return res.status(400).json({ success: false, message: "Gym ID and Trainer ID is required." });
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const trainer = gym.trainers.find((trainer)=>trainer._id.toString() === trainerId)
        if(!trainer){
            return res.status(404).json({ success: false, message: "trainer not found" });
        }

        return res.status(200).json({
            success: true,
            trainer:trainer
        });
    } catch (error) {
        console.error("Error in getSingleTrainer:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}
export const getSingleMember = async (req,res) => {
    const {gymId,memberId} = req.body

    try {
        if(!gymId || !memberId){
            return res.status(400).json({ success: false, message: "Gym ID and memberId is required." });
        }

        const gym = await Gym.findOne({ gymUniqueId: gymId }).populate({
            path: "members.memberId",
            select: "-password -Bio -GymMember -EventParticipated"
        });
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const member = gym.members.find((member)=>member._id.toString() === memberId)
        if(!member){
            return res.status(404).json({ success: false, message: "trainer not found" });
        }

        return res.status(200).json({
            success: true,
            member:member
        });
    } catch (error) {
        console.error("Error in getSingleMember:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}


export const updateTrainer = async (req, res) => {
    const { gymId, trainerId, name, email, contactNumber, role, experience, achievements, profilePicture } = req.body;

    try {
        if (!gymId || !trainerId) {
            return res.status(400).json({ success: false, message: "Gym ID and Trainer ID are required." });
        }

        const gym = await Gym.findOne({ gymUniqueId: gymId });
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        // Find the trainer inside the gym's trainers array
        const trainerIndex = gym.trainers.findIndex((trainer) => trainer._id.toString() === trainerId);
        if (trainerIndex === -1) {
            return res.status(404).json({ success: false, message: "Trainer not found" });
        }

        // Update the trainer's details
        if (name) gym.trainers[trainerIndex].name = name;
        if (email) gym.trainers[trainerIndex].email = email;
        if (contactNumber) gym.trainers[trainerIndex].contactNumber = contactNumber;
        if (role) gym.trainers[trainerIndex].role = role;
        if (experience) gym.trainers[trainerIndex].experience = experience;
        if (achievements) gym.trainers[trainerIndex].achievements = achievements;
        if (profilePicture) gym.trainers[trainerIndex].profilePicture = profilePicture;

        // Save the updated gym document
        await gym.save();

        return res.status(200).json({
            success: true,
            message: "Trainer updated successfully",
            trainer: gym.trainers[trainerIndex]
        });
    } catch (error) {
        console.error("Error in updateTrainer:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
};

export const getSingleEvent = async (req,res) => {
    const {gymId,eventId}=req.body 
    try {
        if (!gymId || !eventId) {
            return res.status(400).json({ success: false, message: "Gym ID and Trainer ID are required." });
        }


        const gym = await Gym.findOne({ gymUniqueId: gymId });
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }
        const event = await Event.findOne({ _id: eventId, gymId: gym._id });

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found for this gym." });
        }

        return res.status(200).json({ success: true, event:event });
    } catch (error) {
        console.error("Error in getSingleEvent:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}

export const updateEvent = async (req, res) => {
    try {
        const { gymId, eventId, name, description, userType, address, city, state, zipCode, startDate, startTime, endDate, endTime, contactForQuery, organizedBy, registrationEnds, MaxUser, priceMember, priceNon_member, displayPhoto } = req.body;
       // Extract event ID from request URL

       const gym = await Gym.findOne({ gymUniqueId: gymId });
       if (!gym) {
           return res.status(404).json({ success: false, message: "Gym not found" });
       }

        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Update event details
        event.name = name || event.name;
        event.description = description || event.description;
        event.userType = userType || event.userType;
        event.address = address || event.address;
        event.city = city || event.city;
        event.state = state || event.state;
        event.zipCode = zipCode || event.zipCode;
        event.startDate = startDate || event.startDate;
        event.startTime = startTime || event.startTime;
        event.endDate = endDate || event.endDate;
        event.endTime = endTime || event.endTime;
        event.contactInfoQuery = contactForQuery || event.contactInfoQuery;
        event.organizedBy = organizedBy || event.organizedBy;
        event.registraionEnd = registrationEnds || event.registraionEnd;
        event.MaxUser = MaxUser || event.MaxUser;
        event.priceMember = priceMember !== undefined ? priceMember : event.priceMember;
        event.priceNon_member = priceNon_member !== undefined ? priceNon_member : event.priceNon_member;
        event.displayPhoto = displayPhoto || event.displayPhoto;

        // Save updated event
        const updatedEvent = await event.save();

        res.status(200).json({ success: true, message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const addParticipants = async (req,res) => {
    const {email,gymId,eventId} = req.body

    try {
        if(!email || !gymId || !eventId){
            return res.status(400).json({ success: false, message: "Gym ID, eventId and email are required." });
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }
 
        const event = await Event.findOne({_id:eventId,gymId:gym._id})
        if (!event) {
            return res.status(400).json({ success: false, message: "Event not found" });
        }

        if(event.status !== 'Active'){
            return res.status(400).json({ success: false, message: "Event not active" });
        }

        if(event.totalParticipants === event.MaxUser){
            return res.status(400).json({ success: false, message: "Max number of participants reached" });
        }

        const user = await User.findOne({Email:email})
        if(!user){
            return res.status(404).json({ success: false, message: "User not registered" });
        }

        if(event.userType === 'membersOnly' && !user.GymMember.map(id => id.toString()).includes(gym._id.toString())){
            return res.status(400).json({ success: false, message: "User is not a member" });
        }

        
        if(event.participants.includes(user._id)){
            return res.status(404).json({ success: false, message: "User already present in event" });
        }


        event.participants.push(user._id)
        event.totalParticipants += 1

        const isMember = user.GymMember.includes(gym._id);
        const eventPrice = isMember ? event.priceMember : event.priceNon_member;
        event.totalRevenue += eventPrice;
        await event.save()

        user.EventParticipated.push(eventId)
        await user.save()

        const participants = await User.find({EventParticipated:eventId})

        const sanitizedParticipants = participants.map(user => {
            // Find matching member in gym.members
            const matchedMember = gym.members.find(member => 
                member?.memberId?._id?.toString() === user?._id?.toString()
            );
        
            return {
                ...user._doc,
                profilePic: user.profilePic || matchedMember?.profilepic,
                Member: user.GymMember.includes(gym._id)? 'Yes' : 'No',  // Ensure correct property name
                password: undefined,
                mobile: undefined,
                Bio: undefined,
                GymMember: undefined,
                EventParticipated: undefined
            };
        });


        return res.status(200).json({ success: true, message: "Participants added successfully", participants:sanitizedParticipants, event:event});
    } catch (error) {
        console.error("Error adding participant:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getParticipants = async (req,res) => {
    const {gymId,eventId} = req.body

    try {
        if( !gymId || !eventId){
            return res.status(400).json({ success: false, message: "Gym ID, eventId are required." });
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }
 
        const event = await Event.findOne({_id:eventId,gymId:gym._id})
        if (!event) {
            return res.status(400).json({ success: false, message: "Event not found" });
        }

        const participants = await User.find({EventParticipated:eventId})

        const sanitizedParticipants = participants.map(user => {
            // Find matching member in gym.members
            const matchedMember = gym.members.find(member => 
                member?.memberId?._id?.toString() === user?._id?.toString()
            );
        
            return {
                ...user._doc,
                profilePic: user.profilePic || matchedMember?.profilepic,
                Member: user.GymMember.includes(gym._id)? 'Yes' : 'No',  // Ensure correct property name
                password: undefined,
                mobile: undefined,
                Bio: undefined,
                GymMember: undefined,
                EventParticipated: undefined
            };
        });


        return res.status(200).json({ success: true, participants:sanitizedParticipants });
    } catch (error) {
        console.error("Error fetching participants:", error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const deleteParticipants = async (req,res) => {
    const {email,gymId,eventId} = req.body

    try {
        if( !gymId || !eventId || !email){
            return res.status(400).json({ success: false, message: "Gym ID, eventId and Email are required." });
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }
 
        const event = await Event.findOne({_id:eventId,gymId:gym._id})
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const user = await User.findOne({Email:email})
        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if(!event.participants.includes(user._id)){
            return res.status(404).json({ success: false, message: "User not found in event" });
        }

        event.totalParticipants -=1
        const isMember = user.GymMember.includes(gym._id);
        const eventPrice = isMember ? event.priceMember : event.priceNon_member;
        event.totalRevenue -= eventPrice;
        await event.save()

        await Event.updateOne(
            { _id: eventId },
            { $pull: { participants: user._id } }
        );

        // Remove event from user's EventParticipated array
        await User.updateOne(
            { Email: email },
            { $pull: { EventParticipated: eventId } }
        );

        return res.status(200).json({ success: true, message: "User removed from event successfully.",event:event });

    } catch (error) {
        console.error("Error in deleteParticipants:", error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const setList = async (req,res) => {
    const {gymId,List} = req.body

    try {
        if( !gymId ){
            return res.status(400).json({ success: false, message: "Gym ID are required." });
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }
        
        gym.List = List
        await gym.save()

        if(List === true){
            return res.status(200).json({ success: true, message: "Gym added to listing" });
        }
        else{
            return res.status(200).json({ success: true, message: "Gym remove from listing" });
        }
    } catch (error) {
        console.error("Error in setList:", error);
        return res.status(500).json({ success: false, message: "Internal server error" }) 
    }
}

export const deleteGymTiming = async (req, res) => {
    const { gymId, timingId } = req.body;

    try {
        if (!gymId || !timingId) {
            return res.status(400).json({ success: false, message: "Gym ID and Timing ID are required" });
        }

        const gym = await Gym.findOne({gymUniqueId:gymId})
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const updatedGym = await Gym.findByIdAndUpdate(
            gym._id,
            { $pull: { gymTimings: { _id: timingId } } }, // Remove the timing object
            { new: true }
        );

        if (!updatedGym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        return res.status(200).json({ success: true, message: "Timing deleted successfully", gym: updatedGym });

    } catch (error) {
        console.error("Error deleting gym timing:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const markAttendance = async (req,res) => {
    try {
        const { memberId, gymId } = req.body;
    
        if (!memberId || !gymId) {
          return res.status(400).json({ success: false, message: "Member ID and Gym ID are required" });
        }
    console.log(memberId)
        // Get today's date in "YYYY-MM-DD" format
        const today = new Date();
        const todayDate = today.toISOString().split("T")[0];
    
        // Find the gym and member
        const gym = await Gym.findOne({gymUniqueId:gymId});
        if (!gym) {
          return res.status(404).json({ success: false, message: "Gym not found" });
        }
    
        // Find the member inside the gym
        const memberIndex = gym.members.findIndex(m => m._id.toString() === memberId.toString());
        if (memberIndex === -1) {
          return res.status(404).json({ success: false, message: "Member not found in this gym" });
        }
    
        const member = gym.members[memberIndex];
    
        // Check if attendance is already marked for today
        const isAlreadyMarked = member.attendance.some(att => att.date.toISOString().split("T")[0] === todayDate);
        if (isAlreadyMarked) {
          return res.status(400).json({ success: false, message: "Attendance already marked for today" });
        }
    
        // Add today's date to attendance array
        member.attendance.push({ date: today });
    
        // Increment totalAttendance count
        member.totalAttendance += 1;
    
        // Save changes
        await gym.save();
    
        res.status(201).json({ success: true, message: "Attendance marked successfully", totalAttendance: member.totalAttendance });
      } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
      }
}

export const getRecentChat = async (req, res) => {
    try {
        const ownerId = req.ownerId;

        // Fetch all chats where the user is involved
        const chats = await ChatUserOwner.find({
            $or: [{ sender: ownerId }, { receiver: ownerId }],
        })
        .sort({ createdAt: -1 }); // Sort by most recent

        // Batch populate senders and receivers
        const senderIds = chats.map(chat => chat.sender);
        const receiverIds = chats.map(chat => chat.receiver);
        const uniqueIds = [...new Set([...senderIds, ...receiverIds])];

        const users = await User.find({ _id: { $in: uniqueIds } }).select("UserName profilePic name email profile");
        const owners = await Owner.find({ _id: { $in: uniqueIds } }).select("UserName profilePic name email profile");

        const populatedChats = chats.map(chat => {
            const sender = chat.senderType === "User"
                ? users.find(user => user._id.equals(chat.sender))
                : owners.find(owner => owner._id.equals(chat.sender));

            const receiver = chat.receiverType === "User"
                ? users.find(user => user._id.equals(chat.receiver))
                : owners.find(owner => owner._id.equals(chat.receiver));

            return {
                ...chat.toObject(),
                sender,
                receiver,
            };
        });

        // Map chats to unique chat partners
        const mapChats = (chats, ownerId) => {
            return Object.values(
                chats.reduce((acc, chat) => {
                    const chatPartner = chat.sender._id.equals(ownerId) ? chat.receiver : chat.sender;
                    if (!acc[chatPartner._id]) {
                        acc[chatPartner._id] = {
                            _id: chat._id,
                            chatPartner,
                            lastMessage: chat.message,
                            lastMessageAt: chat.createdAt,
                        };
                    }
                    return acc;
                }, {})
            );
        };

        // Separate and map user-to-user and user-to-owner chats
        const recentOwnerToOwnerChats = mapChats(
            populatedChats.filter(chat => chat.senderType === "Owner" && chat.receiverType === "Owner"),
            ownerId
        );

        const recentUserToOwnerChats = mapChats(
            populatedChats.filter(chat =>
                (chat.senderType === "User" && chat.receiverType === "Owner") ||
                (chat.senderType === "Owner" && chat.receiverType === "User")
            ),
            ownerId
        );

        // Return the results
        res.status(200).json({
            success: true,
            ownerToownerChats: recentOwnerToOwnerChats,
            userToOwnerChats: recentUserToOwnerChats,
        });
    } catch (error) {
        console.error("Error fetching recent chats:", error);
        res.status(500).json({ success: false, message: "Failed to fetch recent chats" });
    }
};

export const newMessages = async (req, res) => {
    try {
        const ownerId = req.ownerId; // Get logged-in user ID

        // Find all messages sent to this user that are not yet delivered
        const undeliveredMessages = await ChatUserOwner.find({
            receiver: ownerId,
            status: "sent" // Only messages that are not yet delivered
        }).sort({ createdAt: -1 });

        if (undeliveredMessages.length === 0) {
            return res.status(200).json({ success: true, users: [] });
        }

        // Get unique senders from undelivered messages
        const senderIds = [...new Set(undeliveredMessages.map(msg => msg.sender.toString()))];

        // Fetch sender details based on senderType (User or Owner)
        const users = await Promise.all(senderIds.map(async (senderId) => {
            const message = undeliveredMessages.find(msg => msg.sender.toString() === senderId);
            if (message.senderType === "User") {
                const user = await  User.findById(senderId).select("UserName profilePic");
                return {...user.toObject(), senderType:"User"}
            } else if (message.senderType === "Owner") {
                const owner = await Owner.findById(senderId).select("UserName profilePic");
                return { ...owner.toObject(), senderType: "Owner" };
            }
        }));

        // Filter out null values (if any)
        const filteredUsers = users.filter(user => user !== null);

        return res.status(200).json({ success: true, users: filteredUsers });

    } catch (error) {
        console.error("Error fetching new messages:", error);
        res.status(500).json({ success: false, error: "Failed to fetch new messages" });
    }
};

export const ownerDetails = async (req,res) => {
    try {
        const owner = await Owner.findById( req.ownerId )
        if(!owner){
            return res.status(400).json({success:false, message:"owner not found"})
        }

        res.status(200).json({ success: true, owner:{
            ...owner._doc,
            password:undefined,
            
        } });
    } catch (error) {
        console.error("Error in userDetails:", error);
        res.status(500).json({ success: false, message: "Server error" }); 
    }
}

export const getAllUsers = async (req, res) => {
    try {
       
        const users = await User.find();

        // Sanitize user data
        const sanitizedUsers = users.map((user) => {
            const { password, mobile, Bio, GymMember, EventParticipated, ...safeData } = user.toObject();
            return safeData;
        });

       

        res.status(200).json({ success: true, message: "Users retrieved successfully", users: sanitizedUsers });
    } catch (error) {
        console.error("getAllUsers Error:", error);
        res.status(500).json({ success: false, error: "Failed to get users" });
    }
};

export const getAllOwners = async (req, res) => {
    try {
        const ownerId = req.ownerId
        const owners = await Owner.find();

        // Sanitize user data
        const sanitizedOwners = owners.map((user) => {
            const { password, contactNumber, gyms, isVerified, ...safeData } = user.toObject();
            return safeData;
        });

        const sanitized = sanitizedOwners.filter(u=>u._id.toString() !== ownerId.toString())

        res.status(200).json({ success: true, message: "Users retrieved successfully", owners: sanitized });
    } catch (error) {
        console.error("getAllUsers Error:", error);
        res.status(500).json({ success: false, error: "Failed to get users" });
    }
};

export const fetchSingleUser = async (req,res) => {
    try {
        const {userId} = req.body

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({ success: false, error: "user not found" });
        }

        res.status(200).json({ success: true, user:{
            ...user._doc,
            password:undefined,
            Bio:undefined,
            Mobile:undefined,
            GymMember:undefined,
            EventParticipated:undefined
        } });
    } catch (error) {
        console.error("fetchSingleUser Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch single users" });   
    }
}


export const deleteForMe = async (req,res) => {
    const {messageId} = req.body

    try {
        const userId = req.ownerId
        if (!userId) {
            return res.status(400).json({ error: "Owner ID is required" });
        }

        const messages =  await ChatUserOwner.updateOne(
            { _id: messageId },
            { $addToSet: { hiddenBy: userId } } // Add userId to "hiddenBy" array (prevents duplicates)
        );
        res.json({ success: true, message: "Message hidden successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to hide message" });  
    }
}

export const fetchSingleOwner = async (req, res) => {
    try {

        const { ownerId } = req.body;

        // Check if ownerId is provided
        if (!ownerId) {
            return res.status(400).json({ success: false, message: "Owner ID is required" });
        }

        // Fetch the owner from the database
        const owner = await Owner.findById(ownerId).select("-password -contactNumber -gyms"); // Exclude the password field

        // Check if the owner exists
        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        // Return the owner details
        res.status(200).json({ success: true, owner });
    } catch (error) {
        console.error("Error fetching owner details:", error);
        res.status(500).json({ success: false, message: "Failed to fetch owner details" });
    }
};

