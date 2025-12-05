import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../utils/apiConfig";

type SelFile = { file: File; preview: string; id: string };

const CATEGORIES = [
  "디지털/가전",
  "가구/인테리어",
  "생활/주방",
  "유아동",
  "패션/잡화",
  "도서/음반/문구",
  "스포츠/레저",
  "반려동물용품",
  "티켓/서비스",
  "기타",
];

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceRaw, setPriceRaw] = useState<string>("");
  const price = useMemo(
    () => Number(priceRaw.replace(/[^\d]/g, "") || 0),
    [priceRaw]
  );

  const [category, setCategory] = useState("기타");
  const [location, setLocation] = useState("");
  const [usedAvailable, setUsedAvailable] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selFiles, setSelFiles] = useState<SelFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || data.ok === false) throw new Error(data.error);

        const p = data.product;
        setTitle(p.title || "");
        setDescription(p.description || "");
        setPriceRaw(p.price ? String(p.price).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");
        setCategory(p.category || "기타");
        setLocation(p.location || "");
        setUsedAvailable(p.usedAvailable || false);
        setExistingImages(p.images || []);
      } catch (e: any) {
        setErrMsg(e.message || "상품을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(
    () => () => selFiles.forEach((s) => URL.revokeObjectURL(s.preview)),
    [selFiles]
  );

  const onPriceChange = (val: string) => {
    const digits = val.replace(/[^\d]/g, "");
    if (!digits) return setPriceRaw("");
    setPriceRaw(digits.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  };

  const addFiles = (files: File[]) => {
    const remain = 5 - existingImages.length - selFiles.length;
    if (remain <= 0) return;
    const valid = files
      .slice(0, remain)
      .filter((f) => /^image\/(png|jpe?g|gif|webp|bmp)$/i.test(f.type))
      .filter((f) => f.size <= 5 * 1024 * 1024);
    const mapped: SelFile[] = valid.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }));
    setSelFiles((prev) => [...prev, ...mapped]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.currentTarget.value = "";
  };

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      el.classList.add("ring-2", "ring-neutral-900");
    };
    const onDragLeave = () => el.classList.remove("ring-2", "ring-neutral-900");
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      onDragLeave();
      addFiles(Array.from(e.dataTransfer?.files || []));
    };
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [existingImages.length, selFiles.length]);

  async function uploadImages(files: File[]): Promise<string[]> {
    if (!files.length) return [];
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const res = await fetch(`${API_BASE}/api/uploads/images`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || data.message || "업로드 실패");
    }
    return data.urls as string[];
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    setErrMsg(null);
    if (!title.trim() || price <= 0) {
      setErrMsg("필수 항목을 확인해 주세요.");
      return;
    }

    setBusy(true);
    try {
      const newUrls = await uploadImages(selFiles.map((s) => s.file));
      const allImages = [...existingImages, ...newUrls];

      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price,
          category,
          location: location.trim() || "미정",
          usedAvailable,
          images: allImages,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false)
        throw new Error(data.error || "수정 실패");

      setOkMsg("✅ 상품이 수정되었습니다!");
      setTimeout(() => navigate(`/listing/${id}`), 1500);
    } catch (e: any) {
      setErrMsg(e.message || "문제가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 text-center">불러오는 중...</div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-8 text-3xl font-extrabold">상품 수정</h1>

        {okMsg && <div className="alert-ok">{okMsg}</div>}
        {errMsg && <div className="alert-err">{errMsg}</div>}

        <form onSubmit={onSubmit} className="grid gap-6 p-6 card">
          <div>
            <label className="form-label form-required">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="예) 중고 책 · 상급 · 포장만 뜯은 상태"
              maxLength={60}
            />
          </div>

          <div>
            <label className="form-label">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              rows={6}
              placeholder="상세 상태, 구성품, 교환/환불 안내 등"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label form-required">가격(원)</label>
              <input
                inputMode="numeric"
                value={priceRaw}
                onChange={(e) => onPriceChange(e.target.value)}
                className="input"
                placeholder="예) 12,000"
              />
            </div>

            <div>
              <label className="form-label">카테고리</label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="usedAvailable"
              type="checkbox"
              className="size-5 rounded border-gray-300"
              checked={usedAvailable}
              onChange={(e) => setUsedAvailable(e.target.checked)}
            />
            <label htmlFor="usedAvailable" className="text-sm">
              중고 대여 가능
            </label>
          </div>

          <div>
            <label className="form-label">거래 지역</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
              placeholder="예) 대구 수성구"
            />
          </div>

          <div>
            <label className="form-label">
              이미지{" "}
              <span className="text-gray-400">(최대 5장, 파일당 5MB)</span>
            </label>

            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3 sm:grid-cols-4 md:grid-cols-5">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="thumb">
                    <img src={url} className="thumb-img" />
                    <button
                      type="button"
                      className="thumb-del"
                      onClick={() =>
                        setExistingImages((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              ref={dropRef}
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-sm text-gray-700">
                이미지를 드래그하거나 클릭해서 선택하세요
              </div>
              <div className="mt-1 text-xs text-gray-500">
                현재 {existingImages.length + selFiles.length}/5
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {selFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3 sm:grid-cols-4 md:grid-cols-5">
                {selFiles.map((s) => (
                  <div key={s.id} className="thumb">
                    <img src={s.preview} className="thumb-img" />
                    <button
                      type="button"
                      className="thumb-del"
                      onClick={() =>
                        setSelFiles((prev) => prev.filter((x) => x.id !== s.id))
                      }
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="btn-primary"
            disabled={busy || !title.trim() || price <= 0}
          >
            {busy ? "수정 중..." : "수정하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
