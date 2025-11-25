// VAPID 키 생성 스크립트
import webpush from "web-push";

const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n=== VAPID 키 생성 완료 ===\n");
console.log("다음 환경 변수를 .env 파일에 추가하세요:\n");
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log("\n========================\n");
