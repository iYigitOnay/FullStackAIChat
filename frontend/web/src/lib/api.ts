import type { Message, RawMessage } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

function mustBaseUrl(): string {
  if (!BASE_URL || typeof BASE_URL !== "string") {
    throw new Error(
      "VITE_API_URL tanımlı değil. .env dosyanızı kontrol edin ve dev server'ı yeniden başlatın."
    );
  }
  return BASE_URL;
}

function normalizeLabel(lbl?: string | null): Message["sentiment"]["label"] {
  const l = (lbl ?? "").toLowerCase();
  if (l.startsWith("pos")) return "positive";
  if (l.startsWith("neg")) return "negative";
  if (l.startsWith("neu")) return "neutral";
  if (l === "positive" || l === "negative" || l === "neutral") return l as any;
  return "unknown";
}

function toMessage(r: RawMessage): Message {
  return {
    id: r.id,
    userId: r.userId,
    userNickname: r.userNickname,
    text: r.text,
    createdAt: r.createdAt,
    sentiment: {
      label: normalizeLabel(r.sentimentLabel),
      score: r.sentimentScore ?? null,
    },
  };
}

export async function fetchMessages(limit = 50): Promise<Message[]> {
  const base = mustBaseUrl();
  const res = await fetch(`${base}/api/messages?limit=${limit}`);
  if (!res.ok) throw new Error(`Mesajlar alınamadı: ${res.status}`);
  const raw: RawMessage[] = await res.json();
  return raw.map(toMessage);
}

export async function sendMessage(
  userId: string,
  text: string
): Promise<Message> {
  const base = mustBaseUrl();
  const res = await fetch(`${base}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, text }),
  });
  if (!res.ok) throw new Error(`Mesaj gönderilemedi: ${res.status}`);
  const raw: RawMessage = await res.json();
  return toMessage(raw);
}

export async function createUser(
  nickname: string
): Promise<{ id: string; nickname: string; createdAt: string }> {
  const base = mustBaseUrl();
  const res = await fetch(`${base}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  if (!res.ok) throw new Error(`Kullanıcı oluşturulamadı: ${res.status}`);
  return res.json();
}
