import Product from "../models/Product";
import User from "../models/User";
import Review from "../models/Review";
import Reservation from "../models/Reservation";
import { Types } from "mongoose";

interface FraudAnalysisInput {
  productId: string;
  sellerId: string;
}

interface FraudAnalysisResult {
  riskScore: number; // 0-100
  riskLevel: "낮음" | "보통" | "높음";
  riskFactors: string[];
  recommendation: string;
  reasoning: {
    accountAge: { score: number; description: string };
    transactionHistory: { score: number; description: string };
    priceAnalysis: { score: number; description: string };
    reviewPattern: { score: number; description: string };
    behaviorPattern: { score: number; description: string };
  };
}

// 카테고리별 평균 시세 (실제로는 DB에서 통계 계산)
const CATEGORY_AVERAGE_PRICES: Record<string, number> = {
  "전자기기": 300000,
  "가구/인테리어": 150000,
  "의류": 30000,
  "도서": 10000,
  "스포츠/레저": 80000,
  "생활용품": 20000,
  "기타": 50000,
};

// AI 분석을 위한 데이터 구조
interface AnalysisData {
  product: {
    title: string;
    description: string;
    price: number;
    category: string;
    images: number;
    createdAt: Date;
  };
  seller: {
    displayName: string;
    createdAt: Date;
    completedTransactions: number;
    mannerTemperature: number;
    trustScore: number;
    totalReviews: number;
  };
  reviews: Array<{
    comment: string;
    reviewType: string;
    createdAt: Date;
  }>;
  behavior: {
    recentProductCount: number;
    totalProducts: number;
    reservationCancelRate: number;
  };
}

export class FraudDetectionService {
  /**
   * 상품 및 판매자에 대한 사기 위험 분석
   */
  async analyzeFraudRisk(input: FraudAnalysisInput): Promise<FraudAnalysisResult> {
    const { productId, sellerId } = input;

    // 1. 데이터 수집
    const product = await Product.findById(productId);
    const seller = await User.findById(sellerId);
    
    if (!product || !seller) {
      throw new Error("상품 또는 판매자를 찾을 수 없습니다.");
    }

    // 판매자의 모든 상품
    const sellerProducts = await Product.find({ seller: sellerId });
    
    // 판매자가 받은 리뷰
    const sellerReviews = await Review.find({ reviewee: sellerId })
      .populate("reviewer", "displayName")
      .sort({ createdAt: -1 });
    
    // 판매자의 예약 기록
    const sellerReservations = await Reservation.find({ seller: sellerId });

    // 2. AI 분석을 위한 데이터 준비
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentProducts = sellerProducts.filter(p => new Date(p.createdAt).getTime() > oneDayAgo);
    const cancelledReservations = sellerReservations.filter(r => r.status === "cancelled");
    const cancelRate = sellerReservations.length > 0 ? (cancelledReservations.length / sellerReservations.length) * 100 : 0;

    const analysisData: AnalysisData = {
      product: {
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        category: product.category || "기타",
        images: product.images?.length || 0,
        createdAt: product.createdAt
      },
      seller: {
        displayName: seller.displayName || "",
        createdAt: seller.createdAt,
        completedTransactions: seller.completedTransactions || 0,
        mannerTemperature: seller.mannerTemperature || 36.5,
        trustScore: seller.trustScore || 0,
        totalReviews: seller.totalReviews || 0
      },
      reviews: sellerReviews.map(r => ({
        comment: r.comment || "",
        reviewType: r.reviewType || "positive",
        createdAt: r.createdAt
      })),
      behavior: {
        recentProductCount: recentProducts.length,
        totalProducts: sellerProducts.length,
        reservationCancelRate: cancelRate
      }
    };

    // 3. AI 기반 종합 분석
    const aiAnalysis = await this.performAIAnalysis(analysisData);
    const riskScore = aiAnalysis.score;
    const riskFactors = aiAnalysis.factors;

    // 5. 위험 레벨 결정
    let riskLevel: "낮음" | "보통" | "높음";
    if (riskScore < 30) riskLevel = "낮음";
    else if (riskScore < 60) riskLevel = "보통";
    else riskLevel = "높음";

    // 6. 권장사항 생성
    const recommendation = this.generateRecommendation(riskLevel, riskFactors);

    return {
      riskScore,
      riskLevel,
      riskFactors: riskFactors.length > 0 ? riskFactors : ["특이사항 없음"],
      recommendation,
      reasoning: {
        accountAge: { score: 0, description: "AI 종합 분석으로 대체" },
        transactionHistory: { score: 0, description: "AI 종합 분석으로 대체" },
        priceAnalysis: { score: 0, description: "AI 종합 분석으로 대체" },
        reviewPattern: { score: riskScore, description: aiAnalysis.description },
        behaviorPattern: { score: 0, description: "AI 종합 분석에 포함" },
      },
    };
  }

