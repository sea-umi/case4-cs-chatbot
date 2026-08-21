"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./Home.module.css";

type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  badge?: string;
  label: string;
  theme: string;
};

const products: Product[] = [
  { id: 1, name: "ボタニカル クレンジングオイル", category: "スキンケア", description: "植物オイルで、落とす時間までやさしく。", price: 3600, badge: "人気", label: "CLEANSING", theme: "sage" },
  { id: 2, name: "モイスチャーバランス ローション", category: "スキンケア", description: "乾燥しやすい肌に、みずみずしい保湿を。", price: 4200, label: "LOTION", theme: "blue" },
  { id: 3, name: "ハーバルハンドクリーム", category: "ボディケア", description: "手肌を包む、森林浴のような香り。", price: 2200, badge: "新着", label: "HAND CARE", theme: "amber" },
  { id: 4, name: "リペアヘアオイル", category: "ヘアケア", description: "毛先まで、軽やかにまとまる植物由来オイル。", price: 2800, label: "HAIR OIL", theme: "rose" },
  { id: 5, name: "アロマバスソーク 3種セット", category: "ボディケア", description: "一日の終わりを整える、香りのギフトセット。", price: 3900, label: "BATH SET", theme: "clay" },
  { id: 6, name: "デイリーケア トライアルセット", category: "セット", description: "BOTANICAをはじめる方へ、定番3アイテム。", price: 4800, badge: "おすすめ", label: "TRIAL SET", theme: "mint" },
];

const categories = ["すべて", "スキンケア", "ボディケア", "ヘアケア", "セット"];

