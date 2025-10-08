import type { Message } from "../types";

export default function MessageItem({ m, isOwn }: { m: Message; isOwn: boolean }) {
  const label = m?.sentiment?.label ?? "unknown";
  const score = m?.sentiment?.score;
  const nick = m?.userNickname || "(rumuz)";

  return (
    <div className={`row ${isOwn ? "row--self" : "row--other"}`}>
      <div className={`bubble ${isOwn ? "bubble--self" : ""}`}>
        <div className="text">{m.text}</div>
        <div className="meta">
          <span className="nick">{nick}</span>
          <span aria-hidden="true">•</span>
          <span className={`sentiment ${label}`}>
            <span className="dot" />
            {label}{score != null ? ` (${score.toFixed(2)})` : ""}
          </span>
          <span aria-hidden="true">•</span>
          <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
