import { Link } from "react-router-dom";
import type { Product } from "../data/mockProducts";

interface Props {
    item: Product;
}

export default function ProductCard({ item }: Props) {
    return (
        <Link
            to={`/listing/${item.id}`} 
            className="block transition card hover:shadow-md"
        >
            <div className="bg-gray-100 aspect-square" >
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm line-clamp-1">{item.title}</h3>
                <p className="mt-1 font-semibold">{item.price.toLocaleString()}원</p>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500" >
                    <span>{item.location}</span>
                    <span>{item.time}</span>
                </div>
            </div>
        </Link>
    );
}