import type { MessageDoc } from "../models/Message";

export type SerializedMessage = {
  _id: string;
  conversation: string;
  sender: string;
  senderProfile?: {
    _id: string;
    userId?: string;
    email?: string;
  };
  text: string;
  createdAt: string;
};

function isSenderPopulated(sender: MessageDoc["sender"] | any): sender is {
  _id?: any;
  userId?: string;
  email?: string;
} {
  return Boolean(sender && typeof sender === "object" && "userId" in sender);
}

export function serializeMessage(msg: MessageDoc & { sender?: any }): SerializedMessage {
  const populatedSender = isSenderPopulated(msg.sender) ? msg.sender : null;
  const senderId = populatedSender?._id ? String(populatedSender._id) : String(msg.sender);

  return {
    _id: String(msg._id),
    conversation: String(msg.conversation),
    sender: senderId,
    senderProfile: populatedSender
      ? {
          _id: senderId,
          userId: populatedSender.userId,
          email: populatedSender.email,
        }
      : undefined,
    text: msg.text,
    createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : String(msg.createdAt),
  };
}


