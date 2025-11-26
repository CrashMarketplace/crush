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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | "escrow">("escrow");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
          amount,
          paymentMethod,
        }),
      });

      if (res.ok) {
        alert("결제가 완료되었습니다!\n판매자가 상품을 전달하면 거래를 완료해주세요.");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "결제에 실패했습니다");
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
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">상품명</div>
            <div className="font-medium mb-3">{productName}</div>
            <div className="text-sm text-gray-600 mb-1">판매자</div>
            <div className="font-medium mb-3">{sellerName}</div>
            <div className="text-sm text-gray-600 mb-1">결제 금액</div>
            <div className="text-2xl font-bold text-blue-600">
              {amount.toLocaleString()}원
            </div>
          </div>

          {/* 에스크로 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-xl">🔒</span>
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">안전거래 보호</div>
                <div className="text-blue-700">
                  결제 금액은 에스크로에 안전하게 보관되며, 거래 완료 후 판매자에게 전달됩니다.
                  문제 발생 시 환불이 가능합니다.
                </div>
              </div>
            </div>
          </div>

          {/* 결제 수단 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">결제 수단</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="escrow"
                  checked={paymentMethod === "escrow"}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">에스크로 결제</div>
                  <div className="text-sm text-gray-600">안전거래 보호</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">신용/체크카드</div>
                  <div className="text-sm text-gray-600">즉시 결제</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">계좌이체</div>
                  <div className="text-sm text-gray-600">가상계좌 발급</div>
                </div>
              </label>
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
              안전거래 이용약관 및 개인정보 처리방침에 동의합니다
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
              {loading ? "처리 중..." : `${amount.toLocaleString()}원 결제`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
