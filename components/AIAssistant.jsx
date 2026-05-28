"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button, cn } from "@/components/ui";

const initialReply =
  "Please choose your language:\n1. English\n2. हिंदी\n3. मराठी";

export function AIAssistant({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState([
    { role: "assistant", content: initialReply },
  ]);
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentStep, setCurrentStep] = useState("ASK_LANGUAGE");
  const [structuredData, setStructuredData] = useState({});
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  async function sendMessage(event) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((items) => [...items, { role: "user", content: text }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          selectedLanguage,
          currentStep,
          structuredData,
        }),
      });
      const data = await response.json();
      setSelectedLanguage(data.selectedLanguage || selectedLanguage);
      setCurrentStep(data.nextStep || currentStep);
      setStructuredData(data.structuredData || {});
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content:
            data.reply ||
            "Assistant is temporarily unavailable. You can continue booking using the normal form.",
          action: data.action,
        },
      ]);
    } catch {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content:
            "Assistant is temporarily unavailable. You can continue booking using the normal form.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-300/30 bg-violet-400/15 px-5 py-3 text-sm font-semibold text-violet-100 shadow-lg shadow-violet-950/30 transition hover:border-violet-200/60 hover:bg-violet-400/25"
      >
        <MessageCircle className="h-4 w-4" />
        Ask AI Assistant
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-3 py-4 backdrop-blur-sm sm:items-center">
          <section className="flex h-[min(720px,92vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/50">
            <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-300 text-slate-950">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Calenzo Assistant</p>
                  <p className="text-xs text-slate-500">
                    Real slots, real booking confirmation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
                aria-label="Close assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "max-w-[86%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6",
                    message.role === "user"
                      ? "ml-auto bg-sky-300 text-slate-950"
                      : "border border-slate-800 bg-slate-900/80 text-slate-100",
                  )}
                >
                  {message.content}
                  {message.action === "SHOW_PROFILE_LINK" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button href="/patient/register" size="sm">
                        Create account
                      </Button>
                      <Button href="/patient/profile" variant="secondary" size="sm">
                        Complete profile
                      </Button>
                    </div>
                  ) : null}
                  {message.action === "REQUIRE_SIGN_IN" ? (
                    <div className="mt-3">
                      <Button href="/patient/login" size="sm">
                        Sign in
                      </Button>
                    </div>
                  ) : null}
                  {message.action === "SHOW_CONFIRMATION" &&
                  structuredData?.appointmentId ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button href={`/ticket/${structuredData.appointmentId}`} size="sm">
                        View ticket
                      </Button>
                      <Button
                        href={`/queue/${structuredData.appointmentId}`}
                        variant="secondary"
                        size="sm"
                      >
                        Live queue
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
              {loading ? (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
                  Thinking
                </div>
              ) : null}
            </div>

            <form onSubmit={sendMessage} className="border-t border-slate-800 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type 1, 2, 3 or your answer..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-300 text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
