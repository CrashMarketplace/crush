"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Message_1 = __importDefault(require("../models/Message"));
const authToken_1 = require("../utils/authToken");
const serializeMessage_1 = require("../utils/serializeMessage");
let io = null;
const roomName = (conversationId) => `conversation:${conversationId}`;
function initSocketServer(httpServer, allowedOrigins) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: allowedOrigins === true ? true : allowedOrigins,
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const user = (0, authToken_1.readUserFromCookieHeader)(socket.handshake.headers.cookie);
        if (!user) {
            return next(new Error("unauthorized"));
        }
        socket.data.user = user;
        return next();
    });
    io.on("connection", (socket) => {
        const authed = socket.data.user;
        if (!authed) {
            socket.disconnect();
            return;
        }
        socket.on("conversation:join", async ({ conversationId }) => {
            if (!conversationId)
                return;
            try {
                const convo = await Conversation_1.default.findById(conversationId).select(["participants", "_id"]);
                if (!convo) {
                    socket.emit("conversation:error", { conversationId, error: "not_found" });
                    return;
                }
                const isMember = convo.participants.map(String).includes(authed.id);
                if (!isMember) {
                    socket.emit("conversation:error", { conversationId, error: "forbidden" });
                    return;
                }
                socket.join(roomName(conversationId));
            }
            catch (e) {
                socket.emit("conversation:error", { conversationId, error: e?.message || "failed_to_join" });
            }
        });
        socket.on("conversation:leave", ({ conversationId }) => {
            if (!conversationId)
                return;
            socket.leave(roomName(conversationId));
        });
        socket.on("message:send", async (payload, callback) => {
            const { conversationId, text } = payload || {};
            if (!conversationId || !text?.trim()) {
                callback?.({ ok: false, error: "invalid_payload" });
                return;
            }
            try {
                const convo = await Conversation_1.default.findById(conversationId);
                if (!convo) {
                    callback?.({ ok: false, error: "not_found" });
                    return;
                }
                const isMember = convo.participants.map(String).includes(authed.id);
                if (!isMember) {
                    callback?.({ ok: false, error: "forbidden" });
                    return;
                }
                const msg = await Message_1.default.create({
                    conversation: conversationId,
                    sender: authed.id,
                    text: text.trim(),
                });
                convo.lastMessage = msg._id;
                await convo.save();
                await msg.populate({ path: "sender", select: ["userId", "email"] });
                const messagePayload = (0, serializeMessage_1.serializeMessage)(msg);
                io?.to(roomName(conversationId)).emit("conversation:new-message", messagePayload);
                callback?.({ ok: true });
            }
            catch (e) {
                callback?.({ ok: false, error: e?.message || "failed_to_send" });
            }
        });
    });
    return io;
}
function getIO() {
    if (!io) {
        throw new Error("socket.io server is not initialized");
    }
    return io;
}
//