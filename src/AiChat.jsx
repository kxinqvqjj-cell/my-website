import "./AiChat.css";
import { useState, useRef, useEffect } from "react";

function AiChat({ username, avatar }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "嘿，我是Kxincc的AI分身～有什么想聊的？",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // 添加打字占位
    const typingMsg = { role: "assistant", content: "..." };
    setMessages([...newMessages, typingMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m.role !== "assistant" || m.content !== "...").map((m) => ({
            role: m.role,
            content: m.content,
          })),
          username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.error || "出错了，稍后再试～" },
        ]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.reply },
        ]);
        if (data.limit !== undefined) {
          setLimitInfo(`今日剩余 ${data.limit} 次`);
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "网络出了点问题，等会再聊～" },
      ]);
    }

    setSending(false);
  };

  return (
    <div className={`ai-chat-panel${open ? " open" : ""}`}>
      {/* 头像卡片（收起时显示） */}
      <div className="ai-chat-avatar-card" onClick={() => setOpen(true)}>
        <img src="/cjw1.png" alt="" className="ai-chat-avatar-img" />
        <div className="ai-chat-avatar-name">kxinc</div>
      </div>

      {/* 聊天窗口（展开时显示） */}
      {open && (
        <>
          <div className="ai-chat-header">
            <img className="avatar" src="/cjw1.png" alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div className="info">
              <h3>AI cc</h3>
              <p>21岁 · INFJ · 天秤座</p>
            </div>
            <button className="ai-chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                {m.role === "assistant" ? (
                  <img className="msg-avatar" src="/cjw1.png" alt="" />
                ) : (
                  <img className="msg-avatar" src={avatar || "/1.png"} alt="" />
                )}
                <div className={`msg-bubble${m.content === "..." ? " typing" : ""}`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {limitInfo && <div className="ai-chat-limit">{limitInfo}</div>}

          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="和AI小韩聊聊..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={sending}
            />
            <button onClick={handleSend} disabled={sending || !input.trim()}>
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AiChat;