  /**
   * 🤖 AI 기반 종합 분석
   */
  private async performAIAnalysis(data: AnalysisData): Promise<{ score: number; description: string; factors: string[] }> {
    // 실제 AI 분석 로직 (현재는 휴리스틱 기반으로 구현)
    let riskScore = 0;
    const riskFactors: string[] = [];

    // 1. 상품 품질 분석
    const productQuality = this.analyzeProductQuality(data.product);
    riskScore += productQuality.score * 0.3;
    if (productQuality.score > 50) riskFactors.push(productQuality.description);

    // 2. 판매자 신뢰도 분석
    const sellerTrust = this.analyzeSellerTrustability(data.seller);
    riskScore += sellerTrust.score * 0.25;
    if (sellerTrust.score > 50) riskFactors.push(sellerTrust.description);

    // 3. 리뷰 감정 분석
    const reviewSentiment = this.analyzeReviewSentiment(data.reviews);
    riskScore += reviewSentiment.score * 0.25;
    if (reviewSentiment.score > 50) riskFactors.push(reviewSentiment.description);

    // 4. 행동 패턴 분석
    const behaviorPattern = this.analyzeBehaviorAnomalies(data.behavior);
    riskScore += behaviorPattern.score * 0.2;
    if (behaviorPattern.score > 50) riskFactors.push(behaviorPattern.description);

    const finalScore = Math.round(riskScore);
    let description = "";

    if (finalScore >= 70) {
      description = "🚨 AI가 높은 사기 위험을 감지했습니다";
    } else if (finalScore >= 40) {
      description = "⚠️ AI가 중간 수준의 위험을 감지했습니다";
    } else {
      description = "✅ AI 분석 결과 비교적 안전합니다";
    }

    return { score: finalScore, description, factors: riskFactors };
  }

  /**
   * 상품 품질 분석
   */
  private analyzeProductQuality(product: any): { score: number; description: string } {
    let score = 0;
    let issues: string[] = [];

    // 제목 품질
    if (!product.title || product.title.length < 5) {
      score += 30;
      issues.push("제목 부실");
    }

    // 설명 품질
    if (!product.description || product.description.length < 20) {
      score += 25;
      issues.push("설명 부족");
    }

    // 이미지 수
    if (product.images < 2) {
      score += 20;
      issues.push("이미지 부족");
    }

    // 가격 합리성 (카테고리 대비)
    const avgPrice = CATEGORY_AVERAGE_PRICES[product.category] || 50000;
    if (product.price < avgPrice * 0.1) {
      score += 40;
      issues.push("비정상적 저가");
    }

    return {
      score: Math.min(score, 100),
      description: issues.length > 0 ? `상품 품질 문제: ${issues.join(", ")}` : "상품 품질 양호"
    };
  }

