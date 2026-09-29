/**
 * Seeds a new store with a starter catalogue in the country's own products and
 * prices, so a merchant lands on a working ledger instead of an empty table.
 *
 * Runs once per account+country (flag in localStorage) and only when the
 * inventory is genuinely empty — a merchant who deleted everything on purpose
 * never gets their catalogue back.
 */

import { activeCountry } from "@/store/country-store";
import { inventoryApi } from "@/lib/endpoints";
import { notify } from "@/store/notify";

const seedKey = (account: string, country: string) => `traka_seeded_${account}_${country}`;

function activeAccountKey(): string | null {
  try {
    const stored = localStorage.getItem("traka_user");
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user.virtualAccountNumber ?? user.phone ?? null;
  } catch {
    return null;
  }
}

export async function seedCountryInventory(inventoryLength: number): Promise<void> {
  if (inventoryLength > 0) return;

  const country = activeCountry();
  const account = activeAccountKey();
  if (!account) return;

  const key = seedKey(account, country.code);
  if (localStorage.getItem(key)) return;

  // Mark before creating: a half-finished seed must not double up on reload.
  localStorage.setItem(key, "1");

  const created = await Promise.allSettled(
    country.seedProducts.map((p) =>
      inventoryApi.create({
        name: p.name,
        cost_price: p.cost,
        selling_price: p.price,
        quantity: p.qty,
        low_stock_threshold: 3,
      }),
    ),
  );

  const ok = created.filter((c) => c.status === "fulfilled").length;
  if (ok > 0) {
    notify(
      "Starter Catalogue Added",
      `${ok} ${country.name} products loaded at local prices.`,
    );
  }
}
