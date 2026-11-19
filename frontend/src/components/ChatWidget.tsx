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
        <span className={open ? "fab-icon open" : "fab-icon"} aria-hidden="true">
          {open ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
              <path d="M12 8.5v.01M8.5 12h.01M15.5 12h.01" strokeWidth="3" />
            </svg>
          )}
        </span>
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
            background: "var(--glass)",
            backdropFilter: "blur(20px)",
            borderRadius: 20,
            border: "1px solid rgba(148,163,184,0.25)",
            boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div className="chat-avatar" aria-hidden="true">
              ✨<span className="chat-online" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text)" }}>
                AI Finance Assistant
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                Ask about your spending, budgets and balances
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {messages.length === 0 && (
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12 }}>
                  Try asking:
                </p>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="chat-suggestion"
                    style={{
                      animationDelay: `${0.1 + i * 0.06}s`,
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      marginBottom: 8,
                      borderRadius: 12,
                      border: "1px solid var(--border-strong)",
                      background: "var(--surface-2)",
                      color: "var(--text)",
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

            {loading && (
              <Bubble role="assistant">
                <span className="typing" aria-label="Thinking…" role="status">
                  <span />
                  <span />
                  <span />
                </span>
              </Bubble>
            )}

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
              borderTop: "1px solid var(--border)",
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
                border: "1px solid var(--border-strong)",
                background: "var(--surface-2)",
                color: "var(--text)",
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
      className={isUser ? "chat-bubble from-user" : "chat-bubble from-assistant"}
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
          background: isUser ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "var(--surface-3)",
          color: isUser ? "white" : "var(--text)",
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
