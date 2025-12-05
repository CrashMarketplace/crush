import { useState } from "react";

interface ReviewModalProps {
  reservationId: string;
  revieweeName: string;
  onClose: () => void;
  onSubmit: () => void;
}

const REVIEW_TAGS = [
  "친절해요",
  "시간약속을 잘 지켜요",
  "응답이 빨라요",
  "매너가 좋아요",
  "상품상태가 좋아요",
  "설명이 자세해요",
];

export default function ReviewModal({ reservationId, revieweeName, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [punctuality, setPunctuality] = useState(5);
  const [kindness, setKindness] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [productCondition, setProductCondition] = useState(5);
  const [loading, setLoading] = useState(false);

  const reviewType = rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reservationId,
          rating,
          reviewType,
          comment,
          tags: selectedTags,
          punctuality,
          kindness,
          communication,
          productCondition,
        }),
      });

      if (res.ok) {
        alert("리뷰가 작성되었습니다!");
        onSubmit();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "리뷰 작성에 실패했습니다");
      }
    } catch (error) {
      console.error("리뷰 작성 오류:", error);
      alert("리뷰 작성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{revieweeName}님과의 거래 어떠셨나요?</h2>

          {/* 별점 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">전체 평가</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  {star <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>

          {/* 세부 평가 */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">시간 약속</label>
              <input
                type="range"
                min="1"
                max="5"
                value={punctuality}
                onChange={(e) => setPunctuality(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-right">{punctuality}/5</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">친절도</label>
              <input
                type="range"
                min="1"
                max="5"
                value={kindness}
                onChange={(e) => setKindness(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-right">{kindness}/5</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">의사소통</label>
              <input
                type="range"
                min="1"
                max="5"
                value={communication}
                onChange={(e) => setCommunication(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-right">{communication}/5</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">상품 상태</label>
              <input
                type="range"
                min="1"
                max="5"
                value={productCondition}
                onChange={(e) => setProductCondition(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-right">{productCondition}/5</div>
            </div>
          </div>

          {/* 태그 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">거래 태그 (선택)</label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 코멘트 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">상세 후기 (선택)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="거래 경험을 자세히 알려주세요"
              className="w-full border rounded-lg p-3 h-24 resize-none"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 text-right">{comment.length}/500</div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "작성 중..." : "리뷰 작성"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
