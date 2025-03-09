import express from 'express'
import dotenv from "dotenv"
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {v2 as cloudinary} from "cloudinary"
import { connectDB } from './db/connectDB.js'
import ownerRoutes from './router/owner.route.js'
import userRoutes from './router/user.route.js'
import webhookRoute from './router/webhook.route.js'; 


dotenv.config()
const app = express()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

app.use('/api/user/webhook', express.raw({ type: 'application/json' }));
app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
      origin: "http://localhost:5173", // Replace with your frontend's origin
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    })
  );
const port = process.env.PORT

app.use('/api/owner',ownerRoutes)
app.use('/api/user',userRoutes)
app.use('/api/user/webhook', webhookRoute);


app.listen(port,()=>{
    connectDB()
    console.log("Server is running on: ",port)
})