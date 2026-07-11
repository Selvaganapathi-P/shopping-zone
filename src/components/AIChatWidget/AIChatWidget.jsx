import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import API from "../../api/axios";
import "./AIChatWidget.css";

const SUGGESTIONS = [
  "Best smartphones under ₹20,000?",
  "Top-rated kitchen appliances",
  "Gift ideas for ₹1,000",
  "Compare earphones under ₹5,000",
];

function TypingIndicator() {
  return (
    <div className="ai-typing">
      <div className="ai-typing-dot" />
      <div className="ai-typing-dot" />
      <div className="ai-typing-dot" />
    </div>
  );
}

export default function AIChatWidget() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm Zova 🛍️, your AI shopping assistant. How can I help you find the perfect product today?",
  }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const messagesEndRef           = useRef(null);
  const inputRef                 = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.slice(-10);

    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const response = await fetch(`${API.defaults.baseURL}/ai/chat`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: msg, history }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "AI request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      const updateLast = (text, done) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: text, streaming: !done };
          return updated;
        });
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              assistantText += parsed.text;
              updateLast(assistantText, false);
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e.message && !e.message.includes("JSON")) throw e;
          }
        }
      }

      updateLast(assistantText, true);
    } catch (err) {
      const errMsg = err.message?.includes("not configured")
        ? "AI assistant is not yet configured. Please add your Anthropic API key."
        : "Sorry, I couldn't process that. Please try again.";

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: errMsg };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        className="ai-chat-fab"
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        title="AI Shopping Assistant"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={22} />
              </motion.div>
            : <motion.div key="open"  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Sparkles size={22} />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-chat-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-info">
                <div className="ai-avatar">🤖</div>
                <div className="ai-chat-header-text">
                  <h4>Zova AI Assistant</h4>
                  <p>Powered by Claude</p>
                </div>
              </div>
              <button className="ai-chat-close" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`ai-msg ${msg.role}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="ai-msg-avatar">
                    {msg.role === "assistant" ? "🤖" : "👤"}
                  </div>
                  <div className="ai-msg-bubble">
                    {msg.content || (msg.streaming && <TypingIndicator />)}
                  </div>
                </motion.div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="ai-msg assistant">
                  <div className="ai-msg-avatar">🤖</div>
                  <div className="ai-msg-bubble"><TypingIndicator /></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions (shown only with default message) */}
            {messages.length <= 1 && (
              <div className="ai-suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="ai-suggestion-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="ai-chat-input-row">
              <textarea
                ref={inputRef}
                className="ai-chat-input"
                placeholder="Ask me anything about products..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
              />
              <button
                className="ai-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                title="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