export default function Home() {
  const [category, setCategory] = useState("すべて");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === "すべて" || product.category === category;
      const matchesSearch = !query || `${product.name} ${product.description}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const addToCart = (product: Product) => {
    setCart((current) => [...current, product]);
    setCartOpen(true);
  };

  const total = cart.reduce((sum, product) => sum + product.price, 0);

  return (
    <main className={styles.page}>
      <div className={styles.announcement}>5,000円以上のご注文で送料無料 / 平日15時までのご注文は最短翌日発送</div>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="BOTANICA ホーム">BOTANICA<span> botanical care</span></Link>
        <nav className={styles.nav} aria-label="メインナビゲーション">
          <a href="#products">商品一覧</a>
          <a href="#story">BOTANICAについて</a>
          <Link href="/customer">ご利用ガイド</Link>
        </nav>
        <div className={styles.headerActions}>
          <label className={styles.searchBox}>
            <span aria-hidden="true">⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="商品を検索" aria-label="商品を検索" />
          </label>
          <button className={styles.cartButton} onClick={() => setCartOpen(true)} aria-label={`カート ${cart.length}点`}>カート <span>{cart.length}</span></button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>NATURAL CARE FOR EVERYDAY</p>
          <h1>肌と暮らしに、<br /><em>植物の余白</em>を。</h1>
          <p className={styles.heroLead}>自然由来の成分と心地よい香りで、毎日のケアを自分らしく。BOTANICAは、肌にも環境にもやさしいケアを提案します。</p>
          <div className={styles.heroActions}><a className={styles.primaryAction} href="#products">商品を見る <span>→</span></a><Link className={styles.textAction} href="/customer">商品選びをチャットで相談 <span>↗</span></Link></div>
        </div>
        <div className={styles.heroVisual} aria-label="BOTANICA 春のケアコレクション">
          <div className={styles.heroCircle} />
          <div className={`${styles.heroBottle} ${styles.heroBottleLarge}`}><span>BOTANICA</span><b>FACE<br />OIL</b></div>
          <div className={`${styles.heroBottle} ${styles.heroBottleSmall}`}><span>BOTANICA</span><b>HAND<br />CREAM</b></div>
          <p>SPRING<br /><strong>CARE<br />COLLECTION</strong></p>
        </div>
      </section>

      <section className={styles.benefits} aria-label="BOTANICAの特徴">
        <div><span>01</span><strong>植物由来の処方</strong><p>毎日使いたくなる、シンプルな成分設計。</p></div>
        <div><span>02</span><strong>心地よい香り</strong><p>ケアの時間を、気持ちを整える時間に。</p></div>
        <div><span>03</span><strong>丁寧なサポート</strong><p>商品についての疑問はチャットでいつでも相談。</p></div>
      </section>

      <section className={styles.productsSection} id="products">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>SHOP ALL</p><h2>日々のケアを選ぶ</h2></div><p>肌や気分に合わせて、<br />お気に入りを見つけてください。</p></div>
        <div className={styles.categoryRow} role="tablist" aria-label="商品カテゴリ">
          {categories.map((item) => <button key={item} className={category === item ? styles.categoryActive : ""} onClick={() => setCategory(item)} role="tab" aria-selected={category === item}>{item}</button>)}
        </div>
        {visibleProducts.length > 0 ? <div className={styles.productGrid}>{visibleProducts.map((product) => <article className={styles.productCard} key={product.id}>
          <div className={`${styles.productVisual} ${styles[product.theme]}`}>{product.badge && <span className={styles.productBadge}>{product.badge}</span>}<div className={styles.productBottle}><span>BOTANICA</span><b>{product.label}</b></div></div>
          <div className={styles.productInfo}><div><p className={styles.productCategory}>{product.category}</p><h3>{product.name}</h3></div><strong>¥{product.price.toLocaleString()}</strong></div>
          <p className={styles.productDescription}>{product.description}</p><button className={styles.addButton} onClick={() => addToCart(product)}>カートに追加 <span>＋</span></button>
        </article>)}</div> : <p className={styles.emptyState}>該当する商品が見つかりませんでした。</p>}
      </section>

      <section className={styles.supportBand} id="story"><div><p className={styles.eyebrow}>NEED A LITTLE HELP?</p><h2>商品選びに迷ったら、<br />チャットでご相談ください。</h2><p>在庫・配送状況・返品についても、AIがすぐにご案内します。複雑なご相談はスタッフへおつなぎします。</p></div><Link href="/customer" className={styles.supportButton}>ショップサポートへ <span>→</span></Link></section>

      <footer className={styles.footer}><Link href="/" className={styles.logo}>BOTANICA<span> botanical care</span></Link><p>© 2026 BOTANICA. All rights reserved.</p><Link href="/operator" className={styles.staffLink}>スタッフ用管理画面</Link></footer>

      {cartOpen && <div className={styles.cartOverlay}><button className={styles.cartBackdrop} onClick={() => setCartOpen(false)} aria-label="カートを閉じる" /><aside className={styles.cartDrawer} role="dialog" aria-modal="true" aria-label="ショッピングカート">
        <div className={styles.cartHeader}><div><p className={styles.eyebrow}>YOUR CART</p><h2>ショッピングカート</h2></div><button onClick={() => setCartOpen(false)} aria-label="カートを閉じる">×</button></div>
        {cart.length === 0 ? <div className={styles.cartEmpty}><p>カートに商品がありません。</p><button onClick={() => setCartOpen(false)}>商品を見る</button></div> : <><div className={styles.cartItems}>{cart.map((product, index) => <div className={styles.cartItem} key={`${product.id}-${index}`}><div className={`${styles.cartThumb} ${styles[product.theme]}`}><span>BOTANICA</span></div><div><strong>{product.name}</strong><p>¥{product.price.toLocaleString()}</p></div></div>)}</div><div className={styles.cartTotal}><span>合計</span><strong>¥{total.toLocaleString()}</strong></div><button className={styles.checkoutButton}>購入手続きへ（デモ）</button><p className={styles.demoNote}>※課題用の簡易EC画面です。実際の決済は行いません。</p></>}
      </aside></div>}
    </main>
  );
}
