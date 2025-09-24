import { useParams } from "react-router-dom";
import ImageCarousel from "../components/ImageCarousel";
import DetailSidebar from "../components/DetailSidebar";
import ProductSection from "../components/ProductSection";
import { mockProducts } from "../data/mockProducts";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const product = mockProducts.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="container py-10 text-center text-gray-600">
        존재하지 않는 상품입니다.
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div
        className="grid gap-6 
      lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_320px]"
      >
        {/* 이미지 */}
        <ImageCarousel images={[product.image]} />

        {/* 본문 */}
        <section className="space-y-4">
          {/* 판매자 (임시 데이터) */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 rounded-full size-10" />
            <div>
              <div className="text-sm font-semibold">사용자 {product.id}</div>
              <div className="text-xs text-gray-500">{product.location}</div>
            </div>
          </div>

          {/* 제목/가격 */}
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <div className="mt-1 text-xl font-extrabold">
              {product.price.toLocaleString()}원
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {product.location} · {product.time}
            </div>
          </div>

          {/* 설명 (더미 텍스트) */}
          <div className="p-4 text-sm leading-6 text-gray-800 whitespace-pre-line card">
            {`이것은 ${product.title}의 상세 설명입니다.\n상세 스펙과 특징을 
            여기에 적습니다.`}
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 text-sm text-gray-600 border rounded-full hover:bg-gray-50">
              ♡
            </button>
            <button className="px-3 py-2 text-sm text-gray-600 border rounded-full hover:bg-gray-50">
              ↗ 공유
            </button>
            <button className="h-10 px-6 ml-auto text-sm font-semibold text-white bg-black rounded-lg hover:opacity-90">
              채팅하기
            </button>
          </div>
        </section>

        {/* 사이드바 */}
        <DetailSidebar />
      </div>

      {/* 비슷한 상품 */}
      <div className="mt-10">
        <ProductSection
          title="비슷한 상품"
          products={mockProducts.filter((p) => p.id !== Number(id)).slice(0, 6)}
        />
      </div>
    </div>
  );
}