/**
 * Provisions the demo stores listed in `src/lib/countries.ts` against a running
 * backend, using the public signup endpoint (no backend code changes).
 *
 * Safe to re-run: signup 400s on a phone that already exists, which we treat as
 * "already provisioned" rather than an error. Every account is verified with a
 * login probe AND a /accounts/me read, so we never ship a demo row that can't
 * sign in or that was stored under the wrong country.
 *
 *   node scripts/seed-demo-accounts.mjs                       # production
 *   API=http://localhost:8000 node scripts/seed-demo-accounts.mjs
 *
 * The config is the single source of truth — this imports it rather than
 * duplicating phone numbers. Node strips the TS types at load.
 */

import { allDemoAccounts } from "../src/lib/countries.ts";

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
  const ok = me.status === 200 && stored === country.code;
  if (!ok) broken += 1;
  console.log(
    `  ${ok ? "✓" : "✗"} ${tag} — ${signup.status === 201 ? "created" : "already existed"}, ` +
      `login ${login.status}, country ${stored ?? "?"}${ok ? "" : ` (expected ${country.code})`}`,
  );
}

console.log(`\n${created} created, ${already} already present, ${broken} unusable.`);
if (broken > 0) {
  console.log("Fix the ✗ rows in countries.ts — a judge tapping a dead or wrongly-currency'd demo row loses the demo.");
}
