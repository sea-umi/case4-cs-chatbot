export const CONVERSATION_STATUS = "open" as const;
export const MAX_MESSAGE_LENGTH = 10_000;
export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
export const FAQ_CANDIDATE_LIMIT = 8;
export const GEMINI_REQUEST_TIMEOUT_MS = 8_000;
export const SAFE_PLACEHOLDER_REPLY =
  "お問い合わせありがとうございます。現在は自動回答の準備中です。担当者からの案内をお待ちください。";

export type MessageRole = "customer" | "assistant" | "operator";

export function createBackendId(): string {
  return crypto.randomUUID();
}
