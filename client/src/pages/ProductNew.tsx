import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../utils/apiConfig";
import LocationInput from "../components/LocationInput";
import ClickableMap from "../components/ClickableMap";

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

export default function ProductNew() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceRaw, setPriceRaw] = useState<string>("");
  const price = useMemo(
    () => Number(priceRaw.replace(/[^\d]/g, "") || 0),
    [priceRaw]
  );

  const [category, setCategory] = useState("기타");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [usedAvailable, setUsedAvailable] = useState(false);
  const [selFiles, setSelFiles] = useState<SelFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

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
    const remain = 5 - selFiles.length;
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

  // 드래그&드롭 시각 피드백
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
  }, [selFiles.length]);

  async function uploadImages(files: File[]): Promise<string[]> {
    if (!files.length) return [];
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    console.log(`📤 Uploading ${files.length} file(s) to ${API_BASE}/api/uploads/images`);
    const res = await fetch(`${API_BASE}/api/uploads/images`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json();
    console.log("📥 Server response:", { status: res.status, data });
    if (!res.ok || data.ok === false) {
      const errorMsg = `업로드 실패 (${res.status}): ${data.error || data.message || "알 수 없는 오류"}`;
      console.error(errorMsg, data);
      throw new Error(errorMsg);
    }
    return data.urls as string[];
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, price: true });
    setOkMsg(null);
    setErrMsg(null);
    if (!title.trim() || price <= 0) {
      setErrMsg("필수 항목을 확인해 주세요.");
      return;
    }

    setBusy(true);
    try {
      const urls = await uploadImages(selFiles.map((s) => s.file));
      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price,
          category,
          location: location.trim() || "미정",
          latitude,
          longitude,
          usedAvailable,
          images: urls,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false)
        throw new Error(data.error || "등록 실패");

      setOkMsg("✅ 상품이 등록되었습니다!");
      setTitle("");
      setDescription("");
      setPriceRaw("");
      setCategory("기타");
      setLocation("");
      setLatitude(undefined);
      setLongitude(undefined);
      setUsedAvailable(false);
      setSelFiles([]);
      setTouched({});
    } catch (e: any) {
      setErrMsg(e.message || "문제가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const titleError = touched.title && !title.trim();
  const priceError = touched.price && price <= 0;

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-8 text-3xl font-extrabold">상품 등록</h1>

        {okMsg && <div className="alert-ok">{okMsg}</div>}
        {errMsg && <div className="alert-err">{errMsg}</div>}

        <form onSubmit={onSubmit} className="grid gap-6 p-6 card">
          {/* 제목 */}
          <div>
            <label className="form-label form-required">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((s) => ({ ...s, title: true }))}
              className={titleError ? "input-error" : "input"}
              placeholder="예) 중고 책 · 상급 · 포장만 뜯은 상태"
              maxLength={60}
            />
            <p className="form-hint">
              최대 60자. 상품 핵심이 드러나게 적어주세요.
            </p>
          </div>

          {/* 설명 */}
          <div>
            <label className="form-label">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              rows={6}
              placeholder={`상세 상태(사용감/하자), 구성품, 교환/환불 안내 등\n예) 거의 새것, 책갈피 사은품 포함`}
            />
            <div className="form-counter">{description.length}/1000</div>
          </div>

          {/* 가격 + 카테고리 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label form-required">가격(원)</label>
              <input
                inputMode="numeric"
                value={priceRaw}
                onChange={(e) => onPriceChange(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, price: true }))}
                className={priceError ? "input-error" : "input"}
                placeholder="예) 12,000"
              />
              <p className="form-hint">
                숫자만 입력하면 자동으로 3자리 콤마가 적용돼요.
              </p>
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
              <p className="form-hint">
                적절한 분류를 선택하면 검색에 더 잘 노출돼요.
              </p>
            </div>
          </div>

          {/* 중고 가능 여부 */}
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

          {/* 위치 */}
          <div className="space-y-4">
            <div>
              <LocationInput
                value={location}
                onChange={(loc, lat, lng) => {
                  setLocation(loc);
                  if (lat && lng) {
                    setLatitude(lat);
                    setLongitude(lng);
                  }
                }}
                label="거래 희망 장소"
                required={false}
              />
              <p className="form-hint mt-2">
                상가명, 카페, 지하철역 등을 검색하세요 (예: 대구 노마즈하우스)
              </p>
            </div>

            {/* 클릭 가능한 지도 */}
            {latitude && longitude && (
              <div>
                <label className="form-label">📍 정확한 위치 지정</label>
                <ClickableMap
                  latitude={latitude}
                  longitude={longitude}
                  onLocationChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                  height="400px"
                  zoom={16}
                />
                <p className="form-hint mt-2">
                  💡 지도를 클릭하여 정확한 만남 장소를 지정할 수 있습니다
                </p>
              </div>
            )}

            {/* 좌표 정보 표시 */}
            {latitude && longitude && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="font-semibold text-gray-700 mb-1">선택된 위치 정보</div>
                <div className="text-gray-600">
                  <div>📌 주소: {location || "주소 미입력"}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    좌표: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 이미지 */}
          <div>
            <label className="form-label">
              이미지{" "}
              <span className="text-gray-400">(최대 5장, 파일당 5MB)</span>
            </label>

            <div
              ref={dropRef}
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
              title="클릭 또는 파일을 드래그해 업로드"
            >
              <div className="text-sm text-gray-700">
                이미지를 드래그하거나 클릭해서 선택하세요
              </div>
              <div className="mt-1 text-xs text-gray-500">
                JPG, PNG, GIF, WEBP, BMP 지원 • 현재 {selFiles.length}/5
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
                      aria-label="이미지 제거"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 제출 */}
          <button
            className="btn-primary"
            disabled={busy || !title.trim() || price <= 0}
          >
            {busy ? "등록 중..." : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
