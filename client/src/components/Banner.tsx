import bannerImg from "../assets/screenshot-2025-11-11-19-43-24.png";

export default function Banner() {
  return (
    <div className="w-full bg-white">
      <div className="container max-w-[1200px] mx-auto px-6 py-4">
        <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm">
          <picture>
            <source srcSet={bannerImg} media="(min-width: 1024px)" />
            <img
              src={bannerImg}
              alt="중고 대여 거래 배너"
              className="w-full object-contain max-h-[280px]"
              loading="lazy"
            />
          </picture>
        </div>
      </div>
    </div>
  );
}
