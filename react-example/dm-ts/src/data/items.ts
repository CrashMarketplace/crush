//src/datas.ts
import type { item } from "../types";//
export const items: item[] = [
    {id: "a1",title:"자전거",price:120000,region:"대구",photo:"https:picsum.photos/400?1"},
    {id: "b2",title:"캠핑의자",price:30000,region:"부산",photo:"https:picsum.photos/400?2"},
    {id: "cs",title:"공기청정기",price:50000,region:"서울",photo:"https:picsum.photos/400?3",sold:true}
];

export const itemByld = (id:string) => items.find(i => i.id === id);
