import { useState } from 'react';

interface Props {
    images: string[];
}

export default function ImageCarousel({ images }: Props) {
    const [idx, setIdx] = useState(0);
    const total = images.length || 1;

    const prev = () => setIdx((i) => (i - 1 + total) % total);
    const next = () => setIdx((i) => (i + 1) % total);

    return (
        <div className="relative w-full">
            <div className="card">
                <div className='bg-gray-100 aspect-square'>
                    <img 
                        src={images[idx]} 
                        alt={`image-${idx + 1}`} 
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>

            {/* 좌/우 버튼 */}
            <button
                type="button"
                onClick={prev}
                className="absolute p-2 text-gray-700 -translate-y-1/2 rounded-full shadow left-2 top-1/2 bg-white/90"
                aria-label="prev"
            >
                ←
            </button>
            <button
                type="button"
                onClick={next}
                className="absolute p-2 text-gray-700 -translate-y-1/2 rounded-full shadow right-2 top-1/2 bg-white/90"
                aria-label="next"
            >
                →
            </button>

            {/* 인디케이터 */}
            <div className="absolute bottom-3 left-1/2 rounded-full bg-white/90 px-2 py-0.5 text-xs text-gray-700">
                {idx + 1} / {total}
            </div>
        </div>
    );
}