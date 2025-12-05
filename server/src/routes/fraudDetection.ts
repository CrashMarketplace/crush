import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import fraudDetectionService from "../services/fraudDetection";

const router = Router();

/**
 * GET /api/fraud-detection/analyze/:productId
 * 상품에 대한 사기 위험 분석
 */
router.get("/analyze/:productId", requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { sellerId } = req.query;

    if (!sellerId || typeof sellerId !== "string") {
      return res.status(400).json({ error: "판매자 ID가 필요합니다." });
    }

    const analysis = await fraudDetectionService.analyzeFraudRisk({
      productId,
      sellerId,
    });

    res.json(analysis);
  } catch (error: any) {
    console.error("사기 위험 분석 오류:", error);
    res.status(500).json({ error: error.message || "분석 중 오류가 발생했습니다." });
  }
});

export default router;
