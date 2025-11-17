import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product } from "../data/mockProducts";
import { API_BASE } from "../utils/apiConfig";

export default function AllProducts() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const sectionTitle = params.get("title") || "전체 상품";
  const q = (params.get("q") || "").trim();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/products`, { credentials: "include" });
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
    if (!q) return items;
    const lower = q.toLowerCase();
    return items.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return title.includes(lower) || desc.includes(lower);
    });
  }, [items, q]);

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 고정 바: 제목 + 닫기(X) */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-white/80 backdrop-blur">
        <h1 className="text-base font-semibold">
          {q ? (
            <>
              검색 결과 <span className="text-neutral-600">“{q}”</span>
            </>
          ) : (
            sectionTitle
          )}
        </h1>
        {q ? (
          <div className="text-xs text-neutral-500">총 {filtered.length}개</div>
        ) : null}
        <button
          aria-label="닫기"
          className="text-lg leading-none px-2 py-1 rounded hover:bg-gray-100"
          onClick={() => navigate(-1)}
        >
          ×
        </button>
      </div>

      {/* 본문: 상품 카드 그리드 */}
      <div className="container py-4">
        {loading ? (
          <div className="py-10 text-center text-gray-600">불러오는 중...</div>
        ) : err ? (
          <div className="py-10 text-center text-red-600">오류: {err}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-neutral-600">검색 결과가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {filtered.map((p) => (
              <ProductCard key={p._id} item={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


