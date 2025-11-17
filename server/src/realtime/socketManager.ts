import type http from "http";
import { Server } from "socket.io";

import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { readUserFromCookieHeader } from "../utils/authToken";
import { serializeMessage } from "../utils/serializeMessage";

type AllowedOrigins = string[] | true;

let io: Server | null = null;

const roomName = (conversationId: string) => `conversation:${conversationId}`;

export function initSocketServer(httpServer: http.Server, allowedOrigins: AllowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins === true ? true : allowedOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const user = readUserFromCookieHeader(socket.handshake.headers.cookie);
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

    socket.on("conversation:join", async ({ conversationId }: { conversationId?: string }) => {
      if (!conversationId) return;
      try {
        const convo = await Conversation.findById(conversationId).select(["participants", "_id"]);
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
      } catch (e: any) {
        socket.emit("conversation:error", { conversationId, error: e?.message || "failed_to_join" });
      }
    });

    socket.on("conversation:leave", ({ conversationId }: { conversationId?: string }) => {
      if (!conversationId) return;
      socket.leave(roomName(conversationId));
    });

    socket.on(
      "message:send",
      async (
        payload: { conversationId?: string; text?: string },
        callback?: (resp: { ok: boolean; error?: string }) => void
      ) => {
        const { conversationId, text } = payload || {};
        if (!conversationId || !text?.trim()) {
          callback?.({ ok: false, error: "invalid_payload" });
          return;
        }
        try {
          const convo = await Conversation.findById(conversationId);
          if (!convo) {
            callback?.({ ok: false, error: "not_found" });
            return;
          }
          const isMember = convo.participants.map(String).includes(authed.id);
          if (!isMember) {
            callback?.({ ok: false, error: "forbidden" });
            return;
          }

          const msg = await Message.create({
            conversation: conversationId,
            sender: authed.id,
            text: text.trim(),
          });

          convo.lastMessage = msg._id;
          await convo.save();

          await msg.populate({ path: "sender", select: ["userId", "email"] });
          const messagePayload = serializeMessage(msg);

          io?.to(roomName(conversationId)).emit("conversation:new-message", messagePayload);
          callback?.({ ok: true });
        } catch (e: any) {
          callback?.({ ok: false, error: e?.message || "failed_to_send" });
        }
      }
    );
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("socket.io server is not initialized");
  }
  return io;
}

