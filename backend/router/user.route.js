import express from "express"
import { addExerciseName, addReviews, addSet, addWeight, checkUserAuth, deleteChatHistory, deleteExercise, deleteForMe, deleteSet, fetchSingleOwner, fetchSingleUser, getAllOwners, getAllUsers, getAttendance, getChat, getEvents, getGyms, getMyEvents, getRecentChat, getReviews, getSingleEquipment, getSingleGym, getSingleTrainer, getUserMembership, Logout, newMessages, paymentCheckout, paymentEvent, SaveChat, userDetails, userLogin, userRegister } from "../controller/user.controller.js";
import { verifyUserToken } from "../middleware/verifyToken.js";

const router = express.Router()

router.post("/register",userRegister)

router.post("/login",userLogin)

router.post("/logout",Logout)

router.post('/userDetails', verifyUserToken,userDetails)

router.post('/getGyms', verifyUserToken, getGyms)

router.get('/checkAuth',verifyUserToken,checkUserAuth)

router.post('/getSingleGym',verifyUserToken,getSingleGym)

router.post('/getUserMembership',verifyUserToken,getUserMembership)

router.post('/checkout',verifyUserToken,paymentCheckout)

router.post('/getSingleTrainer',verifyUserToken,getSingleTrainer)

router.post('/getSingleEquipment',verifyUserToken,getSingleEquipment)

router.post('/getEvents',verifyUserToken,getEvents)

router.post('/payment-event',verifyUserToken,paymentEvent)

router.post('/myEvents',verifyUserToken,getMyEvents)

router.post('/getAttendance',verifyUserToken,getAttendance)

router.post('/addWeight',verifyUserToken,addWeight)

router.post('/addExerciseName',verifyUserToken,addExerciseName)

router.post('/addSet',verifyUserToken,addSet)

router.post('/deleteExercise',verifyUserToken,deleteExercise)

router.post('/deleteSet',verifyUserToken,deleteSet)

router.post('/save-chat',verifyUserToken,SaveChat)

router.post('/getChat',verifyUserToken,getChat)

router.delete('/deleteChat',verifyUserToken,deleteChatHistory)

router.post('/getAllUsers',verifyUserToken,getAllUsers)

router.post('/getRecentChat',verifyUserToken,getRecentChat)

router.post('/fetchSingleUser',verifyUserToken,fetchSingleUser)

router.post('/deleteForMe',verifyUserToken,deleteForMe)

// router.post('/deleteForAll',verifyUserToken,deleteForAll)

router.post('/newMessages',verifyUserToken,newMessages)

router.post('/getAllOwners',verifyUserToken,getAllOwners)

router.post('/fetchSingleOwner',verifyUserToken,fetchSingleOwner)

router.post('/addReview',verifyUserToken,addReviews)

router.post('/getReview',verifyUserToken,getReviews)

export default router;