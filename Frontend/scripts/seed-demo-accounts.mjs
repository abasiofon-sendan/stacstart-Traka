/**
 * Provisions the demo stores listed in `src/lib/countries.ts` against a running
 * backend, using the public signup endpoint (no backend code changes).
 *
 * Safe to re-run: signup 400s on a phone that already exists, which we treat as
 * "already provisioned" rather than an error. Every account is verified with a
 * login probe AND a /accounts/me read, so we never ship a demo row that can't
 * sign in or that was stored under the wrong country. Products still sitting at
 * quantity 0 are stocked — the backend seeds its starter catalogue with no
 * stock, and a demo row nobody can sell from is as dead as one that won't log
 * in. Never lowers stock, so re-runs leave a half-sold store alone.
 *
 *   node scripts/seed-demo-accounts.mjs                       # production
 *   API=http://localhost:8000 node scripts/seed-demo-accounts.mjs
 *
 * The config is the single source of truth — this imports it rather than
 * duplicating phone numbers. Node strips the TS types at load.
 */

import { allDemoAccounts, STARTER_SHELF_QTY } from "../src/lib/countries.ts";

const API = process.env.API ?? "https://stacstart-traka.onrender.com";
const PIN = process.env.DEMO_PIN ?? "123456";

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function get(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/**
 * Partial update: the backend's ProductUpdate is exclude_unset, so sending
 * only `quantity` leaves prices untouched (and out of the minor-unit
 * conversion that price fields go through).
 */
async function put(path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

const rows = allDemoAccounts();
console.log(`Provisioning ${rows.length} demo stores against ${API}\n`);

let created = 0;
let already = 0;
let broken = 0;

for (const { country, phone, store } of rows) {
  const tag = `${country.flag} ${country.code} ${store} (${phone})`;

  const signup = await post("/accounts/signup", {
    business_name: store,
    phone_number: phone,
    country: country.code,
    pin: PIN,
  });

  if (signup.status === 201) created += 1;
  else if (signup.status === 400) already += 1;
  else {
    console.log(`  ✗ ${tag} — signup ${signup.status} ${JSON.stringify(signup.body)}`);
    continue;
  }

  const login = await post("/accounts/login", { phone_number: phone, pin: PIN });
  if (login.status !== 200) {
    broken += 1;
    console.log(`  ✗ ${tag} — ${signup.status === 201 ? "created" : "already existed"}, login ${login.status}`);
    continue;
  }

  // Login doesn't return the country, so read it back — a demo row that
  // signs in but was stored as the wrong country would show the wrong
  // currency to whoever taps it.
  const me = await get("/accounts/me", login.body.access_token);
  const stored = me.body?.country;
  const countryOk = me.status === 200 && stored === country.code;

  // The backend seeds its starter catalogue at quantity 0, so a row can be
  // logged-in and correct but still unable to make a single sale. Stock the
  // zero-quantity products; anything already above 0 is left alone, so this
  // never lowers stock on a store someone has been selling from.
  const inv = await get("/inventory", login.body.access_token);
  const items = Array.isArray(inv.body) ? inv.body : [];
  const invOk = inv.status === 200;
  const outOfStock = items.filter((p) => (p.quantity ?? 0) === 0);
  let stocked = 0;
  for (const p of outOfStock) {
    const r = await put(`/inventory/${p.id}`, login.body.access_token, {
      quantity: STARTER_SHELF_QTY,
    });
    if (r.status === 200) stocked += 1;
  }

  const stockOk = invOk && stocked === outOfStock.length;
  const ok = countryOk && stockOk;
  if (!ok) broken += 1;
  console.log(
    `  ${ok ? "✓" : "✗"} ${tag} — ${signup.status === 201 ? "created" : "already existed"}, ` +
      `login ${login.status}, country ${stored ?? "?"}${countryOk ? "" : ` (expected ${country.code})`}` +
      `, stock ${
        invOk
          ? outOfStock.length
            ? `${stocked}/${outOfStock.length} topped up to ${STARTER_SHELF_QTY}`
            : `${items.length} sellable`
          : `read failed ${inv.status}`
      }`,
  );
}

console.log(`\n${created} created, ${already} already present, ${broken} unusable.`);
if (broken > 0) {
  console.log("Fix the ✗ rows — a judge tapping a dead, wrongly-currency'd or unstocked demo row loses the demo.");
}
