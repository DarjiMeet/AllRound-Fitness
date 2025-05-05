import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ["User", "Owner"], // To differentiate sender type
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    receiverType: {
      type: String,
      enum: ["User", "Owner"], // To differentiate receiver type
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    hiddenBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

const ChatUserOwner = mongoose.model("UserOwner", ChatSchema);
export default ChatUserOwner;
