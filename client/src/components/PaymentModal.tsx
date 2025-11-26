import { useState } from "react";

interface PaymentModalProps {
  reservationId: string;
  productName: string;
  amount: number;
  sellerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  reservationId,
  productName,
  amount,
  sellerName,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"in_person">("in_person");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // 플랫폼 수수료 20%
  const platformFee = Math.round(amount * 0.2);
  const totalAmount = amount + platformFee;

  const handlePayment = async () => {
    if (!agreed) {
      alert("안전거래 이용약관에 동의해주세요");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reservationId,
          amount: totalAmount,
          productAmount: amount,
          platformFee,
          paymentMethod,
        }),
      });

      if (res.ok) {
        alert("거래가 확정되었습니다!\n현장에서 판매자에게 결제해주세요.\n(상품 금액 + 플랫폼 수수료 20%)");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "거래 확정에 실패했습니다");
      }
    } catch (error) {
      console.error("결제 오류:", error);
      alert("결제에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">안전 결제</h2>

          {/* 상품 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-1">상품명</div>
            <div className="font-medium mb-3">{productName}</div>
            <div className="text-sm text-gray-600 mb-1">판매자</div>
            <div className="font-medium mb-3">{sellerName}</div>
            
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">상품 금액</span>
                <span className="font-medium">{amount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">플랫폼 수수료 (20%)</span>
                <span className="font-medium text-orange-600">+{platformFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">총 결제 금액</span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalAmount.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 현장 결제 안내 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">💰</span>
              <div className="text-sm">
                <div className="font-medium text-yellow-900 mb-1">현장 결제 방식</div>
                <div className="text-yellow-700">
                  판매자와 만나서 상품을 확인한 후 현금 또는 계좌이체로 결제해주세요.
                  플랫폼 수수료 20%가 포함된 금액입니다.
                </div>
              </div>
            </div>
          </div>

          {/* 수수료 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-xl">ℹ️</span>
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">플랫폼 수수료 안내</div>
                <div className="text-blue-700">
                  수수료는 안전한 거래 환경 제공 및 BILIDA 플랫폼 운영에 사용됩니다.
                  거래 완료 후 판매자가 수수료를 제외한 금액을 받게 됩니다.
                </div>
              </div>
            </div>
          </div>

          {/* 약관 동의 */}
          <label className="flex items-start gap-2 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              현장 결제 방식 및 플랫폼 수수료 정책에 동의합니다
            </span>
          </label>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={loading || !agreed}
            >
              {loading ? "처리 중..." : "거래 확정"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
