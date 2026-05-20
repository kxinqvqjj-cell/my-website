import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useEffect, useRef } from "react";

export default function Chat() {
  // ✅ 你的真实头像（本地 or URL都可以）
  const userAvatar =
    "https://api.dicebear.com/7.x/avataaars/svg?seed=user";

  const aiAvatar =
    "https://api.dicebear.com/7.x/bottts/svg?seed=ai";

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("messages");
    return saved ? JSON.parse(saved) : [];
  });

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("conversations");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // 滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 保存 messages
  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  // 保存 conversations
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // 新聊天
  function newChat() {
    const newConversation = {
      id: Date.now(),
      title: "新聊天",
      messages: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentChatId(newConversation.id);
    setMessages([]);
  }

  // 删除聊天
  function deleteChat(id) {
    setConversations(prev => prev.filter(chat => chat.id !== id));

    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
    }
  }

  // 发送消息
  async function sendMessage() {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      avatar: userAvatar,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      const data = await response.json();

      // ❗只保留一个 AI message（修复重复 bug）
      const aiMessage = {
        role: "assistant",
        content: "",
        avatar: aiAvatar,
      };

      setMessages(prev => [...prev, aiMessage]);

      const fullText = data.reply;
      let currentText = "";
      let index = 0;

      const interval = setInterval(() => {
        if (index >= fullText.length) {
          clearInterval(interval);
          setLoading(false);
          return;
        }

        currentText += fullText[index];
        index++;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: currentText,
            avatar: aiAvatar,
          };
          return updated;
        });
      }, 20);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white text-black">

      {/* Sidebar */}
      <div className="w-[260px] border-r bg-gray-100 p-4 flex flex-col">
        <button
          onClick={newChat}
          className="bg-white border rounded-xl py-3 mb-4"
        >
          + 新聊天
        </button>

        <div className="space-y-2">
          {conversations.map(chat => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setMessages(chat.messages);
              }}
              className={`p-3 rounded-xl cursor-pointer border flex justify-between ${
                currentChatId === chat.id
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              <span className="truncate">{chat.title}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col p-6">

        <div className="text-3xl font-bold mb-4">Chat</div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 items-end ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >

              {/* AI头像 */}
              {msg.role === "assistant" && (
                <img
                  src={msg.avatar}
                  className="w-8 h-8 rounded-full"
                />
              )}

              {/* 气泡 */}
              <div
                className={`p-3 rounded-xl max-w-[70%] ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                <ReactMarkdown
                  components={{
                    code({ inline, className, children }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                        >
                          {String(children)}
                        </SyntaxHighlighter>
                      ) : (
                        <code>{children}</code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              {/* 用户头像 */}
              {msg.role === "user" && (
                <img
                  src={msg.avatar}
                  className="w-8 h-8 rounded-full"
                />
              )}

            </div>
          ))}

          {loading && (
            <div className="text-gray-500 text-sm">
              AI 正在思考...
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* input */}
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            className="flex-1 border p-3 rounded-xl"
            placeholder="输入消息..."
          />

          <button
            onClick={sendMessage}
            className="px-6 bg-black text-white rounded-xl"
          >
            发送
          </button>
        </div>

      </div>
    </div>
  );
}