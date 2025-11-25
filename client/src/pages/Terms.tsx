import { usePageTitle } from "../hooks/usePageTitle";

export default function Terms() {
  usePageTitle("이용약관", "BILIDA 서비스 이용약관을 확인하세요.");

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-8">이용약관</h1>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
          <p>
            본 약관은 BILIDA(이하 "회사")가 제공하는 중고 거래 및 대여 플랫폼 서비스(이하 "서비스")의
            이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>"서비스"란 회사가 제공하는 중고 거래, 물품 대여, 채팅, 예약 등의 플랫폼 서비스를 말합니다.</li>
            <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 말합니다.</li>
            <li>"판매자"란 서비스를 통해 물품을 판매하거나 대여하는 회원을 말합니다.</li>
            <li>"구매자"란 서비스를 통해 물품을 구매하거나 대여받는 회원을 말합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.</li>
            <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
            <li>약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 공지합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
            <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제5조 (서비스의 제공)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회사는 다음과 같은 서비스를 제공합니다.
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>중고 물품 거래 중개 서비스</li>
                <li>물품 대여 중개 서비스</li>
                <li>실시간 채팅 서비스</li>
                <li>예약 및 알림 서비스</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
              </ul>
            </li>
            <li>회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제6조 (거래의 성립)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회사는 판매자와 구매자 간의 거래를 중개하는 플랫폼을 제공할 뿐, 거래 당사자가 아닙니다.</li>
            <li>거래는 판매자와 구매자 간의 합의에 의해 성립되며, 회사는 거래 내용에 대해 책임지지 않습니다.</li>
            <li>회원은 거래 전 상품의 상태, 가격, 거래 조건 등을 충분히 확인해야 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제7조 (금지행위)</h2>
          <p className="mb-2">회원은 다음 각 호에 해당하는 행위를 해서는 안 됩니다:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>타인의 정보 도용</li>
            <li>회사가 게시한 정보의 변경</li>
            <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
            <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
            <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위</li>
            <li>불법 물품의 거래</li>
            <li>사기 행위</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제8조 (택배 및 배송)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회사는 택배 서비스를 직접 제공하지 않으며, 회원 간 합의에 따라 택배 업체를 선택할 수 있습니다.</li>
            <li>배송 중 발생하는 분실, 파손 등의 책임은 택배 업체 및 거래 당사자에게 있습니다.</li>
            <li>회원은 택배 이용 시 택배 업체의 약관을 준수해야 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제9조 (개발자 및 운영자)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>서비스의 개발 및 운영은 회사가 담당합니다.</li>
            <li>서비스 개선을 위한 업데이트 및 유지보수가 진행될 수 있으며, 이 경우 사전 공지합니다.</li>
            <li>긴급한 시스템 점검이 필요한 경우 사전 공지 없이 서비스가 일시 중단될 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제10조 (면책조항)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.</li>
            <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
            <li>회사는 회원 간 또는 회원과 제3자 간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없으며 이로 인한 손해를 배상할 책임도 없습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">제11조 (분쟁해결)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
            <li>본 약관과 관련하여 회사와 이용자 간에 발생한 분쟁에 대해서는 대한민국 법을 적용합니다.</li>
          </ol>
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
