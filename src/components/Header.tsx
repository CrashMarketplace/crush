import { Link } from "react-router-dom";
import Group88 from "../assets/Group 88.png";

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container flex flex-col gap-3 py-3">
        {/* 로고 */}
        <div>
          <Link to="/" className="text-xl font-extrabold tracking-tight">
            <img src={Group88} alt="BILIDA" className="h-[78px] w-auto" />
          </Link>
        </div>

        {/* 검색창 + 로그인/회원가입 버튼 */}
        <div className="flex gap-3 items-center">
          {/* 검색창 */}
          <div className="relative flex-1">
            <input
              className="py-2 pr-10 pl-4 w-full text-sm rounded-full border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="검색어를 입력해주세요"
            />
            <span className="absolute right-3 top-1/2 text-gray-400 -translate-y-1/2">
              🔍
            </span>
          </div>

          {/* 버튼들 */}
          <nav className="flex gap-2">
            <Link to="/login" className="btn">
              로그인
            </Link>{" "}
            <Link to="/signup" className="btn btn-primary">
              회원가입
            </Link>{" "}
          </nav>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="border-t">
        <div className="container flex gap-4 items-center py-2 text-sm text-[#001C6D]">
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