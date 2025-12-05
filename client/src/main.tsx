import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { requestNotificationPermission, subscribeToPushNotifications } from "./utils/pushNotifications";

// 푸시 알림 초기화
const initPushNotifications = async () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  
  // 알림 권한 요청
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    // 푸시 알림 구독
    await subscribeToPushNotifications(apiBase);
  }
};

// 앱 로드 후 푸시 알림 초기화 (사용자가 로그인한 경우에만)
setTimeout(() => {
  initPushNotifications().catch(console.error);
}, 2000);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
