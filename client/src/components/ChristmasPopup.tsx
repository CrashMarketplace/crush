// 🎄 크리스마스 팝업 (나중에 삭제 가능)
import { useState, useEffect } from "react";

export default function ChristmasPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 페이지 로드 후 1초 뒤에 팝업 표시
    const timer = setTimeout(() => {
      const hasSeenPopup = sessionStorage.getItem('christmas-popup-seen');
      if (!hasSeenPopup) {
        setIsOpen(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('christmas-popup-seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-red-50 via-white to-green-50 rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in border-4 border-red-200"
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

        {/* 크리스마스 장식 */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce">
          🎅
        </div>

        {/* 내용 */}
        <div className="text-center space-y-6 mt-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent animate-pulse">
              🎄 Merry Christmas! 🎄
            </h2>
            <p className="text-lg font-semibold text-gray-700">
              행복한 크리스마스 되세요!
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner">
            <p className="text-gray-700 leading-relaxed">
              🎁 BILIDA와 함께하는<br/>
              따뜻한 중고 대여 거래로<br/>
              더욱 의미있는 연말 보내세요!
            </p>
          </div>

          <div className="flex gap-2 justify-center text-4xl animate-bounce-slow">
            <span>🎄</span>
            <span style={{ animationDelay: '0.2s' }}>⭐</span>
            <span style={{ animationDelay: '0.4s' }}>🎁</span>
            <span style={{ animationDelay: '0.6s' }}>🔔</span>
            <span style={{ animationDelay: '0.8s' }}>⛄</span>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            확인했어요! 🎅
          </button>
        </div>

        {/* 반짝이는 별 */}
        <div className="absolute top-4 left-4 text-2xl animate-twinkle">✨</div>
        <div className="absolute top-8 right-8 text-xl animate-twinkle" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-8 left-8 text-xl animate-twinkle" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-4 right-4 text-2xl animate-twinkle" style={{ animationDelay: '1.5s' }}>✨</div>
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
            transform: scale(0.8);
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
            transform: translateY(-10px);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
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

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
