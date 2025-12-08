import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const links = [
    { label: "이용약관", path: "/terms" },
    { label: "개인정보처리방침", path: "/privacy" },
  ];

  return (
    <footer className="mt-12 bg-gray-50 border-t">
      <div className="container flex flex-col gap-6 py-10 text-sm text-[#001C6D]">
        <div className="flex flex-wrap gap-3">
          {links.map(({ label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#001C6D]"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-2 text-xs leading-6 text-[#000000] sm:text-sm">
          <p>본 서비스는 지역 기반 중고 대여 거래 플랫폼입니다.</p>
          <p>
            <strong>문의:</strong>{" "}
            <a
              href="mailto:junsumon090608@dgsw.hs.kr"
              className="underline underline-offset-2"
            >
              junsumon090608@dgsw.hs.kr
            </a>
          </p>
          <p className="text-gray-500">
            안전하고 편리한 중고 대여 거래 플랫폼
          </p>
          <p className="text-gray-400">© {new Date().getFullYear()} BILIDA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
