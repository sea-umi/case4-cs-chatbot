export const CONVERSATION_STATUS = "open" as const;
export const MAX_MESSAGE_LENGTH = 10_000;
export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
export const FAQ_CANDIDATE_LIMIT = 8;
export const GEMINI_REQUEST_TIMEOUT_MS = 30_000;
export const SAFE_PLACEHOLDER_REPLY =
  "お問い合わせありがとうございます。担当者へ引き継ぎます。しばらくお待ちください。";
export const OPERATOR_HANDOFF_REPLY =
  "確認のうえ、担当者からご案内します。しばらくお待ちください。";

export type MessageRole = "customer" | "assistant" | "operator";

export function createBackendId(): string {
  return crypto.randomUUID();
}
