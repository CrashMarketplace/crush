import {Link} from "react-router-dom";
import type {Product} from  "../data/mockProducts";

interface Props{
    item:Product;
}

export default function productCard({item}: Props){
    return (
        <Link
            to={`/listing/${item.id}`}
            className="brock transeration card hover:shadow-md"
        >
            <div className="bg-gray-100 aspect-square">
                <img
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm line-clamp-1">{item.title}</h3>
                <p className="mt-1 font-semibold">{item.price.toLocaleString()}원</p>
                    <span>{item.location}</span>
                    <span>{item.title}</span>
            </div>
        </Link>
    );
}