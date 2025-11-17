export type SellerProfile = {
  _id: string;
  displayName?: string;
  userId?: string;
  email?: string;
  location?: string;
  avatarUrl?: string;
};

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  status: "selling" | "reserved" | "sold";
  usedAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
  seller: string | SellerProfile;
  likes?: string[];
}

// ✅ 목(Mock) 데이터 추가
export const mockProducts: Product[] = [
  {
    _id: "1",
    title: "MacBook Pro 2021",
    description: "Apple M1 Pro 16-inch, excellent condition",
    price: 2300000,
    category: "Electronics",
    location: "Seoul",
    images: [
      "https://via.placeholder.com/400x300",
      "https://via.placeholder.com/400x300?text=second",
    ],
    status: "selling",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: "user123",
  },
  {
    _id: "2",
    title: "Nike Air Jordan",
    description: "Brand new, size 270mm",
    price: 250000,
    category: "Fashion",
    location: "Busan",
    images: ["https://via.placeholder.com/400x300"],
    status: "reserved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seller: "user456",
  },
];

export function getSellerId(seller: Product["seller"]) {
  return typeof seller === "string" ? seller : seller?._id ?? "";
}

export function getSellerProfile(seller: Product["seller"]) {
  return typeof seller === "object" && seller ? seller : null;
}