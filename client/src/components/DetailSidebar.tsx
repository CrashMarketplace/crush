export default function DetailSidebar() {
    return (
        <aside className="p-4 text-sm text-gray-700 card">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">브랜드</span>
                    <span className="font-medium">브랜드명</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">제품상태</span>
                    <span className="font-medium">상</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">구매일자</span>
                    <span className="font-medium">2025.01</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">거래방식</span>
                    <span className="font-medium">비대면, 택배</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">배송비</span>
                    <span className="font-medium">배송비 별도</span>
                </div>
            </div>
        </aside>
    );
}