  /**
   * 판매자 신뢰도 분석
   */
  private analyzeSellerTrustability(seller: any): { score: number; description: string } {
    let score = 0;
    let issues: string[] = [];

    // 계정 나이
    const accountDays = Math.floor((Date.now() - new Date(seller.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (accountDays < 7) {
      score += 40;
      issues.push("신규 계정");
    }

    // 거래 경험
    if (seller.completedTransactions < 3) {
      score += 30;
      issues.push("거래 경험 부족");
    }

    // 매너 온도
    if (seller.mannerTemperature < 30) {
      score += 35;
      issues.push("낮은 매너 온도");
    }

    // 신뢰 점수
    if (seller.trustScore < 50 && seller.totalReviews > 5) {
      score += 25;
      issues.push("낮은 신뢰 점수");
    }

    return {
      score: Math.min(score, 100),
      description: issues.length > 0 ? `판매자 신뢰도 문제: ${issues.join(", ")}` : "판매자 신뢰도 양호"
    };
  }

  /**
   * 리뷰 감정 분석
   */
  private analyzeReviewSentiment(reviews: any[]): { score: number; description: string } {
    if (reviews.length === 0) {
      return { score: 30, description: "리뷰 없음" };
    }

    let score = 0;
    let negativeCount = 0;
    let suspiciousCount = 0;

    reviews.forEach(review => {
      if (review.reviewType === "negative") {
        negativeCount++;
      }

      const comment = review.comment || "";
      
      // 의심스러운 패턴 감지 (간단한 휴리스틱)
      if (comment.length < 5 || 
          /ㅋ{3,}/.test(comment) || 
          /ㅎ{3,}/.test(comment) ||
          /[ㄱ-ㅎㅏ-ㅣ]{5,}/.test(comment)) {
        suspiciousCount++;
      }
    });

    const negativeRate = (negativeCount / reviews.length) * 100;
    const suspiciousRate = (suspiciousCount / reviews.length) * 100;

    if (negativeRate > 60) {
      score += 50;
    } else if (negativeRate > 30) {
      score += 25;
    }

    if (suspiciousRate > 40) {
      score += 40;
    } else if (suspiciousRate > 20) {
      score += 20;
    }

    let description = "";
    if (score > 50) {
      description = `리뷰 패턴 이상: 부정 ${negativeRate.toFixed(0)}%, 의심 ${suspiciousRate.toFixed(0)}%`;
    } else {
      description = "리뷰 패턴 정상";
    }

    return { score: Math.min(score, 100), description };
  }

  /**
   * 행동 패턴 이상 감지
   */
  private analyzeBehaviorAnomalies(behavior: any): { score: number; description: string } {
    let score = 0;
    let issues: string[] = [];

    // 과도한 상품 등록
    if (behavior.recentProductCount > 10) {
      score += 40;
      issues.push("과도한 상품 등록");
    }

    // 높은 예약 취소율
    if (behavior.reservationCancelRate > 50) {
      score += 35;
      issues.push("높은 취소율");
    }

    return {
      score: Math.min(score, 100),
      description: issues.length > 0 ? `행동 패턴 이상: ${issues.join(", ")}` : "행동 패턴 정상"
    };
  }

  /**
   * 계정 나이 분석
   */
  private analyzeAccountAge(seller: any): { score: number; description: string } {
    const accountAgeDays = Math.floor(
      (Date.now() - new Date(seller.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    let score = 0;
    let description = "";

    if (accountAgeDays < 7) {
      score = 80;
      description = `신규 계정 (가입 ${accountAgeDays}일)`;
    } else if (accountAgeDays < 30) {
      score = 50;
      description = `최근 가입 계정 (가입 ${accountAgeDays}일)`;
    } else if (accountAgeDays < 90) {
      score = 20;
      description = `일반 계정 (가입 ${accountAgeDays}일)`;
    } else {
      score = 0;
      description = `신뢰 계정 (가입 ${accountAgeDays}일)`;
    }

    return { score, description };
  }

  /**
   * 거래 이력 분석
   */
  private analyzeTransactionHistory(
    seller: any,
    reservations: any[]
  ): { score: number; description: string } {
    const completedCount = seller.completedTransactions || 0;
    const totalReservations = reservations.length;
    const cancelledCount = reservations.filter(r => r.status === "cancelled").length;
    const cancelRate = totalReservations > 0 ? (cancelledCount / totalReservations) * 100 : 0;

    let score = 0;
    let description = "";

    if (completedCount === 0) {
      score = 70;
      description = "이전 거래 없음";
    } else if (completedCount < 3) {
      score = 40;
      description = `거래 경험 적음 (${completedCount}건)`;
    } else if (cancelRate > 50) {
      score = 60;
      description = `예약 취소율 높음 (${cancelRate.toFixed(0)}%)`;
    } else if (completedCount >= 10) {
      score = 0;
      description = `활발한 거래 이력 (${completedCount}건)`;
    } else {
      score = 10;
      description = `정상 거래 이력 (${completedCount}건)`;
    }

    return { score, description };
  }

  /**
   * 가격 분석 (시세 대비)
   */
  private async analyzePriceRisk(
    product: any,
    sellerProducts: any[]
  ): Promise<{ score: number; description: string }> {
    const category = product.category || "기타";
    const avgPrice = CATEGORY_AVERAGE_PRICES[category] || CATEGORY_AVERAGE_PRICES["기타"];
    
    // 같은 카테고리의 다른 상품들 평균 가격 계산
    const categoryProducts = await Product.find({ 
      category,
      status: "selling",
      _id: { $ne: product._id }
    }).limit(50);

    let marketAvgPrice = avgPrice;
    if (categoryProducts.length > 0) {
      const sum = categoryProducts.reduce((acc, p) => acc + p.price, 0);
      marketAvgPrice = sum / categoryProducts.length;
    }

    const priceDiff = ((marketAvgPrice - product.price) / marketAvgPrice) * 100;

    let score = 0;
    let description = "";

    if (priceDiff > 70) {
      score = 90;
      description = `시세보다 ${priceDiff.toFixed(0)}% 저렴 (의심)`;
    } else if (priceDiff > 50) {
      score = 70;
      description = `시세보다 ${priceDiff.toFixed(0)}% 저렴`;
    } else if (priceDiff > 30) {
      score = 40;
      description = `시세보다 ${priceDiff.toFixed(0)}% 저렴 (합리적 할인)`;
    } else if (priceDiff < -50) {
      score = 30;
      description = `시세보다 ${Math.abs(priceDiff).toFixed(0)}% 비쌈`;
    } else {
      score = 0;
      description = "적정 가격대";
    }

    return { score, description };
  }



  /**
   * 권장사항 생성
   */
  private generateRecommendation(
    riskLevel: "낮음" | "보통" | "높음",
    riskFactors: string[]
  ): string {
    if (riskLevel === "높음") {
      return "⚠️ 거래 시 각별한 주의가 필요합니다. 반드시 대면 거래를 권장하며, 선입금은 절대 피하세요. 상품 상태를 직접 확인한 후 거래하시기 바랍니다.";
    } else if (riskLevel === "보통") {
      return "⚡ 거래 전 판매자와 충분히 소통하고, 가능하면 대면 거래를 권장합니다. 상품 상태와 가격을 꼼꼼히 확인하세요.";
    } else {
      return "✅ 비교적 안전한 거래로 판단됩니다. 그래도 거래 시 기본적인 주의사항을 지켜주세요.";
    }
  }
}

export default new FraudDetectionService();
