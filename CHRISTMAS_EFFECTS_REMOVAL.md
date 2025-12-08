# 🎄 크리스마스 효과 제거 가이드

크리스마스 시즌이 끝나면 아래 단계를 따라 효과를 제거하세요.

## 제거할 파일 목록

```bash
# 1. 크리스마스 컴포넌트 삭제
rm client/src/components/ChristmasEffects.tsx
rm client/src/components/ChristmasPopup.tsx
```

## 수정할 파일

### 1. `client/src/App.tsx`

**제거할 코드:**
```typescript
// 🎄 크리스마스 효과 (나중에 삭제 가능)
import ChristmasEffects from "./components/ChristmasEffects";
import ChristmasPopup from "./components/ChristmasPopup";
```

```typescript
{/* 🎄 크리스마스 효과 (나중에 삭제 가능) */}
<ChristmasEffects />
<ChristmasPopup />
```

### 2. `client/src/components/Banner.tsx`

**변경 전 (크리스마스 버전):**
```typescript
<div className="w-full bg-gradient-to-br from-red-50 via-white to-green-50 relative overflow-hidden">
  {/* 🎄 크리스마스 그라디언트 오버레이 */}
  <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-transparent to-green-100/20 animate-shimmer pointer-events-none" />
  
  {/* 🎄 크리스마스 장식 */}
  <div className="absolute -top-4 left-8 text-4xl animate-swing z-20">🎄</div>
  <div className="absolute -top-4 right-8 text-4xl animate-swing z-20" style={{ animationDelay: '1s' }}>🎅</div>
  
  <div className="w-full overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl border-4 border-red-200 ...">
  
  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
    🎄 중고 대여 마켓플레이스 BILIDA 🎄
  </h2>
  <p className="text-gray-700 text-sm font-semibold">
    🎁 따뜻한 나눔으로 행복한 크리스마스를 만들어요!
  </p>
```

**변경 후 (일반 버전):**
```typescript
<div className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
  {/* 그라디언트 오버레이 */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none" />
  
  <div className="w-full overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-2xl border border-white/50 ...">
  
  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
    중고 대여 마켓플레이스 BILIDA
  </h2>
  <p className="text-gray-600 text-sm">
    ✨ 필요한 물건을 빌리고, 안 쓰는 물건을 빌려주세요
  </p>
```

**제거할 CSS (Banner.tsx 하단):**
```typescript
@keyframes swing {
  0%, 100% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(15deg);
  }
}

.animate-swing {
  animation: swing 2s ease-in-out infinite;
  transform-origin: top center;
}
```

## 빠른 제거 명령어

```bash
# 1. 파일 삭제
rm client/src/components/ChristmasEffects.tsx
rm client/src/components/ChristmasPopup.tsx

# 2. Git에서 변경사항 확인
git status

# 3. 수정 후 커밋
git add -A
git commit -m "chore: 크리스마스 효과 제거"
git push origin main
```

## 체크리스트

- [ ] `ChristmasEffects.tsx` 파일 삭제
- [ ] `ChristmasPopup.tsx` 파일 삭제
- [ ] `App.tsx`에서 import 제거
- [ ] `App.tsx`에서 컴포넌트 사용 제거
- [ ] `Banner.tsx` 배경색 변경 (red/green → blue/purple)
- [ ] `Banner.tsx` 크리스마스 장식 제거
- [ ] `Banner.tsx` 텍스트 변경
- [ ] `Banner.tsx` swing 애니메이션 제거
- [ ] 빌드 테스트: `npm run build`
- [ ] Git 커밋 및 푸시

## 참고사항

- 크리스마스 효과는 `sessionStorage`를 사용하므로 브라우저를 닫으면 팝업이 다시 표시됩니다
- 눈송이 효과는 성능에 영향을 줄 수 있으므로 시즌 종료 후 즉시 제거하는 것을 권장합니다
- 모든 크리스마스 관련 코드는 `🎄` 이모지로 표시되어 있어 쉽게 찾을 수 있습니다
