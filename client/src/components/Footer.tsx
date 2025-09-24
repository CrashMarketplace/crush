export default function Footer() {
    return (
        <footer className="mt-12 border-t bg-gray-50">
            <div className="container py-8 text-sm text-gray-600">
                <div className="flex flex-wrap gap-4">
                    <button className="hover:text-black">회사소개</button>
                    <button className="hover:text-black">이용약관</button>
                    <button className="hover:text-black">개인정보처리방침</button>
                </div>
                <p className="mt-4 leading-6">
                    본 페이지는 교육용 데모입니다. 실제 서비스가 아닙니다.
                </p>
                <p className="mt-4 text-gray-400">© {new Date().getFullYear()} KRUSH</p>
            </div>
        </footer>
    );
}