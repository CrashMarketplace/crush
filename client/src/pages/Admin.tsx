import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../utils/apiConfig";

type Product = {
  _id: string;
  title: string;
  price: number;
  seller: { userId: string; displayName: string; email: string };
  status: string;
  createdAt: string;
};

type User = {
  _id: string;
  userId: string;
  email: string;
  displayName: string;
  isBanned: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt?: string;
};

type Chat = {
  _id: string;
  participants: { userId: string; displayName: string }[];
  product: { title: string };
  updatedAt: string;
};

type Reservation = {
  _id: string;
  product: { title: string };
  buyer: { userId: string; displayName: string };
  seller: { userId: string; displayName: string };
  status: string;
  meetingLocation: string;
  createdAt: string;
};

import { usePageTitle } from "../hooks/usePageTitle";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"products" | "users" | "chats" | "reservations">("products");

  usePageTitle("관리자 페이지", "BILIDA 관리자 페이지 - 상품, 사용자, 채팅, 예약 관리");

  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/${tab}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "권한이 없습니다.");
      }

      if (tab === "products") setProducts(data.products || []);
      else if (tab === "users") setUsers(data.users || []);
      else if (tab === "chats") setChats(data.conversations || []);
      else if (tab === "reservations") setReservations(data.reservations || []);
    } catch (e: any) {
      setError(e.message || "데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("이 상품을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e: any) {
      alert(e.message || "삭제 실패");
    }
  };

  const toggleBan = async (id: string, banned: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ banned }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBanned: banned } : u))
      );
    } catch (e: any) {
      alert(e.message || "처리 실패");
    }
  };

  const deleteChat = async (id: string) => {
    if (!confirm("이 채팅을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/chats/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error);
      setChats((prev) => prev.filter((c) => c._id !== id));
    } catch (e: any) {
      alert(e.message || "삭제 실패");
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("이 예약을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error);
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (e: any) {
      alert(e.message || "삭제 실패");
    }
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold">관리자 페이지</h1>
        <button
          onClick={() => navigate("/admin/fraud-analytics")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          🔍 AI 사기 위험 분석
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            tab === "products"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          상품 관리
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            tab === "users"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          사용자 관리
        </button>
        <button
          onClick={() => setTab("chats")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            tab === "chats"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          채팅 관리
        </button>
        <button
          onClick={() => setTab("reservations")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            tab === "reservations"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          예약 관리
        </button>
      </div>

      {error && <div className="alert-err mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-10">불러오는 중...</div>
      ) : (
        <>
          {tab === "products" && (
            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="text-gray-500">상품이 없습니다.</div>
              ) : (
                products.map((p) => (
                  <div
                    key={p._id}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-sm text-gray-500">
                        {p.price.toLocaleString()}원 · {p.seller.userId} ·{" "}
                        {p.status} ·{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-3">
              {users.length === 0 ? (
                <div className="text-gray-500">사용자가 없습니다.</div>
              ) : (
                users.map((u) => {
                  const memberSince = new Date(u.createdAt);
                  const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt) : null;
                  const now = new Date();
                  
                  // 가입 후 경과 시간 계산
                  const daysSinceMember = Math.floor((now.getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24));
                  
                  // 마지막 로그인 시간 표시
                  let lastLoginText = "로그인 기록 없음";
                  if (lastLogin) {
                    const minutesAgo = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60));
                    if (minutesAgo < 60) {
                      lastLoginText = `${minutesAgo}분 전`;
                    } else if (minutesAgo < 1440) {
                      lastLoginText = `${Math.floor(minutesAgo / 60)}시간 전`;
                    } else {
                      lastLoginText = `${Math.floor(minutesAgo / 1440)}일 전`;
                    }
                  }
                  
                  return (
                    <div
                      key={u._id}
                      className="card p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">
                          {u.userId} {u.isAdmin && <span className="text-blue-600">(관리자)</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          {u.email} · {u.displayName || "이름 없음"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          가입: {memberSince.toLocaleDateString()} ({daysSinceMember}일 전) · 
                          마지막 로그인: {lastLoginText}
                        </div>
                        {u.isBanned && (
                          <span className="inline-block mt-1 text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                            강퇴됨
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleBan(u._id, !u.isBanned)}
                        className={`px-3 py-1 text-sm rounded ${
                          u.isBanned
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {u.isBanned ? "강퇴 해제" : "강퇴"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "chats" && (
            <div className="space-y-3">
              {chats.length === 0 ? (
                <div className="text-gray-500">채팅이 없습니다.</div>
              ) : (
                chats.map((c) => (
                  <div
                    key={c._id}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">
                        {c.product?.title || "상품 정보 없음"}
                      </div>
                      <div className="text-sm text-gray-500">
                        참여자:{" "}
                        {c.participants
                          .map((p) => p.userId || p.displayName)
                          .join(", ")}{" "}
                        · {new Date(c.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChat(c._id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "reservations" && (
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <div className="text-gray-500">예약이 없습니다.</div>
              ) : (
                reservations.map((r) => (
                  <div
                    key={r._id}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">
                        {r.product?.title || "상품 정보 없음"}
                      </div>
                      <div className="text-sm text-gray-500">
                        구매자: {r.buyer.displayName || r.buyer.userId} · 판매자:{" "}
                        {r.seller.displayName || r.seller.userId}
                      </div>
                      <div className="text-sm text-gray-500">
                        상태: {r.status} · 장소: {r.meetingLocation || "미정"} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReservation(r._id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
