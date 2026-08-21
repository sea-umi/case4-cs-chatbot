export type ConversationStatus = "対応中" | "未対応" | "解決済み";
export type StatusFilter = "すべて" | ConversationStatus;
export type ConversationCategory = "すべて" | "配送について" | "返品・交換" | "商品について" | "お支払い" | "その他";

export type Message = {
  id: string;
  sender: "customer" | "operator" | "system";
  body: string;
  time: string;
  attachment?: string;
};

export type Conversation = {
  id: string;
  customerName: string;
  initials: string;
  email: string;
  subject: string;
  preview: string;
  category: Exclude<ConversationCategory, "すべて">;
  status: ConversationStatus;
  priority: "高" | "通常";
  updatedAt: string;
  messages: Message[];
  operatorMessageCount?: number;
};
