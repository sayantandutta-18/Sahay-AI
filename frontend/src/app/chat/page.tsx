"use client";

import React, { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  ExternalLink,
  Globe,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { ChatSourceCitation } from "@/types";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  sources?: ChatSourceCitation[];
  intentDetected?: string;
  confidenceLevel?: string;
  deterministicAction?: string | null;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      sender: "assistant",
      text: "Namaste! I am your Sahay AI Advisor. I am grounded strictly in verified government notifications and Sahay's deterministic calculators. How can I help your micro-enterprise today?",
      sources: [
        {
          title: "Ministry of MSME Scheme Guidelines (PMEGP, MUDRA)",
          url: "https://msme.gov.in",
          provider: "Govt of India",
          last_verified_at: "2026-03-01",
        },
      ],
      confidenceLevel: "high",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<string>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setErrorMsg(null);
    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userText, undefined, language);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: response.reply,
        sources: response.sources,
        intentDetected: response.intent_detected,
        confidenceLevel: response.confidence_level,
        deterministicAction: response.deterministic_action_taken,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to connect to Sahay Assistant service.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: "PMEGP subsidy rate for women?", lang: "en" },
    { label: "মুদ্রা লোনের জন্য কি গ্যারান্টি দরকার?", lang: "bn" },
    { label: "उद्यम सर्टिफिकेट कैसे डाउनलोड करें?", lang: "hi" },
    { label: "Calculate loan EMI for ₹5 lakh", lang: "en" },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl h-[calc(100vh-8rem)] flex flex-col space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" /> Sahay Grounded AI Assistant
            </h1>
            <p className="text-xs text-slate-500">
              Grounded RAG retrieval over verified government documentation • English, हिंदी, বাংলা
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none text-slate-700 dark:text-slate-200 text-xs focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिंदी (HI)</option>
                <option value="bn">বাংলা (BN)</option>
              </select>
            </div>
            <Badge variant="brand" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Hallucination-Guarded
            </Badge>
          </div>
        </div>

        {errorMsg && (
          <ErrorBanner
            title="Assistant Response Error"
            message={errorMsg}
            onDismiss={() => setErrorMsg(null)}
          />
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-600 text-white rounded-br-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs rounded-bl-xs"
                }`}
              >
                {/* Assistant Metadata Badges */}
                {m.sender === "assistant" && (m.intentDetected || m.confidenceLevel) && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px]">
                    {m.intentDetected && (
                      <span className="font-mono px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {m.intentDetected}
                      </span>
                    )}
                    {m.confidenceLevel && (
                      <span
                        className={`px-1.5 py-0.5 rounded-sm font-medium ${
                          m.confidenceLevel === "high"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        Confidence: {m.confidenceLevel}
                      </span>
                    )}
                    {m.deterministicAction && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Deterministic
                      </span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-line">{m.text}</div>

                {/* Sources & Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Verified Government Citations:
                    </p>
                    <div className="space-y-1">
                      {m.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-sm"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Info className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="font-medium truncate">{src.title}</span>
                            {src.last_verified_at && (
                              <span className="text-[10px] text-slate-400">
                                • Verified {src.last_verified_at}
                              </span>
                            )}
                          </div>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0 ml-2"
                            >
                              Portal <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-1 text-right text-[10px] text-slate-400">{m.timestamp}</div>
              </div>
              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-xs p-4 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Evaluating ground database & deterministic engine...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions & Input bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">Suggestions:</span>
            {suggestions.map((sugg) => (
              <button
                key={sugg.label}
                type="button"
                onClick={() => {
                  setInput(sugg.label);
                  setLanguage(sugg.lang);
                }}
                className="shrink-0 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {sugg.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Ask about schemes, eligibility, loans, required documents, or EMI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              leftIcon={
                isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />
              }
            >
              Ask
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
