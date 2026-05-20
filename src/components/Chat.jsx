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
  const [loading, setLoading] = useState(false);

 const [conversations, setConversations] = useState(() => {

  const saved = localStorage.getItem("conversations");

  return saved ? JSON.parse(saved) : [];

});

const [currentChatId, setCurrentChatId] = useState(null);

  const bottomRef = useRef(null);

useEffect(() => {

  bottomRef.current?.scrollIntoView({
    behavior: "smooth",
    
  });
  

}, [messages]);
useEffect(() => {

  localStorage.setItem(
    "messages",
    JSON.stringify(messages)
  );

}, [messages]);

useEffect(() => {

  if (!currentChatId) return;

  setConversations(prev =>

    prev.map(chat =>

      chat.id === currentChatId
        ? { ...chat, messages }
        : chat

    )

  );

}, [messages]);

useEffect(() => {

  localStorage.setItem(
    "conversations",
    JSON.stringify(conversations)
  );

}, [conversations]);
function newChat() {

  const newConversation = {

    id: Date.now(),

    title: "新聊天",

    messages: [],

  };

  function deleteChat(id) {

  const updated = conversations.filter(
    chat => chat.id !== id
  );

  setConversations(updated);

  if (currentChatId === id) {

    setCurrentChatId(null);

    setMessages([]);

  }

}
  setConversations(prev => [
    newConversation,
    ...prev,
  ]);

  setCurrentChatId(newConversation.id);

  setMessages([]);

}
  async function sendMessage() {

    if (!message) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages(prev => [...prev, userMessage]);

    setMessage("");

    setLoading(true);
    

    // 模拟 AI 回复
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

     let currentText = "";

const aiMessage = {
  role: "assistant",
  content: "",
};

setMessages(prev => [...prev, aiMessage]);

const currentChat = conversations.find(
  chat => chat.id === currentChatId
);

if (
  currentChat &&
  currentChat.title === "新聊天"
) {

  setConversations(prev =>

    prev.map(chat =>

      chat.id === currentChatId
        ? {
            ...chat,
            title: message.slice(0, 20),
          }
        : chat

    )

  );

}

const fullText = data.reply;

let index = 0;

const interval = setInterval(() => {

  currentText += fullText[index];

  index++;

  setMessages(prev => {

    const updated = [...prev];

    updated[updated.length - 1] = {
      role: "assistant",
      content: currentText,
    };

    return updated;

  });

  if (index >= fullText.length) {

    clearInterval(interval);

    setLoading(false);

  }

}, 20);

      setLoading(false);

    } catch (error) {

      console.error(error);

      setLoading(false);

    }
  }

  return (

  <div className="min-h-screen bg-white text-black flex">

    {/* Sidebar */}
    <div className="w-[260px] border-r border-gray-200 bg-gray-100 p-4 flex flex-col">

     <button
  onClick={newChat}
  className="bg-white text-black rounded-xl py-3 font-semibold mb-6"
>
        + 新聊天
      </button>

      <div className="space-y-3">

      <div className="space-y-3">

  {conversations.map((chat) => (

    <div
      key={chat.id}

      onClick={() => {

        setCurrentChatId(chat.id);

        setMessages(chat.messages);

      }}

      className={`p-3 rounded-xl cursor-pointer transition border

${currentChatId === chat.id
  ? "bg-black text-white border-black"
  : "bg-white text-black border-gray-200 hover:bg-gray-100"
}
`}
    >

    <div className="flex items-center justify-between">

  <span className="truncate">
    {chat.title}
  </span>

  <button

    onClick={(e) => {

      e.stopPropagation();

      deleteChat(chat.id);

    }}

    className="ml-2 text-sm opacity-60 hover:opacity-100"
  >

    ×

  </button>

</div>
    </div>

  ))}

</div>  <div className="p-3 rounded-xl bg-white/10 cursor-pointer hover:bg-white/20 transition">
          AI 网站开发
        </div>

        <div className="p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/20 transition">
          React 学习
        </div>

      </div>

    </div>

    {/* Chat Area */}
    <div className="flex-1 flex flex-col p-8">

      <h1 className="text-4xl font-bold mb-8 text-black">
  DeepSeek
</h1>

      {/* 消息区 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-8">

        {messages.map((msg, index) => (

          <div
            key={index}
            className={`p-4 rounded-2xl max-w-[70%] ${
              msg.role === "user"
              ? "bg-white text-black ml-auto border border-gray-200"
                : "bg-gray-100 text-black"
            }`}
          >

            <ReactMarkdown
  components={{
    code({ inline, className, children, ...props }) {

      const match = /language-(\w+)/.exec(className || "");

      return !inline && match ? (

        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          {...props}
        >

          {String(children).replace(/\n$/, "")}

        </SyntaxHighlighter>

      ) : (

        <code className={className} {...props}>
          {children}
        </code>

      );
    },
  }}
>

  {msg.content}

</ReactMarkdown>

          </div>

        ))}

        {loading && (

          <div className="bg-white/10 p-4 rounded-2xl max-w-[70%]">
            AI 正在思考...
          </div>

        )}

        <div ref={bottomRef}></div>

      </div>

      {/* 输入区 */}
      <div className="flex gap-4">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}

          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}

          placeholder="输入消息..."

          className="flex-1 p-4 rounded-2xl bg-gray-100 border border-gray-300 outline-none text-black"
        />

        <button
          onClick={sendMessage}
          className="px-6 py-4 rounded-2xl bg-white text-black font-semibold"
        >

          发送

        </button>

      </div>

    </div>

  </div>

);
}
