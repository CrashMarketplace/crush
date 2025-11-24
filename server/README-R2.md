# Cloudflare R2 이미지 업로드 연동

이 서버는 Cloudflare R2 환경변수가 설정된 경우 로컬 디스크 대신 R2 버킷에 이미지를 저장합니다. 설정이 없으면 기존 `/uploads` 폴더 로컬 저장 방식을 그대로 사용합니다.

## 1. 필수 환경변수
```
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ACCOUNT_ID=...              # 대시보드에서 확인 (숫자/문자 혼합)
R2_BUCKET=market-images        # 버킷명
# 선택
R2_PUBLIC_BASE=https://cdn.example.com   # 커스텀 도메인(선택) 없으면 기본 endpoint URL 사용
R2_PREFIX=prod                 # (선택) 버킷 내부 폴더 prefix
```

PUBLIC BASE 도메인을 Cloudflare DNS + R2 커스텀 도메인으로 설정했다면 `R2_PUBLIC_BASE`를 넣어 보다 짧은 URL을 반환합니다.

## 2. 반환되는 URL 형태
- 커스텀 도메인 설정 시: `https://cdn.example.com/<key>`
- 커스텀 도메인 미설정 시: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<BUCKET>/<key>`

## 3. 로컬 fallback
R2 필수 env 중 하나라도 빠져 있으면 자동으로 메모리 업로드를 사용하지 않고 기존 디스크(`UPLOADS_DIR` 또는 `uploads/`)에 저장하며 `/uploads/<filename>` 경로를 반환합니다.

## 4. 삭제 함수
`deleteObject(key)` 제공. 현재 라우트에서는 사용하지 않지만 추후 상품 삭제나 이미지 교체 시 활용 가능합니다.

## 5. 업로드 라우트 요약
`POST /api/uploads/images` (쿠키 인증 필요)
- 필드명: `files` / `file` / `images` 등 (최대 5)
- 성공 시: `{ ok: true, urls: ["<public url>", ...] }` (단일 시 `url`도 포함)

## 6. 테스트 예시 (curl)
로컬 개발에서 JWT 쿠키가 필요합니다. 로그인 후 브라우저 개발자도구 Application > Cookies 에서 토큰 이름(`krush_token` 기본) 추출.

```
curl -X POST http://localhost:4000/api/uploads/images \
  -H "Cookie: krush_token=<YOUR_JWT_TOKEN>" \
  -F "files=@/absolute/path/to/image1.jpg" \
  -F "files=@/absolute/path/to/image2.png"
```

예상 응답:
```
{ "ok": true, "urls": ["https://cdn.example.com/prod/1732450000000-123456789.jpg", "..."] }
```

## 7. 주의사항
- R2는 region을 `auto`로 설정합니다.
- 퍼블릭 접근을 위해서는 버킷 퍼블릭 정책 + 커스텀 도메인 또는 직접 Endpoint 접근 허용 설정 필요.
- 파일 제한: 10MB (현재 `multer` limits에서 정의)

## 8. 다음 단계 제안
- 이미지 삭제 API 추가 (`DELETE /api/uploads/:key`)
- 이미지 리사이즈/썸네일 (예: Worker 또는 별도 처리 서비스)
- 업로드 확장자 화이트리스트 강화 및 바이러스 스캔 (ClamAV, VirusTotal API 등)

---
R2 설정 후 재배포하면 자동으로 메모리 업로드 + R2 저장이 활성화됩니다.
