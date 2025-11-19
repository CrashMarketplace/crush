import { Link } from "react-router-dom";
import type { Product } from "../data/mockProducts";
import { getSellerId } from "../data/mockProducts";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../utils/apiConfig";

interface Props {
  item: Product;
  onDeleted?: (id: string) => void;
}

export default function ProductCard({ item, onDeleted }: Props) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  // ⭐ 이미지 경로 수정 (Railway 서버 절대경로)
  const rawImage = item.images?.[0];
  const imageSrc = rawImage
    ? `${API_BASE}/uploads/${rawImage}`
    : "/placeholder.png";

  const dateText = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : "";

  const sellerId = getSellerId(item.seller);
  const canDelete = user && sellerId && String(user.id) === sellerId;

  const statusText =
    item.status === "sold"
      ? "판매완료"
      : item.status === "reserved"
      ? "예약중"
      : "판매중";

  const statusTone =
    item.status === "sold"
      ? "bg-red-100 text-red-700"
      : item.status === "reserved"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canDelete || deleting) return;
    if (!confirm("이 상품을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${item._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `삭제 실패 (HTTP ${res.status})`);
      }
      onDeleted?.(item._id);
    } catch (err: any) {
      alert(err.message || "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link
      to={`/listing/${item._id}`}
      className="relative block transition card hover:shadow-md"
    >
      <div className="relative bg-gray-100 aspect-square">
        <img
          src={imageSrc}
          alt={item.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {item.status !== "selling" ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white bg-black/55">
            {statusText}
          </div>
        ) : null}

        {canDelete ? (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute px-2 py-1 text-xs font-semibold text-white border rounded shadow-sm top-2 right-2 bg-white/10 backdrop-blur-md border-white/30 hover:bg-white/20 disabled:opacity-60"
            aria-label="상품 삭제"
            title="내 상품만 삭제 가능"
          >
            {deleting ? "삭제중" : "삭제"}
          </button>
        ) : null}
      </div>

      <div className="p-3">
        <h3 className="text-sm line-clamp-1">{item.title}</h3>
        {item.usedAvailable ? (
          <div className="mt-1">
            <span className="badge badge-yellow">중고 가능</span>
          </div>
        ) : null}

        <p className="mt-1 font-semibold">
          {Number(item.price).toLocaleString()}원
        </p>

        <div className="mt-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusTone}`}
          >
            {statusText}
          </span>
        </div>

        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <span>{item.location || "지역 정보 없음"}</span>
          <span>{dateText}</span>
        </div>
      </div>
    </Link>
  );
}
