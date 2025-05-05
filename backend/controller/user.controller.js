import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from "../model/user.model.js";
import Gym from '../model/gym.model.js';
import Owner from '../model/owner.model.js';
import Stripe from "stripe";
import Event from '../model/event.model.js';
import Chat from '../model/chat.model.js';
import UserChat from '../model/userChat.model.js';
import ChatUserOwner from '../model/userOwnerChat.model.js';
import Review from '../model/review.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET)

export const userRegister = async (req,res) => {
    const { fullname, UserName, email, mobile, password, profilePic } = req.body;

    if (!fullname || !UserName || !email || !mobile || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ Email:email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        // Hash password
    
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create new user
        const newUser = new User({
            Fullname:fullname,
            UserName,
            Email:email,
            Mobile:mobile,
            password: hashedPassword,
            profilePic,
        });

        await newUser.save();

        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const userLogin = async (req,res) => {
    const { Email, password } = req.body;

    if (!Email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ Email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Compare passwords
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id },process.env.JWT_SECRET, { expiresIn: "7d" });

        // Send token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite : 'strict', // Use secure cookie in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ success: true, message: "Login successful", user:{
            ...user._doc,
            password:undefined,
            Mobile:undefined
        } });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ success: false, message: "Server error" });
    } 
}

export const Logout = async (req,res) => {
    res.clearCookie("token")
    res.status(200).json({success: true, message:"Logged out successfully"})
}

export const userDetails = async (req,res) => {
    try {
        const user = await User.findById( req.userId )
        if(!user){
            return res.status(400).json({success:false, message:"User not found"})
        }

        res.status(200).json({ success: true, user:{
            ...user._doc,
            password:undefined,
            
        } });
    } catch (error) {
        console.error("Error in userDetails:", error);
        res.status(500).json({ success: false, message: "Server error" }); 
    }
}

