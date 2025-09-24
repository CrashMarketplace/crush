import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPw, setShowPw] = useState(false);

  return (
    <div
      className="min-h-[calc(100vh-120px)] bg-white flex items-center 
    justify-center px-4 py-16"
    >
      {/* 카드 */}
      <div
        className="w-full max-w-2xl min-h-[60vh] rounded-[28px] shadow-2xl
       shadow-black/20"
      >
        {/* 배경 그Radient */}
        <div
          className="rounded-[28px] bg-gradient-to-b from-neutral-900
         to-neutral-700 text-white min-h-[60vh] overflow-hidden"
        >
          <div className="grid md:grid-cols-2 min-h-[60vh]">
            {/* 왼쪽 카피 영역 */}
            <div className="relative flex items-center justify-center p-10 md:p-14">
              <div className="space-y-2 text-center md:text-left">
                <p className="text-zinc-300 leading-tight text-[18px] md:text-[20px]">
                  빠르고
                  <br />
                  간편한
                  <br />
                  중고거래
                </p>
                <div className="pt-2 text-4xl md:text-[44px] font-extrabold tracking-tight">
                  KRUSH
                </div>
              </div>

              {/* 가운데 구분선 */}
              <div className="absolute right-0 hidden w-px md:block top-8 bottom-8 bg-white/30" />
            </div>

            {/* 오른쪽 폼 영역 */}
            <div className="p-8 md:p-12">
              <form className="w-full max-w-sm mx-auto space-y-4">
                {/* 아이디 */}
                <div>
                  <label className="sr-only">아이디</label>
                  <input
                    type="text"
                    placeholder="아이디"
                    className="w-full px-3 py-2 text-white border-b border-white bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>

                {/* 비밀번호 */}
                <div className="relative">
                  <label className="sr-only">비밀번호</label>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="비밀번호"
                    className="w-full px-3 py-2 pr-10 text-white border-b border-white bg-white/10 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute -translate-y-1/2 right-2 top-1/2 text-zinc-300 hover:text-white"
                    title={showPw ? "숨기기" : "보기"}
                  >
                    {/* 단순 아이콘 문자 (실제 아이콘 라이브러리 없이) */}
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* 로그인 버튼 */}
                <button
                  type="button"
                  className="w-full py-2 font-semibold bg-white rounded-md text-neutral-900 hover:opacity-90"
                >
                  로그인
                </button>

                {/* 하단 링크들 */}
                <div className="flex items-center justify-between text-xs text-zinc-300">
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

      {/* 바깥 쪽 부드러운 그림자 느낌 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="rounded-[28px] mx-auto mt-[-10px] h-10 w-[min(56rem,90%)] blur-2xl bg-black/10" />
      </div>
    </div>
  );
}