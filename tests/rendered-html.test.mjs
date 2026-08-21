import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the BOTANICA storefront entry page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>BOTANICA \| Natural Care<\/title>/i);
  assert.match(html, /肌と暮らしに、/);
  assert.match(html, /商品一覧/);
  assert.match(html, /href="\/customer"/);
  assert.match(html, /商品について相談/);
  assert.doesNotMatch(html, /スタッフ用管理画面/);
});

test("keeps the customer and operator routes in the project", async () => {
  const [customerPage, operatorPage, packageJson] = await Promise.all([
    readFile(new URL("../app/customer/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/operator/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(customerPage, /CustomerChat/);
  assert.match(operatorPage, /OperatorDashboard/);
  assert.match(packageJson, /"build": "vinext build"/);
  await access(new URL("../db/schema.sql", import.meta.url));
});
