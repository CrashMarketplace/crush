import { Router } from "express";
import { z } from "zod";
import Product from "../models/Product";
import User from "../models/User";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { readUserFromReq } from "../utils/authToken";

const router = Router();

// 관리자 권한 체크 미들웨어
async function requireAdmin(req: any, res: any, next: any) {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const userDoc = await User.findById(user.id);
  if (!userDoc?.isAdmin) {
    return res.status(403).json({ ok: false, error: "admin_only" });
  }

  next();
}

// ------------------------------
// 모든 상품 조회 (관리자)
// ------------------------------
router.get("/products", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find()
      .populate("seller", "userId displayName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(),
  ]);

  return res.json({ ok: true, products, total, page, limit });
});

// ------------------------------
// 상품 삭제 (관리자)
// ------------------------------
router.delete("/products/:id", requireAdmin, async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: "not_found" });

  await item.deleteOne();
  return res.json({ ok: true, deleted: true });
});

// ------------------------------
// 모든 사용자 조회 (관리자)
// ------------------------------
router.get("/users", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(),
  ]);

  return res.json({ ok: true, users, total, page, limit });
});

// ------------------------------
// 사용자 강퇴 (관리자)
// ------------------------------
router.patch("/users/:id/ban", requireAdmin, async (req, res) => {
  const { banned } = z.object({ banned: z.boolean() }).parse(req.body);

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ ok: false, error: "not_found" });

  user.isBanned = banned;
  await user.save();

  return res.json({ ok: true, user });
});

// ------------------------------
// 모든 채팅 조회 (관리자)
// ------------------------------
router.get("/chats", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    Conversation.find()
      .populate("participants", "userId displayName")
      .populate("product", "title")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(),
  ]);

  return res.json({ ok: true, conversations, total, page, limit });
});

// ------------------------------
// 채팅 삭제 (관리자)
// ------------------------------
router.delete("/chats/:id", requireAdmin, async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation)
    return res.status(404).json({ ok: false, error: "not_found" });

  await Message.deleteMany({ conversation: conversation._id });
  await conversation.deleteOne();

  return res.json({ ok: true, deleted: true });
});

// ------------------------------
// 모든 예약 조회 (관리자)
// ------------------------------
router.get("/reservations", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const Reservation = (await import("../models/Reservation")).default;

  const [reservations, total] = await Promise.all([
    Reservation.find()
      .populate("product", "title")
      .populate("buyer", "userId displayName")
      .populate("seller", "userId displayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Reservation.countDocuments(),
  ]);

  return res.json({ ok: true, reservations, total, page, limit });
});

// ------------------------------
// 예약 삭제 (관리자)
// ------------------------------
router.delete("/reservations/:id", requireAdmin, async (req, res) => {
  const Reservation = (await import("../models/Reservation")).default;
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation)
    return res.status(404).json({ ok: false, error: "not_found" });

  await reservation.deleteOne();
  return res.json({ ok: true, deleted: true });
});

export default router;
