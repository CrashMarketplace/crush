"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeMessage = serializeMessage;
function isSenderPopulated(sender) {
    return Boolean(sender && typeof sender === "object" && "userId" in sender);
}
function serializeMessage(msg) {
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
