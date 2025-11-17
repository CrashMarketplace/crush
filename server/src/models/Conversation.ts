import mongoose, { Schema, type Document, type Types, type Model } from "mongoose";

export interface ConversationDoc extends Document {
  product: Types.ObjectId;
  participants: Types.ObjectId[]; // 두 명(판매자, 구매자)
  lastMessage?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<ConversationDoc>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true, index: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

ConversationSchema.index({ product: 1, participants: 1 }, { unique: false });

const ConversationModel: Model<ConversationDoc> =
  (mongoose.models.Conversation as Model<ConversationDoc> | undefined) ||
  mongoose.model<ConversationDoc>("Conversation", ConversationSchema);

export const Conversation = ConversationModel;

export default ConversationModel;


