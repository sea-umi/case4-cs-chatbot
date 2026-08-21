import type { Metadata } from "next";
import { OperatorDashboard } from "../../components/operator-dashboard/OperatorDashboard";

export const metadata: Metadata = {
  title: "Operator Console | Support Desk",
  description: "問い合わせの確認と返信を行うオペレーター管理画面",
};

export default function OperatorPage() {
  return <OperatorDashboard />;
}
