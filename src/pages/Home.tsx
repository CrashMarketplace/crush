import Banner from "../components/Banner";
import ProductSection from "../components/ProductSection";
import { mockProducts } from "../data/mockProducts";

export default function Home() {
    return (
        <>
            <Banner />
            <ProductSection
                title="오늘의 상품 추천"
                products={mockProducts.slice(0,12)}
                /><ProductSection
                    title="인기 많은 상품"
                    products={mockProducts.slice(4,16)}
                />
            </>
    );
}