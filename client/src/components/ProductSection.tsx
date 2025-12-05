import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import type { Product } from "../data/mockProducts";

interface Props {
  title: string;
  products: Product[];
}

export default function ProductSection({ title, products }: Props) {
  const navigate = useNavigate();
  if (!products?.length) return null;

  return (
    <section className="container my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        <button
          className="text-sm text-gray-500 hover:text-black"
          onClick={() => navigate(`/all?title=${encodeURIComponent(title)}`)}
        >
          › 전체 보기
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {products.map((p) => (
          <ProductCard key={p._id} item={p} />
        ))}
      </div>
    </section>
  );
}
