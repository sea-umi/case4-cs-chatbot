import type { Metadata } from "next";
import Link from "next/link";
import styles from "./Home.module.css";

export const metadata: Metadata = {
  title: "CSチャットボット",
  description: "ECサイト向けカスタマーサポートチャットボット",
};

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.badge}>BOTANICA / CUSTOMER SUPPORT</div>
        <h1>お問い合わせ対応を、<br /><span>AIと人</span>の連携で整える。</h1>
        <p className={styles.lead}>
          よくある質問にはAIがすぐに回答し、複雑な問い合わせはオペレーターへ引き継ぎます。
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/customer">顧客チャットを試す</Link>
          <Link className={styles.secondaryAction} href="/operator">管理画面を開く</Link>
        </div>
      </section>

      <section className={styles.metrics} aria-label="案件の前提">
        <div><strong>約500件</strong><span>月間問い合わせ</span></div>
        <div><strong>1〜2日</strong><span>現在の返信時間</span></div>
        <div><strong>2名</strong><span>オペレーター体制</span></div>
        <div><strong>10〜18時</strong><span>有人対応時間</span></div>
      </section>

      <section className={styles.overview}>
        <div>
          <p className={styles.sectionLabel}>MVP SCOPE</p>
          <h2>まずは、返信の遅れによる離脱を減らす。</h2>
          <p>FAQベースの自動回答、有人対応への引き継ぎ、会話履歴の保存から開始します。</p>
        </div>
        <div className={styles.flow}>
          <span>顧客</span><b>→</b><span>AI回答</span><b>→</b><span>オペレーター</span>
        </div>
      </section>
    </main>
  );
}
