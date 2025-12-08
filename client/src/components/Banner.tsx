import { useEffect, useState } from "react";
import bannerImg from "../assets/screenshot-2025-11-11-19-43-24.png";

export default function Banner() {
  const [floatingIcons, setFloatingIcons] = useState<Array<{ id: number; icon: string; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // 떠다니는 아이콘 생성
    const icons = ['📦', '🔄', '💰', '🎁', '✨', '🚀', '💎', '🌟'];
    const generated = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      icon: icons[i % icons.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setFloatingIcons(generated);
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* 떠다니는 아이콘 배경 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item) => (
          <div
            key={item.id}
            className="absolute text-2xl opacity-20 animate-float"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDelay: `${item.delay}s`,
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none" />

      <div className="container max-w-[1400px] mx-auto px-6 py-6 relative z-10">
        <div className="w-full overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-2xl border border-white/50 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
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

        {/* 하단 텍스트 */}
        <div className="mt-6 text-center space-y-2 animate-fade-in">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            중고 대여 마켓플레이스 BILIDA
          </h2>
          <p className="text-gray-600 text-sm">
            ✨ 필요한 물건을 빌리고, 안 쓰는 물건을 빌려주세요
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

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

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}
