import { useEffect, useState } from "react";
import { API_BASE } from "../utils/apiConfig";

interface FraudAnalysisResult {
  riskScore: number;
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

interface FraudRiskBadgeProps {
  productId: string;
  sellerId: string;
  compact?: boolean;
}

export default function FraudRiskBadge({ productId, sellerId, compact = false }: FraudRiskBadgeProps) {
  const [analysis, setAnalysis] = useState<FraudAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalysis();
  }, [productId, sellerId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/fraud-detection/analyze/${productId}?sellerId=${sellerId}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("분석 실패");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error("사기 위험 분석 오류:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "낮음":
        return "bg-green-100 text-green-800 border-green-300";
      case "보통":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "높음":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "낮음":
        return "✅";
      case "보통":
        return "⚡";
      case "높음":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer ${getRiskColor(
          analysis.riskLevel
        )}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span>{getRiskIcon(analysis.riskLevel)}</span>
        <span>위험도: {analysis.riskLevel}</span>
        <span className="text-xs opacity-75">({analysis.riskScore}점)</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div
        className={`p-4 border-b cursor-pointer ${getRiskColor(analysis.riskLevel)}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getRiskIcon(analysis.riskLevel)}</span>
            <div>
              <h3 className="font-bold text-lg">AI 사기 위험 분석</h3>
              <p className="text-sm opacity-90">
                위험도: <span className="font-bold">{analysis.riskLevel}</span> (
                {analysis.riskScore}점)
              </p>
            </div>
          </div>
          <button className="text-xl">
            {showDetails ? "▼" : "▶"}
          </button>
        </div>
      </div>

      {/* 권장사항 */}
      <div className="p-4 bg-gray-50 border-b">
        <p className="text-sm leading-relaxed">{analysis.recommendation}</p>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div className="p-4 space-y-4">
          {/* 위험 요소 */}
          <div>
            <h4 className="font-semibold mb-2 text-sm text-gray-700">🔍 감지된 위험 요소</h4>
            <ul className="space-y-1">
              {analysis.riskFactors.map((factor, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 상세 분석 */}
          <div>
            <h4 className="font-semibold mb-2 text-sm text-gray-700">📊 상세 분석</h4>
            <div className="space-y-2">
              {Object.entries(analysis.reasoning).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{getReasoningLabel(key)}</span>
                      <span className="text-xs font-medium">{value.score}점</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          value.score > 60
                            ? "bg-red-500"
                            : value.score > 30
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${value.score}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 새로고침 버튼 */}
          <button
            onClick={fetchAnalysis}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            🔄 분석 새로고침
          </button>
        </div>
      )}
    </div>
  );
}

function getReasoningLabel(key: string): string {
  const labels: Record<string, string> = {
    accountAge: "계정 나이",
    transactionHistory: "거래 이력",
    priceAnalysis: "가격 분석",
    reviewPattern: "리뷰 패턴",
    behaviorPattern: "행동 패턴",
  };
  return labels[key] || key;
}
