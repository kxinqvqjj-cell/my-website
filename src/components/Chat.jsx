import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useEffect, useRef } from "react";

export default function Chat() {
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
  const [selectedModel, setSelectedModel] =
  useState("deepseek/deepseek-chat");
  const bottomRef = useRef(null);
  const controllerRef = useRef(null);

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
  function stopGenerating() {

  controllerRef.current?.abort();

  setLoading(false);

}

  // 发送消息
  async function sendMessage() {
    if (!message.trim()) return;

    const userMessage = {
  role: "user",
  content: message,
};

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);

    try {
      const controller = new AbortController();

      controllerRef.current = controller;
      const response = await fetch("http://127.0.0.1:3001/chat-stream", {
          signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  message: userMessage.content,
  model: selectedModel,
}),
      });

const reader = response.body.getReader();

const decoder = new TextDecoder();

let aiText = "";

const aiMessage = {
  role: "assistant",
  content: "",
};

setMessages(prev => [...prev, aiMessage]);

while (true) {

  const { done, value } =
    await reader.read();

  if (done) break;

  const chunk =
    decoder.decode(value);

  // DeepSeek SSE 数据处理
  const lines = chunk.split("\n");

  for (const line of lines) {

    if (
      line.startsWith("data: ") &&
      !line.includes("[DONE]")
    ) {

      try {

        const json = JSON.parse(
          line.replace("data: ", "")
        );

        const content =
          json.choices?.[0]?.delta?.content || "";

        aiText += content;

        setMessages(prev => {

          const updated = [...prev];

          updated[updated.length - 1] = {
            role: "assistant",
            content: aiText,
          };

          return updated;

        });

      } catch (err) {}

    }

  }

}

setLoading(false);
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

        <div className="flex items-center justify-between mb-4">

  <div className="text-3xl font-bold">
    Chat
  </div>

  <select
  value={selectedModel}
  onChange={(e) =>
    setSelectedModel(e.target.value)
  }
  className="border rounded-xl px-4 py-2 bg-white"
>

  <option value="deepseek/deepseek-chat">
    DeepSeek
  </option>

</select>

</div>

        {/* messages */}
       <div className="flex-1 overflow-y-auto space-y-4 pb-32">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 items-end ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
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
       <div className="sticky bottom-0 bg-white pt-4 flex gap-2">
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
          onClick={
            loading
              ? stopGenerating
              : sendMessage
          }
            className="px-6 bg-black text-white rounded-xl"
          >
           {loading ? "停止" : "发送"}
          </button>
        </div>

      </div>
    </div>
  );
}