import type { Conversation } from "./types";

export const sampleConversations: Conversation[] = [
  {
    id: "conv-1024", customerName: "田中 美咲", initials: "美咲", email: "misaki.tanaka@example.com", subject: "注文した商品がまだ届きません", preview: "お世話になっております。先週注文した商品について…", category: "配送について", status: "対応中", priority: "高", updatedAt: "10:42",
    messages: [
      { id: "msg-1", sender: "customer", body: "お世話になっております。6月12日に注文した商品が、まだ届いておりません。配送状況を確認していただけますでしょうか？", time: "今日 10:24" },
      { id: "msg-2", sender: "operator", body: "田中様、お問い合わせありがとうございます。ご不便をおかけしており申し訳ございません。すぐに配送状況を確認いたします。", time: "今日 10:31" },
      { id: "msg-3", sender: "customer", body: "ありがとうございます。注文番号は #JP-83921 です。", time: "今日 10:42" },
    ],
  },
  {
    id: "conv-1023", customerName: "佐藤 恒一", initials: "恒一", email: "koichi.sato@example.com", subject: "サイズ交換をお願いしたいです", preview: "届いた商品のサイズが合わなかったため、交換の手続きを…", category: "返品・交換", status: "未対応", priority: "通常", updatedAt: "09:18",
    messages: [{ id: "msg-4", sender: "customer", body: "届いた商品のサイズが合わなかったため、交換の手続きをお願いできますか？タグは付いたままです。", time: "今日 09:18" }],
  },
  {
    id: "conv-1022", customerName: "山本 直子", initials: "直子", email: "naoko.yamamoto@example.com", subject: "素材について教えてください", preview: "こちらの商品は自宅で洗濯できますか？素材のお手入れ方法を…", category: "商品について", status: "対応中", priority: "通常", updatedAt: "昨日",
    messages: [
      { id: "msg-5", sender: "customer", body: "こちらの商品は自宅で洗濯できますか？素材のお手入れ方法を教えてください。", time: "昨日 16:54" },
      { id: "msg-6", sender: "operator", body: "お問い合わせありがとうございます。洗濯表示を確認して、改めてご案内いたします。", time: "昨日 17:02" },
    ],
  },
  {
    id: "conv-1021", customerName: "鈴木 恒一郎", initials: "恒一", email: "koichiro.suzuki@example.com", subject: "支払い方法を変更したい", preview: "注文後に支払い方法を変更することは可能でしょうか。", category: "お支払い", status: "未対応", priority: "通常", updatedAt: "昨日",
    messages: [{ id: "msg-7", sender: "customer", body: "注文後に支払い方法を変更することは可能でしょうか。", time: "昨日 13:26" }],
  },
  {
    id: "conv-1019", customerName: "高橋 里奈", initials: "里奈", email: "rina.takahashi@example.com", subject: "領収書の発行について", preview: "先日の購入分の領収書を発行していただきたいです。", category: "お支払い", status: "解決済み", priority: "通常", updatedAt: "6/17",
    messages: [
      { id: "msg-8", sender: "customer", body: "先日の購入分の領収書を発行していただきたいです。", time: "6/17 11:08" },
      { id: "msg-9", sender: "operator", body: "領収書を発行しました。ご確認ください。", time: "6/17 11:30", attachment: "receipt_JP-83211.pdf" },
    ],
  },
];

export const categoryFilters = [
  { label: "すべて", count: 24 }, { label: "配送について", count: 8 }, { label: "返品・交換", count: 5 }, { label: "商品について", count: 6 }, { label: "お支払い", count: 3 }, { label: "その他", count: 2 },
] as const;
