export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
  time: string;
}

export const mockProducts: Product[] = Array.from({ length: 16 }).map(
    (_,i) => ({
      id: i + 1,
      title: `상품${i + 1}`,
        price: 1000,
        image: `https://picsum.photos/seed/${i + 1}/200/200`,
        location: '대구 • 수성구',
        time: '3시간 전',
    })
);