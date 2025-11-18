// client/src/pages/Home.tsx
import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import ProductSection from "../components/ProductSection";
import type { Product } from "../data/mockProducts";
import { buildApiUrl } from "../utils/apiConfig";

export default function Home() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(buildApiUrl("/products"), {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || data.ok === false)
          throw new Error(data.error || "불러오기 실패");
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

  // 간단한 섹션 분리: 앞쪽 12개를 추천, 다음 12개를 인기 섹션에서 사용
  const recommended = items.slice(0, 12);
  const popular = items.slice(12, 24);

  if (loading) {
    return (
      <>
        <Banner />
        <div className="container py-10 text-center text-gray-600">
          불러오는 중...
        </div>
      </>
    );
  }

  if (err) {
    return (
      <>
        <Banner />
        <div className="container py-10 text-center text-red-600">
          오류: {err}
        </div>
      </>
    );
  }

  return (
    <>
      <Banner />
      <ProductSection title="오늘의 상품 추천" products={recommended} />
      <ProductSection
        title="인기 많은 상품"
        products={popular.length ? popular : recommended}
      />
    </>
  );
}
