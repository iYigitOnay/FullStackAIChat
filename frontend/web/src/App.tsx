import { useEffect, useRef, useState } from "react";
import type { Message } from "./types";
import MessageItem from "./components/MessageItem";
import { fetchMessages, sendMessage, createUser } from "./lib/api";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [asking, setAsking] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const hasEnv = !!import.meta.env.VITE_API_URL;

  function getUserId(): string | null {
    return localStorage.getItem("userId");
  }

  async function ensureUser() {
    const existing = getUserId();
    if (existing) {
      setUserId(existing);
      return;
    }
    setAsking(true);
  }

  async function handleCreateUser() {
    const nn = nickname.trim();
    if (!nn) return;
    try {
      const u = await createUser(nn);
      localStorage.setItem("userId", u.id);
      setUserId(u.id);
      setAsking(false);
      setNickname("");
    } catch (e: any) {
      alert(e?.message ?? "Kullanıcı oluşturulamadı");
    }
  }

  async function loadMessages() {
    try {
      const data = await fetchMessages(50);
      setMessages(
        data.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Mesajlar alınamadı");
    }
  }

  useEffect(() => {
    void ensureUser();
  }, []);

  useEffect(() => {
    if (!hasEnv) return;
    loadMessages();
    const id = setInterval(loadMessages, 1500); // 1.5 sn
    return () => clearInterval(id);
  }, [hasEnv]);

  async function onSend() {
    const trimmed = text.trim();
    if (!trimmed || !userId) return;
    setLoading(true);
    try {
      const created = await sendMessage(userId, trimmed);
      setText("");
      setMessages((prev) => [...prev, created]);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Mesaj gönderilemedi");
      alert("Mesaj gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSend();
    }
  }

  return (
    <div className="shell">
      <div className="panel">
        <div className="app">
          {/* Header */}
          <header className="header">
            <div className="brand">STAJtalk</div>
            <div className="subtitle">by Ihsan Yigit Onay</div>
          </header>

          <main ref={listRef} className="list">
            {!hasEnv && (
              <div className="bubble" style={{ maxWidth: 520 }}>
                <div className="text" style={{ margin: 0 }}>
                  <b>.env bulunamadı veya VITE_API_URL boş.</b>
                  <br />
                  <code>frontend/web/.env</code> dosyasına{" "}
                  <code>VITE_API_URL=http://localhost:5000</code> yazın ve{" "}
                  <b>npm run dev</b>’i yeniden başlatın.
                </div>
              </div>
            )}

            {error && hasEnv && (
              <div className="bubble" style={{ maxWidth: 520 }}>
                <div className="text" style={{ margin: 0 }}>
                  Hata: {error}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageItem key={m.id} m={m} isOwn={m.userId === userId} />
            ))}

            {!messages.length && hasEnv && !error && (
              <div className="empty">
                Henüz mesaj yok. Aşağıdan ilk mesajı gönder.
              </div>
            )}
          </main>

          {/* Composer */}
          <footer className="composer">
            <div className="composer-inner">
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  userId ? "Mesaj yazın..." : "Önce rumuz belirleyin"
                }
                disabled={!hasEnv || !userId}
              />
              <button
                className="send"
                onClick={onSend}
                disabled={loading || !text.trim() || !hasEnv || !userId}
                aria-label="Gönder"
                title="Gönder"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M21.44 2.56 10.7 13.3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M21.44 2.56 14.5 21.5l-3.8-8.2-8.2-3.8 18.94-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Gönder
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Rumuz Modal */}
      {asking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.45)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: 360,
              background: "#fff",
              borderRadius: 16,
              padding: 16,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 30px rgba(2, 6, 23, 0.18)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              Rumuz Belirleyin
            </div>
            <div style={{ color: "#64748b", fontSize: 14, marginBottom: 12 }}>
              Sohbete katılmak için bir rumuz girin.
            </div>
            <input
              className="input"
              placeholder="Örn: Yigit"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="send"
                style={{ background: "#64748b" }}
                onClick={() => {
                  setAsking(false);
                }}
              >
                İptal
              </button>
              <button className="send" onClick={handleCreateUser}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
