import "./Guestbook.css";
import { useState, useEffect } from "react";
import { getGuestbookMessages, addGuestbookMessage } from "./api";

function Guestbook({ username, avatar }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
    const timer = setInterval(loadMessages, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadMessages = async () => {
    try {
      const data = await getGuestbookMessages();
      setMessages(data);
    } catch (err) {
      console.error("load guestbook error:", err);
    }
  };

  const handleSubmit = async () => {
    const t = text.trim();
    if (!t) return;
    setLoading(true);
    try {
      const entry = await addGuestbookMessage({
        username,
        avatar: avatar || "/1.png",
        text: t,
      });
      setMessages(prev => [entry, ...prev]);
      setText("");
    } catch (err) {
      console.error("add guestbook error:", err);
    }
    setLoading(false);
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="guestbook-panel">
      <h2>
        💬 在线留言板
        <span className="guestbook-count">({messages.length} 条留言)</span>
      </h2>

      <div className="guestbook-input-area">
        <img src={avatar || "/1.png"} alt="" />
        <textarea
          placeholder="写下你的留言，所有人都能看到..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && e.ctrlKey) handleSubmit();
          }}
          rows={2}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "发送中..." : "发送"}
        </button>
      </div>

      <div className="guestbook-list">
        {messages.length === 0 && (
          <div className="guestbook-empty">还没有留言，来做第一个留言的人吧~</div>
        )}
        {messages.map(m => (
          <div key={m.id} className="guestbook-item">
            <div className="guestbook-item-header">
              <img src={m.avatar} alt="" />
              <span className="name">{m.username}</span>
              <span className="time">{formatTime(m.created_at)}</span>
            </div>
            <div className="guestbook-item-text">{m.text}</div>
            {m.reply && (
              <div className="guestbook-reply">
                <div className="guestbook-reply-label">📝 管理员回复</div>
                <div className="guestbook-reply-text">{m.reply}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Guestbook;
