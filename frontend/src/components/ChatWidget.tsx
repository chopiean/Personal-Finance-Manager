import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { apiFetch } from "../api/api";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatResponse = { reply: string };

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What is my biggest expense category?",
  "Am I over any budget?",
  "Give me 3 tips to save more",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // While open, close on a click/tap outside the panel or on Escape.
  // The toggle button is excluded so its own onClick decides open/close.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;

    const history = messages;
    setMessages([...history, { role: "user", content: message }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<ChatResponse>("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message, history }),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        ref={toggleRef}
        onClick={() => setOpen((o) => !o)}
        className="chat-fab"
        style={{
          position: "fixed",
          right: 28,
          bottom: 28,
          width: 68,
          height: 68,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg,#3b82f6,#6366f1)",
          color: "white",
          fontSize: 30,
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(59,130,246,0.4)",
          zIndex: 1000,
        }}
      >
        {open ? "×" : "💬"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AI assistant"
          ref={panelRef}
          className="chat-panel"
          style={{
            position: "fixed",
            right: 28,
            bottom: 108,
            width: 380,
            maxWidth: "calc(100vw - 40px)",
            height: 540,
            maxHeight: "calc(100vh - 140px)",
            display: "flex",
            flexDirection: "column",
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderRadius: 20,
            border: "1px solid rgba(148,163,184,0.25)",
            boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
            overflow: "hidden",
            zIndex: 1000,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}
          >
            <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>
              AI Finance Assistant
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Ask about your spending, budgets and balances
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {messages.length === 0 && (
              <div>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 12 }}>
                  Try asking:
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      marginBottom: 8,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.role === "assistant" ? formatReply(m.content) : m.content}
              </Bubble>
            ))}

            {loading && <Bubble role="assistant">Thinking…</Bubble>}

            {error && (
              <p
                role="alert"
                style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}
              >
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <textarea
              aria-label="Your question"
              placeholder="Ask about your finances…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={1000}
              style={{
                flex: 1,
                resize: "none",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                padding: "0 18px",
                borderRadius: 12,
                border: "none",
                background: loading || !input.trim() ? "#cbd5e1" : "#3b82f6",
                color: "white",
                fontWeight: 600,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ----- Message bubble ----- */
function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "10px 14px",
          borderRadius: 16,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
          background: isUser ? "#3b82f6" : "#f1f5f9",
          color: isUser ? "white" : "#0f172a",
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function formatReply(text: string): ReactNode {
  return text.split("\n").map((line, i) => {
    const isBullet = /^\s*[-*]\s+/.test(line);
    const content = isBullet ? line.replace(/^\s*[-*]\s+/, "") : line;
    const parts = content
      .split(/\*\*(.+?)\*\*/g)
      .map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part));
    return (
      <div
        key={i}
        style={{ paddingLeft: isBullet ? 14 : 0, position: "relative" }}
      >
        {isBullet && <span style={{ position: "absolute", left: 0 }}>•</span>}
        {parts}
      </div>
    );
  });
}
