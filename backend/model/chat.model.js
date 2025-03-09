import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [
        {
            sender: String,
            text: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
},{timestamps:true})

const Chat = mongoose.model('Chat', chatSchema);

export default Chat