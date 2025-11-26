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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/api/notifications/unread-count`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.ok !== false) {
          setUnreadCount(data.count || 0);
        }
      } catch (e) {
        console.error("읽지 않은 알림 개수 로드 실패:", e);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // 30초마다 갱신

    return () => clearInterval(interval);
  }, [user]);

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
      if (variant === "mobile") {
        return (
          <>
            <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
              <span className="text-sm text-gray-600">안녕하세요,</span>
              <div className="font-semibold text-gray-900">{user.displayName || user.userId} 님</div>
            </div>
            <button
              onClick={() => { navigate("/mypage"); setMobileMenuOpen(false); }}
              className="py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              마이페이지
            </button>
            <button
              onClick={() => { navigate("/chats"); setMobileMenuOpen(false); }}
              className="py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              채팅
            </button>
            <button
              onClick={() => { navigate("/reservations"); setMobileMenuOpen(false); }}
              className="py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              예약
            </button>
            <button
              onClick={() => { navigate("/payments"); setMobileMenuOpen(false); }}
              className="py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              결제
            </button>
            <button
              onClick={() => { navigate("/notifications"); setMobileMenuOpen(false); }}
              className="relative py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              알림
              {unreadCount > 0 && (
                <span className="absolute top-3 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {user.isAdmin && (
              <button
                onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                className="py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                관리자
              </button>
            )}
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="py-3 px-4 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              로그아웃
            </button>
          </>
        );
      }

      // Desktop
      return (
        <>
          <span className="text-[15px] text-gray-800 font-semibold whitespace-nowrap">
            {(user.displayName || user.userId) + " 님"}
          </span>
          <div className="w-px h-4 bg-gray-300"></div>
          <button
            onClick={() => navigate("/mypage")}
            className="text-[15px] text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            title="마이페이지로 이동"
          >
            마이페이지
          </button>
          <div className="w-px h-4 bg-gray-300"></div>
          <button
            onClick={() => navigate("/chats")}
            className="text-[15px] text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            title="채팅으로 이동"
          >
            채팅
          </button>
          <div className="w-px h-4 bg-gray-300"></div>
          <button
            onClick={() => navigate("/reservations")}
            className="text-[15px] text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            title="예약 내역"
          >
            예약
          </button>
          <div className="w-px h-4 bg-gray-300"></div>
          <button
            onClick={() => navigate("/payments")}
            className="text-[15px] text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            title="결제 내역"
          >
            결제
          </button>
          <div className="w-px h-4 bg-gray-300"></div>
          <button
            onClick={() => navigate("/notifications")}
            className="relative text-[15px] text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            title="알림"
          >
            알림
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {user.isAdmin && (
            <>
              <div className="w-px h-4 bg-gray-300"></div>
              <button
                onClick={() => navigate("/admin")}
                className="text-[15px] text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
                title="관리자 페이지"
              >
                관리자
              </button>
            </>
          )}
          <div className="w-px h-4 bg-gray-300"></div>
          <button
            onClick={logout}
            className="text-[15px] text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap"
          >
            로그아웃
          </button>
        </>
      );
    }

    if (variant === "mobile") {
      return (
        <>
          <button
            onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
            className="py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            로그인
          </button>
          <button
            onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }}
            className="py-3 px-4 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            회원가입
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => navigate("/login")}
          className="text-[15px] text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          로그인
        </button>
        <div className="w-px h-4 bg-gray-300"></div>
        <button
          onClick={() => navigate("/signup")}
          className="text-[15px] text-blue-600 hover:text-blue-700 font-semibold transition-colors whitespace-nowrap"
        >
          회원가입
        </button>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-md">
      {/* 메인 헤더 */}
      <div className="border-b border-gray-200">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="flex items-center py-6 gap-6">
            {/* 로고 */}
            <button onClick={() => navigate("/")} className="flex items-center flex-shrink-0">
              <img
                src={logoImage}
                alt="BILIDA"
                className="h-14 w-auto sm:h-16"
                loading="lazy"
              />
            </button>

            {/* 검색창 (데스크톱) - 중앙에 넓게 */}
            <form
              onSubmit={onSubmitSearch}
              className="hidden lg:flex flex-1 max-w-3xl"
              style={{ minWidth: '500px' }}
            >
              <div className="relative w-full">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="어떤 상품을 찾으시나요?"
                  className="w-full pl-14 pr-6 py-4 text-base bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all outline-none shadow-sm hover:border-gray-400"
                />
              </div>
            </form>

            {/* 우측 메뉴 (데스크톱) */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0 ml-auto">
              <button
                onClick={goSell}
                className="px-6 py-3.5 text-[15px] font-semibold text-white rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                title={user ? "상품 등록하기" : "로그인하고 상품 등록하기"}
              >
                + 등록하기
              </button>
              <div className="flex items-center gap-4 pl-4 border-l-2 border-gray-200">
                {renderAuthActions("desktop")}
              </div>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 ml-auto"
              aria-label="모바일 메뉴 토글"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* 검색창 (모바일) */}
          <form onSubmit={onSubmitSearch} className="lg:hidden pb-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="어떤 상품을 찾으시나요?"
                className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all outline-none"
              />
            </div>
          </form>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <div className="bg-white border-b border-gray-100">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="flex gap-8 py-3 text-sm font-medium overflow-x-auto">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `pb-2 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div
        className={`lg:hidden bg-white border-b border-gray-200 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <div className="container max-w-[1400px] mx-auto px-6 py-4">
          {/* 등록하기 버튼 */}
          <button
            onClick={() => {
              goSell();
              setMobileMenuOpen(false);
            }}
            className="w-full mb-4 px-6 py-3 text-sm font-semibold text-white rounded-lg bg-[#0093B7] hover:bg-[#007a9a] transition-colors"
          >
            + 등록하기
          </button>

          {/* 네비게이션 */}
          <div className="flex flex-col gap-1 mb-4 pb-4 border-b border-gray-200">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `py-3 px-4 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex flex-col gap-2">
            {renderAuthActions("mobile")}
          </div>
        </div>
      </div>
    </header>
  );
}
