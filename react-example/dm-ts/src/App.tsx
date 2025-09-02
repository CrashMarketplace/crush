import UserAvartar from "./components/UserAvatar"
import Itemcard from "./components/itemCard"
import {items} from "./data/items"

export default function App(){
  return(
    <div className="px-4 py-6 mx-auto max-w-2x1">
      <UserAvartar name="홍길동"/>
      <div className='mt-6'>
        <Itemcard item={items[0]}/>
s      </div>
    </div>
  )
}
// export default function App() {
//  return (
//   <div className="grid min-h-screen place-items-center bg-gray-50">
//     <h1 className="text-3xl font-bold text-orange-600">Tailwind OK</h1>
//   </div>
//  )
// }
