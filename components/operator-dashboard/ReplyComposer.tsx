"use client";
import { FormEvent, useState } from "react";
import { Icon } from "./Icon";

export function ReplyComposer({ onSend }: { onSend: (body: string) => void }) {
  const [body, setBody] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!body.trim()) return; onSend(body.trim()); setBody(""); }
  return <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} placeholder="メッセージを入力…" className="block w-full resize-none border-0 px-4 py-3 text-[13px] leading-6 text-slate-700 outline-none placeholder:text-slate-400" /><div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-3 py-2.5"><div className="flex items-center gap-1"><button type="button" className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600" aria-label="ファイルを添付"><Icon name="paperclip" size={16} /></button><button type="button" className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600" aria-label="絵文字を追加"><Icon name="smile" size={16} /></button><span className="ml-2 hidden text-[10px] text-slate-400 sm:inline">Shift + Enter で改行</span></div><button type="submit" disabled={!body.trim()} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"><Icon name="send" size={14} />返信する</button></div></form>;
}
