/**
 * Gives a new store a shelf to sell from, in the country's own products and
 * prices, so a merchant lands on a working ledger instead of an empty table.
 *
 * Two jobs, both once per account+country (flag in localStorage), both on
 * first open only:
 *
 *  - empty inventory → create the country's starter catalogue;
 *  - inventory the backend seeded at quantity 0 → give it opening stock,
 *    because a shelf nobody can sell from is no better than an empty one.
 *
 * Anything already in stock means someone is running the shop for real, so
 * they are left alone — which is also why a merchant who deliberately cleared
 * the catalogue never gets it back.
 */

import { activeCountry } from "@/store/country-store";
import { inventoryApi, type ProductResponse } from "@/lib/endpoints";
import { STARTER_SHELF_QTY } from "@/lib/countries";
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

/**
 * @param items The current inventory. `undefined` means the query hasn't
 * resolved (or failed) — read as "not yet": a failed fetch must never look
 * like an empty shop and trigger a second catalogue.
 */
export async function seedCountryInventory(
  items: ProductResponse[] | undefined,
): Promise<void> {
  if (!items) return;

  const account = activeAccountKey();
  if (!account) return;

  const country = activeCountry();
  const key = seedKey(account, country.code);
  if (localStorage.getItem(key)) return;

  // Mark before creating: a half-finished seed must not double up on reload.
  localStorage.setItem(key, "1");

  if (items.length === 0) {
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
    return;
  }

  // The backend seeds its starter catalogue with quantity 0, so a brand-new
  // merchant would open on products they cannot sell. Top them up on first
  // open. Once the backend seeds real quantities this stops firing by itself —
  // nothing sits at zero, so there is nothing to top up.
  const outOfStock = items.filter((p) => p.quantity === 0);
  if (outOfStock.length !== items.length) return;

  const stocked = await Promise.allSettled(
    outOfStock.map((p) => inventoryApi.update(p.id, { quantity: STARTER_SHELF_QTY })),
  );

  const ok = stocked.filter((s) => s.status === "fulfilled").length;
  if (ok > 0) {
    notify(
      "Starter Shelf Stocked",
      `${ok} products given opening stock so you can start selling.`,
    );
  }
}
