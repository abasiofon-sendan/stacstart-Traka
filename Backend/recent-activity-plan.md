# Recent Activity for Account Holder — Plan

## Top-Level Overview

Add a **recent activity feed** for authenticated account holders. A new `activity_logs` table will persistently record every meaningful business event as it happens. A single GET endpoint will return the most recent 20 entries for the authenticated account.

**Scope:**
- New `ActivityLog` SQLAlchemy model + migration via `Base.metadata.create_all`
- A shared helper `log_activity()` called inside the relevant service functions
- 8 activity types captured across transactions, debtors, and inventory
- New `GET /activity/recent` endpoint returning the latest N logs (default 20, configurable via `?limit=` query param)

**Not in scope:**
- Filtering by activity type or date range
- Retroactive backfilling of existing records
- Modifying auth/account creation flows

---

## Sub-Tasks

---

### Sub-Task 1 — Create the `ActivityLog` model and schema

**Status:** `[ ] pending`

**Intent:**
Define the persistent `activity_logs` table and the Pydantic response shape. This is the foundation everything else builds on.

**Expected Outcomes:**
- `app/activity/models.py` exists with an `ActivityLog` SQLAlchemy model
- `app/activity/schemas.py` exists with `ActivityLogResponse` Pydantic schema
- `Base.metadata.create_all` in `main.py` picks up the new model automatically

**Todo List:**
1. Create directory `app/activity/` with an empty `__init__.py`
2. Create `app/activity/models.py` with the `ActivityLog` model:
   - `id` — Integer primary key, auto-increment
   - `account_id` — String, ForeignKey to `accounts.id`, indexed
   - `activity_type` — String, not null (e.g. `"payment_received"`)
   - `title` — String, not null (short human-readable label)
   - `description` — String, nullable (longer detail)
   - `event_metadata` — JSON column (SQLite-compatible, nullable) for extra context
   - `created_at` — DateTime with timezone, server default now
3. Import `ActivityLog` in `main.py` alongside the other model imports so `create_all` registers the table
4. Create `app/activity/schemas.py` with `ActivityLogResponse`:
   - Fields: `id`, `account_id`, `activity_type`, `title`, `description`, `event_metadata`, `created_at`
   - `model_config = ConfigDict(from_attributes=True)`

**Relevant Context:**
- Existing model pattern: [`app/transactions/models.py`](app/transactions/models.py), [`app/notifications/models.py`](app/notifications/models.py)
- Existing schema pattern: [`app/notifications/schemas.py`](app/notifications/schemas.py)
- DB base & engine: [`app/db/database.py`](app/db/database.py)
- Model imports in main: [`main.py`](main.py)

---

### Sub-Task 2 — Create the `log_activity()` helper

**Status:** `[ ] pending`

**Intent:**
Provide a single reusable function that all service modules can call to write an activity record without duplicating boilerplate. Keeps activity-writing logic in one place.

**Expected Outcomes:**
- `app/activity/service.py` exports `log_activity(db, account_id, activity_type, title, description, metadata)`
- The function commits and returns the new `ActivityLog` instance
- All parameters except `description` and `metadata` are required; `description` and `metadata` default to `None`

**Todo List:**
1. Create `app/activity/service.py`
2. Implement `log_activity(db, account_id, activity_type, title, description=None, event_metadata=None)`:
   - Construct an `ActivityLog` instance
   - `db.add()`, `db.commit()`, `db.refresh()`, return the instance
3. Also implement `get_recent_activity(db, account_id, limit=20)`:
   - Query `ActivityLog` filtered by `account_id`, ordered by `created_at DESC`, limit to `limit`
   - Return a list of `ActivityLog` instances

**Relevant Context:**
- Analogous helper pattern: `create_notification()` in [`app/notifications/service.py`](app/notifications/service.py)

---

### Sub-Task 3 — Instrument service functions with `log_activity()` calls

**Status:** `[ ] pending`

