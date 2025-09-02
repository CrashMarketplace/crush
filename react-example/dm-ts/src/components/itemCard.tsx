// //src/compnents/ItemCard.tsx
// import type {item} from "../types";

// type props = {
//     item : item;
//     fav?: boolean; //즐거찾기 표시용
//     onToggleFav?:(id: string) => void; //토글 핸글러(있울떄만 노출)
// };
// export default function ItemCard({item,fav =false,onToggleFav}:props){
//     return(
//         <div className="p-4 mb-4 border shadow-sm rounded-2x1">
//             <img
//                 src={item.photo}
//                 alt={item.title}
//                 className="w-full max-w-[240px] h-[160px]
//                 object-cover tounded-x1"//오타 수정
//                 />
//                 <h3 className="mt-3 text-lg"
//         </div>
//     )
// }

// UserAvatar.tsx

// UserAvatar.tsx
// ItemCard.tsx
import type { item } from "../types"

export default function ItemCard({ item }: { item: item }) {

 return (

 <div className="p-4 mb-4 border shadow-sm rounded-2xl">

 <img src={item.photo} alt={item.title} className="w-full max-w-[240px] h-[160px] object-cover rounded-xl" />

 <h3 className="flex items-center gap-2 mt-3 text-lg font-semibold">

 {item.title}

 {item.sold && (

 <span className="text-xs px-2 py-0.5 border border-orange-500 text-orange-600 rounded-full">거래완료</span>

 )}

 </h3>

 <p className="text-sm text-gray-600">{item.price.toLocaleString()}원 · {item.region}</p>

 </div>

 )

}