import mongoose from "mongoose";
import { type } from "os";

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index:true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index:true
    },
    message: {
      type: String,
      required: true,
    },
    status:{
        type:String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    hiddenBy: { type: [String], default: [] }
  },
  { timestamps: true }
);

const UserChat = mongoose.model("UserChat", ChatSchema);
export default UserChat;