export const getGyms = async (req,res) => {
    try {
        const gyms = await Gym.find({List:true})
        res.status(200).json({ success: true, gym:gyms });
    } catch (error) {
        console.error("Error fetching gyms:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const checkUserAuth = async (req,res) => {
    try {
        const user = await User.findById( req.userId )
        if(!user){
            return res.status(400).json({success:false, message:"user not found"})
        }
        return res.status(200).json({success:true,user:{
            ...user._doc,
            password:undefined,
            Mobile:undefined
        }})
    } catch (error) {
        console.log("error in checkAuth", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const getSingleGym = async (req,res) => {
    const {gymId} = req.body

    try {
        if(!gymId){
            return res.status(400).json({success:false, message: "gymId are required"})
        }

        const gym = await Gym.findById(gymId)
        if(!gym){
            return res.status(400).json({success:false, message: "gym not found"})
        }

        const owner = await Owner.findById(gym.ownerId)

        res.status(200).json({ success: true, gym:gym, ownerName:owner.name, ownerEmail:owner.email, ownerId: owner._id});
    } catch (error) {
        console.log("error in getSingleGym", error);
        res.status(500).json({success:false,message:"Server error"})
    }
}

export const getUserMembership = async (req, res) => {
    try {
        const userId = req.userId; // Get user ID from request

        // Find all gyms where the user is a member
        const gyms = await Gym.find({ "members.memberId": userId });
      

        // Filter gyms where the user's membershipStatus is "active"
        const activeGyms = gyms
            .map(gym => {

                // Find the specific user's membership
                const userMembership = gym.members.find(
                    member => member.memberId.toString() === userId.toString() && member.membershipStatus === "Active"
                );
                // Return gym details only if the membership is active
                if (userMembership) {
                    return {
                        _id: gym._id,
                        name: gym.gymName,
                        location: gym.location,
                        planName: userMembership.planName,
                        amountPaid:userMembership.amountPaid,
                        startDate: userMembership.startDate, 
                        endDate: userMembership.endDate, 
                        membershipStatus:userMembership.membershipStatus
                    };
                }
                return null;
            })
            .filter(gym => gym !== null); // Remove null values (inactive memberships)
          
        res.status(200).json({ success: true, gyms:activeGyms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const paymentCheckout = async (req,res) => {
    try {
        const { gymId, planId, planName, priceInINR, duration } = req.body;
        const userId = req.userId

        const gym = await Gym.findById(gymId)
        if(!gym){
            return res.status(400).json({success:false, message: "gym not found"})
        }

        const user = gym.members.find((member)=> member.memberId.toString() === userId.toString())
        if(user && user.membershipStatus === 'Active' ){
            return res.status(400).json({success:false, message: "Already an member of this gym"})
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items:[
                {
                    price_data:{
                        currency:"inr",
                        product_data:{
                            name:planName
                        },
                        unit_amount:priceInINR * 100
                    },
                    quantity: 1
                }
            ],
            mode:'payment',
            success_url:`http://localhost:5173/payment-success/${gymId}`,
            cancel_url: `http://localhost:5173/payment-cancel/${gymId}`,
            metadata: { userId, gymId, planName, priceInINR, duration }

            
        })

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating Stripe session:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
}



export const Webhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const { userId, gymId, planName, priceInINR, duration, eventId, eventPrice } = session.metadata;

            if (!userId) {
                console.error("Missing required metadata (userId)");
                return res.status(400).json({ error: "Invalid metadata" });
            }

            const user = await User.findById(userId);
            if (!user) return res.status(400).json({ success: false, message: "User not found" });

            if (eventId) {
                // ✅ Handle Event Payment
                const event = await Event.findById(eventId);
                if (!event) {
                    return res.status(400).json({ success: false, message: "Event not found" });
                }

                if (!event.participants.includes(userId)) {
                    event.participants.push(userId);
                    event.totalParticipants +=1
                    event.totalRevenue += eventPrice
                    user.EventParticipated.push(eventId)
                    await event.save();
                    await user.save()
                }

                console.log(`✅ User ${userId} added to event ${eventId}`);
                return res.status(200).json({ success: true, message: "Event payment successful" });
            }

            if (gymId) {
                // ✅ Handle Gym Membership Payment
                const gym = await Gym.findById(gymId);
                if (!gym) return res.status(400).json({ success: false, message: "Gym not found" });

                const durationMatch = duration.match(/^(\d+)\s*([a-zA-Z]+)$/);
                if (!durationMatch) {
                    return res.status(400).json({ success: false, message: "Invalid duration format" });
                }

                const durationValue = parseInt(durationMatch[1]);
                const durationUnit = durationMatch[2].toLowerCase();
                const startDate = new Date();
                const endDate = new Date(startDate);

                if (durationUnit.startsWith("month")) {
                    endDate.setMonth(endDate.getMonth() + durationValue);
                } else if (durationUnit.startsWith("day")) {
                    endDate.setDate(endDate.getDate() + durationValue);
                } else {
                    return res.status(400).json({ success: false, message: "Invalid duration unit" });
                }

                const formattedStartDate = startDate.toISOString().split("T")[0];
                const formattedEndDate = endDate.toISOString().split("T")[0];

                const existingMember = gym.members.find(member => member.memberId.toString() === userId);

                if (existingMember && existingMember.membershipStatus !== 'Active' && !user.GymMember.includes(gymId)) {
                    existingMember.planName = planName;
                    existingMember.amountPaid = priceInINR;
                    existingMember.duration = duration;
                    existingMember.startDate = formattedStartDate;
                    existingMember.endDate = formattedEndDate;
                    existingMember.membershipStatus = "Active";
                    existingMember.profilepic = user.profilePic || existingMember.profilepic;
                } else {
                    gym.members.push({
                        memberId: userId,
                        planName,
                        amountPaid: priceInINR,
                        duration,
                        startDate: formattedStartDate,
                        endDate: formattedEndDate,
                        membershipStatus: "Active",
                        profilepic: user.profilePic || ""
                    });
                }

                gym.totalRevenue += parseInt(priceInINR);
                await gym.save();

                if (!user.GymMember.includes(gymId)) {
                    user.GymMember.push(gymId);
                }
                await user.save();

                return res.status(200).json({ success: true, message: "Gym membership purchased successfully" });
            }
        }

        // Handle expired checkout sessions
        if (event.type === "checkout.session.expired") {
            console.warn("Checkout session expired:", event.data.object.id);
            return res.status(400).json({ success: false, message: "Checkout session expired. Please try again." });
        }

        res.status(200).json({ success: true, message: "Event received" });
    } catch (error) {
        console.error("Webhook error:", error.message);
        res.status(400).json({ message: "Webhook signature verification failed" });
    }
};


export const getSingleTrainer = async (req,res) => {
    const {gymId,trainerId} = req.body

    try {
        if(!gymId || !trainerId){
            return res.status(400).json({ success: false, message: "Gym ID and Trainer ID is required." });
        }

        const gym = await Gym.findById(gymId)
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

export const getSingleEquipment = async (req,res) => {
    const {gymId,equipId} = req.body

    try {
        if(!gymId || !equipId){
            return res.status(400).json({ success: false, message: "Gym ID and Equipment ID is required." });
        }

        const gym = await Gym.findById(gymId)
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const Equipment = gym.equipment.find((equip)=>equip._id.toString() === equipId)
        if(!Equipment){
            return res.status(404).json({ success: false, message: "equipment not found" });
        }

        return res.status(200).json({
            success: true,
            equip:Equipment
        });
    } catch (error) {
        console.error("Error in getSingleEquipment:", error);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}

export const getEvents = async (req,res) => {
    const {gymId} = req.body
    try {
        const gym = await Gym.findById(gymId)
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }
        const events = await Event.find({gymId:gymId})
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

export const paymentEvent = async (req,res) => {
    try {
        const { gymId, eventId, price } = req.body;
        const userId = req.userId

        const gym = await Gym.findById(gymId)
        if(!gym){
            return res.status(400).json({success:false, message: "gym not found"})
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(400).json({ success: false, message: "Event not found" });
        }

        const user  = await User.findById(userId)
        if(!user){
            return res.status(400).json({success:false, message: "user not found"})
        }

        if(event.userType === 'membersOnly' && !(Array.isArray(user.GymMember) && user.GymMember.includes(gymId))){
            return  res.status(400).json({ success: false, message: "Event is only for members" });
        }

        if(Number(price) === 0){
            const user = await User.findById(userId);
            if (!user) return res.status(400).json({ success: false, message: "User not found" });
                // ✅ Handle Event Payment
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(400).json({ success: false, message: "Event not found" });
            }

            if (!event.participants.includes(userId)) {
                event.participants.push(userId);
                event.totalParticipants +=1
                user.EventParticipated.push(eventId)
                await event.save();
                await user.save()
            }

                console.log(`✅ User ${userId} added to event ${eventId}`);
                return res.status(200).json({ success: true, message: "Event Joined" });
            
        }
        // Convert price to paise (INR uses 100 subunits)
        const amountInPaise = price * 100; // ₹1 = 100 paise

        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr", // ✅ Set currency to INR
                        product_data: { name: event.eventName },
                        unit_amount: amountInPaise, // ✅ Amount in paise
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/payment-success/${gymId}`,
            cancel_url: `http://localhost:5173/payment-cancel/${gymId}`,
            metadata: { eventId, userId, eventPrice:price },
        });


        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating Stripe session:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
}

export const getMyEvents = async (req, res) => {
    try {
        const userId = req.userId; // Get user ID from request

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch all events the user has participated in
        const events = await Event.find({ _id: { $in: user.EventParticipated } });

        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ success: false, message: "Failed to fetch events" });
    }
};

export const getAttendance = async (req, res) => {
    const { gymId } = req.body;

    try {
        const userId = req.userId;

        // Find the gym
        const gym = await Gym.findById(gymId);
        if (!gym) {
            return res.status(400).json({ success: false, message: "Gym not found" });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Find the member in the gym's members array
        const member = gym.members.find(m => m.memberId.toString() === userId.toString());
        if (!member) {
            return res.status(400).json({ success: false, message: "Member not found" });
        }

        console.log("Attendance Data Sent:", member.attendance)

        // Return attendance data
        return res.status(200).json({ success: true, attendance: member.attendance });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const addWeight = async (req,res) => {
    const {date,weight,gymId} = req.body

    try {
        const userId = req.userId

        const gym = await Gym.findById(gymId)
        if(!gym){
            return res.status(400).json({success:false, message: "gym not found"})
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({success:false, message: "user not found"})
        }

        const member = gym.members.find(m=>m.memberId.toString()===userId.toString())
        if(!member){
            return res.status(400).json({success:false, message: "member not found"})
        }


        const formattedDate = new Date(date).toISOString().split("T")[0];

        const weightEntry = member.attendance.find(a=>a.date.toISOString().split("T")[0]===formattedDate  )
        if(!weightEntry ){
            return res.status(400).json({success:false, message: "date not found"})
        }

        weightEntry.weight = weight

        await gym.save()
        return res.status(200).json({ success: true, message: "Weight added successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const addExerciseName = async (req,res) => {
    const {date,exerciseName,gymId} = req.body

    try {
        const userId = req.userId

        const gym = await Gym.findById(gymId)
        if(!gym){
            return res.status(400).json({success:false, message: "gym not found"})
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({success:false, message: "user not found"})
        }

        const member = gym.members.find(m=>m.memberId.toString()===userId.toString())
        if(!member){
            return res.status(400).json({success:false, message: "member not found"})
        }

        const formattedDate = new Date(date).toISOString().split("T")[0];

        const attendanceEntry  = member.attendance.find(a=>a.date.toISOString().split("T")[0]===formattedDate)
        if(!attendanceEntry ){
            return res.status(400).json({success:false, message: "date not found"})
        }

        if(attendanceEntry.workout.some(w=>w.exerciseName===exerciseName)){
            return res.status(400).json({success:false, message: "exercise already exists"})
        }

        attendanceEntry.workout.push({exerciseName, set:[]}) 
        await gym.save()

        return res.status(200).json({ success: true, message: "exercise added successfully" });

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const addSet = async (req,res) => {
    const {gymId,exerciseName,date,setNumber,reps,wt,unit} = req.body

    try {
        const userId = req.userId

        const gym = await Gym.findById(gymId)
        if(!gym){
            return res.status(400).json({success:false, message: "gym not found"})
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({success:false, message: "user not found"})
        }

        const member = gym.members.find(m=>m.memberId.toString()===userId.toString())
        if(!member){
            return res.status(400).json({success:false, message: "member not found"})
        }

        const formattedDate = new Date(date).toISOString().split("T")[0];

        const attendanceEntry  = member.attendance.find(a=>a.date.toISOString().split("T")[0]===formattedDate)
        if(!attendanceEntry ){
            return res.status(400).json({success:false, message: "date not found"})
        }

        const exercise = attendanceEntry.workout.find(w=>w.exerciseName===exerciseName)
        if(!exercise){
            return res.status(400).json({success:false, message: "exercise not found"})
        }

        if(exercise.set.some(e=>e.setNumber===setNumber)){
            return res.status(400).json({success:false, message: "set number should be unique"})
        }

        exercise.set.push({setNumber,reps,wt,unit})
        await gym.save()

        return res.status(200).json({ success: true, message: "set added successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const deleteExercise = async (req,res) => {
    try {
        const { gymId, date, exerciseName } = req.body;

        const userId = req.userId
        if (!gymId || !date || !exerciseName) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const gym = await Gym.findById(gymId);

        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        
        const member = gym.members.find(m => m.memberId.toString() === userId.toString());

        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found in this gym" });
        }

        const formattedDate = new Date(date).toISOString().split("T")[0]

        const attendanceEntry = member.attendance.find(entry => entry.date.toISOString().split("T")[0] === formattedDate);

        if (!attendanceEntry) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        attendanceEntry.workout = attendanceEntry.workout.filter(exercise => exercise.exerciseName !== exerciseName);

        await gym.save();

        res.json({ success: true, message: "Exercise deleted successfully" });
    } catch (err) {
        console.error("Error deleteExercise:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteSet = async (req,res) => {
    try {
        const { gymId, date, exerciseName, setNumber  } = req.body;

        const userId = req.userId
        if (!gymId || !date || !exerciseName) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const gym = await Gym.findById(gymId);

        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const member = gym.members.find(m => m.memberId.toString() === userId.toString());

        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found in this gym" });
        }

        const formattedDate = new Date(date).toISOString().split("T")[0]
        const attendanceEntry = member.attendance.find(entry => entry.date.toISOString().split("T")[0] === formattedDate);

        if (!attendanceEntry) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        const exercise = attendanceEntry.workout.find(ex => ex.exerciseName === exerciseName);

        if (!exercise) {
            return res.status(404).json({ success: false, message: "Exercise not found" });
        }

        exercise.set = exercise.set.filter(set => set.setNumber !== setNumber);

        await gym.save();

        res.json({ success: true, message: "set deleted successfully" });
    } catch (err) {
        console.error("Error in deleteset:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const SaveChat = async (req, res) => {
    try {
        const { messages } = req.body;
        const userId = req.userId; // Assuming middleware sets this

        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        if (!Array.isArray(messages)) {
            return res.status(400).json({ success: false, error: "Messages must be an array" });
        }

        // Find and update or insert if not found
        const chat = await Chat.findOneAndUpdate(
            { userId },
            { messages },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: "Chat saved successfully", chat });
    } catch (error) {
        console.error("SaveChat Error:", error);
        res.status(500).json({ success: false, error: "Failed to save chat" });
    }
};

export const getChat = async (req,res) => {
    try {
        const userId = req.userId

        const chat = await Chat.findOne({userId})
        res.status(200).json(chat ? chat.messages : []);
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch chat history" });
    }
}

export const deleteChatHistory = async (req, res) => {
    try {
        const userId = req.userId; // Ensure authentication middleware sets this

        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        // Find and delete the chat history for the user
        const deletedChat = await Chat.findOneAndDelete({ userId });

        if (!deletedChat) {
            return res.status(404).json({ success: false, error: "No chat history found" });
        }

        res.status(200).json({ success: true, message: "Chat history deleted successfully" });
    } catch (error) {
        console.error("DeleteChatHistory Error:", error);
        res.status(500).json({ success: false, error: "Failed to delete chat history" });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const userId = req.userId
        const users = await User.find();

        // Sanitize user data
        const sanitizedUsers = users.map((user) => {
            const { password, mobile, Bio, GymMember, EventParticipated, ...safeData } = user.toObject();
            return safeData;
        });

        const sanitized = sanitizedUsers.filter(u=>u._id.toString() !== userId.toString())

        res.status(200).json({ success: true, message: "Users retrieved successfully", users: sanitized });
    } catch (error) {
        console.error("getAllUsers Error:", error);
        res.status(500).json({ success: false, error: "Failed to get users" });
    }
};

export const getAllOwners = async (req, res) => {
    try {
        // const userId = req.userId
        const owners = await Owner.find();

        // Sanitize user data
        const sanitizedOwners = owners.map((user) => {
            const { password, contactNumber, gyms, isVerified, ...safeData } = user.toObject();
            return safeData;
        });

        res.status(200).json({ success: true, message: "Users retrieved successfully", owners: sanitizedOwners });
    } catch (error) {
        console.error("getAllUsers Error:", error);
        res.status(500).json({ success: false, error: "Failed to get users" });
    }
};


// Backend API: /api/user/getRecentChat
export const getRecentChat = async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch all chats where the user is involved
        const chats = await ChatUserOwner.find({
            $or: [{ sender: userId }, { receiver: userId }],
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
        const mapChats = (chats, userId) => {
            return Object.values(
                chats.reduce((acc, chat) => {
                    if (!chat.sender || !chat.receiver) {
                        console.warn("Invalid chat: sender or receiver is undefined", chat);
                        return acc; // Skip this chat
                    }
                    const chatPartner = chat.sender._id.equals(userId) ? chat.receiver : chat.sender;
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
        const recentUserToUserChats = mapChats(
            populatedChats.filter(chat => chat.senderType === "User" && chat.receiverType === "User"),
            userId
        );

        const recentUserToOwnerChats = mapChats(
            populatedChats.filter(chat =>
                (chat.senderType === "User" && chat.receiverType === "Owner") ||
                (chat.senderType === "Owner" && chat.receiverType === "User")
            ),
            userId
        );

        // Return the results
        res.status(200).json({
            success: true,
            userToUserChats: recentUserToUserChats,
            userToOwnerChats: recentUserToOwnerChats,
        });
    } catch (error) {
        console.error("Error fetching recent chats:", error);
        res.status(500).json({ success: false, message: "Failed to fetch recent chats" });
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
        const userId = req.userId
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
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

// export const deleteForAll = async (req,res) => {
//     const {messageId} = req.body

//     try {
//         const userId = req.userId
//         if (!userId) {
//             return res.status(400).json({ message: "User ID is required" });
//         }

//         const messages = await ChatUserOwner.deleteOne({_id:messageId})
//         res.json({ success: true, message: "Message deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Failed to delete message" });
//     }
// }

export const newMessages = async (req, res) => {
    try {
        const userId = req.userId; // Get logged-in user ID

        // Find all messages sent to this user that are not yet delivered
        const undeliveredMessages = await ChatUserOwner.find({
            receiver: userId,
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

export const addReviews = async (req,res) => {
    const {gymId,userName,star,comment} = req.body

    try {
        if (!gymId || !userName || !star || !comment) {
            return res.status(400).json({ success: false, message: "Gym ID, star, userName and comment are required." });
        }


        const gym = await Gym.findById( gymId )
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

export const getReviews = async (req,res) => {
    const {gymId} = req.body

    try {
        if (!gymId) {
            return res.status(400).json({ success: false, message: "Gym ID is required" });
        }


        const gym = await Gym.findById(gymId)
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
