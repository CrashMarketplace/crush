import { Router } from "express";
import Notification from "../models/Notification";
import PushSubscription from "../models/PushSubscription";
import { readUserFromReq } from "../utils/authToken";
import webpush from "web-push";

const router = Router();

// VAPID 키 설정 (환경 변수에서 가져오거나 생성)
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBroTwJJGEGgOhVGJqhA";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "UUxEUExBQ0VIT0xERVJfUFJJVkFURV9LRVlfRk9SX0RFVg";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@bilida.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// VAPID 공개 키 제공
router.get("/vapid-public-key", (_req, res) => {
  return res.json({ ok: true, publicKey: VAPID_PUBLIC_KEY });
});

// 푸시 구독 저장
router.post("/subscribe", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

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
