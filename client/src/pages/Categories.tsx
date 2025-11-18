import { useEffect, useMemo, useState } from "react";
import type { Product } from "../data/mockProducts";
import ProductCard from "../components/ProductCard";
import { API_BASE } from "../utils/apiConfig";

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

export default function Categories() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("전체");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/api/products`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok || data.ok === false) throw new Error(data.error || "불러오기 실패");
        if (!alive) return;
        setItems(data.products as Product[]);
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message || "에러가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (selected === "전체") return items;
    return items.filter((p) => p.category === selected);
  }, [items, selected]);

  return (
    <div className="container py-8">
      <h1 className="section-title mb-4">카테고리</h1>

      <div className="flex gap-2 pb-2 mb-6 overflow-x-auto">
        {["전체", ...CATEGORIES].map((c) => {
          const active = selected === c;
          return (
            <button
              key={c}
              onClick={() => setSelected(c)}
              aria-pressed={active}
              className={`px-4 py-1.5 whitespace-nowrap rounded-full border transition ${
                active
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-600">불러오는 중...</div>
      ) : err ? (
        <div className="py-20 text-center text-red-600">오류: {err}</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-500">선택한 카테고리의 상품이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
          {filtered.map((p) => (
            <ProductCard key={p._id} item={p} />
          ))}
        </div>
      )}
    </div>
  );
}


