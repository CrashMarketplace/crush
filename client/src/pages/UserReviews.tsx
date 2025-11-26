import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import UserRating from "../components/UserRating";

interface Review {
  _id: string;
  rating: number;
  reviewType: string;
  comment: string;
  tags: string[];
  punctuality: number;
  kindness: number;
  communication: number;
  productCondition?: number;
  createdAt: string;
  reviewer: {
    userId: string;
    displayName: string;
    avatarUrl: string;
  };
}

export default function UserReviews() {
  const { userId } = useParams<{ userId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!userId) return;

    // 사용자 정보 가져오기
    fetch(`/api/auth/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.displayName || data.user.userId);
        }
      });

    // 리뷰 가져오기
    fetch(`/api/reviews/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("리뷰 로드 실패:", err);
        setLoading(false);
      });
  }, [userId]);

  const getReviewTypeEmoji = (type: string) => {
    switch (type) {
      case "positive":
        return "😊";
      case "neutral":
        return "😐";
      case "negative":
        return "😞";
      default:
        return "⭐";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link to={`/profile/${userId}`} className="text-blue-500 hover:underline mb-2 inline-block">
          ← 프로필로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold mb-4">{userName}님의 리뷰</h1>
        {userId && <UserRating userId={userId} showDetails />}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📝</div>
          <div className="text-gray-600">아직 받은 리뷰가 없습니다</div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {review.reviewer.avatarUrl ? (
                      <img
                        src={review.reviewer.avatarUrl}
                        alt={review.reviewer.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{review.reviewer.displayName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getReviewTypeEmoji(review.reviewType)}</span>
                  <div className="text-xl font-bold">
                    {"⭐".repeat(review.rating)}
                  </div>
                </div>
              </div>

              {/* 세부 평가 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">시간약속</div>
                  <div className="font-medium">{review.punctuality}/5</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">친절도</div>
                  <div className="font-medium">{review.kindness}/5</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">의사소통</div>
                  <div className="font-medium">{review.communication}/5</div>
                </div>
                {review.productCondition && (
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">상품상태</div>
                    <div className="font-medium">{review.productCondition}/5</div>
                  </div>
                )}
              </div>

              {/* 태그 */}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 코멘트 */}
              {review.comment && (
                <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {review.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
