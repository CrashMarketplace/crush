export default function Privacy() {
  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-8">개인정보처리방침</h1>
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
          <p className="mb-2">BILIDA는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공</li>
            <li><strong>서비스 제공:</strong> 중고 거래 및 대여 중개, 채팅, 예약, 알림 서비스</li>
            <li><strong>고객 지원:</strong> 민원 처리, 고지사항 전달</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. 수집하는 개인정보 항목</h2>
          <p className="mb-2"><strong>필수:</strong> 아이디, 비밀번호, 이메일</p>
          <p className="mb-2"><strong>선택:</strong> 프로필 사진, 거래 지역, 자기소개</p>
          <p><strong>자동 수집:</strong> IP 주소, 쿠키, 서비스 이용 기록</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>회원 정보:</strong> 회원 탈퇴 시까지</li>
            <li><strong>거래 기록:</strong> 5년간 보관</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
          <p className="mb-2">원칙적으로 제3자에게 제공하지 않습니다.</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">택배 업체 정보 제공</h3>
            <p className="text-sm">배송을 위해 수령인 정보가 택배 업체에 제공될 수 있습니다.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">5. 개인정보 보호책임자</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p><strong>성명:</strong> 장준수</p>
            <p><strong>이메일:</strong> junsumon090608@dgsw.hs.kr</p>
          </div>
        </section>
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>시행일:</strong> 2024년 1월 1일
          </p>
        </div>
      </div>
    </div>
  );
}
