// client/src/pages/ListingDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageCarousel from "../components/ImageCarousel";
import DetailSidebar from "../components/DetailSidebar";
import ProductSection from "../components/ProductSection";
// ✅ mockProducts 대신 타입만 재사용
import type { Product } from "../data/mockProducts";
import { getSellerId, getSellerProfile } from "../data/mockProducts";
import { buildApiUrl } from "../utils/apiConfig";
import { useAuth } from "../context/AuthContext";

type Review = {
  _id: string;
  product: string;
  reviewer: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!id) return;
      setLoading(true);
      setErr(null);
      try {
        // 단건 조회
        const pRes = await fetch(buildApiUrl(`/products/${id}`), {
          credentials: "include",
        });
        const pJson = await pRes.json();
        if (!pRes.ok || pJson.ok === false)
          throw new Error(pJson.error || "not_found");
        const item: Product = pJson.product;

        // 비슷한 상품 (간단히: 전체 목록에서 현재 id 제외 후 상위 6개)
        const lRes = await fetch(buildApiUrl("/products"), {
          credentials: "include",
        });
        const lJson = await lRes.json();
        const list: Product[] =
          lRes.ok && lJson.ok !== false ? lJson.products : [];

        if (!alive) return;
        setProduct(item);
        setLikesCount(item.likes?.length ?? 0);
        setSimilar(list.filter((p) => p._id !== item._id).slice(0, 6));
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message || "에러가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [id]);

  const sellerProfile = product ? getSellerProfile(product.seller) : null;
  const sellerId = product ? getSellerId(product.seller) : "";
  const sellerName =
    sellerProfile?.displayName?.trim() ||
    sellerProfile?.userId?.trim() ||
    (sellerId ? `사용자 ${sellerId.slice(0, 6)}` : "알수없음");
  const sellerLocation =
    sellerProfile?.location?.trim() ||
    product?.location ||
    "지역 정보 없음";
  const sellerAvatar = sellerProfile?.avatarUrl?.trim();
  const sellerInitial =
    sellerName?.replace("사용자 ", "")?.[0]?.toUpperCase() || "U";

  const canDelete = Boolean(
    user && product && sellerId && String(user.id) === sellerId
  );
  const myReview = useMemo(
    () =>
      user
        ? reviews.find((rv) => String(rv.reviewer) === String(user.id))
        : undefined,
    [reviews, user]
  );

  const onClickChat = async () => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!id) return;
    try {
      const res = await fetch(buildApiUrl("/chats/start"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || "failed");
      navigate(`/chats/${data.conversation._id}`);
    } catch (e: any) {
      alert(e?.message || "채팅 시작에 실패했습니다.");
    }
  };

  const onClickReserve = async () => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!id || !product) return;
    if (product.status !== "selling") {
      alert("현재 예약할 수 없는 상품입니다.");
      return;
    }

    const meetingLocation = prompt("만날 장소를 입력해주세요 (선택):");
    const meetingTime = prompt("만날 시간을 입력해주세요 (예: 2025-12-01 14:00, 선택):");
    const notes = prompt("메모 (선택):");

    try {
      const res = await fetch(buildApiUrl("/reservations"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          meetingLocation: meetingLocation || "",
          meetingTime: meetingTime || undefined,
          notes: notes || "",
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || "예약 실패");
      alert("예약이 완료되었습니다!");
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "예약에 실패했습니다.");
    }
  };
  const onToggleStatus = async () => {
    if (!product || !canDelete || statusBusy) return;
    const next =
      product.status === "selling"
        ? "reserved"
        : product.status === "reserved"
        ? "sold"
        : "selling";
    setStatusBusy(true);
    try {
      const res = await fetch(buildApiUrl(`/products/${product._id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `상태 변경 실패 (HTTP ${res.status})`);
      }
      setProduct(data.product);
    } catch (e: any) {
      alert(e.message || "상태 변경 중 오류가 발생했습니다.");
    } finally {
      setStatusBusy(false);
    }
  };

  const onToggleLike = async () => {
    if (!product || likeBusy) return;
    if (!user) {
      const goLogin = confirm("로그인 후 이용할 수 있어요. 로그인하시겠어요?");
      if (goLogin) navigate("/login");
      return;
    }
    setLikeBusy(true);
    try {
      const res = await fetch(buildApiUrl(`/products/${product._id}/likes`), {
        method: liked ? "DELETE" : "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `좋아요 처리 실패 (HTTP ${res.status})`);
      }
      setLiked(Boolean(data.liked));
      setLikesCount(
        typeof data.likesCount === "number" ? data.likesCount : likesCount
      );
    } catch (e: any) {
      alert(e.message || "좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setLikeBusy(false);
    }
  };

  const onShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title ?? "BILIDA",
          url: shareUrl,
        });
      } catch (e) {
        if ((e as DOMException)?.name !== "AbortError") {
          alert("공유 중 문제가 발생했습니다.");
        }
      }
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("링크가 복사되었습니다. 친구에게 공유해보세요!");
        return;
      } catch {
        // fall through
      }
    }
    const copied = window.prompt("공유할 링크입니다. 복사해 주세요.", shareUrl);
    if (!copied) {
      alert("복사에 실패했다면 주소창 링크를 직접 복사해 주세요.");
    }
  };

  const onSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!user) {
      const goLogin = confirm("로그인 후 후기를 남길 수 있어요. 로그인할까요?");
      if (goLogin) navigate("/login");
      return;
    }
    if (product.status !== "sold") {
      setReviewFeedback("판매완료된 상품에서만 후기를 남길 수 있어요.");
      return;
    }
    if (reviewText.trim().length < 5) {
      setReviewFeedback("최소 5자 이상 작성해주세요.");
      return;
    }
    setReviewBusy(true);
    setReviewFeedback(null);
    try {
      const res = await fetch(buildApiUrl(`/products/${product._id}/reviews`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewText.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `후기 작성 실패 (HTTP ${res.status})`);
      }
      if (data.review) {
        setReviews((prev) => {
          const next = prev.filter((rv) => rv._id !== data.review._id);
          next.unshift(data.review as Review);
          return next.slice();
        });
      }
      setReviewFeedback("후기가 저장되었습니다.");
    } catch (e: any) {
      setReviewFeedback(e.message || "후기를 저장하지 못했습니다.");
    } finally {
      setReviewBusy(false);
    }
  };

  useEffect(() => {
    if (!product) {
      setLiked(false);
      setLikesCount(0);
      return;
    }
    setLikesCount(product.likes?.length ?? 0);
    if (!user) {
      setLiked(false);
      return;
    }
    setLiked(
      product.likes?.some((id) => String(id) === String(user.id)) ?? false
    );
  }, [product, user]);

  useEffect(() => {
    if (!id || !product || product.status !== "sold") {
      setReviews([]);
      setReviewsLoading(false);
      return;
    }
    let alive = true;
    setReviewsLoading(true);
    fetch(buildApiUrl(`/products/${id}/reviews`), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        if (data?.ok === false) throw new Error(data?.error || "failed");
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      })
      .catch((err) => {
        if (!alive) return;
        console.error("리뷰를 불러오지 못했습니다.", err);
      })
      .finally(() => {
        if (alive) setReviewsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id, product]);

  useEffect(() => {
    if (!user) {
      if (!myReview) {
        setReviewText("");
        setReviewRating(5);
      }
      return;
    }
    if (myReview) {
      setReviewText(myReview.comment);
      setReviewRating(myReview.rating);
    }
  }, [myReview, user]);
  const onClickDelete = async () => {
    if (!id || !canDelete || deleting) return;
    if (!confirm("정말로 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    setDeleting(true);
    try {
      const res = await fetch(buildApiUrl(`/products/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `삭제 실패 (HTTP ${res.status})`);
      }
      navigate("/", { replace: true });
    } catch (e: any) {
      alert(e.message || "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 text-center text-gray-600">
        불러오는 중...
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="container py-10 text-center text-gray-600">
        {err ? `오류: ${err}` : "존재하지 않는 상품입니다."}
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/placeholder.png"];

  return (
    <div className="container py-6">
      <div
        className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_320px]"
      >
        {/* 이미지 */}
        <ImageCarousel images={images} />

        {/* 본문 */}
        <section className="space-y-4">
          {/* 판매자(간단 표기) */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 rounded-full size-10 overflow-hidden flex items-center justify-center text-sm font-semibold text-gray-600">
              {sellerAvatar ? (
                <img
                  src={sellerAvatar}
                  alt={`${sellerName} 프로필 이미지`}
                  className="w-full h-full object-cover"
                />
              ) : (
                sellerInitial
              )}
            </div>
            <div>
              <div className="text-sm font-semibold">
                {sellerName}
              </div>
              <div className="text-xs text-gray-500">
                {sellerLocation}
              </div>
            </div>
          </div>

          {/* 제목/가격 */}
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            {product.usedAvailable ? (
              <div className="mt-2">
                <span className="badge badge-yellow">중고 가능</span>
              </div>
            ) : null}
            <div className="mt-2 flex items-center gap-2">
              <div
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  product.status === "sold"
                    ? "bg-red-100 text-red-700"
                    : product.status === "reserved"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {product.status === "sold"
                  ? "판매완료"
                  : product.status === "reserved"
                  ? "예약중"
                  : "판매중"}
              </div>
              <div className="text-xl font-extrabold">
                {Number(product.price).toLocaleString()}원
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {product.location || "지역 정보 없음"} ·{" "}
              {product.createdAt
                ? new Date(product.createdAt).toLocaleDateString()
                : ""}
            </div>
          </div>

          {/* 설명 */}
          <div className="p-4 text-sm leading-6 text-gray-800 whitespace-pre-line card">
            {product.description?.trim()
              ? product.description
              : "판매자가 설명을 입력하지 않았습니다."}
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onToggleLike}
              disabled={likeBusy}
              className={`px-3 py-2 text-sm border rounded-full hover:bg-gray-50 flex items-center gap-1 ${
                liked ? "text-rose-500 border-rose-200" : "text-gray-600"
              }`}
            >
              <span aria-hidden>♡</span>
              <span>{likesCount}</span>
            </button>
            <button
              onClick={onShare}
              className="px-3 py-2 text-sm text-gray-600 border rounded-full hover:bg-gray-50 flex items-center gap-1"
            >
              <span aria-hidden>↗</span>
              <span>공유</span>
            </button>
            <button
              onClick={onClickChat}
              className="h-11 px-6 text-sm font-semibold text-white bg-black rounded-lg hover:opacity-90 flex-1 sm:flex-none"
            >
              채팅하기
            </button>
            {product.status === "selling" && !canDelete && (
              <button
                onClick={onClickReserve}
                className="h-11 px-6 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:opacity-90 flex-1 sm:flex-none"
              >
                예약하기
              </button>
            )}
            {canDelete ? (
              <>
                <button
                  onClick={() => navigate(`/product/edit/${product._id}`)}
                  className="h-10 px-4 text-sm font-semibold border rounded-lg hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={onToggleStatus}
                  disabled={statusBusy}
                  className="h-10 px-4 text-sm font-semibold border rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                  {statusBusy
                    ? "처리 중..."
                    : product.status === "sold"
                    ? "판매중으로 변경"
                    : product.status === "reserved"
                    ? "판매완료 표시"
                    : "예약중으로 변경"}
                </button>
                <button
                  onClick={onClickDelete}
                  disabled={deleting}
                  className="h-10 px-4 text-sm font-semibold text-white bg-white/10 backdrop-blur-md border border-white/30 rounded-lg hover:bg-white/20 disabled:opacity-60"
                  title="내가 올린 상품만 삭제할 수 있어요"
                >
                  {deleting ? "삭제 중..." : "삭제"}
                </button>
              </>
            ) : null}
          </div>
        </section>

        {/* 사이드바 */}
        <div className="order-last xl:order-none">
          <DetailSidebar />
        </div>
      </div>

      {/* 비슷한 상품 */}
      <div className="mt-10">
        <ProductSection title="비슷한 상품" products={similar} />
      </div>

      <section className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">거래 후기</h2>
          <span className="text-sm text-gray-500">{reviews.length}개</span>
        </div>

        {product.status === "sold" ? (
          <form
            onSubmit={onSubmitReview}
            className="card p-4 space-y-4 rounded-2xl bg-gray-50"
          >
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">
                평점
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="ml-2 rounded border border-gray-200 px-2 py-1 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((score) => (
                    <option key={score} value={score}>
                      {score}점
                    </option>
                  ))}
                </select>
              </label>
              {myReview ? (
                <span className="text-xs font-semibold text-emerald-600">
                  이미 남긴 후기는 다시 저장하면 덮어써요.
                </span>
              ) : null}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="거래 경험을 공유해주세요. (최소 5자)"
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              rows={4}
            />
            {reviewFeedback ? (
              <p className="text-xs text-gray-500">{reviewFeedback}</p>
            ) : null}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={reviewBusy}
                className="px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:opacity-90 disabled:opacity-60"
              >
                {reviewBusy ? "저장 중..." : myReview ? "후기 수정" : "후기 남기기"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            판매완료 상태가 되면 거래 후기를 남길 수 있습니다.
          </div>
        )}

        <div className="space-y-3">
          {reviewsLoading ? (
            <div className="text-sm text-gray-500">후기를 불러오는 중입니다...</div>
          ) : reviews.length === 0 ? (
            <div className="text-sm text-gray-500">아직 후기가 없습니다.</div>
          ) : (
            reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold text-gray-800">
                    ⭐ {review.rating}점
                    {String(review.reviewer) === String(user?.id) ? (
                      <span className="ml-2 text-xs text-emerald-600">내 후기</span>
                    ) : null}
                  </div>
                  <time className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                  {review.comment}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
