import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../utils/apiConfig";
import { usePageTitle } from "../hooks/usePageTitle";

type Product = {
  _id: string;
  title: string;
  price: number;
  seller: { _id: string; userId: string; displayName: string };
  status: string;
  createdAt: string;
};

type FraudAnalysisResult = {
  riskScore: number;
  riskLevel: "낮음" | "보통" | "높음";
  riskFactors: string[];
};

type ProductWithRisk = Product & {
  riskAnalysis?: FraudAnalysisResult;
  analyzing?: boolean;
};

export default function FraudAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithRisk[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "높음" | "보통" | "낮음">("all");

  usePageTitle("사기 위험 분석", "BILIDA - AI 사기 위험 분석 대시보드");

  useEffect(() => {
    if (!user?.isAdmin) {
      alert("관리자만 접근할 수 있습니다.");
      navigate("/");
      return;
    }
    loadProducts();
  }, [user, navigate]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "상품 목록을 불러올 수 없습니다.");
      }
      setProducts(data.products || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProduct = async (productId: string, sellerId: string) => {
    setProducts((prev: ProductWithRisk[]) =>
      prev.map((p: ProductWithRisk) =>
        p._id === productId ? { ...p, analyzing: true } : p
      )
    );

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

      const analysis = await res.json();
      setProducts((prev: ProductWithRisk[]) =>
        prev.map((p: ProductWithRisk) =>
          p._id === productId
            ? { ...p, riskAnalysis: analysis, analyzing: false }
            : p
        )
      );
    } catch (err: any) {
      console.error("분석 오류:", err);
      setProducts((prev: ProductWithRisk[]) =>
        prev.map((p: ProductWithRisk) =>
          p._id === productId ? { ...p, analyzing: false } : p
        )
      );
      alert("분석 중 오류가 발생했습니다.");
    }
  };

  const analyzeAll = async () => {
    const unanalyzed = products.filter((p) => !p.riskAnalysis);
    for (const product of unanalyzed) {
      await analyzeProduct(product._id, product.seller._id);
      // 요청 간격 조절 (서버 부하 방지)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "낮음":
        return "bg-green-100 text-green-800";
      case "보통":
        return "bg-yellow-100 text-yellow-800";
      case "높음":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    return p.riskAnalysis?.riskLevel === filter;
  });

  const stats = {
    total: products.length,
    analyzed: products.filter((p: ProductWithRisk) => p.riskAnalysis).length,
    high: products.filter((p: ProductWithRisk) => p.riskAnalysis?.riskLevel === "높음").length,
    medium: products.filter((p: ProductWithRisk) => p.riskAnalysis?.riskLevel === "보통").length,
    low: products.filter((p: ProductWithRisk) => p.riskAnalysis?.riskLevel === "낮음").length,
  };

  if (loading) {
    return (
      <div className="container py-10 text-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔍 AI 사기 위험 분석 대시보드</h1>
        <p className="text-gray-600">
          등록된 상품의 사기 위험도를 AI가 자동으로 분석합니다.
        </p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">전체 상품</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">분석 완료</div>
          <div className="text-2xl font-bold text-blue-600">{stats.analyzed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">높은 위험</div>
          <div className="text-2xl font-bold text-red-600">{stats.high}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">보통 위험</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">낮은 위험</div>
          <div className="text-2xl font-bold text-green-600">{stats.low}</div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={analyzeAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          전체 분석 시작
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === "all"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter("높음")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === "높음"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            높음
          </button>
          <button
            onClick={() => setFilter("보통")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === "보통"
                ? "bg-yellow-600 text-white"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            }`}
          >
            보통
          </button>
          <button
            onClick={() => setFilter("낮음")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === "낮음"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            낮음
          </button>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="space-y-3">
        {filteredProducts.map((product: ProductWithRisk) => (
          <div
            key={product._id}
            className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3
                    className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/listing/${product._id}`)}
                  >
                    {product.title}
                  </h3>
                  {product.riskAnalysis && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                        product.riskAnalysis.riskLevel
                      )}`}
                    >
                      {product.riskAnalysis.riskLevel} ({product.riskAnalysis.riskScore}점)
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  판매자: {product.seller.displayName || product.seller.userId} ·{" "}
                  {Number(product.price).toLocaleString()}원 · {product.status}
                </div>
                {product.riskAnalysis && (
                  <div className="text-sm text-gray-700">
                    <div className="font-medium mb-1">위험 요소:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {product.riskAnalysis.riskFactors.map((factor: string, idx: number) => (
                        <li key={idx} className="text-gray-600">
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {!product.riskAnalysis && !product.analyzing && (
                  <button
                    onClick={() => analyzeProduct(product._id, product.seller._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                  >
                    분석하기
                  </button>
                )}
                {product.analyzing && (
                  <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                    분석 중...
                  </div>
                )}
                {product.riskAnalysis && (
                  <button
                    onClick={() => analyzeProduct(product._id, product.seller._id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium whitespace-nowrap"
                  >
                    재분석
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          {filter === "all" ? "상품이 없습니다." : `${filter} 위험도 상품이 없습니다.`}
        </div>
      )}
    </div>
  );
}
