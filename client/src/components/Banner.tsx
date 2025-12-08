import bannerImg from "../assets/screenshot-2025-11-11-19-43-24.png";

export default function Banner() {
  return (
    <div className="w-full bg-gradient-to-br from-red-50 via-white to-green-50 relative overflow-hidden">
      {/* 🎄 크리스마스 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-transparent to-green-100/20 animate-shimmer pointer-events-none" />

      <div className="container max-w-[1400px] mx-auto px-6 py-6 relative z-10">
        {/* 🎄 크리스마스 장식 */}
        <div className="absolute -top-4 left-8 text-4xl animate-swing z-20">🎄</div>
        <div className="absolute -top-4 right-8 text-4xl animate-swing z-20" style={{ animationDelay: '1s' }}>🎅</div>

        <div className="w-full overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl border-4 border-red-200 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl hover:border-green-200">
          <picture>
            <source srcSet={bannerImg} media="(min-width: 1024px)" />
            <img
              src={bannerImg}
              alt="중고 대여 거래 배너"
              className="w-full object-contain max-h-[420px] transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
          </picture>
        </div>

        {/* 🎄 크리스마스 하단 텍스트 */}
        <div className="mt-6 text-center space-y-2 animate-fade-in">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
            🎄 중고 대여 마켓플레이스 BILIDA 🎄
          </h2>
          <p className="text-gray-700 text-sm font-semibold">
            🎁 따뜻한 나눔으로 행복한 크리스마스를 만들어요!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes swing {
          0%, 100% {
            transform: rotate(-15deg);
          }
          50% {
            transform: rotate(15deg);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-swing {
          animation: swing 2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
}
