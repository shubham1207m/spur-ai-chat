import { useEffect, useRef, useState } from "react";
import "./App.css";

type Message = {
  sender: "user" | "ai";
  text: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages((m) => [...m, { sender: "user", text: userText }]);

    const res = await fetch("https://spur-ai-chat-backend-k09u.onrender.com/chat/message",
 {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, sessionId }),
    });

    const data = await res.json();

    setSessionId(data.sessionId);
    setMessages((m) => [...m, { sender: "ai", text: data.reply }]);
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>AI Support Chat</h2>

      <div
        style={{
          border: "1px solid #ddd",
          padding: 10,
          height: 400,
          overflowY: "auto",
          borderRadius: 6,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.sender === "user" ? "right" : "left",
              margin: "6px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 8,
                background: m.sender === "user" ? "#DCF8C6" : "#EEE",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
