import { Router } from "express";
import { z } from "zod";
import Reservation from "../models/Reservation";
import Product from "../models/Product";
import User from "../models/User";
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

  const product = await Product.findById(parsed.data.productId).populate("seller", "_id userId displayName");
  if (!product) return res.status(404).json({ ok: false, error: "product_not_found" });

  if (product.status !== "selling") {
    return res.status(400).json({ ok: false, error: "product_not_available" });
  }

  // 같은 사용자가 이미 이 상품에 예약했는지 확인
  const myExistingReservation = await Reservation.findOne({
    product: product._id,
    buyer: user.id,
    status: { $in: ["pending", "confirmed"] },
  });

  if (myExistingReservation) {
    return res.status(400).json({ ok: false, error: "you_already_reserved" });
  }

  const reservation = await Reservation.create({
    product: product._id,
    buyer: user.id,
    seller: product.seller,
    meetingLocation: parsed.data.meetingLocation || "",
    meetingTime: parsed.data.meetingTime ? new Date(parsed.data.meetingTime) : undefined,
    notes: parsed.data.notes || "",
  });

  // 상품 상태를 예약중으로 변경
  product.status = "reserved";
  await product.save();

  // 판매자에게 알림 생성
  const Notification = (await import("../models/Notification")).default;
  await Notification.create({
    user: product.seller,
    type: "reservation",
    title: "새로운 예약이 있습니다",
    message: `"${product.title}" 상품에 예약 요청이 들어왔습니다.`,
    relatedProduct: product._id,
    relatedReservation: reservation._id,
  });

  // 푸시 알림 전송
  const { sendPushNotification } = await import("./notifications");
  const sellerIdValue = (product.seller as any)?._id || product.seller;
  await sendPushNotification(
    String(sellerIdValue),
    "새로운 예약이 있습니다",
    `"${product.title}" 상품에 예약 요청이 들어왔습니다.`,
    { url: `/listing/${product._id}` }
  );

  console.log(`✅ 예약 생성: ${product.title} - 판매자에게 알림 전송`);

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

  const oldStatus = reservation.status;
  reservation.status = parsed.data.status;
  await reservation.save();

  const Notification = (await import("../models/Notification")).default;
  const product = await Product.findById(reservation.product);

  if (parsed.data.status === "cancelled") {
    if (product && product.status === "reserved") {
      // 다른 활성 예약이 있는지 확인
      const otherActiveReservations = await Reservation.countDocuments({
        product: product._id,
        _id: { $ne: reservation._id },
        status: { $in: ["pending", "confirmed"] },
      });

      // 다른 활성 예약이 없으면 판매중으로 변경
      if (otherActiveReservations === 0) {
        product.status = "selling";
        await product.save();
      }
    }

    // 상대방에게 알림
    const notifyUser = String(reservation.buyer) === String(user.id) ? reservation.seller : reservation.buyer;
    await Notification.create({
      user: notifyUser,
      type: "reservation_cancelled",
      title: "예약이 취소되었습니다",
      message: `"${product?.title}" 상품의 예약이 취소되었습니다.`,
      relatedProduct: product?._id,
      relatedReservation: reservation._id,
    });

    // 푸시 알림 전송
    const { sendPushNotification } = await import("./notifications");
    await sendPushNotification(
      String(notifyUser),
      "예약이 취소되었습니다",
      `"${product?.title}" 상품의 예약이 취소되었습니다.`,
      { url: `/listing/${product?._id}` }
    );
  } else if (parsed.data.status === "confirmed" && oldStatus !== "confirmed") {
    if (product) {
      // 구매자에게 알림
      await Notification.create({
        user: reservation.buyer,
        type: "reservation_confirmed",
        title: "예약이 확정되었습니다",
        message: `"${product.title}" 상품의 예약이 확정되었습니다.`,
        relatedProduct: product._id,
        relatedReservation: reservation._id,
      });

      // 푸시 알림 전송
      const { sendPushNotification } = await import("./notifications");
      await sendPushNotification(
        String(reservation.buyer),
        "예약이 확정되었습니다",
        `"${product.title}" 상품의 예약이 확정되었습니다.`,
        { url: `/listing/${product._id}` }
      );
    }
  } else if (parsed.data.status === "completed") {
    if (product) {
      product.status = "sold";
      await product.save();

      // 구매자에게 알림
      await Notification.create({
        user: reservation.buyer,
        type: "reservation_completed",
        title: "거래가 완료되었습니다",
        message: `"${product.title}" 상품의 거래가 완료되었습니다.`,
        relatedProduct: product._id,
        relatedReservation: reservation._id,
      });

      // 푸시 알림 전송
      const { sendPushNotification } = await import("./notifications");
      await sendPushNotification(
        String(reservation.buyer),
        "거래가 완료되었습니다",
        `"${product.title}" 상품의 거래가 완료되었습니다.`,
        { url: `/listing/${product._id}` }
      );
    }
  }

  return res.json({ ok: true, reservation });
});

export default router;
