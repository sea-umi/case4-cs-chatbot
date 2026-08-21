export const CONVERSATION_STATUS = "open" as const;
export const MAX_MESSAGE_LENGTH = 10_000;
export const SAFE_PLACEHOLDER_REPLY =
  "お問い合わせありがとうございます。現在はFAQ検索に未接続のため、自動回答を提供できません。担当者からの案内をお待ちください。";

export type MessageRole = "customer" | "assistant";

export function createBackendId(): string {
  return crypto.randomUUID();
}