**Intent:**
Wire `log_activity()` into each service function that triggers a meaningful business event. The log call happens after the primary action succeeds and the DB has been committed.

**Expected Outcomes:**
- Each of the 8 event types below generates an `activity_logs` row when the action succeeds
- No existing behaviour is changed — only additive `log_activity()` calls are inserted

**Activity types and trigger points:**

| activity_type | Trigger function | File |
|---|---|---|
| `payment_received` | `ingest_settlement()` after transaction created | `app/webhooks/service.py` |
| `sale_reconciled` | `reconcile_as_sale()` after commit | `app/transactions/service.py` |
| `debt_repayment_reconciled` | `reconcile_as_debt()` after commit | `app/transactions/service.py` |
| `debtor_created` | `create_debtor()` after commit | `app/debtors/service.py` |
| `debt_settled` | `settle_debt()` after commit | `app/debtors/service.py` |
| `product_created` | `create_product()` after commit | `app/inventory/service.py` |
| `product_updated` | `update_product()` after commit | `app/inventory/service.py` |
| `product_deleted` | `delete_product()` after commit | `app/inventory/service.py` |

**Suggested metadata payloads (JSON):**
- `payment_received`: `{ "amount": ..., "sender_name": ..., "reference": ... }`
- `sale_reconciled`: `{ "amount": ..., "profit": ..., "reference": ... }`
- `debt_repayment_reconciled`: `{ "amount": ..., "debtor_id": ..., "reference": ... }`
- `debtor_created`: `{ "debtor_id": ..., "debtor_name": ..., "amount": ... }`
- `debt_settled`: `{ "debtor_id": ..., "debtor_name": ... }`
- `product_created`: `{ "product_id": ..., "product_name": ... }`
- `product_updated`: `{ "product_id": ..., "product_name": ... }`
- `product_deleted`: `{ "product_id": ..., "product_name": ... }`

**Todo List:**
1. In `app/webhooks/service.py`: import `log_activity`; after the transaction is committed call `log_activity(db, account_id, "payment_received", ...)`
2. In `app/transactions/service.py`: import `log_activity`; add calls at end of `reconcile_as_sale()` and `reconcile_as_debt()`
3. In `app/debtors/service.py`: import `log_activity`; add calls at end of `create_debtor()` and `settle_debt()`
4. In `app/inventory/service.py`: import `log_activity`; add calls at end of `create_product()`, `update_product()`, `delete_product()`

**Relevant Context:**
- [`app/webhooks/service.py`](app/webhooks/service.py)
- [`app/transactions/service.py`](app/transactions/service.py)
- [`app/debtors/service.py`](app/debtors/service.py)
- [`app/inventory/service.py`](app/inventory/service.py)

---

### Sub-Task 4 — Create the `GET /activity/recent` endpoint

**Status:** `[ ] pending`

**Intent:**
Expose the activity feed to the frontend via a protected REST endpoint. Returns the 20 most recent activity log entries for the authenticated account holder.

**Expected Outcomes:**
- `GET /activity/recent` returns HTTP 200 with a JSON array of up to 20 `ActivityLogResponse` objects
- Endpoint is protected by the `get_current_account_id` dependency
- Router is registered in `main.py` under the `/activity` prefix

**Todo List:**
1. Create `app/activity/router.py`
2. Define `router = APIRouter(prefix="/activity", tags=["Activity"])`
3. Implement `GET /recent`:
   - Depends on `get_current_account_id` and `get_db`
   - Accepts optional `limit: int = Query(default=20, ge=1, le=100)` query parameter
   - Calls `get_recent_activity(db, account_id, limit=limit)`
   - Returns `List[ActivityLogResponse]`
4. In `main.py`, import the activity router and register it with `app.include_router(activity_router)`

**Relevant Context:**
- Existing router pattern: [`app/notifications/router.py`](app/notifications/router.py)
- Router registration: [`main.py`](main.py)
- Auth guard: `get_current_account_id` in [`app/accounts/service.py`](app/accounts/service.py)
