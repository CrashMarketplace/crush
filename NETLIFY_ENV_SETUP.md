# Netlify 환경 변수 설정 가이드

## ⚠️ 중요: 환경 변수 설정 후 반드시 "Clear cache & redeploy" 실행!

Netlify는 환경 변수를 **빌드 시간에만** 읽습니다. 환경 변수를 추가/수정한 후에는 반드시 캐시를 지우고 재배포해야 합니다.

---

## 📋 체크리스트 (5가지 모두 확인!)

### 1️⃣ 올바른 사이트에 환경 변수 설정했는지 확인

**확인 위치:**
- Netlify Dashboard → **당신의 사이트** (예: `darling-torrone-5e5797`)
- Site settings → Environment variables

⚠️ 프로젝트가 여러 개면 다른 사이트에 설정했을 수 있습니다!

---

### 2️⃣ Key 이름 정확히 확인

**정확한 Key:**
```
VITE_API_URL
```

**❌ 잘못된 예시 (모두 실패):**
- `VITE_APT_URL` (오타)
- `VITE_APIURL` (언더스코어 누락)
- `API_URL` (VITE_ 접두사 누락)
- `VITE_API_BASE` (다른 변수명)

---

### 3️⃣ Value 정확히 확인

**✅ 올바른 형식:**
```
https://crush-production.up.railway.app
```

**❌ 잘못된 형식:**
```
https://crush-production.up.railway.app/api  ← /api 붙이면 안 됨!
```

⚠️ Railway → Settings → Domains에서 정확한 도메인을 확인하세요.

---

### 4️⃣ Clear cache & deploy 실행 (필수!)

환경 변수를 저장한 후에는 **반드시** 다음을 실행해야 합니다:

1. Netlify → Deploys 탭
2. 오른쪽 상단 "⋯" (점 3개) 메뉴 클릭
3. **"Clear cache and deploy site"** 선택

이것을 안 하면 환경 변수가 빌드에 반영되지 않습니다!

---

### 5️⃣ 빌드 로그에서 환경 변수 확인

재배포 후 빌드 로그를 확인하세요:

1. Netlify → Deploys → 최신 배포 클릭
2. Build logs 확인
3. `VITE_API_URL`이 보이는지 확인

**❌ 안 보이면:** 환경 변수 적용 실패
**✅ 보이면:** 환경 변수 적용 성공

---

## 🔍 배포 후 확인 방법

### 브라우저 콘솔에서 확인

배포 후 브라우저 개발자 도구(F12) → Console 탭에서:

**✅ 성공 시:**
```
✅ VITE_API_URL 환경 변수가 설정되었습니다: https://crush-production.up.railway.app
```

**❌ 실패 시:**
```
❌ VITE_API_URL 환경 변수가 설정되지 않았습니다!
Netlify 환경 변수에 VITE_API_URL을 추가해주세요.
...
```

### Network 탭에서 확인

개발자 도구 → Network 탭에서 API 요청을 확인:

**✅ 성공 시:**
- 요청 URL: `https://crush-production.up.railway.app/api/products`
- Railway 도메인으로 요청이 가는지 확인

**❌ 실패 시:**
- 요청 URL: `/api/products` (상대 경로)
- Netlify 도메인으로 요청이 가서 404 발생

---

## 🚀 최종 해결 절차

### STEP 1: 환경 변수 설정
1. Netlify → Site settings → Environment variables
2. **Add variable** 클릭
3. Key: `VITE_API_URL`
4. Value: `https://crush-production.up.railway.app` (Railway에서 확인한 실제 도메인)
5. **Save** 클릭

### STEP 2: Clear cache & deploy (필수!)
1. Netlify → Deploys 탭
2. 오른쪽 상단 "⋯" 메뉴 클릭
3. **"Clear cache and deploy site"** 선택
4. 배포 완료까지 대기

### STEP 3: 브라우저 캐시 지우고 새로고침
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `⌘ + Shift + R`

### STEP 4: 콘솔 확인
브라우저 개발자 도구 → Console에서:
- ✅ `VITE_API_URL 환경 변수가 설정되었습니다` 메시지 확인
- ❌ 경고 메시지가 사라졌는지 확인

---

## 💡 문제 해결 팁

### 여전히 환경 변수가 안 보인다면:

1. **Key 이름 재확인**: 정확히 `VITE_API_URL`인지 확인
2. **Value 재확인**: `/api`가 붙지 않았는지 확인
3. **Clear cache & deploy 다시 실행**: 캐시 문제일 수 있음
4. **빌드 로그 확인**: 환경 변수가 빌드에 포함되었는지 확인
5. **브라우저 캐시 완전히 지우기**: 하드 리프레시 (Ctrl+Shift+R)

### 빌드 로그에서 환경 변수 확인하는 방법:

빌드 로그에서 다음을 검색:
- `VITE_API_URL`
- 또는 `import.meta.env`

환경 변수가 제대로 설정되었다면 빌드 로그에 나타납니다.

