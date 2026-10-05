"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, Network } from "lucide-react";
import { CursorGlow } from "@/components/nexus/CursorGlow";
import { NexusMessage } from "@/components/chat/NexusMessage";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import type { Msg } from "@/components/chat/types";

const SUGGESTIONS = [
  "My VPN isn't working and can I work from home tomorrow?",
  "How do I expense a client dinner in Berlin?",
  "What's the onboarding checklist for a new engineer?",
];

const SCRIPT: Record<"default" | "expense" | "onboarding", Omit<Msg, "id" | "role">> = {
  default: {
    text: "Your VPN is failing because split tunneling is disabled on the new gateway — reset the client profile and reconnect. Separately, your team policy allows two remote days per week, so working from home tomorrow is approved.",
    evidence: [
      { source: "IT · VPN Troubleshooting Guide §3", detail: "Reset profile after gateway migration" },
      { source: "HR · Remote Work Policy 2026", detail: "Up to 2 remote days per week, no approval needed" },
    ],
    confidence: 96,
    agents: ["Router Agent", "IT Agent", "HR Agent", "Evidence Nodes", "Response Generator"],
  },
  expense: {
    text: "Client dinners are reimbursable up to €80 per attendee. Submit the itemised receipt within 30 days and tag the cost centre of the client account.",
    evidence: [
      { source: "Finance · Travel & Entertainment Policy", detail: "€80 per attendee cap, EU region" },
      { source: "Finance · Expense Submission SOP", detail: "30-day submission window" },
    ],
    confidence: 92,
    agents: ["Router Agent", "Finance Agent", "Evidence Nodes", "Response Generator"],
  },
  onboarding: {
    text: "New engineers get hardware and SSO on day one, repository access on day two after security training, and a 30-60-90 plan from their manager in week one.",
    evidence: [
      { source: "HR · Engineering Onboarding Checklist", detail: "Day 1–5 sequence" },
      { source: "IT · Access Provisioning Runbook", detail: "SSO + repo access gates" },
    ],
    confidence: 89,
    agents: ["Router Agent", "HR Agent", "IT Agent", "Response Generator"],
  },
};

function pickScript(q: string) {
  const s = q.toLowerCase();
  if (s.includes("expense") || s.includes("dinner") || s.includes("reimburse")) return SCRIPT.expense;
  if (s.includes("onboard") || s.includes("new engineer") || s.includes("checklist"))
    return SCRIPT.onboarding;
  return SCRIPT.default;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState<string[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        const timer = setTimeout(() => {
          send(q);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const send = (value: string) => {
    const q = value.trim();
    if (!q || thinking) return;
    setInput("");
    const answer = pickScript(q);
    setMessages((m) => [...m, { id: ++idRef.current, role: "user", text: q }]);
    setThinking(answer.agents ?? []);
    window.setTimeout(() => {
      setThinking(null);
      setMessages((m) => [...m, { id: ++idRef.current, role: "nexus", ...answer }]);
    }, 2200);
  };

  return (
    <div className="noise relative flex h-[100svh] overflow-hidden bg-background">
      <CursorGlow />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute inset-0 aurora-bg opacity-50" />

      {/* Floating sidebar */}
      <ChatSidebar thinking={thinking} />

      {/* Conversation */}
      <main className="relative z-10 flex min-w-0 flex-1 flex-col p-4">
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-6">
          <div className="mx-auto max-w-2xl space-y-6 pt-10">
            {messages.length === 0 && (
              <div className="text-center">
                <div className="mx-auto h-16 w-16 animate-breathe rounded-full bg-primary/30 blur-xl" />
                <h1 className="text-gradient mt-6 text-3xl font-bold sm:text-4xl">
                  Ask your enterprise
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  One question. Multiple systems. One intelligent answer.
                </p>
                <div className="mt-8 grid gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="glass-panel rounded-2xl px-4 py-3 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) =>
              m.role === "user" ? (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <p className="glass-panel max-w-[85%] rounded-3xl rounded-br-lg px-5 py-3 text-sm text-foreground">
                    {m.text}
                  </p>
                </motion.div>
              ) : (
                <NexusMessage key={m.id} msg={m} />
              ),
            )}

            <AnimatePresence>
              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel rounded-3xl p-5"
                >
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
                    Beacon is orchestrating
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {thinking.map((a, i) => (
                      <motion.span
                        key={a}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.32 }}
                        className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-foreground"
                      >
                        {a.toUpperCase()}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="glass-panel glow-ring flex items-center gap-3 rounded-full px-5 py-3"
          >
            <Network className="h-4 w-4 shrink-0 text-primary" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask across HR, IT and Finance…"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Send"
              className="rounded-full bg-primary/20 p-2 text-foreground transition-colors hover:bg-primary/35"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-3 pb-2 text-center text-[10px] text-muted-foreground">
            Every answer is grounded in cited enterprise sources.
          </p>
        </div>
      </main>
    </div>
  );
}
