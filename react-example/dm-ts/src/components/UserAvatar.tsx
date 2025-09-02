export default function UserAvartar({name}:{ name:string}) {
 const initial = name?.[0] ?? "?";
 return(
    <div className="flex items-center gap-2">
        <div className="grid border border-gray-200  place-items-center">
            <span className="font-semibold">{initial}</span>
        </div>
        <strong>{name}</strong>
    </div>
 )};
