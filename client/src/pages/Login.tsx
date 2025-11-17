// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LocationState = { from?: string } | null;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authBusy } = useAuth();

  const [userId, setUserId] = useState("");
  const [pw, setPw] = useState("");//초기화
  const [showPw, setShowPw] = useState(false);
  
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = userId.trim().length > 0 && pw.length > 0 && !authBusy;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setErr(null);
      await login(userId, pw); // 컨텍스트 갱신

      // 리다이렉트 대상이 있으면 거기로, 없으면 홈
      const state = location.state as LocationState;
      const from =
        state?.from && typeof state.from === "string" ? state.from : "/";
      navigate(from, { replace: true });
    } catch (e: any) {
      setErr(e.message || "로그인 실패");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-120px)] bg-gradient-to-b from-white to-slate-50 px-4 py-12">
      <div className="relative w-full max-w-4xl rounded-[28px] shadow-2xl shadow-black/20 overflow-hidden">
        <div className="bg-gradient-to-r from-[#001C6D] to-[#004695] text-white">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* 왼쪽 카피 영역 */}
            <div className="relative flex items-center justify-center p-10 md:p-14">
              <div className="space-y-2 text-center md:text-left">
                <p className="text-zinc-300 leading-tight text-lg md:text-xl">
                  빠르고
                  <br />
                  간편한
                  <br />
                  중고거래
                </p>
                <div className="pt-2 text-4xl font-extrabold tracking-tight md:text-[44px]">
                  KRUSH
                </div>
              </div>
              <div className="hidden absolute right-0 top-8 bottom-8 w-px md:block bg-white/30" />
            </div>

            {/* 오른쪽 폼 영역 */}
            <div className="p-8 pb-12 md:p-12">
              <form
                className="mx-auto space-y-4 w-full max-w-sm"
                onSubmit={onSubmit}
              >
                {/* 아이디 */}
                <div>
                  <label className="sr-only">아이디</label>
                  <input
                    type="text"
                    placeholder="아이디"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    autoComplete="username"
                    className="px-3 py-2 w-full text-white rounded-md border border-white/25 bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>

                {/* 비밀번호 */}
                <div className="relative">
                  <label className="sr-only">비밀번호</label>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="비밀번호"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete="current-password"
                    className="px-3 py-2 pr-10 w-full text-white rounded-md border border-white/25 bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white"
                    title={showPw ? "숨기기" : "보기"}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* 로그인 버튼 */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="py-2 w-full font-semibold bg-white rounded-md text-neutral-900 hover:opacity-90 disabled:opacity-50"
                >
                  {authBusy ? "로그인 중..." : "로그인"}
                </button>

                {/* 에러 메시지 */}
                {err && (
                  <p className="text-xs text-center text-rose-300">{err}</p>
                )}

                {/* 하단 링크 */}
                <div className="flex justify-between items-center text-xs text-zinc-300">
                  <div className="space-x-2">
                    <Link to="#" className="underline underline-offset-2">
                      비밀번호 찾기
                    </Link>
                    <span className="opacity-60">|</span>
                    <Link to="#" className="underline underline-offset-2">
                      아이디 찾기
                    </Link>
                  </div>
                  <Link to="/signup" className="underline underline-offset-2">
                    회원가입
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
