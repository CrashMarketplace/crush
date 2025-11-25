export default function About() {
  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-8">회사소개</h1>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">BILIDA 소개</h2>
          <p className="mb-4">
            BILIDA는 "빌리다"의 의미를 담은 지역 기반 중고 거래 및 대여 플랫폼입니다.
            우리는 사용하지 않는 물건을 필요한 사람과 연결하여 자원의 효율적인 활용과
            지속 가능한 소비 문화를 만들어갑니다.
          </p>
          <p>
            2024년에 설립된 BILIDA는 사용자 간의 신뢰를 바탕으로 안전하고 편리한
            거래 환경을 제공하며, 지역 커뮤니티의 활성화에 기여하고 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">우리의 미션</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>사용하지 않는 물건에 새로운 가치를 부여합니다</li>
            <li>지역 커뮤니티 간의 신뢰와 연결을 강화합니다</li>
            <li>환경 보호와 지속 가능한 소비를 실천합니다</li>
            <li>누구나 쉽고 안전하게 거래할 수 있는 플랫폼을 제공합니다</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">주요 서비스</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">중고 거래</h3>
              <p className="text-sm">
                사용하지 않는 물건을 판매하고 필요한 물건을 합리적인 가격에 구매할 수 있습니다.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">물품 대여</h3>
              <p className="text-sm">
                잠깐 필요한 물건을 구매 대신 대여하여 경제적이고 환경친화적인 소비를 실천합니다.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">실시간 채팅</h3>
              <p className="text-sm">
                판매자와 구매자가 실시간으로 소통하여 빠르고 편리한 거래를 진행합니다.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">예약 시스템</h3>
              <p className="text-sm">
                원하는 물건을 미리 예약하고 만날 시간과 장소를 조율할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">회사 정보</h2>
          <div className="bg-gray-50 p-6 rounded-lg space-y-2">
            <p><strong>상호:</strong> BILIDA</p>
            <p><strong>설립일:</strong> 2024년</p>
            <p><strong>대표:</strong> 장준수</p>
            <p><strong>이메일:</strong> junsumon090608@dgsw.hs.kr</p>
            <p><strong>주소:</strong> 대구광역시</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">파트너십</h2>
          <p className="mb-4">
            BILIDA는 다양한 파트너와 협력하여 더 나은 서비스를 제공합니다:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>택배 업체:</strong> 안전하고 빠른 배송 서비스 제공</li>
            <li><strong>결제 시스템:</strong> 안전한 거래를 위한 에스크로 서비스</li>
            <li><strong>지역 커뮤니티:</strong> 지역 기반 거래 활성화</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">문의하기</h2>
          <p className="mb-4">
            서비스 이용 중 궁금한 점이나 제안 사항이 있으시면 언제든지 연락주세요.
          </p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="font-semibold mb-2">고객센터</p>
            <p>이메일: <a href="mailto:junsumon090608@dgsw.hs.kr" className="text-blue-600 underline">junsumon090608@dgsw.hs.kr</a></p>
            <p className="text-sm text-gray-600 mt-2">평일 09:00 - 18:00 (주말 및 공휴일 휴무)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
