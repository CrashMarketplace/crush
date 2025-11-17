"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const authToken_1 = require("../utils/authToken");
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Message_1 = __importDefault(require("../models/Message"));
const Product_1 = __importDefault(require("../models/Product"));
const socketManager_1 = require("../realtime/socketManager");
const serializeMessage_1 = require("../utils/serializeMessage");
const router = (0, express_1.Router)();
function requireAuth(req, res) {
    const me = (0, authToken_1.readUserFromReq)(req);
    if (!me) {
        res.status(401).json({ ok: false, error: "unauthorized" });
        return null;
    }
    return me;
}
// 대화 시작 또는 기존 대화 반환 (상품별 단체방)
router.post("/start", async (req, res) => {
    const me = requireAuth(req, res);
    if (!me)
        return;
    try {
        const schema = zod_1.z.object({
            productId: zod_1.z.string().min(1),
            peerUserId: zod_1.z.string().optional(),
        });
        const { productId, peerUserId } = schema.parse(req.body || {});
        const product = await Product_1.default.findById(productId);
        if (!product)
            return res.status(404).json({ ok: false, error: "product_not_found" });
        const myId = me.id;
        const sellerId = product.seller ? String(product.seller) : null;
        const participantsToEnsure = new Set();
        if (sellerId)
            participantsToEnsure.add(sellerId);
        participantsToEnsure.add(myId);
        if (peerUserId)
            participantsToEnsure.add(peerUserId);
        // 상품별 단 하나의 대화방 유지 (판매자 + 모든 관심 사용자)
        let convo = await Conversation_1.default.findOne({
            product: product._id,
        });
        if (!convo) {
            const participants = Array.from(participantsToEnsure).map((id) => new mongoose_1.Types.ObjectId(id));
            convo = await Conversation_1.default.create({
                product: product._id,
                participants,
            });
        }
        else {
            const members = convo.participants.map(String);
            const missing = Array.from(participantsToEnsure).filter((id) => !members.includes(id));
            if (missing.length > 0) {
                convo.participants.push(...missing.map((id) => new mongoose_1.Types.ObjectId(id)));
                await convo.save();
            }
        }
        const populated = await Conversation_1.default.findById(convo._id)
            .populate({ path: "product", select: ["title", "price", "images", "seller", "location"] })
            .populate({
            path: "lastMessage",
            populate: { path: "sender", select: ["userId", "email"] },
        });
        return res.json({ ok: true, conversation: populated ?? convo });
    }
    catch (e) {
        return res.status(400).json({ ok: false, error: e?.message || "failed_to_start" });
    }
});
// 내 대화 목록
router.get("/", async (req, res) => {
    const me = requireAuth(req, res);
    if (!me)
        return;
    try {
        const list = await Conversation_1.default.find({
            participants: me.id,
        })
            .sort({ updatedAt: -1 })
            .populate({ path: "product", select: ["title", "price", "images", "seller", "location"] })
            .populate({
            path: "lastMessage",
            populate: { path: "sender", select: ["userId", "email"] },
        });
        return res.json({ ok: true, conversations: list });
    }
    catch (e) {
        return res.status(500).json({ ok: false, error: e?.message || "failed_to_list" });
    }
});
// 특정 대화의 메시지 목록
router.get("/:id/messages", async (req, res) => {
    const me = requireAuth(req, res);
    if (!me)
        return;
    try {
        const { id } = req.params;
        const convo = await Conversation_1.default.findById(id);
        if (!convo)
            return res.status(404).json({ ok: false, error: "not_found" });
        const isMember = convo.participants.map(String).includes(me.id);
        if (!isMember)
            return res.status(403).json({ ok: false, error: "forbidden" });
        const messagesRaw = await Message_1.default.find({ conversation: id })
            .sort({ createdAt: 1 })
            .populate({ path: "sender", select: ["userId", "email"] });
        const messages = messagesRaw.map((m) => (0, serializeMessage_1.serializeMessage)(m));
        return res.json({ ok: true, messages });
    }
    catch (e) {
        return res.status(500).json({ ok: false, error: e?.message || "failed_to_load" });
    }
});
// 메시지 전송
router.post("/:id/messages", async (req, res) => {
    const me = requireAuth(req, res);
    if (!me)
        return;
    try {
        const { id } = req.params;
        const { text } = zod_1.z.object({ text: zod_1.z.string().min(1) }).parse(req.body || {});
        const convo = await Conversation_1.default.findById(id);
        if (!convo)
            return res.status(404).json({ ok: false, error: "not_found" });
        const isMember = convo.participants.map(String).includes(me.id);
        if (!isMember)
            return res.status(403).json({ ok: false, error: "forbidden" });
        const msg = await Message_1.default.create({
            conversation: id,
            sender: me.id,
            text,
        });
        convo.lastMessage = msg._id;
        await convo.save();
        await msg.populate({ path: "sender", select: ["userId", "email"] });
        const payload = (0, serializeMessage_1.serializeMessage)(msg);
        try {
            const io = (0, socketManager_1.getIO)();
            io.to(`conversation:${id}`).emit("conversation:new-message", payload);
        }
        catch {
            // 소켓 서버 미초기화 시 무시
        }
        return res.json({ ok: true, message: payload });
    }
    catch (e) {
        return res.status(400).json({ ok: false, error: e?.message || "failed_to_send" });
    }
});
exports.default = router;
