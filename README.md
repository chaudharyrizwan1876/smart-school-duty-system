# School Duty Management System

Next.js + MongoDB app for managing ~50 teachers' monthly duty roster with automatic WhatsApp reminders 30 minutes before each duty.

## Setup

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and set your MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/school-duty-system
```

## Run

```bash
npm run dev
```

On first start, a QR code prints in the terminal — scan it with WhatsApp (Linked Devices) to connect. The session is saved in `.wwebjs_auth/` so you won't need to scan again on future restarts.

## How scheduling works

- On server start, and again every midnight, the app loads today's duty assignments from MongoDB.
- For each one it schedules a one-time job (via `node-schedule`) firing 30 minutes before the duty's start time.
- When a job fires, it WhatsApp-messages every assigned teacher and marks the assignment as notified.
- No polling loop — the process is idle between jobs.

## Pages

- `/` — dashboard: WhatsApp status, stats, today's duties
- `/teachers` — manage teachers
- `/duty-types` — manage duty types (name, location, start time)
- `/assign` — assign duties per day for a chosen month; includes "copy week pattern to all weeks"
- `/schedule` — read-only monthly view, color-coded by duty type, filterable by teacher
- `/logs` — notification send history

## Notes

- Requires Google Chrome or Microsoft Edge installed (used headlessly by `whatsapp-web.js`/puppeteer). Set `CHROME_PATH` env var if it's in a non-default location.
- No authentication — intended for internal/trusted use only.
