# premed-backend (Backend)

This folder contains the refactored backend for the Pre-Med Election System. It is functionally equivalent to the original `server/` codebase but reorganized into a layered structure (`routes/controllers/services/middlewares/utils`).

## Quick Start

1. Install dependencies and build

```powershell
cd premed-backend
npm install
npm run build
```

2. Start the server

```powershell
npm start
```

3. Development (hot reload)

```powershell
npm run dev
```

## Important Environment Variables

- `MONGODB_URI` — MongoDB connection string (default: `mongodb://localhost:27017/premed_election`)
- `PORT` — HTTP port (default: `5000`)
- `CLIENT_URL` — frontend origin for CORS (optional)
- `OCR_MAX_CONCURRENCY` — limit for concurrent OCR workers (optional)

## Notes on Architecture

- Routes are registered in `src/routes/index.ts`.
- Controllers live in `src/controllers/` and handle HTTP-level concerns.
- Business logic is in `src/services/` and preserves original side-effects (DB transactions, Socket.io emits, file cleanup).
- Centralized error handling is in `src/middlewares/errorHandler.ts`.
- OCR logic remains in `src/ocr.ts` and is protected by a simple semaphore to limit concurrency.
- Distributed locking uses a Mongo `Lock` collection (no Redis required). If you want Redis, you can reintroduce it and update `server.ts`.

## Seeding

On first start the server will seed:
- Demo candidates
- A `superadmin` account with password `password123`
- A set of `AccessCode` entries used for testing

## Running smoke tests (manual)

After starting the server, you can exercise a few endpoints with `curl` or PowerShell `Invoke-RestMethod`:

```powershell
# Health and candidates
curl.exe -sS http://localhost:5000/api/health; echo
curl.exe -sS http://localhost:5000/api/candidates; echo

# Admin login
curl.exe -sS -X POST -H "Content-Type: application/json" -d '{"username":"superadmin","password":"password123"}' http://localhost:5000/api/admin/login; echo
```

## Next steps I can help with

- Run automated smoke tests here (I need a running MongoDB and the `.env`) 
- Prepare a cleanup commit to remove the legacy `server/` folder after you confirm everything works
- Add CI steps to run tests/build before merging
# premed-backend

This folder is a safe, renamed copy of the original `server` backend for the Pre-Med Election System.

Purpose:
- Provide a non-breaking rename to `premed-backend` while preserving runtime behavior.
- Serve as the starting point for progressive refactoring into a layered architecture.

Notes:
 - Files under `src/` are identical to the original `server/src/` content to ensure zero behavioral changes.
- Update and run from this folder by installing dependencies and using the existing scripts.

Usage:

Install dependencies:

```powershell
cd premed-backend
npm install
```

Run in development:

```powershell
npm run dev
```
