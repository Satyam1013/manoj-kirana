# Bahi Khata — Backend API

NestJS + MongoDB (Mongoose) backend for the **Bahi Khata** ledger app —
Manoj Kirana Dukan & Cold Storage. It mirrors the data model and
behaviour of the existing frontend (`dukan-ledger-app.html`) exactly:
customers, ledger entries, inventory, bills, receipts, cold storage
stores, IN/OUT entries and rent payments.

## 1. Setup

```bash
npm install
cp .env.example .env
# edit .env: set MONGODB_URI to your MongoDB connection string, and JWT_SECRET
npm run start:dev
```

The API runs on `http://localhost:3000/api` by default. You need a
running MongoDB instance (local `mongod`, Docker, or a MongoDB Atlas
cluster) — put its connection string in `MONGODB_URI`.

## 2. Authentication

There's no seeded user — create one first via `/api/auth/register`,
then log in to get a JWT. Every other endpoint requires
`Authorization: Bearer <token>`.

```
POST /api/auth/register   { username, password, businessName? }
POST /api/auth/login      { username, password }
```

Both return `{ accessToken, user }`.

## 3. Kirana Dukan endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/kirana/customers?search=` | list customers, each with computed `balance` |
| GET | `/api/kirana/customers/:id` | one customer + balance |
| POST | `/api/kirana/customers` | `{ name, village? }` |
| PATCH | `/api/kirana/customers/:id` | update name/village |
| DELETE | `/api/kirana/customers/:id` | only allowed when balance is 0 |
| GET | `/api/kirana/entries?customerId=` | ledger entries |
| POST | `/api/kirana/entries` | create a debit/credit entry. Provide `customerId` **or** `customerName` (find-or-create, like the app). Set `generateDoc: true` to auto-create a Bill (debit) or Receipt (credit) in the same call. |
| DELETE | `/api/kirana/entries/:id` | remove an entry |
| POST | `/api/kirana/entries/:id/generate-doc` | generate a bill/receipt for an existing entry that doesn't have one yet (mirrors `handleEntryDoc`) |
| GET | `/api/kirana/inventory` | stock list |
| POST | `/api/kirana/inventory` | `{ name, unit?, qty?, price? }` |
| PATCH | `/api/kirana/inventory/:id/adjust` | `{ mode: 'add'|'reduce', qty, price? }` |
| DELETE | `/api/kirana/inventory/:id` | remove item |
| GET | `/api/kirana/bills` / `/:id` | list / fetch bills |
| POST | `/api/kirana/bills` | `{ date?, customerName, village?, phone?, items:[{name,qty,rate}], autoLedger? }`. Auto-generates a sequential `INV-0001` bill number, optionally posts a matching debit ledger entry, and deducts sold quantities from inventory. |
| GET | `/api/kirana/receipts` / `/:id` | list / fetch receipts |
| POST | `/api/kirana/receipts` | `{ date?, customerName, village?, amount }`. Auto-generates a sequential `RCPT-0001` number. |

Customer balance = sum(debit amounts) − sum(credit amounts), exactly
like the frontend's `customerBalance()`.

## 4. Cold Storage endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/cold-storage/stores?search=` | list stores with IN/OUT counts |
| GET | `/api/cold-storage/stores/:id` | one store |
| POST | `/api/cold-storage/stores` | `{ name }` |
| DELETE | `/api/cold-storage/stores/:id` | also removes its entries/rent |
| GET | `/api/cold-storage/stores/:storeId/entries?mode=in|out&search=` | entries (omit `mode` for full history) |
| GET | `/api/cold-storage/stores/:storeId/lot-numbers` | distinct lot numbers for the OUT-entry lot picker |
| POST | `/api/cold-storage/entries/in` | `{ storeId, date?, time?, lotNumber, ownerName, materialName, sackCount?, weightKg?, lenderEntry?, vehicleNumber?, ratePerKg? }` |
| POST | `/api/cold-storage/entries/out` | `{ storeId, date?, outOwnerName, lotNumber? }` |
| DELETE | `/api/cold-storage/entries/:id` | remove an entry |
| GET | `/api/cold-storage/stores/:storeId/rent-payments?search=` | `{ rents, totalRent }` |
| POST | `/api/cold-storage/rent-payments` | `{ storeId, date?, amount }` |

## 5. Project structure

```
src/
  auth/            user schema, JWT strategy/guard, register+login
  kirana/          customers, ledger entries, inventory, bills, receipts
  cold-storage/    stores, in/out entries, rent payments
  common/          shared decorators (CurrentUser)
  app.module.ts
  main.ts
```

## 6. Notes on matching the frontend exactly

- IDs are MongoDB ObjectIds (24-char hex strings) instead of the
  frontend's client-generated `uid()` strings — everything else
  (field names, entry types, bill/receipt numbering scheme
  `INV-0001`/`RCPT-0001`, auto-ledger + inventory deduction on bill
  creation, delete-only-when-balanced rule for customers) is a direct
  port of the logic in `dukan-ledger-app.html`.
- Dates are kept as plain `yyyy-mm-dd` strings (as the frontend sends
  them via `<input type="date">`), not native `Date` objects, so
  sorting/filtering behaves the same way.
- PDF/Excel/WhatsApp generation currently lives client-side in the
  frontend (jsPDF/xlsx/wa.me link) and isn't duplicated here — the API
  returns the bill/receipt data the frontend already uses to build
  those documents. Ask if you'd like PDF/Excel generation moved
  server-side as well.
