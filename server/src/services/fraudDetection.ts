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

// 🔥 위험 키워드 (리뷰용)
const RISK_KEYWORDS = [
  "노쇼", "입금", "선입금", "말 바꿈", "연락두절", "사기",
  "환불거부", "거짓말", "불친절", "위협", "욕설",
  "먹튀", "차단", "신고", "경찰", "고소", "피해",
  "속았", "조심", "주의", "의심", "이상함", "수상"
];

// 🔥 가짜 상품 키워드 (상품명/설명용)
const FAKE_PRODUCT_KEYWORDS = [
  // 정치인
  "노무현", "문재인", "윤석열", "이명박", "박근혜", "김대중", "전두환", "노태우",
  "이재명", "홍준표", "안철수", "심상정", "유승민", "김무성", "나경원",
  // 연예인/유명인
  "BTS", "방탄소년단", "블랙핑크", "아이유", "손흥민", "김연아", "박지성",
  "싸이", "빅뱅", "트와이스", "엑소", "레드벨벳", "뉴진스", "에스파",
  // 욕설/비속어
  "시발", "씨발", "ㅅㅂ", "개새", "병신", "ㅂㅅ", "좆", "ㅈ같", "엿먹",
  "응디", "ㅇㄷ", "꺼져", "죽어", "디져", "뒤져",
  // 정치/사회 이슈
  "민주당", "국민의힘", "정의당", "진보당", "좌파", "우파", "종북", "빨갱이",
  // 기타 부적절
  "마약", "대마초", "필로폰", "총기", "폭탄", "테러"
];

