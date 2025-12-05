import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { readUserFromReq } from "../utils/authToken";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import Product from "../models/Product";
import { getIO } from "../realtime/socketManager";
import { serializeMessage, type SerializedMessage } from "../utils/serializeMessage";

const router = Router();

function requireAuth(req: any, res: any) {
  const me = readUserFromReq(req);
  if (!me) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return null;
  }
  return me;
}

// 대화 시작 또는 기존 대화 반환 (상품별 단체방)
router.post("/start", async (req, res) => {
  const me = requireAuth(req, res);
  if (!me) return;
  try {
    const schema = z.object({
      productId: z.string().min(1),
      peerUserId: z.string().optional(),
    });
    const { productId, peerUserId } = schema.parse(req.body || {});

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ ok: false, error: "product_not_found" });

    const myId = me.id;
    const sellerId = product.seller ? String(product.seller) : null;

    const participantsToEnsure = new Set<string>();
    if (sellerId) participantsToEnsure.add(sellerId);
    participantsToEnsure.add(myId);
    if (peerUserId) participantsToEnsure.add(peerUserId);

    // 상품별 단 하나의 대화방 유지 (판매자 + 모든 관심 사용자)
    let convo = await Conversation.findOne({
      product: product._id,
    });

    if (!convo) {
      const participants = Array.from(participantsToEnsure).map((id) => new Types.ObjectId(id));
      convo = await Conversation.create({
        product: product._id,
        participants,
      });
    } else {
      const members = convo.participants.map(String);
      const missing = Array.from(participantsToEnsure).filter((id) => !members.includes(id));
      if (missing.length > 0) {
        convo.participants.push(...missing.map((id) => new Types.ObjectId(id)));
        await convo.save();
      }
    }

    const populated = await Conversation.findById(convo._id)
      .populate({ path: "product", select: ["title", "price", "images", "seller", "location"] })
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: ["userId", "email"] },
      });

    return res.json({ ok: true, conversation: populated ?? convo });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || "failed_to_start" });
  }
});

// 내 대화 목록
router.get("/", async (req, res) => {
  const me = requireAuth(req, res);
  if (!me) return;
  try {
    const list = await Conversation.find({
      participants: me.id,
    })
      .sort({ updatedAt: -1 })
      .populate({ path: "product", select: ["title", "price", "images", "seller", "location"] })
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: ["userId", "email"] },
      });

    return res.json({ ok: true, conversations: list });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "failed_to_list" });
  }
});

// 특정 대화의 메시지 목록
router.get("/:id/messages", async (req, res) => {
  const me = requireAuth(req, res);
  if (!me) return;
  try {
    const { id } = req.params;
    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ ok: false, error: "not_found" });
    const isMember = convo.participants.map(String).includes(me.id);
    if (!isMember) return res.status(403).json({ ok: false, error: "forbidden" });

    const messagesRaw = await Message.find({ conversation: id })
      .sort({ createdAt: 1 })
      .populate({ path: "sender", select: ["userId", "email"] });

    const messages: SerializedMessage[] = messagesRaw.map((m) => serializeMessage(m));

    return res.json({ ok: true, messages });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "failed_to_load" });
  }
});

// 메시지 전송
router.post("/:id/messages", async (req, res) => {
  const me = requireAuth(req, res);
  if (!me) return;
  try {
    const { id } = req.params;
    const { text } = z.object({ text: z.string().min(1) }).parse(req.body || {});

    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ ok: false, error: "not_found" });
    const isMember = convo.participants.map(String).includes(me.id);
    if (!isMember) return res.status(403).json({ ok: false, error: "forbidden" });

    const msg = await Message.create({
      conversation: id,
      sender: me.id,
      text,
    });

    convo.lastMessage = msg._id as Types.ObjectId;
    await convo.save();

    await msg.populate({ path: "sender", select: ["userId", "email"] });
    const payload = serializeMessage(msg);

    try {
      const io = getIO();
      io.to(`conversation:${id}`).emit("conversation:new-message", payload);
    } catch {
      // 소켓 서버 미초기화 시 무시
    }

    return res.json({ ok: true, message: payload });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || "failed_to_send" });
  }
});

export default router;


