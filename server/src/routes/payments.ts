import { Router } from "express";
import Payment from "../models/Payment";
import Reservation from "../models/Reservation";
import User from "../models/User";
import { requireAuth } from "../middleware/auth";

const router = Router();

// 거래 확정 (현장 결제)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { reservationId, amount, productAmount, platformFee, paymentMethod } = req.body;
    const buyerId = req.user!._id;

    // 예약 확인
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다" });
    }

    // 구매자 확인
    if (reservation.buyer.toString() !== buyerId.toString()) {
      return res.status(403).json({ error: "구매자만 거래를 확정할 수 있습니다" });
    }

    // 이미 결제가 있는지 확인
    const existingPayment = await Payment.findOne({ reservation: reservationId });
    if (existingPayment) {
      return res.status(400).json({ error: "이미 거래가 확정되었습니다" });
    }

    // 거래 확정 (현장 결제 대기)
    const payment = await Payment.create({
      reservation: reservationId,
      buyer: buyerId,
      seller: reservation.seller,
      productAmount,
      platformFee,
      amount,
      paymentMethod: paymentMethod || "in_person",
      status: "pending", // 현장 결제 대기
    });

    // 예약 상태 업데이트
    reservation.paymentRequired = true;
    reservation.paymentAmount = amount;
    reservation.paymentStatus = "pending";
    reservation.paymentMethod = paymentMethod || "in_person";
    reservation.status = "payment_pending";
    await reservation.save();

    res.json(payment);
  } catch (error) {
    console.error("거래 확정 오류:", error);
    res.status(500).json({ error: "거래 확정에 실패했습니다" });
  }
});

// 거래 완료 (현장 결제 완료)
router.post("/:paymentId/complete", requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!._id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "거래를 찾을 수 없습니다" });
    }

    const reservation = await Reservation.findById(payment.reservation);
    if (!reservation) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다" });
    }

    // 구매자만 완료 처리 가능
    if (payment.buyer.toString() !== userId.toString()) {
      return res.status(403).json({ error: "구매자만 거래를 완료할 수 있습니다" });
    }

    // 대기 상태 확인
    if (payment.status !== "pending") {
      return res.status(400).json({ error: "이미 처리된 거래입니다" });
    }

    // 거래 완료 처리
    payment.status = "completed";
    payment.paidAt = new Date();
    await payment.save();

    // 예약 완료 처리
    reservation.status = "completed";
    reservation.paymentStatus = "completed";
    await reservation.save();

    // 판매자 거래 완료 수 증가
    await User.findByIdAndUpdate(payment.seller, {
      $inc: { completedTransactions: 1 },
    });

    res.json({ message: "거래가 완료되었습니다", payment });
  } catch (error) {
    console.error("거래 완료 오류:", error);
    res.status(500).json({ error: "거래 완료에 실패했습니다" });
  }
});

// 거래 취소
router.post("/:paymentId/refund", requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const userId = req.user!._id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "거래를 찾을 수 없습니다" });
    }

    // 구매자 또는 판매자만 취소 가능
    if (
      payment.buyer.toString() !== userId.toString() &&
      payment.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({ error: "권한이 없습니다" });
    }

    // 대기 상태에서만 취소 가능
    if (payment.status !== "pending") {
      return res.status(400).json({ error: "취소할 수 없는 상태입니다" });
    }

    // 취소 처리
    payment.status = "cancelled";
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    // 예약 취소 처리
    const reservation = await Reservation.findById(payment.reservation);
    if (reservation) {
      reservation.status = "cancelled";
      reservation.paymentStatus = "cancelled";
      await reservation.save();
    }

    res.json({ message: "거래가 취소되었습니다", payment });
  } catch (error) {
    console.error("거래 취소 오류:", error);
    res.status(500).json({ error: "거래 취소에 실패했습니다" });
  }
});

// 결제 내역 조회
router.get("/my-payments", requireAuth, async (req, res) => {
  try {
    const userId = req.user!._id;

    const payments = await Payment.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("reservation")
      .populate("buyer", "userId displayName")
      .populate("seller", "userId displayName")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("결제 내역 조회 오류:", error);
    res.status(500).json({ error: "결제 내역 조회에 실패했습니다" });
  }
});

// 특정 결제 조회
router.get("/:paymentId", requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!._id;

    const payment = await Payment.findById(paymentId)
      .populate("reservation")
      .populate("buyer", "userId displayName")
      .populate("seller", "userId displayName");

    if (!payment) {
      return res.status(404).json({ error: "결제를 찾을 수 없습니다" });
    }

    // 당사자만 조회 가능
    if (
      payment.buyer.toString() !== userId.toString() &&
      payment.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({ error: "권한이 없습니다" });
    }

    res.json(payment);
  } catch (error) {
    console.error("결제 조회 오류:", error);
    res.status(500).json({ error: "결제 조회에 실패했습니다" });
  }
});

export default router;
