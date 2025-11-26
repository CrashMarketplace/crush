import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

interface Payment {
  _id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  escrowHeldAt?: string;
  escrowReleasedAt?: string;
  refundedAt?: string;
  buyer: {
    userId: string;
    displayName: string;
  };
  seller: {
    userId: string;
    displayName: string;
  };
  reservation: any;
}

export default function MyPayments() {
  usePageTitle("결제 내역");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments/my-payments", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setPayments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("결제 내역 로드 실패:", err);
        setLoading(false);
      });
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "결제 대기", color: "text-yellow-600 bg-yellow-50" };
      case "held":
        return { text: "에스크로 보관", color: "text-blue-600 bg-blue-50" };
      case "completed":
        return { text: "거래 완료", color: "text-green-600 bg-green-50" };
      case "refunded":
        return { text: "환불 완료", color: "text-gray-600 bg-gray-50" };
      case "cancelled":
        return { text: "취소됨", color: "text-red-600 bg-red-50" };
      default:
        return { text: status, color: "text-gray-600 bg-gray-50" };
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "card":
        return "신용/체크카드";
      case "bank_transfer":
        return "계좌이체";
      case "escrow":
        return "에스크로";
      default:
        return method;
    }
  };

  const handleCompletePayment = async (paymentId: string) => {
    if (!confirm("거래를 완료하시겠습니까?\n판매자에게 결제 금액이 전달됩니다.")) {
      return;
    }

    try {
      const res = await fetch(`/api/payments/${paymentId}/complete`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        alert("거래가 완료되었습니다!");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "거래 완료에 실패했습니다");
      }
    } catch (error) {
      console.error("거래 완료 오류:", error);
      alert("거래 완료에 실패했습니다");
    }
  };

  const handleRefund = async (paymentId: string) => {
    const reason = prompt("환불 사유를 입력해주세요:");
    if (!reason) return;

    try {
      const res = await fetch(`/api/payments/${paymentId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        alert("환불이 완료되었습니다!");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "환불에 실패했습니다");
      }
    } catch (error) {
      console.error("환불 오류:", error);
      alert("환불에 실패했습니다");
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
      <h1 className="text-3xl font-bold mb-6">결제 내역</h1>

      {payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">💳</div>
          <div className="text-gray-600 mb-4">결제 내역이 없습니다</div>
          <Link to="/" className="text-blue-500 hover:underline">
            상품 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const status = getStatusText(payment.status);
            return (
              <div key={payment._id} className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                      {status.text}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {new Date(payment.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {payment.amount.toLocaleString()}원
                    </div>
                    <div className="text-sm text-gray-600">
                      {getPaymentMethodText(payment.paymentMethod)}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">구매자</span>
                    <span className="font-medium">{payment.buyer.displayName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">판매자</span>
                    <span className="font-medium">{payment.seller.displayName}</span>
                  </div>
                  {payment.escrowHeldAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">에스크로 보관</span>
                      <span>{new Date(payment.escrowHeldAt).toLocaleString()}</span>
                    </div>
                  )}
                  {payment.escrowReleasedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">판매자 지급</span>
                      <span>{new Date(payment.escrowReleasedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {payment.refundedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">환불 완료</span>
                      <span>{new Date(payment.refundedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                {payment.status === "held" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleCompletePayment(payment._id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      거래 완료
                    </button>
                    <button
                      onClick={() => handleRefund(payment._id)}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      환불 요청
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
