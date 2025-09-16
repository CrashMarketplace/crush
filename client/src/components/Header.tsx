import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container flex gap-4 items-center py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          KRUSH
        </Link>

        <div className="flex-1">
          <div className="relative">
            <input
              className="py-2 pr-10 pl-4 w-full text-sm rounded-full border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="검색어를 입력해주세요"
            />
            <span className="absolute right-3 top-1/2 text-gray-400 -translate-y-1/2">
              ⌕
            </span>
          </div>
        </div>

        <nav className="hidden gap-2 items-center sm:flex">
          <Link to="/" className="btn">
            로그인
          </Link>{" "}
          <Link to="/signup" className="btn btn-primary">
            회원가입
          </Link>{" "}
        </nav>
      </div>

      <div className="border-t">
        <div className="container flex gap-4 items-center py-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-black">
            추천
          </Link>
          <button className="hover:text-black">카테고리</button>
          <button className="hover:text-black">인기</button>
          <button className="hover:text-black">최신</button>
        </div>
      </div>
    </header>
  );
}