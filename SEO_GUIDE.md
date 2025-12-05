# SEO 및 사이트 카드 설정 가이드

## 구글 검색 사이트 카드란?

구글이 검색 결과에서 특정 사이트를 브랜드 아이콘 + 도메인 + 사이트명을 묶어서 카드 형태로 보여주는 UI입니다.

## 적용된 SEO 최적화

### 1. 메타 태그
- ✅ Primary Meta Tags (제목, 설명, 키워드)
- ✅ Open Graph (Facebook, 카카오톡 공유)
- ✅ Twitter Card (트위터 공유)
- ✅ Canonical URL (중복 콘텐츠 방지)

### 2. 구조화된 데이터 (JSON-LD)
- ✅ WebSite Schema (사이트 정보)
- ✅ Organization Schema (회사 정보)
- ✅ WebApplication Schema (앱 정보)
- ✅ SearchAction (사이트 내 검색)

### 3. 추가 파일
- ✅ robots.txt (검색 엔진 크롤링 가이드)
- ✅ sitemap.xml (사이트 구조 맵)
- ✅ manifest.json (PWA 설정)

## 사이트 카드 표시를 위한 체크리스트

### 필수 요소
1. **파비콘 (Favicon)**
   - [ ] 192x192 PNG 이미지
   - [ ] 512x512 PNG 이미지
   - 현재 위치: `client/public/vite.svg`

2. **로고 이미지**
   - [ ] 고해상도 로고 (최소 600x60px)
   - 권장: `client/public/logo.png`

3. **OG 이미지**
   - [ ] 1200x630px 이미지
   - 권장: `client/public/og-image.png`

4. **구글 서치 콘솔 등록**
   - [ ] https://search.google.com/search-console
   - [ ] 사이트 소유권 인증
   - [ ] sitemap.xml 제출

### 권장 사항

1. **HTTPS 필수**
   - ✅ Vercel 자동 제공

2. **모바일 친화적**
   - ✅ 반응형 디자인 적용

3. **빠른 로딩 속도**
   - ✅ Vite 빌드 최적화

4. **구조화된 데이터 검증**
   - 도구: https://search.google.com/test/rich-results
   - 현재 URL 입력하여 테스트

## 이미지 준비 가이드

### 1. 파비콘 (favicon.ico)
```
크기: 192x192, 512x512
형식: PNG, ICO
위치: client/public/favicon.ico
```

### 2. 로고
```
크기: 600x60 이상
형식: PNG (투명 배경 권장)
위치: client/public/logo.png
```

### 3. OG 이미지 (소셜 공유용)
```
크기: 1200x630
형식: PNG, JPG
위치: client/public/og-image.png
내용: 브랜드 로고 + 간단한 설명
```

## 구글 서치 콘솔 설정

### 1. 사이트 등록
1. https://search.google.com/search-console 접속
2. "속성 추가" 클릭
3. 도메인 입력: `bilidamarket.com`
4. 소유권 인증 (HTML 태그 또는 DNS)

### 2. Sitemap 제출
1. 좌측 메뉴 "Sitemaps" 클릭
2. `https://bilidamarket.com/sitemap.xml` 입력
3. "제출" 클릭

### 3. URL 검사
1. 상단 검색창에 URL 입력
2. "색인 생성 요청" 클릭
3. 구글이 크롤링할 때까지 대기 (1-2주)

## 검증 도구

### 1. 구조화된 데이터 테스트
- URL: https://search.google.com/test/rich-results
- 사이트 URL 입력하여 검증

### 2. 모바일 친화성 테스트
- URL: https://search.google.com/test/mobile-friendly
- 사이트 URL 입력하여 검증

### 3. PageSpeed Insights
- URL: https://pagespeed.web.dev/
- 성능 점수 확인

### 4. Open Graph 미리보기
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator

## 사이트 카드 표시 시기

- **즉시 표시 안 됨**: 구글이 사이트를 크롤링하고 평가하는 시간 필요
- **일반적인 기간**: 1-4주
- **조건**:
  - 충분한 트래픽
  - 브랜드 검색 쿼리 (예: "BILIDA", "빌리다")
  - 구조화된 데이터 정상 작동
  - 사이트 신뢰도

## 팁

1. **브랜드 검색 최적화**
   - 사이트 이름으로 검색했을 때 1위 노출 필수
   - 예: "BILIDA", "빌리다 마켓"

2. **일관된 브랜딩**
   - 모든 페이지에서 동일한 브랜드명 사용
   - 로고, 색상, 폰트 일관성 유지

3. **소셜 미디어 연동**
   - 페이스북, 인스타그램 등에 사이트 링크
   - 브랜드 인지도 향상

4. **콘텐츠 품질**
   - 유용한 콘텐츠 지속적 업데이트
   - 사용자 리뷰 및 평점 수집

## 문제 해결

### 사이트 카드가 표시되지 않는 경우

1. **구글 서치 콘솔 확인**
   - 크롤링 오류 확인
   - 색인 상태 확인

2. **구조화된 데이터 검증**
   - Rich Results Test 실행
   - 오류 수정

3. **시간 대기**
   - 신규 사이트는 최소 1개월 소요
   - 꾸준한 트래픽 유지

4. **브랜드 검색 증가**
   - 마케팅 활동
   - 소셜 미디어 홍보

## 참고 자료

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
