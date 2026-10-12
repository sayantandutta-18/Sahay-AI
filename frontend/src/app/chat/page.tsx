"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MessageSquare, Send, Sparkles, ShieldCheck, User } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: string;
  verifiedDate?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Namaste! I am your Sahay AI Advisor. I am grounded strictly in verified government notifications and Sahay's deterministic calculators. How can I help your micro-enterprise today?",
    },
    {
      id: "2",
      sender: "user",
      text: "Can I get a subsidy under PMEGP for starting a small spice processing unit?",
    },
    {
      id: "3",
      sender: "assistant",
      text: "Yes, spice processing falls under the Agro-based & Food Processing Industry category under PMEGP. In rural West Bengal, general category entrepreneurs receive 25% subsidy, while special category (women, SC/ST, OBC, minorities) receive up to 35% margin money subsidy. A 10-day EDP training certificate is mandatory before loan sanction.",
      source: "PMEGP Official Operational Guidelines (Ministry of MSME)",
      verifiedDate: "2026-03-01",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate grounded assistant response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `Regarding "${userMsg.text}": Under verified guidelines, micro-enterprises can access collateral-free credit via MUDRA or CGTMSE guarantee. The deterministic eligibility engine has confirmed your profile parameters match this criterion.`,
        source: "RBI Master Circular on MSME Lending & SIDBI Directives",
        verifiedDate: "2026-02-15",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl h-[calc(100vh-8rem)] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" /> Sahay Multilingual AI Assistant
            </h1>
            <p className="text-xs text-slate-500">
              Grounded RAG retrieval over verified government documentation • English, हिंदी, বাংলা
            </p>
          </div>
          <Badge variant="brand" size="sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Hallucination-Guarded
          </Badge>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-600 text-white rounded-br-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs rounded-bl-xs"
                }`}
              >
                <p>{m.text}</p>
                {m.source && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-500">Verified Source:</span> {m.source} ({m.verifiedDate})
                  </div>
                )}
              </div>
              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Suggestions & Input bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">Suggestions:</span>
            {[
              "PMEGP subsidy rate for women?",
              "মুদ্রা লোনের জন্য কি গ্যারান্টি দরকার?",
              "उद्यम सर्टिफिकेट कैसे डाउनलोड करें?",
            ].map((sugg) => (
              <button
                key={sugg}
                onClick={() => setInput(sugg)}
                className="shrink-0 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {sugg}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Ask about schemes, loans, documents, or business finance..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" leftIcon={<Send className="w-4 h-4" />}>
              Ask
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
