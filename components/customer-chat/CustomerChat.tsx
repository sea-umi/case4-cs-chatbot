"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./CustomerChat.module.css";

type MessageRole = "customer" | "assistant" | "operator";
type ConversationStatus = "ai" | "operator" | "closed";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  time: string;
};

type ApiMessage = {
  id?: string | number;
  role?: string;
  sender?: string;
  content?: string;
  text?: string;
  message?: string;
  createdAt?: string;
  created_at?: string;
};

type ConversationResponse = {
  id?: string | number;
  status?: string;
};

const fallbackMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "こんにちは。ショップサポートです。\nご注文や商品のことでお困りのことがあれば、お気軽にご相談ください。",
  time: "今",
};

const quickQuestions = ["配送状況を確認したい", "返品・交換について", "おすすめ商品を知りたい"];

function toRole(message: ApiMessage): MessageRole {
  const role = (message.role ?? message.sender ?? "assistant").toLowerCase();
  if (["user", "customer", "human"].includes(role)) return "customer";
  if (["operator", "agent", "staff"].includes(role)) return "operator";
  return "assistant";
}

function formatTime(value?: string) {
  if (!value) return "今";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "今";
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeMessage(message: ApiMessage, index: number): ChatMessage | null {
  const content = message.content ?? message.text ?? message.message;
  if (!content || typeof content !== "string") return null;
  return {
    id: String(message.id ?? `api-message-${index}`),
    role: toRole(message),
    content,
    time: formatTime(message.createdAt ?? message.created_at),
  };
}

function statusFromApi(value?: string): ConversationStatus {
  const status = value?.toLowerCase();
  if (status && ["operator", "handoff", "transferred", "in_progress"].includes(status)) {
    return "operator";
  }
  if (status === "closed" || status === "resolved") return "closed";
  return "ai";
}

function getAnswer(data: unknown): ChatMessage | null {
  if (!data || typeof data !== "object") return null;
  const body = data as { answer?: unknown; reply?: unknown; message?: unknown };
  const candidate = body.answer ?? body.reply ?? body.message;
  if (typeof candidate === "string") {
    return { id: `answer-${Date.now()}`, role: "assistant", content: candidate, time: "今" };
  }
  if (candidate && typeof candidate === "object") {
    return normalizeMessage(candidate as ApiMessage, 0);
  }
  return null;
}

function Icon({ name }: { name: "send" | "headset" | "spark" | "back" }) {
  if (name === "send") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m4 4 16 8-16 8 3.2-8L4 4Zm3.95 8h7.1" />
      </svg>
    );
  }
  if (name === "headset") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H5a1 1 0 0 1-1-1v-4Zm16 0h-3v5h2a1 1 0 0 0 1-1v-4ZM17 19c-.8 1-2.1 1.5-4 1.5" />
      </svg>
    );
  }
  if (name === "back") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m15 5-7 7 7 7M9 12h11" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 .9 5.1L17 6l-2.1 4.1L20 12l-5.1.9L17 17l-4.1-2.1L12 21l-.9-6.1L7 17l2.1-4.1L4 12l5.1-.9L7 6l4.1 2.1L12 3Z" />
    </svg>
  );
}

