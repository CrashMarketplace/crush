import { useEffect, useMemo, useState } from "react";
import type { Product } from "../data/mockProducts";
import ProductCard from "../components/ProductCard";
import { buildApiUrl } from "../utils/apiConfig";

type FeedMode = "recommend" | "hot" | "new";

interface Props {
  mode: FeedMode;
}

export default function Feed({ mode }: Props) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(buildApiUrl("/products"), { credentials: "include" });
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

  const title = useMemo(() => {
    switch (mode) {
      case "recommend":
        return "오늘의 상품 추천";
      case "hot":
        return "인기 많은 상품";
      case "new":
      default:
        return "최신 등록 상품";
    }
  }, [mode]);

  const list = useMemo(() => {
    if (mode === "new") {
      return items;
    }
    if (mode === "hot") {
      return [...items].reverse();
    }
    return items.slice(0, 24);
  }, [items, mode]);

  if (loading) {
    return <div className="container py-10 text-center text-gray-600">불러오는 중...</div>;
  }
  if (err) {
    return (
      <div className="container py-10 text-center text-red-600">
        오류: {err}
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="section-title">{title}</h1>
        <div className="text-sm text-gray-500">{list.length}개</div>
      </div>

      {list.length === 0 ? (
        <div className="py-20 text-center text-gray-500">표시할 상품이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
          {list.map((p) => (
            <ProductCard
              key={p._id}
              item={p}
              onDeleted={(id) => setItems((prev) => prev.filter((x) => x._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}


