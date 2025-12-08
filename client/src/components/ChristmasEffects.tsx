// 🎄 크리스마스 이펙트 컴포넌트 (나중에 삭제 가능)
import { useEffect, useState } from "react";

export default function ChristmasEffects() {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // 눈송이 생성
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <>
      {/* 눈송이 효과 */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute text-white text-xl animate-snowfall"
            style={{
              left: `${flake.left}%`,
              top: '-20px',
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
            }}
          >
            ❄️
          </div>
        ))}
      </div>

      {/* 크리스마스 장식 (상단) */}
      <div className="fixed top-0 left-0 right-0 h-16 pointer-events-none z-40 flex justify-around items-start">
        <span className="text-3xl animate-swing">🎄</span>
        <span className="text-2xl animate-swing" style={{ animationDelay: '0.5s' }}>⭐</span>
        <span className="text-3xl animate-swing" style={{ animationDelay: '1s' }}>🎅</span>
        <span className="text-2xl animate-swing" style={{ animationDelay: '1.5s' }}>🎁</span>
        <span className="text-3xl animate-swing" style={{ animationDelay: '2s' }}>🔔</span>
        <span className="text-2xl animate-swing" style={{ animationDelay: '2.5s' }}>⛄</span>
      </div>

      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }

        @keyframes swing {
          0%, 100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        .animate-snowfall {
          animation: snowfall linear infinite;
        }

        .animate-swing {
          animation: swing 2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </>
  );
}