// 🔥 의심스러운 리뷰 패턴
const SUSPICIOUS_PATTERNS = [
  /ㅋ{3,}/g,           // ㅋㅋㅋ 이상
  /ㅎ{3,}/g,           // ㅎㅎㅎ 이상
  /\.{3,}/g,           // ... 이상
  /!{3,}/g,            // !!! 이상
  /\?{3,}/g,           // ??? 이상
  /(.)\1{4,}/g,        // 같은 글자 5번 이상 반복
  /^.{1,5}$/,          // 5글자 이하 짧은 리뷰
  /[ㄱ-ㅎㅏ-ㅣ]{5,}/,  // 자음/모음만 5개 이상
];

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

    // 2. 각 항목별 위험도 분석
    const productAnalysis = this.analyzeProductContent(product);  // 🔥 상품 내용 분석 추가
    const reviewAnalysis = this.analyzeReviewPattern(sellerReviews);
    const behaviorAnalysis = this.analyzeBehaviorPattern(seller, sellerProducts, sellerReservations);

    // 3. 종합 위험 점수 계산
    const weights = {
      product: 0.50,       // 50% - 상품 내용 (가장 중요!)
      review: 0.40,        // 40% - 리뷰 패턴
      behavior: 0.10,      // 10% - 행동 패턴
    };

    const riskScore = Math.round(
      productAnalysis.score * weights.product +
      reviewAnalysis.score * weights.review +
      behaviorAnalysis.score * weights.behavior
    );

    // 4. 위험 요소 수집
    const riskFactors: string[] = [];
    
    if (productAnalysis.score > 50) riskFactors.push(productAnalysis.description);
    if (reviewAnalysis.score > 50) riskFactors.push(reviewAnalysis.description);
    if (behaviorAnalysis.score > 50) riskFactors.push(behaviorAnalysis.description);

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
        accountAge: { score: 0, description: "분석 안함" },
        transactionHistory: { score: 0, description: "분석 안함" },
        priceAnalysis: { score: 0, description: "분석 안함" },
        reviewPattern: reviewAnalysis,
        behaviorPattern: behaviorAnalysis,
      },
    };
  }

  /**
   * 🔥 상품 내용 분석 (가짜 상품 감지)
   */
  private analyzeProductContent(product: any): { score: number; description: string } {
    const title = (product.title || "").toLowerCase();
    const productDesc = (product.description || "").toLowerCase();
    const fullText = `${title} ${productDesc}`;

    // 가짜 상품 키워드 검색
    const foundKeywords: string[] = [];
    
    FAKE_PRODUCT_KEYWORDS.forEach(keyword => {
      if (fullText.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    });

    let score = 0;
    let description = "";

    if (foundKeywords.length > 0) {
      score = 100;  // 최고 위험도!
      description = `🚨 가짜 상품 의심: "${foundKeywords.slice(0, 3).join(", ")}" 포함`;
    } else if (title.length < 3) {
      score = 70;
      description = "⚠️ 상품명이 너무 짧음";
    } else if (productDesc.length < 10) {
      score = 50;
      description = "⚠️ 상품 설명이 너무 짧음";
    } else {
      score = 0;
      description = "✅ 정상 상품";
    }

    return { score, description };
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
   * 리뷰 패턴 분석 (강화)
   */
  private analyzeReviewPattern(reviews: any[]): { score: number; description: string } {
    if (reviews.length === 0) {
      return { score: 40, description: "리뷰 없음 (신뢰도 낮음)" };
    }

    const negativeCount = reviews.filter(r => r.reviewType === "negative").length;
    const negativeRate = (negativeCount / reviews.length) * 100;

    // 🔥 위험 키워드 검색
    let riskKeywordCount = 0;
    const foundKeywords: string[] = [];

    reviews.forEach(review => {
      const comment = (review.comment || "").toLowerCase();
      RISK_KEYWORDS.forEach(keyword => {
        if (comment.includes(keyword)) {
          riskKeywordCount++;
          if (!foundKeywords.includes(keyword)) {
            foundKeywords.push(keyword);
          }
        }
      });
    });

    // 🔥 의심스러운 패턴 검색
    let suspiciousPatternCount = 0;
    const foundPatterns: string[] = [];

    reviews.forEach(review => {
      const comment = review.comment || "";
      
      SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
        if (pattern.test(comment)) {
          suspiciousPatternCount++;
          
          // 패턴별 설명
          const patternNames = [
            "과도한 ㅋㅋㅋ",
            "과도한 ㅎㅎㅎ", 
            "과도한 ...",
            "과도한 !!!",
            "과도한 ???",
            "같은 글자 반복",
            "너무 짧은 리뷰",
            "자음/모음만 사용"
          ];
          
          if (!foundPatterns.includes(patternNames[index])) {
            foundPatterns.push(patternNames[index]);
          }
        }
      });
    });

    let score = 0;
    let description = "";

    // 🔥 점수 계산 (더 민감하게)
    if (riskKeywordCount > 0) {
      score = 90;
      description = `⚠️ 위험 키워드 발견: ${foundKeywords.join(", ")}`;
    } else if (suspiciousPatternCount >= 3) {
      score = 80;
      description = `⚠️ 의심스러운 리뷰 패턴: ${foundPatterns.slice(0, 3).join(", ")}`;
    } else if (suspiciousPatternCount >= 1) {
      score = 60;
      description = `⚡ 부적절한 리뷰: ${foundPatterns.join(", ")}`;
    } else if (negativeRate > 50) {
      score = 70;
      description = `부정 리뷰 ${negativeRate.toFixed(0)}%`;
    } else if (negativeRate > 30) {
      score = 50;
      description = `부정 리뷰 ${negativeRate.toFixed(0)}%`;
    } else if (reviews.length < 3) {
      score = 20;
      description = `리뷰 부족 (${reviews.length}개)`;
    } else {
      score = 0;
      description = `✅ 정상 리뷰 패턴 (${reviews.length}개)`;
    }

    return { score, description };
  }

  /**
   * 행동 패턴 분석
   */
  private analyzeBehaviorPattern(
    seller: any,
    products: any[],
    reservations: any[]
  ): { score: number; description: string } {
    // 최근 24시간 내 등록한 상품 수
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentProducts = products.filter(
      p => new Date(p.createdAt).getTime() > oneDayAgo
    );

    // 매너 온도
    const mannerTemp = seller.mannerTemperature || 36.5;

    // 신뢰 지수
    const trustScore = seller.trustScore || 0;

    let score = 0;
    let description = "";

    if (recentProducts.length > 10) {
      score = 70;
      description = `24시간 내 ${recentProducts.length}개 상품 등록 (과다)`;
    } else if (mannerTemp < 20) {
      score = 80;
      description = `매너 온도 매우 낮음 (${mannerTemp.toFixed(1)}°C)`;
    } else if (trustScore < 20 && seller.totalReviews > 5) {
      score = 60;
      description = `신뢰 지수 낮음 (${trustScore}점)`;
    } else if (recentProducts.length > 5) {
      score = 30;
      description = `최근 활발한 상품 등록 (${recentProducts.length}개)`;
    } else {
      score = 0;
      description = "정상 활동 패턴";
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
