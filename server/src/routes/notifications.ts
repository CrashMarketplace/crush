import { Router } from "express";
import Notification from "../models/Notification";
import PushSubscription from "../models/PushSubscription";
import { readUserFromReq } from "../utils/authToken";
import webpush from "web-push";

const router = Router();

// VAPID 키 설정 (환경 변수에서 가져오기)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

let pushEnabled = false;

// VAPID 키 유효성 검사 함수
function isValidVapidKey(key: string): boolean {
  // Base64 URL-safe 형식 확인
  if (!key || key.length < 40) return false;
  // 플레이스홀더 키 제외
  if (key.includes("PLACEHOLDER") || key.includes("EXAMPLE")) return false;
  return true;
}

// VAPID 키가 올바르게 설정되어 있으면 웹 푸시 활성화
if (isValidVapidKey(VAPID_PUBLIC_KEY) && isValidVapidKey(VAPID_PRIVATE_KEY)) {
  try {
    webpush.setVapidDetails(
      "mailto:admin@bilida.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    pushEnabled = true;
    console.log("✅ 웹 푸시 알림 활성화됨");
  } catch (error) {
    console.warn("⚠️ VAPID 키 설정 실패. 푸시 알림 비활성화");
    console.warn("   Railway 환경 변수에서 VAPID_PUBLIC_KEY와 VAPID_PRIVATE_KEY를 삭제하거나");
    console.warn("   npm run generate-vapid 명령으로 새 키를 생성하여 교체하세요");
  }
} else {
  console.warn("⚠️ VAPID 키가 설정되지 않았거나 유효하지 않음. 푸시 알림 비활성화");
  console.warn("   npm run generate-vapid 명령으로 키를 생성하고 .env에 추가하세요");
}

// VAPID 공개 키 제공
router.get("/vapid-public-key", (_req, res) => {
  return res.json({ ok: true, publicKey: VAPID_PUBLIC_KEY });
});

// 푸시 구독 저장
router.post("/subscribe", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  if (!pushEnabled) {
    return res.status(503).json({ ok: false, error: "push_disabled" });
  }

  try {
    const subscription = req.body;

    // 기존 구독 삭제 후 새로 저장
    await PushSubscription.deleteMany({ user: user.id });
    await PushSubscription.create({
      user: user.id,
      subscription,
    });

    console.log(`✅ 푸시 구독 저장: ${user.userId}`);
    return res.json({ ok: true });
  } catch (error: any) {
    console.error("푸시 구독 저장 실패:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// 푸시 알림 전송 헬퍼 함수
export async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  data?: any
) {
  // 푸시 알림이 비활성화되어 있으면 스킵
  if (!pushEnabled) {
    console.log(`푸시 알림 비활성화됨. 알림 스킵: ${userId}`);
    return;
  }

  try {
    const subscriptions = await PushSubscription.find({ user: userId });

    if (subscriptions.length === 0) {
      console.log(`푸시 구독 없음: ${userId}`);
      return;
    }

    const payload = JSON.stringify({
      title,
      message,
      data,
    });

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        console.log(`✅ 푸시 알림 전송 성공: ${userId}`);
      } catch (error: any) {
        console.error(`푸시 알림 전송 실패: ${userId}`, error);
        // 구독이 만료되었으면 삭제
        if (error.statusCode === 410) {
          await sub.deleteOne();
        }
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("푸시 알림 전송 중 오류:", error);
  }
}

// 내 알림 목록 조회
router.get("/", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const notifications = await Notification.find({ user: user.id })
    .populate("relatedProduct", "title images")
    .sort({ createdAt: -1 })
    .limit(50);

  return res.json({ ok: true, notifications });
});

// 읽지 않은 알림 개수
router.get("/unread-count", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const count = await Notification.countDocuments({
    user: user.id,
    read: false,
  });

  return res.json({ ok: true, count });
});

// 알림 읽음 처리
router.patch("/:id/read", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const notification = await Notification.findOne({
    _id: req.params.id,
    user: user.id,
  });

  if (!notification) {
    return res.status(404).json({ ok: false, error: "not_found" });
  }

  notification.read = true;
  await notification.save();

  return res.json({ ok: true, notification });
});

// 모든 알림 읽음 처리
router.patch("/read-all", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  await Notification.updateMany(
    { user: user.id, read: false },
    { read: true }
  );

  return res.json({ ok: true });
});

// 알림 삭제
router.delete("/:id", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const notification = await Notification.findOne({
    _id: req.params.id,
    user: user.id,
  });

  if (!notification) {
    return res.status(404).json({ ok: false, error: "not_found" });
  }

  await notification.deleteOne();

  return res.json({ ok: true, deleted: true });
});

export default router;
