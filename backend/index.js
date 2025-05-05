import express from 'express'
import dotenv from "dotenv"
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {v2 as cloudinary} from "cloudinary"
import {createServer} from "http"
import {Server} from "socket.io"
import { connectDB } from './db/connectDB.js'
import ownerRoutes from './router/owner.route.js'
import userRoutes from './router/user.route.js'
import webhookRoute from './router/webhook.route.js'; 
import ChatUserOwner from './model/userOwnerChat.model.js'


dotenv.config()
const app = express()
const server = createServer(app)
const io = new Server(server,{
  cors:{
    origin:"http://localhost:5173",
    methods:["GET","POST"],
    credentials:true
  }
})

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

app.use('/api/user/webhook', webhookRoute);
app.use('/api/owner',ownerRoutes)
app.use('/api/user',userRoutes)


const onlineUser = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", async ({ userId, userType, receiverId, receiverType }) => {
    console.log(`User joined: ${userId} (${userType})`);

    if (!onlineUser.has(userId)) {
      onlineUser.set(userId, new Set());
    }
    onlineUser.get(userId).add(socket.id);

    try {
      // Fetch chat history between user & owner
      const chatHistory = await ChatUserOwner.find({
        $or: [
          { sender: userId, senderType: userType, receiver: receiverId, receiverType: receiverType },
          { sender: receiverId, senderType: receiverType, receiver: userId, receiverType: userType }
        ]
      }).sort({ createdAt: 1 });

      socket.emit("chatHistory", chatHistory);

      // Fetch unread messages
      const unreadMessages = await ChatUserOwner.find({
        receiver: userId, // Current user's ID
        receiverType: userType, // Current user's type
        sender: receiverId, // Specific sender's ID (the user you're chatting with)
        senderType: receiverType, // Specific sender's type
        status: "sent" // Only unread messages
    });

      unreadMessages.forEach(async (msg) => {
        io.to(socket.id).emit("receiveMessage", {
          _id: msg._id,
          sender: msg.sender,
          senderType: msg.senderType,
          message: msg.message,
          receiver: msg.receiver,
          receiverType: msg.receiverType,
        });

        // Mark message as delivered
        await ChatUserOwner.findByIdAndUpdate(msg._id, { status: "delivered" });
      });
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  });

  // Send Message
  socket.on("sendMessage", async ({ sender, senderType, receiver, receiverType, message }) => {
    try {
      const newMessage = await ChatUserOwner.create({
        sender,
        senderType,
        receiver,
        receiverType,
        message,
        status: "sent"
      });

      io.to(socket.id).emit("messageSent", newMessage);
      const receiverSocketIds = onlineUser.get(receiver);

      console.log("receiverSocketIds:", receiverSocketIds);

      if (receiverSocketIds && receiverSocketIds.size > 0) {
        receiverSocketIds.forEach((socketId) => {
          io.to(socketId).emit("receiveMessage", {
            _id: newMessage._id,
            sender,
            senderType,
            message,
            receiver,
            receiverType,
          });
        });

        // Update message status to delivered
        await ChatUserOwner.findByIdAndUpdate(newMessage._id, { status: "delivered" });
      }

      io.emit("newMessage");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    onlineUser.forEach((socketSet, userId) => {
      socketSet.delete(socket.id);
      if (socketSet.size === 0) {
        onlineUser.delete(userId);
      }
    });
  });

  // User leaves chat
  socket.on("leave", ({ userId }) => {
    console.log(`User left: ${userId}`);

    if (onlineUser.has(userId)) {
      const socketSet = onlineUser.get(userId);
      socketSet.delete(socket.id);

      if (socketSet.size === 0) {
        onlineUser.delete(userId);
      }
    }
  });

  socket.on("delete", async ({ messageId }) => {
    try {
        // Delete the message from the database
        const result = await ChatUserOwner.deleteOne({ _id: messageId });

        if (result.deletedCount === 0) {
            console.log("Message not found");
            return;
        }

        // Notify all clients about the deleted message
        io.emit("messageDeleted", { messageId });
    } catch (error) {
        console.error("Error deleting message:", error);
    }
});
});



server.listen(port,()=>{
    connectDB()
    console.log("Server is running on: ",port)
})