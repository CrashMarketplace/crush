import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../utils/apiConfig";
import PaymentModal from "../components/PaymentModal";
import ReviewModal from "../components/ReviewModal";

type Reservation = {
  _id: string;
  product: { _id: string; title: string; price: number; images: string[] };
  buyer: { _id?: string; userId: string; displayName: string };
  seller: { _id?: string; userId: string; displayName: string };
  status: "pending" | "confirmed" | "cancelled" | "completed" | "payment_pending" | "payment_completed";
  meetingLocation: string;
  meetingTime?: string;
  notes: string;
  createdAt: string;
  paymentRequired: boolean;
  paymentAmount: number;
  paymentStatus: string;
  buyerReviewed: boolean;
  sellerReviewed: boolean;
};

import { usePageTitle } from "../hooks/usePageTitle";

export default function Reservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  usePageTitle("예약 내역", "내 예약 목록을 확인하고 관리하세요.");

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/reservations/my`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "예약 목록을 불러올 수 없습니다.");
      }
      setReservations(data.reservations || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/reservations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error);
      loadReservations();
    } catch (e: any) {
      alert(e.message || "상태 변경 실패");
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "대기중";
      case "confirmed":
        return "확정";
      case "cancelled":
        return "취소됨";
      case "completed":
        return "완료";
      case "payment_pending":
        return "결제 대기";
      case "payment_completed":
        return "결제 완료";
      default:
        return status;
    }
  };

  const openPaymentModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
  };

  const openReviewModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowReviewModal(true);
  };

  if (loading) {
    return <div className="container py-10 text-center">불러오는 중...</div>;
  }

  if (error) {
    return <div className="container py-10 text-center text-red-600">{error}</div>;
  }

  const { user } = useAuth();

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-extrabold">내 예약</h1>

      {reservations.length === 0 ? (
        <div className="text-gray-500">예약 내역이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => {
            const isSeller = user && String(r.seller._id || r.seller.userId) === String(user.id);
            const isBuyer = user && String(r.buyer._id || r.buyer.userId) === String(user.id);
            
            return (
            <div key={r._id} className="card p-4">
              <div className="flex gap-4">
                <img
                  src={r.product.images[0] || "/placeholder.png"}
                  alt={r.product.title}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="font-semibold text-lg cursor-pointer hover:underline"
                      onClick={() => navigate(`/listing/${r.product._id}`)}
                    >
                      {r.product.title}
                    </div>
                    {isSeller && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
                        판매자
                      </span>
                    )}
                    {isBuyer && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded">
                        구매자
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {r.product.price.toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    구매자: {r.buyer.displayName || r.buyer.userId} · 판매자:{" "}
                    {r.seller.displayName || r.seller.userId}
                  </div>
                  {r.meetingLocation && (
                    <div className="text-sm text-gray-500">
                      만날 장소: {r.meetingLocation}
                    </div>
                  )}
                  {r.meetingTime && (
                    <div className="text-sm text-gray-500">
                      만날 시간: {new Date(r.meetingTime).toLocaleString()}
                    </div>
                  )}
                  {r.notes && (
                    <div className="text-sm text-gray-500">메모: {r.notes}</div>
                  )}
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        r.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : r.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : r.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {isSeller && r.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(r._id, "confirmed")}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        확정
                      </button>
                      <button
                        onClick={() => updateStatus(r._id, "cancelled")}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        취소
                      </button>
                    </>
                  )}
                  {isBuyer && r.status === "confirmed" && (
                    <button
                      onClick={() => openPaymentModal(r)}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      💳 결제하기
                    </button>
                  )}
                  {isSeller && r.status === "confirmed" && (
                    <button
                      onClick={() => updateStatus(r._id, "completed")}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      완료
                    </button>
                  )}
                  {r.status === "completed" && (
                    <>
                      {isBuyer && !r.buyerReviewed && (
                        <button
                          onClick={() => openReviewModal(r)}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          ⭐ 리뷰 작성
                        </button>
                      )}
                      {isSeller && !r.sellerReviewed && (
                        <button
                          onClick={() => openReviewModal(r)}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          ⭐ 리뷰 작성
                        </button>
                      )}
                    </>
                  )}
                  {isBuyer && r.status === "pending" && (
                    <button
                      onClick={() => updateStatus(r._id, "cancelled")}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* 결제 모달 */}
      {showPaymentModal && selectedReservation && (
        <PaymentModal
          reservationId={selectedReservation._id}
          productName={selectedReservation.product.title}
          amount={selectedReservation.product.price}
          sellerName={selectedReservation.seller.displayName || selectedReservation.seller.userId}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedReservation(null);
          }}
          onSuccess={() => {
            loadReservations();
          }}
        />
      )}

      {/* 리뷰 모달 */}
      {showReviewModal && selectedReservation && (
        <ReviewModal
          reservationId={selectedReservation._id}
          revieweeName={
            user && String(selectedReservation.buyer._id || selectedReservation.buyer.userId) === String(user.id)
              ? selectedReservation.seller.displayName || selectedReservation.seller.userId
              : selectedReservation.buyer.displayName || selectedReservation.buyer.userId
          }
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReservation(null);
          }}
          onSubmit={() => {
            loadReservations();
          }}
        />
      )}
    </div>
  );
}
