# 🌐 도메인 마이그레이션 완료: bilida.site

## ✅ 변경 완료된 파일들

### 1. SEO & 메타 태그 (client/index.html)
- ✅ Open Graph URL: `https://bilida.site/`
- ✅ Open Graph Image: `https://bilida.site/logo.png`
- ✅ Twitter Card URL: `https://bilida.site/`
- ✅ Twitter Card Image: `https://bilida.site/logo.png`
- ✅ Canonical URL: `https://bilida.site/`
- ✅ JSON-LD Schema (WebSite): `https://bilida.site`
- ✅ JSON-LD Schema (Organization): `https://bilida.site`
- ✅ Search Action Target: `https://bilida.site/all?q={search_term_string}`

### 2. SEO 파일들
- ✅ **robots.txt**: Sitemap URL → `https://bilida.site/sitemap.xml`
- ✅ **sitemap.xml**: 모든 URL을 bilida.site로 변경
  - 홈페이지: `https://bilida.site/`
  - About: `https://bilida.site/about`
  - Terms: `https://bilida.site/terms`
  - Privacy: `https://bilida.site/privacy`
  - All Products: `https://bilida.site/all`
  - Categories: `https://bilida.site/categories`
  - lastmod: 2024-12-01로 업데이트

### 3. 문서 파일
- ✅ **favicon-setup.md**: Google Search Console 가이드 업데이트

## 🔧 환경변수 확인

### Client (.env)
```
VITE_API_BASE=https://crush-production.up.railway.app
```
✅ API는 Railway를 사용하므로 변경 불필요

## 📋 배포 후 체크리스트

### 1. Vercel 설정
- [ ] Vercel 프로젝트 설정에서 Custom Domain 추가
- [ ] `bilida.site` 추가
- [ ] `www.bilida.site` 추가 (선택사항)
- [ ] DNS 레코드 확인

### 2. Google Search Console
- [ ] 새 속성 추가: `https://bilida.site`
- [ ] 소유권 확인
- [ ] Sitemap 제출: `https://bilida.site/sitemap.xml`
- [ ] URL 검사 및 색인 생성 요청

### 3. DNS 전파 확인
```bash
# DNS 전파 확인
nslookup bilida.site

# 또는 온라인 도구 사용
https://www.whatsmydns.net/#A/bilida.site
```

### 4. 기능 테스트
- [ ] 메인 페이지 접속: `https://bilida.site`
- [ ] 로그인/회원가입 테스트
- [ ] 상품 등록 테스트
- [ ] 채팅 기능 테스트
- [ ] 이미지 업로드 테스트
- [ ] API 호출 정상 작동 확인

### 5. SEO 확인
- [ ] `https://bilida.site/robots.txt` 접속 확인
- [ ] `https://bilida.site/sitemap.xml` 접속 확인
- [ ] `https://bilida.site/favicon.png` 접속 확인
- [ ] Open Graph 미리보기 테스트: https://www.opengraph.xyz/
- [ ] Twitter Card 미리보기 테스트: https://cards-dev.twitter.com/validator

## 🚀 배포 명령어

```bash
# 클라이언트 빌드 및 배포
cd client
npm run build

# Vercel 배포 (자동)
git add .
git commit -m "도메인 변경: bilida.site"
git push origin main
```

## ⏰ 예상 소요 시간

- **DNS 전파**: 24~48시간
- **Google 색인**: 24~72시간
- **파비콘 캐시**: 24~72시간
- **완전한 SEO 반영**: 1~2주

## 🔍 문제 해결

### 도메인이 연결되지 않는 경우
1. Vercel 대시보드에서 도메인 상태 확인
2. DNS 레코드가 올바른지 확인
3. DNS 전파 대기 (최대 48시간)

### 이전 도메인으로 리다이렉트되는 경우
1. 브라우저 캐시 삭제
2. Vercel에서 이전 도메인 제거
3. 새 도메인만 남기기

### SEO가 반영되지 않는 경우
1. Google Search Console에서 색인 생성 요청
2. sitemap.xml 재제출
3. 24~72시간 대기

## 📞 지원

문제가 발생하면:
- Vercel 문서: https://vercel.com/docs/concepts/projects/domains
- Google Search Console: https://search.google.com/search-console
- Gabia DNS 설정: https://customer.gabia.com
