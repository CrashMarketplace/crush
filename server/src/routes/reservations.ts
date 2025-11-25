import { Router } from "express";
import { z } from "zod";
import Reservation from "../models/Reservation";
import Product from "../models/Product";
import { readUserFromReq } from "../utils/authToken";

const router = Router();

// 예약 생성
router.post("/", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const Body = z.object({
    productId: z.string(),
    meetingLocation: z.string().optional(),
    meetingTime: z.string().optional(),
    notes: z.string().optional(),
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message });
  }

  const product = await Product.findById(parsed.data.productId);
  if (!product) return res.status(404).json({ ok: false, error: "product_not_found" });

  if (product.status !== "selling") {
    return res.status(400).json({ ok: false, error: "product_not_available" });
  }

  // 이미 예약이 있는지 확인
  const existingReservation = await Reservation.findOne({
    product: product._id,
    status: { $in: ["pending", "confirmed"] },
  });

  if (existingReservation) {
    return res.status(400).json({ ok: false, error: "already_reserved" });
  }

  const reservation = await Reservation.create({
    product: product._id,
    buyer: user.id,
    seller: product.seller,
    meetingLocation: parsed.data.meetingLocation || "",
    meetingTime: parsed.data.meetingTime ? new Date(parsed.data.meetingTime) : undefined,
    notes: parsed.data.notes || "",
  });

  product.status = "reserved";
  await product.save();

  return res.status(201).json({ ok: true, reservation });
});

// 내 예약 목록 조회
router.get("/my", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const reservations = await Reservation.find({
    $or: [{ buyer: user.id }, { seller: user.id }],
  })
    .populate("product", "title price images")
    .populate("buyer", "_id userId displayName")
    .populate("seller", "_id userId displayName")
    .sort({ createdAt: -1 });

  return res.json({ ok: true, reservations });
});

// 예약 상태 변경
router.patch("/:id/status", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const Body = z.object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message });
  }

  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ ok: false, error: "not_found" });

  if (
    String(reservation.buyer) !== String(user.id) &&
    String(reservation.seller) !== String(user.id)
  ) {
    return res.status(403).json({ ok: false, error: "forbidden" });
  }

  reservation.status = parsed.data.status;
  await reservation.save();

  if (parsed.data.status === "cancelled") {
    const product = await Product.findById(reservation.product);
    if (product && product.status === "reserved") {
      product.status = "selling";
      await product.save();
    }
  } else if (parsed.data.status === "completed") {
    const product = await Product.findById(reservation.product);
    if (product) {
      product.status = "sold";
      await product.save();
    }
  }

  return res.json({ ok: true, reservation });
});

export default router;
