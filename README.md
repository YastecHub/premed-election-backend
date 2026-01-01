# premed-backend (Backend)

This folder contains the backend for the Pre-Med Election System.

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

## Seeding

On first start the server will seed:
- Demo candidates
- A `superadmin` account with password `password123`
- A set of `AccessCode` entries used for testing
