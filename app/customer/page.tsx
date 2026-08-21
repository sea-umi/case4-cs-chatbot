import type { Metadata } from "next";
import CustomerChat from "@/components/customer-chat/CustomerChat";

export const metadata: Metadata = {
  title: "カスタマーサポート | ECサイト",
  description: "お買い物に関するご質問をチャットで承ります。",
};

export default function CustomerPage() {
  return (
    <main>
      <CustomerChat />
    </main>
  );
}
