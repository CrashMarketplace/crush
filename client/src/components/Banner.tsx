import bannerImg from "../assets/screenshot-2025-11-11-19-43-24.png";

export default function Banner() {
  return (
    <div className="container my-6">
      <div className="w-full overflow-hidden rounded-3xl bg-[#F8F9FF]">
        <picture>
          <source srcSet={bannerImg} media="(min-width: 1024px)" />
          <img
            src={bannerImg}
            alt="중고 대여 거래 배너"
            className="w-full object-contain max-h-[420px]"
            loading="lazy"
          />
        </picture>
      </div>
    </div>
  );
}
