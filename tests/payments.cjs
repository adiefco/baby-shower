/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test loader */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const { createHmac } = require("node:crypto");

function load(path, imports, env = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, require: (id) => imports[id] ?? require(id),
    process: { env }, Buffer, console,
  });
  return exports;
}

function database({ itemFailure = false } = {}) {
  const state = { status: "pending", bought: 0 };
  const server = { from(table) {
    let change, head = false;
    const filters = [];
    const query = {
      select(_columns, options) { head = options?.head; return query; },
      update(value) { change = value; return query; },
      eq(key, value) { filters.push((row) => row[key] === value); return query; },
      neq(key, value) { filters.push((row) => row[key] !== value); return query; },
      lt(key, value) { filters.push((row) => row[key] < value); return query; },
      single() { return Promise.resolve({ data: { id: "gift", item_id: "item", amount: 50, status: state.status } }); },
      then(resolve, reject) {
        const row = table === "items"
          ? { id: "item", bought: state.bought }
          : { id: "gift", item_id: "item", status: state.status };
        if (table === "items" && change && itemFailure) {
          itemFailure = false;
          return Promise.resolve({ error: { message: "temporary failure" } }).then(resolve, reject);
        }
        if (change && filters.every((fn) => fn(row))) Object.assign(state, change);
        return Promise.resolve(head ? { count: state.status === "approved" ? 1 : 0 } : {}).then(resolve, reject);
      },
    };
    return query;
  }};
  const api = load("lib/db.ts", { "./supabase": { supabase: server }, "./supabase-server": { supabaseServer: server } });
  return { state, update: api.updateContributionStatus };
}

test("duplicate approvals count one gift and delayed rejection cannot undo it", async () => {
  const db = database();
  await db.update("gift", "approved", "payment", 50);
  await db.update("gift", "approved", "payment", 50);
  await db.update("gift", "rejected", "payment", 50);
  assert.equal(db.state.bought, 1);
  assert.equal(db.state.status, "approved");
});

test("retry repairs an item update that failed after approval", async () => {
  const db = database({ itemFailure: true });
  await assert.rejects(db.update("gift", "approved", "payment", 50));
  await db.update("gift", "approved", "payment", 50);
  assert.equal(db.state.bought, 1);
});

test("mismatched amount leaves gift pending", async () => {
  const db = database();
  await assert.rejects(db.update("gift", "approved", "payment", 1));
  assert.equal(db.state.status, "pending");
});

test("webhook rejects invalid signatures before querying payment and accepts signed payment", async () => {
  let fetched = 0, updated = 0;
  const api = load("app/api/webhooks/mercadopago/route.ts", {
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    mercadopago: {
      default: class {},
      Payment: class { async get() { fetched++; return { id: 123, external_reference: "gift", status: "approved", transaction_amount: 50, currency_id: "BRL" }; } },
    },
    "@/lib/db": { updateContributionStatus: async () => { updated++; } },
  }, { MP_ACCESS_TOKEN: "test", MP_WEBHOOK_SECRET: "secret" });
  const signature = createHmac("sha256", "secret").update("id:123;request-id:request;ts:1234;").digest("hex");
  const request = (sig) => ({
    headers: new Map([["x-signature", sig], ["x-request-id", "request"]]),
    nextUrl: new URL("https://example.com?data.id=123"),
    json: async () => ({ type: "payment", data: { id: 123 } }),
  });
  assert.equal((await api.POST(request("ts=1234,v1=" + "0".repeat(64)))).status, 401);
  assert.equal(fetched, 0);
  assert.equal((await api.POST(request("ts=1234,v1=" + signature))).status, 200);
  assert.equal(fetched, 1);
  assert.equal(updated, 1);
});
