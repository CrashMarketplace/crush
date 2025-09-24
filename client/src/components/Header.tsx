import { Link,useLocation } from "react-router-dom";

export default function Header() {
    const location = useLocation();
    const simpleHeader = ["/signup", "/login"].includes(location.pathname);
  return (
    <header className="bg-white border-b">
      <div className="container flex items-center gap-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          KRUSH
        </Link>
        
        <div className="flex-1">
          <div className="relative">
            <input
              className="w-full py-2 pl-4 pr-10 text-sm border border-gray-300 rounded-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="검색어를 입력해주세요"
            />
            <span className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2">
              🔍
            </span>
          </div>
        </div>

        <nav className="items-center hidden gap-2 sm:flex">
          <Link to="/login" className="btn">
            로그인
          </Link>{" "}
          <Link to="/signup" className="btn btn-primary">
            회원가입
          </Link>{" "}
        </nav>
      </div>
    {!simpleHeader && (
      <div className="border-t">
        <div className="container flex items-center gap-4 py-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-black">
            추천
          </Link>
          <button className="hover:text-black">카테고리</button>
          <button className="hover:text-black">인기</button>
          <button className="hover:text-black">최신</button>
        </div>
      </div>
    )}
    </header>
  );
}