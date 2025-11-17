import { useState } from "react";

interface Props {
  images: string[];
}

export default function ImageCarousel({ images }: Props) {
  const [idx, setIdx] = useState(0);
  const total = images.length || 1;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);
  const showControls = total > 1;

  return (
    <div className="relative w-full">
      <div className="card">
        <div className="bg-gray-100 aspect-[4/3] sm:aspect-square">
          <img
            src={images[idx]}
            alt={`image-${idx}`}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* 좌/우 버튼 */}
      {showControls && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute flex items-center justify-center text-gray-700 -translate-y-1/2 rounded-full shadow left-2 top-1/2 bg-white/90 size-10"
            aria-label="이전 이미지"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute flex items-center justify-center text-gray-700 -translate-y-1/2 rounded-full shadow right-2 top-1/2 bg-white/90 size-10"
            aria-label="다음 이미지"
          >
            ›
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {showControls && (
        <div className="absolute px-3 py-1 text-xs text-gray-700 -translate-x-1/2 rounded-full shadow-sm bottom-3 left-1/2 bg-white/90">
          {idx + 1}/{total}
        </div>
      )}
    </div>
  );
}
