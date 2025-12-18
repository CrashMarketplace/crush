# Render + Cloudflare R2 설정 가이드

## Cloudflare R2 이미지 스토리지 설정

### 1. Render 환경 변수 설정

Render 대시보드 → Environment → Environment Variables에서 다음 변수를 추가하세요:

#### 필수 변수
```
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_ACCOUNT_ID=ff1320ed07128edf1b9f0c5eb9eedd00
R2_BUCKET=your_bucket_name
R2_PUBLIC_BASE=https://ff1320ed07128edf1b9f0c5eb9eedd00.r2.cloudflarestorage.com
```

#### 선택 변수
```
R2_PREFIX=prod  # 버킷 내부 폴더 prefix (선택사항)
```

### 2. Cloudflare R2 설정 확인

1. Cloudflare 대시보드 → R2 → 버킷 선택
2. Settings → Public Access 설정 확인
3. 커스텀 도메인이 있다면 `R2_PUBLIC_BASE`에 커스텀 도메인 사용 가능

### 3. 이미지 URL 형식

설정 후 업로드된 이미지는 다음 형식으로 반환됩니다:
- `https://ff1320ed07128edf1b9f0c5eb9eedd00.r2.cloudflarestorage.com/{key}`

### 4. 테스트

환경 변수 설정 후 Render에 재배포하면 자동으로 R2 스토리지를 사용합니다.

업로드 API: `POST /api/uploads/images`

