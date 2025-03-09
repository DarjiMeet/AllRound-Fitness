import express from 'express'
import { addActivity, addAmenity, addEquipments, addEvents, addMemberPlan, addMembers, addParticipants, addPhotos, addReviews, addTrainers, checkAuth, createGym, decreaseQuantity, deleteActivity, deleteAmenity, deleteEquipment, deleteEvent, deleteGym, deleteGymTiming, deleteMember, deleteMembership, deleteParticipants, deleteTrainer, deltePhotos, editGymDetails, getEquipments, getEvents, getGym, getMembers, getParticipants, getReviews, getSingleEvent, getSingleGym, getSingleMember, getSingleTrainer, getTrainer, increaseQuantity, markAttendance, ownerLogin, ownerLogout, ownerRegister, setList, updateEvent, updateTrainer, verifyEmail } from '../controller/owner.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()

router.post("/register",ownerRegister)

router.post("/verify-email",verifyEmail)

router.post("/login",ownerLogin)

router.get("/checkAuth",verifyToken,checkAuth)

router.post("/logout",ownerLogout)     

router.post("/createGym",verifyToken,createGym)

router.post("/addMemberPlan",verifyToken,addMemberPlan)

router.post("/addEquipments",verifyToken,addEquipments)

router.post("/increaseQuantity",verifyToken,increaseQuantity)

router.post("/decreaseQuantity",verifyToken,decreaseQuantity)

router.post("/addTrainers",verifyToken,addTrainers)

router.post("/addPhotos",verifyToken,addPhotos)

router.post("/createEvent",verifyToken,addEvents)

router.post("/addMember",verifyToken,addMembers)

router.post("/addActivity",verifyToken,addActivity)

router.post("/addAmenity",verifyToken,addAmenity)

router.post("/deleteGym",verifyToken,deleteGym)

router.post("/deleteTrainer",verifyToken,deleteTrainer)

router.post("/deleteEvent",verifyToken,deleteEvent)

router.post("/deleteEquipment",verifyToken,deleteEquipment)

router.post("/deleteMember",verifyToken,deleteMember)

router.post("/deleteMembership",verifyToken,deleteMembership)

router.post("/deleteActivity",verifyToken,deleteActivity)

router.post("/deleteAmenity",verifyToken,deleteAmenity)

router.post("/getGyms",verifyToken,getGym)

router.post("/getEvents",verifyToken,getEvents)

router.post('/getSingleGym',verifyToken,getSingleGym)

router.post('/deletePhoto',verifyToken,deltePhotos)

router.put('/editGym',verifyToken,editGymDetails)

router.post('/getMember',verifyToken,getMembers)

router.post('/getTrainer',verifyToken,getTrainer)

router.post('/getEquipments',verifyToken,getEquipments)

router.post('/getReview',verifyToken,getReviews)

router.post('/addReviews',verifyToken,addReviews)

router.post('/getSingleTrainer',verifyToken,getSingleTrainer)

router.post('/getSingleMember',verifyToken,getSingleMember)

router.put('/updateTrainer',verifyToken,updateTrainer)

router.post('/getSingleEvent',verifyToken,getSingleEvent)

router.put('/updateEvent',verifyToken,updateEvent)

router.post('/addParticipants',verifyToken,addParticipants)

router.post('/getParticipants',verifyToken,getParticipants)

router.post('/deleteParticipants',verifyToken,deleteParticipants)

router.post('/setList',verifyToken,setList)

router.post('/deleteTiming',verifyToken,deleteGymTiming)

router.post('/markAttendance',verifyToken,markAttendance)

export default router