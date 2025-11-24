import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAuth } from "../context/AuthContext";
import { get } from "../lib/api";
import type { Product } from "../data/mockProducts";
import { getSellerId } from "../data/mockProducts";
import { API_BASE } from "../utils/apiConfig";

type TabKey = "all" | "selling" | "sold";

export default function MyPage() {
  const { user, loading, refresh } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [infoEditorOpen, setInfoEditorOpen] = useState(false);
  const handleProfileRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setBusy(true);
      try {
        const res = await get<{ ok: true; products: Product[] }>("/products");
        // 내 상품만 필터
        const mine = res.products.filter(
          (p) => getSellerId(p.seller) === String(user.id)
        );
        setItems(mine);
      } catch {
        setItems([]);
      } finally {
        setBusy(false);
      }
    })();
  }, [user]);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    if (tab === "selling") return items.filter((i) => i.status !== "sold");
    return items.filter((i) => i.status === "sold");
  }, [items, tab]);

  const stats = useMemo(() => {
    const total = items.length;
    const sold = items.filter((i) => i.status === "sold").length;
    const selling = total - sold;
    return { total, sold, selling, reviews: 0 };
  }, [items]);

  const rawDisplayName =
    user?.displayName ?? user?.userId ?? user?.email ?? "사용자";
  const displayName = rawDisplayName.trim() || "사용자";
  const locationValue = user?.location ?? "";
  const locationText = locationValue.trim() || "지역 정보 없음";
  const avatarUrl = user?.avatarUrl;
  
  // [수정] 이미지 URL 처리: http로 시작하지 않으면 API_BASE를 붙임
  const displayAvatarUrl = avatarUrl
    ? avatarUrl.startsWith("http")
      ? avatarUrl
      : `${API_BASE}${avatarUrl}`
    : null;

  const avatarInitial = displayName[0]?.toUpperCase() || "U";
  const bioText = user?.bio?.trim();

  if (loading) return null;

  return (
    <div className="container py-6">
      {/* 프로필 헤더 */}
      <section className="flex flex-col gap-6 p-6 bg-white border rounded-2xl md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-20 h-20 overflow-hidden text-2xl font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-full">
            {displayAvatarUrl ? (
              <img
                src={displayAvatarUrl}
                alt={`${displayName}님의 프로필 이미지`}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            ) : (
              avatarInitial
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            <p className="mt-1 text-sm text-gray-500">{locationText}</p>
            {bioText ? (
              <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                {bioText}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setPhotoEditorOpen((prev) => !prev)}
                className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
              >
                프로필 사진 변경
              </button>
              <button
                onClick={() => setInfoEditorOpen((prev) => !prev)}
                className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
              >
                사용자 정보 변경
              </button>
            </div>
          </div>
        </div>
        <div className="grid w-full grid-cols-3 gap-4 text-center sm:max-w-md md:w-auto">
          <ProfileStat label="상품 수" value={stats.total} />
          <ProfileStat label="판매중" value={stats.selling} />
          <ProfileStat label="거래후기" value={stats.reviews} />
        </div>
      </section>

      {photoEditorOpen ? (
        <ProfilePhotoEditor
          currentAvatar={avatarUrl}
          onClose={() => setPhotoEditorOpen(false)}
          onUpdated={async () => {
            await handleProfileRefresh();
            setPhotoEditorOpen(false);
          }}
        />
      ) : null}

      {infoEditorOpen ? (
        <ProfileInfoEditor
          currentName={rawDisplayName}
          currentLocation={locationValue}
          currentBio={bioText ?? ""}
          onClose={() => setInfoEditorOpen(false)}
          onUpdated={async () => {
            await handleProfileRefresh();
            setInfoEditorOpen(false);
          }}
        />
      ) : null}

      {/* 탭 */}
      <div className="mt-8">
        <div className="flex gap-6 overflow-x-auto border-b">
          {[
            { k: "all", label: "전체" },
            { k: "selling", label: "판매중" },
            { k: "sold", label: "판매완료" },
          ].map(({ k, label }) => {
            const key = k as TabKey;
            const active = tab === key;
            return (
              <button
                key={k}
                onClick={() => setTab(key)}
                className={`-mb-px pb-3 text-sm ${
                  active
                    ? "font-semibold text-[#001C6D] border-b-2 border-[#001C6D]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 상품 그리드 */}
      <section className="mt-6">
        {busy ? (
          <div className="py-20 text-center text-gray-500">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            표시할 상품이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {filtered.map((p) => (
              <MyProductCard
                key={p._id}
                item={p}
                onDeleted={(id) => {
                  setItems((prev) => prev.filter((x) => x._id !== id));
                }}
                onUpdated={(next) => {
                  setItems((prev) =>
                    prev.map((x) => (x._id === next._id ? next : x))
                  );
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50">
      <div className="text-xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  );
}

function MyProductCard({
  item,
  onDeleted,
  onUpdated,
}: {
  item: Product;
  onDeleted: (id: string) => void;
  onUpdated: (item: Product) => void;
}) {
  // 카드 재사용: 삭제 권한/버튼 포함
  // 기존 ProductCard를 그대로 쓰면 링크 이동이 포함되어 드롭다운/액션 배치가 어려워
  // 마이페이지 전용으로 최소한의 정보만 노출

  // 기본 플레이스홀더: 인라인 SVG(data URI) — 빌드 시 public에 placeholder.png가 없어도 404 방지
  const DEFAULT_PLACEHOLDER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" ry="2" fill="#f8fafc"/><path d="M3 7h18"/><path d="M8 11l2 2 3-3 5 5"/><circle cx="8.5" cy="8.5" r="1.5" fill="#e2e8f0"/><text x="50%" y="92%" font-size="2.5" fill="#94a3b8" text-anchor="middle" font-family="Arial, Helvetica, sans-serif">이미지 없음</text></svg>`
    );

  // [수정] 상품 이미지 URL 처리
  const rawImage = item.images?.[0];
  const imageSrc = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${API_BASE}${rawImage}`
    : DEFAULT_PLACEHOLDER;

  const dateText = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : "";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const isSold = item.status === "sold";

  const requestDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${item._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `삭제 실패 (HTTP ${res.status})`);
      }
      onDeleted(item._id);
    } catch (e: any) {
      alert(e?.message || "삭제 중 오류가 발생했어요.");
    } finally {
      setConfirmOpen(false);
    }
  };

  const updateStatus = async (next: Product["status"]) => {
    if (statusBusy) return;
    setStatusBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${item._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `상태 변경 실패 (HTTP ${res.status})`);
      }
      onUpdated(data.product as Product);
    } catch (e: any) {
      alert(e?.message || "상태를 변경할 수 없어요.");
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white border rounded-2xl">
      <div className="relative bg-gray-100 aspect-square">
        <img
          src={imageSrc}
          alt={item.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {item.status !== "selling" ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white bg-black/50">
            {item.status === "sold" ? "판매완료" : "예약중"}
          </div>
        ) : null}
      </div>
      <div className="p-3 space-y-1">
        <div className="text-sm font-medium line-clamp-1">{item.title}</div>
        <div className="font-semibold">
          {Number(item.price).toLocaleString()}원
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{item.location || "지역 정보 없음"}</span>
          <span>{dateText}</span>
        </div>
      </div>

      {/* 액션 메뉴 (간단 버전) */}
      <div className="absolute top-2 right-2">
        {!confirmOpen ? (
          <button
            className="px-2 py-1 text-xs border rounded bg-white/90 hover:bg-white"
            onClick={() => setConfirmOpen(true)}
          >
            삭제
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
              onClick={() => setConfirmOpen(false)}
            >
              취소
            </button>
            <button
              className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
              onClick={requestDelete}
            >
              삭제
            </button>
          </div>
        )}
      </div>
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${
              isSold
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isSold ? "판매완료" : "판매중"}
          </span>
          <button
            className="px-2 py-1 border rounded text-[11px] font-semibold hover:bg-gray-50 disabled:opacity-60"
            onClick={() => updateStatus(isSold ? "selling" : "sold")}
            disabled={statusBusy}
          >
            {statusBusy
              ? "처리 중..."
              : isSold
              ? "판매중으로 변경"
              : "판매완료 표시"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePhotoEditor({
  currentAvatar,
  onUpdated,
  onClose,
}: {
  currentAvatar?: string | null;
  onUpdated: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentAvatar || "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0];
    if (!next) {
      setFile(null);
      setPreview(currentAvatar || "");
      return;
    }
    if (next.size > 5 * 1024 * 1024) {
      setError("이미지는 5MB 이하만 업로드할 수 있어요.");
      return;
    }
    setError(null);
    setFile(next);
    const blobUrl = URL.createObjectURL(next);
    setPreview(blobUrl);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("변경할 이미지를 선택해주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const uploadRes = await fetch(`${API_BASE}/api/uploads/images`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const uploadJson = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok || uploadJson?.ok === false) {
        throw new Error(
          uploadJson?.error || `업로드 실패 (HTTP ${uploadRes.status})`
        );
      }
      const url = uploadJson.urls?.[0];
      if (!url) throw new Error("업로드된 이미지 주소를 찾을 수 없어요.");

      const res = await fetch(`${API_BASE}/api/auth/profile/avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ avatarUrl: url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(
          data?.error || `프로필 갱신 실패 (HTTP ${res.status})`
        );
      }
      await onUpdated();
    } catch (err: any) {
      setError(err?.message || "프로필 사진 변경에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 mt-4 bg-white border rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            프로필 사진 변경
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            정사각형 이미지, 최대 5MB (JPEG/PNG/WebP)
          </p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          닫기
        </button>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4 mt-4 sm:flex-row">
        <div className="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-100 border rounded-full">
          {preview ? (
            <img
              src={preview}
              alt="새 프로필 미리보기"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-sm text-gray-500">미리보기</span>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "업로드 중..." : "변경하기"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ProfileInfoEditor({
  currentName,
  currentLocation,
  currentBio,
  onUpdated,
  onClose,
}: {
  currentName: string;
  currentLocation: string;
  currentBio: string;
  onUpdated: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    displayName: currentName || "",
    location: currentLocation || "",
    bio: currentBio || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange =
    (key: "displayName" | "location" | "bio") =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      displayName: form.displayName.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
    };

    if (!payload.displayName) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `정보 수정 실패 (HTTP ${res.status})`);
      }
      await onUpdated();
    } catch (err: any) {
      setError(err?.message || "정보 수정 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 mt-4 bg-white border rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">사용자 정보 변경</h2>
        <button
          onClick={onClose}
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          닫기
        </button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700">
            닉네임
          </label>
          <input
            type="text"
            value={form.displayName}
            onChange={onChange("displayName")}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="닉네임"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700">
            지역
          </label>
          <input
            type="text"
            value={form.location}
            onChange={onChange("location")}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="예: 서울시 강남구"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700">
            소개
          </label>
          <textarea
            value={form.bio}
            onChange={onChange("bio")}
            className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black/10"
            rows={3}
            placeholder="자기소개를 입력하세요"
          />
        </div>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </form>
    </div>
  );
}


