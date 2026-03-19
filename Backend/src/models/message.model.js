import mongoose  from "mongoose";

const messageSchema=new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },

    text:{
        type:String,
       },

    image:{
        type:String,
    },

    isRead: {
        type: Boolean,
        default: false,
    }
},{timestamps:true});

// Optimized index for fetching conversation history
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Message=mongoose.model("Message",messageSchema);
export default Message;