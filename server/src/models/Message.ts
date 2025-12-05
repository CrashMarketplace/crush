import mongoose, { Schema, type Document, type Types, type Model } from "mongoose";

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

const MessageModel: Model<MessageDoc> =
  (mongoose.models.Message as Model<MessageDoc> | undefined) ||
  mongoose.model<MessageDoc>("Message", MessageSchema);

export const Message = MessageModel;

export default MessageModel;


