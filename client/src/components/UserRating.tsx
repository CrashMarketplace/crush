import { useEffect, useState } from "react";

interface UserRatingProps {
  userId: string;
  showDetails?: boolean;
}

interface UserStats {
  mannerTemperature: number;
  trustScore: number;
  totalReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  completedTransactions: number;
}

export default function UserRating({ userId, showDetails = false }: UserRatingProps) {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    fetch(`/api/auth/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setStats({
            mannerTemperature: data.user.mannerTemperature || 36.5,
            trustScore: data.user.trustScore || 0,
            totalReviews: data.user.totalReviews || 0,
            positiveReviews: data.user.positiveReviews || 0,
            negativeReviews: data.user.negativeReviews || 0,
            completedTransactions: data.user.completedTransactions || 0,
          });
        }
      })
      .catch((err) => console.error("사용자 정보 로드 실패:", err));
  }, [userId]);

  if (!stats) return null;

  const getTemperatureColor = (temp: number) => {
    if (temp >= 40) return "text-red-500";
    if (temp >= 37) return "text-orange-500";
    if (temp >= 35) return "text-blue-500";
    return "text-gray-500";
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌡️</span>
          <div>
            <div className="text-sm text-gray-600">매너 온도</div>
            <div className={`text-2xl font-bold ${getTemperatureColor(stats.mannerTemperature)}`}>
              {stats.mannerTemperature}°C
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="text-sm text-gray-600">신뢰 지수</div>
            <div className={`text-2xl font-bold ${getTrustColor(stats.trustScore)}`}>
              {stats.trustScore}점
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="border-t pt-3 mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">총 리뷰</span>
            <span className="font-medium">{stats.totalReviews}개</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">긍정 리뷰</span>
            <span className="font-medium text-green-600">{stats.positiveReviews}개</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">부정 리뷰</span>
            <span className="font-medium text-red-600">{stats.negativeReviews}개</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">완료된 거래</span>
            <span className="font-medium">{stats.completedTransactions}건</span>
          </div>
        </div>
      )}
    </div>
  );
}
