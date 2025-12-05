import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buildApiUrl } from "../utils/apiConfig";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

type Conversation = {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
    seller?: string;
    location?: string;
  };
  participants: string[];
  lastMessage?: { _id: string; text: string; createdAt: string; sender: string };
  updatedAt: string;
};

type SenderProfile = {
  _id: string;
  userId?: string;
  email?: string;
};

type Message = {
  _id: string;
  conversation: string;
  sender: string;
  senderProfile?: SenderProfile;
  text: string;
  createdAt: string;
};

export default function Chats() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket, status: socketStatus } = useSocket();

  const [convos, setConvos] = useState<Conversation[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [text, setText] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 대화 목록
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingList(true);
      try {
        const res = await fetch(buildApiUrl("/chats"), { credentials: "include" });
        const data = await res.json();
        if (!res.ok || data?.ok === false) throw new Error(data?.error || "failed");
        if (!alive) return;
        setConvos(data.conversations as Conversation[]);
      } catch (e) {
        // noop
      } finally {
        if (alive) setLoadingList(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight ?? 10_000_000,
      behavior: "smooth",
    });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!id) {
      setMsgs([]);
      return;
    }
    setLoadingMsgs(true);
    try {
      const res = await fetch(buildApiUrl(`/chats/${id}/messages`), {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || "failed");
      setMsgs(data.messages as Message[]);
      setTimeout(scrollToBottom, 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMsgs(false);
    }
  }, [id, scrollToBottom]);

  // 메시지 초기 로드 및 폴백 재요청
  useEffect(() => {
    if (!id) {
      setMsgs([]);
      return;
    }
    let alive = true;
    fetchMessages();
    const timer = setInterval(() => {
      if (!alive) return;
      if (socketStatus !== "connected") {
        fetchMessages();
      }
    }, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id, socketStatus, fetchMessages]);

  // 소켓 방 참여
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("conversation:join", { conversationId: id });
    return () => {
      socket.emit("conversation:leave", { conversationId: id });
    };
  }, [socket, id]);

  // 실시간 메시지 처리
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (incoming: Message) => {
      if (!incoming?.conversation) return;
      setMsgs((prev) => {
        if (incoming.conversation !== id) return prev;
        if (prev.some((m) => m._id === incoming._id)) return prev;
        return [...prev, incoming];
      });
      setConvos((prev) => {
        let touched = false;
        const updated = prev.map((c) => {
          if (c._id === incoming.conversation) {
            touched = true;
            return {
              ...c,
              lastMessage: {
                _id: incoming._id,
                text: incoming.text,
                createdAt: incoming.createdAt,
                sender: incoming.sender,
              },
              updatedAt: incoming.createdAt,
            };
          }
          return c;
        });
        if (!touched) return prev;
        return [...updated].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      if (incoming.conversation === id) {
        requestAnimationFrame(scrollToBottom);
      }
    };

    socket.on("conversation:new-message", handleNewMessage);
    return () => {
      socket.off("conversation:new-message", handleNewMessage);
    };
  }, [socket, id, scrollToBottom]);

  const current = useMemo(
    () => convos.find((c) => c._id === id) || null,
    [id, convos]
  );

  useEffect(() => {
    setMobileListOpen(false);
  }, [id]);

  const onSend = async () => {
    if (!id || !text.trim()) return;
    const payload = text.trim();
    setText("");

    if (socket && socketStatus === "connected") {
      socket.emit(
        "message:send",
        { conversationId: id, text: payload },
        (resp?: { ok: boolean; error?: string }) => {
          if (!resp?.ok) {
            alert(resp?.error || "메시지 전송에 실패했습니다.");
            setText((prev) => prev || payload);
          }
        }
      );
      return;
    }

    try {
      const res = await fetch(buildApiUrl(`/chats/${id}/messages`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payload }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || "failed");
      await fetchMessages();
    } catch (e: any) {
      alert(e?.message || "메시지 전송에 실패했습니다.");
      setText((prev) => prev || payload);
    }
  };

  const renderConversationList = (onNavigate?: () => void) => (
    <>
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <p className="text-2xl font-bold text-gray-900">채팅</p>
        <button
          className="text-sm text-gray-500 lg:hidden"
          onClick={() => onNavigate?.()}
        >
          닫기
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loadingList ? (
          <div className="p-6 text-sm text-gray-500">불러오는 중...</div>
        ) : convos.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            아직 참여 중인 대화가 없어요.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200/70">
            {convos.map((c) => {
              const lastTime = c.lastMessage?.createdAt || c.updatedAt;
              const relative = formatRelativeTime(lastTime);
              const preview = c.lastMessage?.text || "대화를 시작해보세요.";
              const location = c.product?.location || "지역 정보 없음";
              const isActive = id === c._id;
              return (
                <li key={c._id}>
                  <Link
                    to={`/chats/${c._id}`}
                    onClick={onNavigate}
                    className={`flex items-center gap-4 px-6 py-4 transition ${
                      isActive ? "bg-white shadow-sm" : "hover:bg-white/80"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d7c28a] to-[#b7903f]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {c.product?.title || "상품 대화"}
                        </p>
                        <span className="text-[11px] text-gray-400">
                          {relative}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{location}</p>
                      <p className="mt-1 text-sm text-gray-700 truncate">
                        {preview}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-8">
      <div className="container">
        <div className="grid grid-cols-1 rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)] min-h-[640px]">
          {/* 좌측 목록 (데스크톱) */}
          <aside className="hidden lg:flex bg-[#f5f5f5] border-r border-gray-100 flex-col">
            {renderConversationList()}
          </aside>

          {/* 우측 대화 */}
          <section className="flex flex-col bg-white">
            {id && current ? (
              <>
                <div className="p-6 border-b border-gray-100 space-y-4">
                  <button
                    type="button"
                    onClick={() => setMobileListOpen(true)}
                    className="inline-flex items-center gap-2 text-sm text-[#00a2d3] underline-offset-4 hover:underline lg:hidden"
                  >
                    ☰ 대화 목록 열기
                  </button>
                  <div className="bg-[#f6f6f6] rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
                      {current.product?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={current.product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-gray-900 truncate">
                        {current.product?.title}
                      </p>
                      <p className="text-2xl font-extrabold text-gray-900 mt-1">
                        {formatPrice(current.product?.price)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {current.product?.location || "지역 정보 없음"} · 참여자{" "}
                        {current.participants?.length ?? 0}명
                      </p>
                    </div>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#fafafa] px-6 py-8">
                  {loadingMsgs ? (
                    <div className="text-sm text-gray-500">메시지를 불러오는 중입니다...</div>
                  ) : msgs.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      아직 메시지가 없습니다. 첫 메시지를 남겨보세요!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {msgs.map((m) => {
                        const mine = String(m.sender) === String(user?.id);
                        const label =
                          mine ? "나" : m.senderProfile?.userId || m.senderProfile?.email || "참여자";
                        return (
                          <div key={m._id} className={`flex ${mine ? "justify-end" : ""}`}>
                            <div className={`max-w-[75%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                              <span className="text-[11px] text-gray-400 mb-1">{label}</span>
                              <div
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                  mine ? "bg-[#111827] text-white" : "bg-white text-gray-900"
                                }`}
                              >
                                {m.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-white">
                  {socketStatus !== "connected" && (
                    <div className="text-xs text-amber-600 mb-2">
                      실시간 연결을 대기 중입니다. 잠시 후 자동으로 재시도합니다.
                    </div>
                  )}
                  <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-full px-4 py-2">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onSend()}
                      placeholder="메시지를 입력하세요"
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                    <button
                      onClick={onSend}
                      className="px-6 py-2 rounded-full bg-[#00a2d3] text-white text-sm font-semibold hover:bg-[#0089b2] transition"
                    >
                      전송
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6 text-sm text-gray-500">
                <p className="text-center">
                좌측에서 대화를 선택해 주세요.
                </p>
                <button
                  type="button"
                  onClick={() => setMobileListOpen(true)}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-full bg-[#00a2d3] hover:bg-[#0089b2] lg:hidden"
                >
                  대화 목록 보기
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 모바일 대화 목록 드로어 */}
      {mobileListOpen && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileListOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-40 flex flex-col w-full max-w-sm bg-[#f5f5f5] border-l border-gray-200 lg:hidden">
            {renderConversationList(() => setMobileListOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

function formatRelativeTime(date?: string) {
  if (!date) return "";
  try {
    const formatter = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
    const now = Date.now();
    const target = new Date(date).getTime();
    const diff = target - now;
    const abs = Math.abs(diff);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (abs < hour) {
      return formatter.format(Math.round(diff / minute), "minute");
    }
    if (abs < day) {
      return formatter.format(Math.round(diff / hour), "hour");
    }
    return formatter.format(Math.round(diff / day), "day");
  } catch {
    return "";
  }
}

function formatPrice(value?: number) {
  const num = Number(value || 0);
  return `${num.toLocaleString()}원`;
}


