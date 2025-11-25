import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoImage from "../assets/Group 88.png";

const NAV_LINKS = [
  { to: "/feed/recommend", label: "추천" },
  { to: "/categories", label: "카테고리" },
  { to: "/feed/hot", label: "인기" },
  { to: "/feed/new", label: "최신" },
] as const;

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const goSell = () => {
    if (user) {
      navigate("/sell");
    } else {
      // 로그인 후 다시 /sell 로 돌아오도록 리다이렉트 상태 전달
      navigate("/login", { state: { from: "/sell" } });
    }
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/all?q=${encodeURIComponent(q)}` : "/all");
  };

  const renderAuthActions = (variant: "desktop" | "mobile") => {
    if (loading) {
      return (
        <span className="text-sm text-gray-500" aria-live="polite">
          확인 중...
        </span>
      );
    }

    if (user) {
      return (
        <>
          <span
            className={`text-sm text-gray-700 ${
              variant === "mobile" ? "" : "whitespace-nowrap"
            }`}
          >
            {(user.displayName || user.userId) + " 님"}
          </span>
          <button
            onClick={() => navigate("/mypage")}
            className={`rounded border border-gray-300 hover:bg-gray-100 ${
              variant === "mobile"
                ? "px-4 py-2 text-base"
                : "px-3 py-1 text-sm"
            }`}
            title="마이페이지로 이동"
          >
            마이페이지
          </button>
          <button
            onClick={() => navigate("/chats")}
            className={`rounded border border-gray-300 hover:bg-gray-100 ${
              variant === "mobile"
                ? "px-4 py-2 text-base"
                : "px-3 py-1 text-sm"
            }`}
            title="채팅으로 이동"
          >
            채팅
          </button>
          <button
            onClick={() => navigate("/reservations")}
            className={`rounded border border-gray-300 hover:bg-gray-100 ${
              variant === "mobile"
                ? "px-4 py-2 text-base"
                : "px-3 py-1 text-sm"
            }`}
            title="예약 내역"
          >
            예약
          </button>
          <button
            onClick={() => navigate("/admin")}
            className={`rounded border border-gray-300 hover:bg-gray-100 ${
              variant === "mobile"
                ? "px-4 py-2 text-base"
                : "px-3 py-1 text-sm"
            }`}
            title="관리자 페이지"
          >
            관리자
          </button>
          <button
            onClick={logout}
            className={`text-white bg-red-500 rounded hover:bg-red-600 ${
              variant === "mobile"
                ? "px-4 py-2 text-base"
                : "px-3 py-1 text-sm"
            }`}
          >
            로그아웃
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => navigate("/login")}
          className={`rounded border border-gray-300 hover:bg-gray-100 ${
            variant === "mobile" ? "px-4 py-2 text-base" : "px-3 py-1 text-sm"
          }`}
        >
          로그인
        </button>
        <button
          onClick={() => navigate("/signup")}
          className={`text-white rounded bg-neutral-900 hover:opacity-90 ${
            variant === "mobile" ? "px-4 py-2 text-base" : "px-3 py-1 text-sm"
          }`}
        >
          회원가입
        </button>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="container flex flex-wrap items-center gap-3 py-3">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <button onClick={() => navigate("/")} className="flex items-center">
            <img
              src={logoImage}
              alt="BILIDA"
              className="w-auto h-10 sm:h-12"
              loading="lazy"
            />
          </button>

          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={goSell}
              className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg bg-[#0093B7] hover:opacity-90"
              title={user ? "상품 등록하기" : "로그인하고 상품 등록하기"}
            >
              등록하기
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300"
              aria-label="모바일 메뉴 토글"
            >
              {mobileMenuOpen ? "닫기" : "메뉴"}
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <form
          onSubmit={onSubmitSearch}
          className="order-3 w-full sm:order-none sm:flex-1 sm:max-w-3xl"
        >
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력해주세요"
              className="w-full px-5 py-3 text-sm rounded-full border border-gray-300 focus:ring-2 focus:ring-neutral-800 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute text-xs font-medium text-white rounded-full px-4 py-2 right-1.5 top-1/2 -translate-y-1/2 bg-neutral-800 hover:bg-neutral-900"
              aria-label="검색"
            >
              검색
            </button>
          </div>
        </form>

        {/* 우측 메뉴 (데스크톱) */}
        <div className="items-center hidden gap-2 ml-auto sm:flex">
          <button
            onClick={goSell}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-[#0093B7] hover:opacity-90"
            title={user ? "상품 등록하기" : "로그인하고 상품 등록하기"}
          >
            등록하기
          </button>
          {renderAuthActions("desktop")}
        </div>
      </div>

      {/* 하단 카테고리 메뉴 */}
      <div className="border-t border-gray-100 bg-white">
        <div className="container">
          <div className="flex gap-6 py-2 text-sm text-[#001C6D] overflow-x-auto">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `pb-1 border-b-2 border-transparent hover:border-[#001C6D] hover:text-sky-600 ${
                    isActive ? "text-sky-600 font-medium border-[#001C6D]" : ""
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* 모바일 풀스크린 메뉴 */}
      <div
        className={`sm:hidden border-t border-gray-100 bg-white transition-[max-height] duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-[480px]" : "max-h-0"
        }`}
      >
        <div className="container flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2 text-base text-[#001C6D]">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `py-2 border-b border-gray-100 ${
                    isActive ? "font-semibold text-sky-600" : ""
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
            {renderAuthActions("mobile")}
          </div>
        </div>
      </div>
    </header>
  );
}
