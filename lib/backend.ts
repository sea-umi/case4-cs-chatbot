export const CONVERSATION_STATUS = "open" as const;
export const MAX_MESSAGE_LENGTH = 10_000;
export const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";
export const FAQ_CANDIDATE_LIMIT = 8;
export const ANTHROPIC_REQUEST_TIMEOUT_MS = 8_000;
export const SAFE_PLACEHOLDER_REPLY =
  "お問い合わせありがとうございます。現在はFAQ検索に未接続のため、自動回答を提供できません。担当者からの案内をお待ちください。";

export type MessageRole = "customer" | "assistant" | "operator";

export function createBackendId(): string {
  return crypto.randomUUID();
}
