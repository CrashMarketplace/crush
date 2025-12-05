// 푸시 알림 유틸리티

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("이 브라우저는 알림을 지원하지 않습니다.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const subscribeToPushNotifications = async (apiBase: string) => {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("푸시 알림이 지원되지 않습니다.");
      return null;
    }

    // 서비스 워커 등록
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("서비스 워커 등록 성공");

    // VAPID 공개 키 가져오기
    const response = await fetch(`${apiBase}/api/notifications/vapid-public-key`, {
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok || !data.publicKey) {
      throw new Error("VAPID 공개 키를 가져올 수 없습니다.");
    }

    // 푸시 구독
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });

    // 서버에 구독 정보 전송
    const saveResponse = await fetch(`${apiBase}/api/notifications/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(subscription),
    });

    if (!saveResponse.ok) {
      throw new Error("구독 정보 저장 실패");
    }

    console.log("푸시 알림 구독 성공");
    return subscription;
  } catch (error) {
    console.error("푸시 알림 구독 실패:", error);
    return null;
  }
};

export const showLocalNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};
