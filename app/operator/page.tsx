import type { Metadata } from "next";
import { LiveOperatorDashboard } from "../../components/operator-dashboard/LiveOperatorDashboard";

export const metadata: Metadata = {
  title: "Operator Console | Support Desk",
  description: "問い合わせの確認と返信を行うオペレーター管理画面",
};

export default function OperatorPage() {
  return <LiveOperatorDashboard />;
}
