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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
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

  const renderMobileAuthActions = () => {
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
          <button
            onClick={() => { navigate("/reservations"); setMobileMenuOpen(false); }}
            className="py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            예약 내역
          </button>
          <button
            onClick={() => { navigate("/payments"); setMobileMenuOpen(false); }}
            className="py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            결제 내역
          </button>
          {user.userId === "junsu" && (
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
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-md">
      {/* 메인 헤더 */}
      <div className="border-b border-gray-200">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between py-6 gap-6">
            {/* 로고 */}
            <button onClick={() => navigate("/")} className="flex items-center flex-shrink-0">
              <img
                src={logoImage}
                alt="BILIDA"
                className="h-14 w-auto sm:h-16"
                loading="lazy"
              />
            </button>

            {/* 검색창 (데스크톱) - 중앙 배치 */}
            <form
              onSubmit={onSubmitSearch}
              className="hidden lg:flex flex-1 justify-center mx-8"
            >
              <div className="relative w-full max-w-2xl">
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
            <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
              {loading ? (
                <span className="text-sm text-gray-500">확인 중...</span>
              ) : user ? (
                <>
                  {/* 채팅 버튼 */}
                  <button
                    onClick={() => navigate("/chats")}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="채팅"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>

                  {/* 알림 버튼 */}
                  <button
                    onClick={() => navigate("/notifications")}
                    className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="알림"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* 프로필 드롭다운 */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {(user.displayName || user.userId).charAt(0).toUpperCase()}
                      </div>
                      <svg className={`w-4 h-4 text-gray-600 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800">{user.displayName || user.userId} 님</p>
                        </div>
                        <button
                          onClick={() => { navigate("/mypage"); setProfileDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          마이페이지
                        </button>
                        <button
                          onClick={() => { navigate("/reservations"); setProfileDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          예약 내역
                        </button>
                        <button
                          onClick={() => { navigate("/payments"); setProfileDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          결제 내역
                        </button>
                        {user.userId === "junsu" && (
                          <button
                            onClick={() => { navigate("/admin"); setProfileDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            관리자
                          </button>
                        )}
                        <button
                          onClick={() => { navigate("/settings"); setProfileDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          회원 탈퇴
                        </button>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setProfileDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            로그아웃
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[15px] text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-5 py-2.5 text-[15px] text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    회원가입
                  </button>
                </>
              )}
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
          <div className="flex items-center gap-8 py-3 text-sm font-medium overflow-x-auto">
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
            {/* 등록하기 버튼 (네비게이션 바) */}
            <button
              onClick={goSell}
              className="ml-auto px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-lg transition-all shadow-sm hover:shadow-md whitespace-nowrap"
              title={user ? "상품 등록하기" : "로그인하고 상품 등록하기"}
            >
              + 등록하기
            </button>
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
            {renderMobileAuthActions()}
          </div>
        </div>
      </div>
    </header>
  );
}