export default function CustomerChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([fallbackMessage]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<ConversationStatus>("ai");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [handoffRequested, setHandoffRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function startConversation() {
      try {
        const response = await fetch("/api/conversations", { method: "POST" });
        if (!response.ok) throw new Error("conversation could not be created");
        const data = (await response.json()) as ConversationResponse;
        if (cancelled || data.id === undefined) return;

        const id = String(data.id);
        setConversationId(id);
        setConversationStatus(statusFromApi(data.status));

        const messagesResponse = await fetch(`/api/conversations/${encodeURIComponent(id)}/messages`);
        if (!messagesResponse.ok) throw new Error("messages could not be loaded");
        const messagesData = (await messagesResponse.json()) as { messages?: ApiMessage[] };
        const loadedMessages = (messagesData.messages ?? [])
          .map(normalizeMessage)
          .filter((message): message is ChatMessage => message !== null);
        if (!cancelled && loadedMessages.length > 0) setMessages(loadedMessages);
      } catch {
        if (!cancelled) setIsOffline(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void startConversation();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;

    async function syncMessages() {
      try {
        const response = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}/messages`);
        if (!response.ok) return;
        const data = (await response.json()) as { messages?: ApiMessage[] };
        const serverMessages = (data.messages ?? [])
          .map(normalizeMessage)
          .filter((message): message is ChatMessage => message !== null);
        if (cancelled || serverMessages.length === 0) return;

        setMessages((current) => {
          const pendingCustomerMessages = current.filter((message) => (
            message.role === "customer"
            && !serverMessages.some((serverMessage) => serverMessage.role === "customer" && serverMessage.content === message.content)
          ));
          return [...serverMessages, ...pendingCustomerMessages];
        });

        if (serverMessages.some((message) => message.role === "operator")) {
          setConversationStatus("operator");
          setHandoffRequested(true);
        }
      } catch {
        // Keep the current conversation visible if a background refresh fails.
      }
    }

    const syncTimer = window.setInterval(() => void syncMessages(), 2000);
    return () => {
      cancelled = true;
      window.clearInterval(syncTimer);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending, handoffRequested]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending || conversationStatus === "closed") return;

    const customerMessage: ChatMessage = {
      id: `customer-${Date.now()}`,
      role: "customer",
      content,
      time: "今",
    };
    setMessages((current) => [...current, customerMessage]);
    setInput("");
    setIsSending(true);

    if (!conversationId) {
      window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: `fallback-${Date.now()}`,
            role: "assistant",
            content: "お問い合わせありがとうございます。現在確認中です。担当者からの回答まで少々お待ちください。",
            time: "今",
          },
        ]);
        setIsSending(false);
      }, 650);
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, message: content }),
      });
      if (!response.ok) throw new Error("message could not be sent");
      const data = (await response.json()) as { messages?: ApiMessage[]; status?: string; answer?: unknown; reply?: unknown; message?: unknown };
      const returnedMessages = (data.messages ?? [])
        .map(normalizeMessage)
        .filter((message): message is ChatMessage => message !== null);
      const answer = getAnswer(data);
      const nextMessages = returnedMessages.length > 0 ? returnedMessages : answer ? [answer] : [];
      if (nextMessages.length > 0) {
        setMessages((current) => [
          ...current,
          ...nextMessages.filter(
            (message) => !(message.role === "customer" && message.content === content),
          ),
        ]);
      }
      if (data.status) {
        const nextStatus = statusFromApi(data.status);
        setConversationStatus(nextStatus);
        if (nextStatus === "operator") setHandoffRequested(true);
      }
      setIsOffline(false);
    } catch {
      setIsOffline(true);
      setMessages((current) => [
        ...current,
        {
          id: `offline-${Date.now()}`,
          role: "assistant",
          content: "ただいま接続が不安定なため、仮の受付画面を表示しています。内容は送信できていません。時間をおいてもう一度お試しください。",
          time: "今",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function requestHandoff() {
    if (isSending || conversationStatus === "closed") return;
    const content = "オペレーターに相談したいです";
    setIsSending(true);
    if (!conversationId) {
      setHandoffRequested(true);
      setConversationStatus("operator");
      setMessages((current) => [...current, { id: `handoff-${Date.now()}`, role: "assistant", content: "担当者への引き継ぎを受け付けました。確認でき次第、このチャットでご案内します。", time: "今" }]);
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, message: content, handoff: true }),
      });
      if (!response.ok) throw new Error("handoff could not be requested");
      const data = (await response.json()) as { message?: ApiMessage; reply?: ApiMessage; status?: string };
      const customerMessage = data.message ? normalizeMessage(data.message, 0) : null;
      const answer = data.reply ? normalizeMessage(data.reply, 1) : null;
      setMessages((current) => [...current, ...(customerMessage ? [customerMessage] : []), ...(answer ? [answer] : [])]);
      setHandoffRequested(true);
      setConversationStatus(statusFromApi(data.status));
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className={styles.shell} aria-label="カスタマーサポートチャット">
      <div className={styles.chatWindow}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className={styles.backButton} href="/" aria-label="ショップに戻る">
              <Icon name="back" />
            </a>
            <div className={styles.avatar} aria-hidden="true">
              <Icon name="spark" />
            </div>
            <div>
              <p className={styles.eyebrow}>SHOP SUPPORT</p>
              <h1>ショップサポート</h1>
            </div>
          </div>
          <div className={styles.onlineStatus}>
            <span className={styles.statusDot} />
            <span>{conversationStatus === "operator" ? "引き継ぎ中" : "オンライン"}</span>
          </div>
        </header>

        <div className={styles.chatBody}>
          <div className={styles.dateDivider}><span>今日</span></div>

          {isOffline && (
            <div className={styles.offlineNotice} role="status">
              <span className={styles.noticeIcon}>!</span>
              <span>接続できないため、画面上で仮の会話を表示しています</span>
            </div>
          )}

          {isLoading && (
            <div className={styles.loadingRow} role="status" aria-label="会話を準備中">
              <div className={styles.avatarSmall}><Icon name="spark" /></div>
              <div className={styles.typingBubble}><span /><span /><span /></div>
            </div>
          )}

          {messages.map((message) => (
            <div className={`${styles.messageRow} ${message.role === "customer" ? styles.customerRow : ""}`} key={message.id}>
              {message.role !== "customer" && (
                <div className={`${styles.avatarSmall} ${message.role === "operator" ? styles.operatorAvatar : ""}`} aria-hidden="true">
                  {message.role === "operator" ? <Icon name="headset" /> : <Icon name="spark" />}
                </div>
              )}
              <div className={styles.messageGroup}>
                {message.role !== "customer" && <span className={styles.senderName}>{message.role === "operator" ? "担当者" : "AIサポート"}</span>}
                <div className={`${styles.bubble} ${message.role === "customer" ? styles.customerBubble : styles.assistantBubble}`}>
                  {message.content.split("\n").map((line, index) => <span key={`${message.id}-${index}`}>{line}{index < message.content.split("\n").length - 1 && <br />}</span>)}
                </div>
                <span className={`${styles.messageTime} ${message.role === "customer" ? styles.customerTime : ""}`}>{message.time}</span>
              </div>
            </div>
          ))}

          {isSending && (
            <div className={styles.loadingRow} role="status" aria-label="回答を準備中">
              <div className={styles.avatarSmall}><Icon name="spark" /></div>
              <div className={styles.typingBubble}><span /><span /><span /></div>
            </div>
          )}

          {handoffRequested && (
            <div className={styles.handoffCard} role="status">
              <div className={styles.handoffIcon}><Icon name="headset" /></div>
              <div>
                <strong>オペレーター引き継ぎ中</strong>
                <p>担当者が会話を確認しています。通常数分以内に回答します。</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={styles.composerArea}>
          {!handoffRequested && (
            <div className={styles.quickQuestions} aria-label="よくある質問">
              {quickQuestions.map((question) => (
                <button type="button" key={question} onClick={() => setInput(question)}>{question}</button>
              ))}
            </div>
          )}
          <form className={styles.composer} onSubmit={sendMessage}>
            <label className={styles.srOnly} htmlFor="customer-message">メッセージを入力</label>
            <input
              id="customer-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={handoffRequested ? "担当者へのメッセージを入力" : "メッセージを入力してください"}
              disabled={conversationStatus === "closed"}
              autoComplete="off"
            />
            <button className={styles.sendButton} type="submit" disabled={!input.trim() || isSending || conversationStatus === "closed"} aria-label="メッセージを送信">
              <Icon name="send" />
            </button>
          </form>
          {!handoffRequested && (
            <button className={styles.handoffButton} type="button" onClick={requestHandoff}>
              <Icon name="headset" />
              オペレーターに相談する
            </button>
          )}
          <p className={styles.privacyNote}>個人情報やカード情報は入力しないでください</p>
        </div>
      </div>
    </section>
  );
}
