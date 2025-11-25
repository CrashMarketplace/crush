export default function Privacy() {
  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-8">개인정보처리방침</h1>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
          <p className="mb-2">BILIDA(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공, 본인 확인</li>
            <li><strong>서비스 제공:</strong> 중고 거래 및 대여 중개, 채팅 서비스, 예약 서비스, 알림 서비스</li>
            <li><strong>마케팅 및 광고:</strong> 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공</li>
            <li><strong>고객 지원:</strong> 민원 처리, 고지사항 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. 수집하는 개인정보 항목</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">필수 항목:</h3>
              <ul className="list-disc list-inside ml-4">
                <li>아이디, 비밀번호</li>
                <li>이메일 주소</li>
                <li>닉네임</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">선택 항목:</h3>
              <ul className="list-disc list-inside ml-4">
                <li>프로필 사진</li>
                <li>거래 지역</li>
                <li>자기소개</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">자동 수집 항목:</h3>
              <ul className="list-disc list-inside ml-4">
                <li>IP 주소, 쿠키, 서비스 이용 기록</li>
                <li>기기 정보 (브라우저 종류, OS 등)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우 해당 수사·조사 종료 시까지)</li>
            <li><strong>거래 기록:</strong> 전자상거래법에 따라 5년간 보관</li>
            <li><strong>소비자 불만 또는 분쟁처리 기록:</strong> 3년간 보관</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
          <p className="mb-2">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">택배 업체 정보 제공</h3>
            <p className="text-sm">거래 시 배송을 위해 택배 업체에 다음 정보가 제공될 수 있습니다:</p>
            <ul className="list-disc list-inside ml-4 mt-2 text-sm">
              <li>수령인 이름, 연락처, 주소</li>
              <li>상품 정보</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">5. 개인정보의 파기</h2>
          <p className="mb-2">회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>파기 절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 파기됩니다.</li>
            <li><strong>파기 방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">6. 이용자의 권리</h2>
          <p className="mb-2">이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정 요구</li>
            <li>개인정보 삭제 요구</li>
            <li>개인정보 처리정지 요구</li>
          </ul>
          <p className="mt-4 text-sm">권리 행사는 마이페이지에서 직접 하거나, 고객센터를 통해 요청할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">7. 개인정보 보호책임자</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="font-semibold mb-2">개인정보 보호책임자</p>
            <ul className="space-y-1 text-sm">
              <li><strong>성명:</strong> 문준수</li>
              <li><strong>직책:</strong> 대표</li>
              <li><strong>이메일:</strong> junsumon090608@dgsw.hs.kr</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">8. 개인정보 처리방침 변경</h2>
          <p>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
            변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
        </section>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>시행일:</strong> 2024년 1월 1일<br />
            <strong>최종 수정일:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
