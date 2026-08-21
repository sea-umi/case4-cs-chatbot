"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ConversationDetail } from "./ConversationDetail";
import { ConversationList } from "./ConversationList";
import type { Conversation, ConversationCategory, Message, StatusFilter } from "./types";

type ApiConversation = {
  id: string;
  status: string;
  updatedAt: string;
  preview: string;
  messageCount: number;
};

type ApiMessage = {
  id: string;
  role: "customer" | "assistant" | "operator";
  content: string;
  createdAt: string;
};

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function mapConversation(item: ApiConversation): Conversation {
  const name = `顧客 ${item.id.slice(0, 6)}`;
  return {
    id: item.id,
    customerName: name,
    initials: "顧客",
    email: "匿名セッション",
    subject: item.preview || "問い合わせ",
    preview: item.preview || "メッセージを読み込み中",
    category: "その他",
    status: item.status === "closed" ? "解決済み" : item.messageCount > 0 ? "対応中" : "未対応",
    priority: "通常",
    updatedAt: formatTime(item.updatedAt),
    messages: [],
  };
}

function mapMessage(item: ApiMessage): Message {
  return { id: item.id, sender: item.role === "customer" ? "customer" : "operator", body: item.content, time: formatTime(item.createdAt) };
}

export function LiveOperatorDashboard() {
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ConversationCategory>("すべて");
  const [status, setStatus] = useState<StatusFilter>("すべて");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch("/api/conversations", { headers: { "x-operator-token": token } })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 401 ? "トークンが正しくありません" : "問い合わせ一覧を取得できませんでした");
        return (await response.json()) as { conversations: ApiConversation[] };
      })
      .then((data) => {
        if (cancelled) return;
        const next = data.conversations.map(mapConversation);
        setConversations(next);
        setSelectedId((current) => next.some((item) => item.id === current) ? current : next[0]?.id ?? "");
        setError("");
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "管理画面を読み込めませんでした");
        setToken("");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const visible = useMemo(() => conversations.filter((item) => {
    const matchesCategory = category === "すべて" || item.category === category;
    const matchesStatus = status === "すべて" || item.status === status;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [item.customerName, item.subject, item.preview].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesStatus && matchesSearch;
  }), [category, conversations, search, status]);

  const selected = conversations.find((item) => item.id === selectedId);

  useEffect(() => {
    if (!token || !selectedId) return;
    let cancelled = false;
    fetch(`/api/conversations/${encodeURIComponent(selectedId)}/messages`)
      .then(async (response) => {
        if (!response.ok) throw new Error("会話履歴を取得できませんでした");
        return (await response.json()) as { messages: ApiMessage[] };
      })
      .then((data) => {
        if (cancelled) return;
        setConversations((current) => current.map((item) => item.id === selectedId ? { ...item, messages: data.messages.map(mapMessage) } : item));
      })
      .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "会話履歴を取得できませんでした"); });
    return () => { cancelled = true; };
  }, [selectedId, token]);

  function submitToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tokenInput.trim()) { setLoading(true); setToken(tokenInput.trim()); }
  }

  async function sendMessage(body: string) {
    if (!selected || !token) return;
    const response = await fetch(`/api/conversations/${encodeURIComponent(selected.id)}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-operator-token": token },
      body: JSON.stringify({ content: body, role: "operator" }),
    });
    if (!response.ok) { setError("返信を送信できませんでした"); return; }
    const data = (await response.json()) as { message: ApiMessage };
    setConversations((current) => current.map((item) => item.id === selected.id ? { ...item, messages: [...item.messages, mapMessage(data.message)], preview: body, status: "対応中", updatedAt: "今" } : item));
  }

  function markResolved() {
    if (selected) setConversations((current) => current.map((item) => item.id === selected.id ? { ...item, status: "解決済み" } : item));
  }

  if (!token) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6"><form onSubmit={submitToken} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">Operator Console</p><h1 className="mt-3 text-xl font-semibold text-slate-900">管理画面にログイン</h1><p className="mt-3 text-sm leading-6 text-slate-500">管理用アクセストークンを入力してください。</p><label className="mt-6 block text-sm font-medium text-slate-700">アクセストークン<input type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>{error && <p className="mt-3 text-sm text-rose-600">{error}</p>}<button type="submit" className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700">管理画面を開く</button></form></main>;
  }

  return <main className="min-h-screen bg-[#f8fafc] text-slate-900"><header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-7"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Live Inbox</p><h2 className="mt-0.5 text-sm font-semibold text-slate-800">問い合わせ一覧</h2></div><div className="flex items-center gap-3"><span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 sm:block">認証済み</span><button onClick={() => { setToken(""); setTokenInput(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50">ログアウト</button></div></header>{error && <p className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">{error}</p>}<div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row"><ConversationList conversations={visible} selectedId={selectedId} search={search} category={category} status={status} onSearchChange={setSearch} onCategoryChange={setCategory} onStatusChange={setStatus} onSelect={setSelectedId} />{selected ? <ConversationDetail conversation={selected} showEscalation={false} onCloseEscalation={() => undefined} onResolve={markResolved} onEscalate={() => undefined} onSend={sendMessage} /> : <section className="flex min-h-[680px] flex-1 items-center justify-center bg-[#f8fafc] text-sm text-slate-400">{loading ? "問い合わせを読み込んでいます…" : "問い合わせがありません"}</section>}</div></main>;
}
