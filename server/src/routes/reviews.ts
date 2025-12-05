import { Router } from "express";
import Review from "../models/Review";
import Reservation from "../models/Reservation";
import User from "../models/User";
import { requireAuth } from "../middleware/auth";

const router = Router();

// 리뷰 작성
router.post("/", requireAuth, async (req, res) => {
  try {
    const { reservationId, rating, reviewType, comment, tags, punctuality, kindness, communication, productCondition } = req.body;
    const reviewerId = req.user!._id;

    // 예약 확인
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다" });
    }

    // 거래 완료 상태인지 확인
    if (reservation.status !== "completed") {
      return res.status(400).json({ error: "완료된 거래만 리뷰를 작성할 수 있습니다" });
    }

    // 구매자 또는 판매자인지 확인
    const isBuyer = reservation.buyer.toString() === reviewerId.toString();
    const isSeller = reservation.seller.toString() === reviewerId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: "이 거래의 당사자만 리뷰를 작성할 수 있습니다" });
    }

    // 이미 리뷰를 작성했는지 확인
    if (isBuyer && reservation.buyerReviewed) {
      return res.status(400).json({ error: "이미 리뷰를 작성했습니다" });
    }
    if (isSeller && reservation.sellerReviewed) {
      return res.status(400).json({ error: "이미 리뷰를 작성했습니다" });
    }

    // 리뷰 대상자 결정
    const revieweeId = isBuyer ? reservation.seller : reservation.buyer;

    // 리뷰 생성
    const review = await Review.create({
      reservation: reservationId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      reviewType,
      comment,
      tags: tags || [],
      punctuality,
      kindness,
      communication,
      productCondition: isBuyer ? productCondition : undefined,
    });

    // 예약에 리뷰 완료 표시
    if (isBuyer) {
      reservation.buyerReviewed = true;
    } else {
      reservation.sellerReviewed = true;
    }
    await reservation.save();

    // 사용자 평가 점수 업데이트
    await updateUserRating(revieweeId.toString());

    res.json(review);
  } catch (error) {
    console.error("리뷰 작성 오류:", error);
    res.status(500).json({ error: "리뷰 작성에 실패했습니다" });
  }
});

// 사용자가 받은 리뷰 조회
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "userId displayName avatarUrl")
      .populate("reservation")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    res.status(500).json({ error: "리뷰 조회에 실패했습니다" });
  }
});

// 특정 예약의 리뷰 조회
router.get("/reservation/:reservationId", requireAuth, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user!._id;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다" });
    }

    // 당사자만 조회 가능
    if (
      reservation.buyer.toString() !== userId.toString() &&
      reservation.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({ error: "권한이 없습니다" });
    }

    const reviews = await Review.find({ reservation: reservationId })
      .populate("reviewer", "userId displayName avatarUrl")
      .populate("reviewee", "userId displayName avatarUrl");

    res.json(reviews);
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    res.status(500).json({ error: "리뷰 조회에 실패했습니다" });
  }
});

// 사용자 평가 점수 업데이트 함수
async function updateUserRating(userId: string) {
  const reviews = await Review.find({ reviewee: userId });

  if (reviews.length === 0) return;

  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter((r) => r.reviewType === "positive").length;
  const negativeReviews = reviews.filter((r) => r.reviewType === "negative").length;

  // 평균 별점 계산
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  // 매너 온도 계산 (36.5 기준, 별점에 따라 증감)
  // 5점: +1.0, 4점: +0.5, 3점: 0, 2점: -0.5, 1점: -1.0
  const mannerTemperature = Math.max(
    0,
    Math.min(100, 36.5 + (avgRating - 3) * totalReviews * 0.5)
  );

  // 신뢰 지수 계산 (긍정 리뷰 비율 기반)
  const trustScore = totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0;

  await User.findByIdAndUpdate(userId, {
    mannerTemperature: Math.round(mannerTemperature * 10) / 10,
    trustScore: Math.round(trustScore),
    totalReviews,
    positiveReviews,
    negativeReviews,
  });
}

export default router;
