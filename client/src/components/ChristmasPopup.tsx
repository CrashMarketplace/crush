// BILIDA 소개 팝업
import { useState, useEffect } from "react";
import logoImg from "../assets/Group 88.png";

export default function ChristmasPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 페이지 로드 후 1.5초 뒤에 팝업 표시
    const timer = setTimeout(() => {
      const hasSeenPopup = sessionStorage.getItem('bilida-intro-popup-seen');
      if (!hasSeenPopup) {
        setIsOpen(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('bilida-intro-popup-seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-scale-in border-2 border-blue-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl leading-none transition-transform hover:rotate-90 duration-300"
          aria-label="닫기"
        >
          ×
        </button>

        {/* 로고 영역 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4 animate-bounce-slow">
            <img 
              src={logoImg} 
              alt="BILIDA 로고" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            BILIDA
          </h2>
          <p className="text-sm text-gray-500 mt-1">중고 대여 마켓플레이스</p>
        </div>

        {/* 내용 */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              BILIDA는 무엇인가요?
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              필요한 물건을 빌리고, 안 쓰는 물건을 빌려주는<br/>
              <strong className="text-blue-600">스마트한 중고 대여 플랫폼</strong>입니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 text-center border border-blue-100">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-xs font-semibold text-gray-700">합리적인 가격</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 text-center border border-blue-100">
              <div className="text-3xl mb-2">🛡️</div>
              <div className="text-xs font-semibold text-gray-700">AI 사기 방지</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 text-center border border-blue-100">
              <div className="text-3xl mb-2">📍</div>
              <div className="text-xs font-semibold text-gray-700">위치 기반 거래</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 text-center border border-blue-100">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-xs font-semibold text-gray-700">실시간 채팅</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white text-center">
            <p className="text-sm font-semibold">
              ✨ 지금 바로 시작하세요!
            </p>
            <p className="text-xs mt-1 opacity-90">
              회원가입 없이도 둘러볼 수 있어요
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            시작하기 🚀
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
