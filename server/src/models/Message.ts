import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface MessageDoc extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDoc>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Message =
  mongoose.models.Message || mongoose.model<MessageDoc>("Message", MessageSchema);

export default Message;


