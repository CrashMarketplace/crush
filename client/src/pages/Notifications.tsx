import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/apiConfig";

type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  relatedProduct?: { _id: string; title: string; images: string[] };
  read: boolean;
  createdAt: string;
};

import { usePageTitle } from "../hooks/usePageTitle";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  usePageTitle("알림", "새로운 예약, 채팅 메시지 등 알림을 확인하세요.");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.ok !== false) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error("알림 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error("읽음 처리 실패:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("전체 읽음 처리 실패:", e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      console.error("알림 삭제 실패:", e);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.relatedProduct) {
      navigate(`/listing/${notification.relatedProduct._id}`);
    }
  };

  if (loading) {
    return <div className="container py-10 text-center">불러오는 중...</div>;
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold">알림</h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            모두 읽음
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          알림이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                !notification.read ? "bg-blue-50 border-blue-200" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-4">
                {notification.relatedProduct?.images?.[0] && (
                  <img
                    src={notification.relatedProduct.images[0]}
                    alt={notification.relatedProduct.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="text-gray-400 hover:text-red-600 text-xl leading-none"
                      aria-label="삭제"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
