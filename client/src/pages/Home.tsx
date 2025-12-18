// client/src/pages/Home.tsx
import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import ProductSection from "../components/ProductSection";
import type { Product } from "../data/mockProducts";
import { buildApiUrl, API_BASE } from "../utils/apiConfig";

// 🔥 비상용 백엔드 주소 (환경변수 누락 대비)
const BACKUP_API_URL = "https://crush-h4ws.onrender.com";

// 🔥 안전한 이미지 URL 변환 함수 (MyPage와 동일 로직)
function safeFixImageUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  // 1. localhost -> Render URL 변환
  let fixed = url;
  
  // 🔥 [수정] API_BASE가 로컬호스트면 강제로 백업(Render) 주소 사용 (Vercel에서 엑박 방지)
  const isLocalApi = API_BASE && (API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1"));
  const targetBase = (!API_BASE || isLocalApi) ? BACKUP_API_URL : API_BASE;

  if (fixed.includes("localhost:4000") || fixed.includes("127.0.0.1:4000")) {
    fixed = fixed
      .replace("http://localhost:4000", targetBase)
      .replace("http://127.0.0.1:4000", targetBase);
  }

  // 2. 상대 경로 -> 절대 경로 변환
  if (!fixed.startsWith("http")) {
    fixed = `${targetBase}${fixed.startsWith("/") ? "" : "/"}${fixed}`;
  }

  return fixed;
}

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

        // 🔥 이미지 URL 보정 적용
        const products = data.products as Product[];
        const fixedProducts = products.map((p) => ({
          ...p,
          images: p.images?.map((img) => safeFixImageUrl(img)),
        }));

        setItems(fixedProducts);
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

  // 🔥 [추가] 디버깅용 로그: 새 상품 등록 후 콘솔(F12)에서 이미지 주소가 https://...로 잘 나오는지 확인하세요.
  useEffect(() => {
    if (items.length > 0) {
      console.log("🔍 홈 화면 상품 데이터(상위 3개):", items.slice(0, 3).map(p => ({
        title: p.title,
        image: p.images?.[0]
      })));
    }
  }, [items]);

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
