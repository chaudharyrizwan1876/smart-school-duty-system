# 🏫 Smart School Duty Management System

An internal tool for schools to plan monthly teacher duty rosters (Assembly Duty, Break Duty, Gate Duty, etc.) and automatically remind assigned teachers on **WhatsApp**, 30 minutes before each duty starts — with zero manual work once the roster is set.

Built entirely on **Next.js 14** (App Router) — frontend and backend live in a single codebase, no separate API server.

---

## ✨ Features

- **Monthly duty roster builder** — assign one or more teachers to a duty type on any day of the month, with a "copy week 1 to all weeks" shortcut for recurring patterns.
- **Automatic WhatsApp reminders** — a smart scheduler wakes up only at the exact moment each notification is due (30 minutes before duty start), instead of polling every minute.
- **Read-only monthly schedule view** — color-coded by duty type, filterable by teacher name.
- **Notification log** — full history of every reminder sent, with delivery status.
- **Live dashboard** — WhatsApp connection status, today's duties, and at-a-glance stats.
- **Light & dark mode**, fully responsive UI.
- **No login required** — designed as a simple internal tool for a single school coordinator.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router, API Routes) |
| Language | TypeScript |
| Database | MongoDB + [Mongoose](https://mongoosejs.com/) |
| Messaging | [whatsapp-web.js](https://wwebjs.dev/) (WhatsApp Web automation) |
| Scheduling | [node-schedule](https://github.com/node-schedule/node-schedule) |
| Styling | Tailwind CSS |

---

## 📂 Project Structure

```
app/
  api/                   → REST API routes (teachers, duty-types, assignments, logs, whatsapp)
  page.tsx               → Dashboard
  teachers/page.tsx      → Teacher directory (CRUD)
  duty-types/page.tsx    → Duty type definitions (CRUD)
  assign/page.tsx        → Monthly duty assignment builder
  schedule/page.tsx      → Read-only monthly schedule view
  logs/page.tsx          → Notification history

lib/
  db.ts                  → MongoDB connection singleton
  whatsapp.ts             → WhatsApp Web client singleton
  scheduler.ts             → Smart notification scheduling logic

models/
  Teacher.ts, DutyType.ts, DutyAssignment.ts, NotificationLog.ts

components/
  Navbar.tsx, Logo.tsx, ThemeToggle.tsx, ConfirmDialog.tsx

instrumentation.ts        → Boots the WhatsApp client + scheduler once, on server start
```

---

## ⚙️ How the Smart Scheduler Works

Instead of a cron job that checks the database every minute, this system schedules **exact one-time jobs**:

1. On server start (and every midnight), `scheduleTodaysDuties()` runs.
2. It fetches every duty assignment for **today** that hasn't been notified yet.
3. For each one, it calculates `notifyTime = dutyStartTime − 30 minutes`.
4. If that time is still in the future, a precise one-time job is scheduled with `node-schedule`.
5. When the job fires, it sends a WhatsApp message to every assigned teacher and logs the result.

This means the process sits idle all day and only wakes up at the exact moments it needs to — no wasted CPU cycles.

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- A MongoDB database — either:
  - **Local**: [MongoDB Community Server](https://www.mongodb.com/try/download/community), or
  - **Cloud**: a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- Google Chrome or Microsoft Edge installed (used by WhatsApp Web automation)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/school-duty-system
```

For MongoDB Atlas, use your cluster's connection string instead. If your network blocks `mongodb+srv://` DNS lookups, use the standard (non-SRV) connection string format from Atlas instead.

If Chrome/Edge is installed in a non-default location, you can point to it explicitly:

```env
CHROME_PATH=C:\Path\To\chrome.exe
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Connect WhatsApp

On first run, a QR code will be printed **directly in the terminal**. Open WhatsApp on your phone → **Linked Devices** → **Link a Device** → scan the code.

The session is saved locally (`.wwebjs_auth/`), so you only need to scan it once — it persists across restarts.

---

## 🖱️ One-Click Startup (for non-technical users)

A ready-made `Start-School-Duty-System.bat` script is included. Double-clicking it will:

1. Start the server in the background.
2. Automatically open the app in your default browser.

To make it even easier, right-click the file → **Send to → Desktop (create shortcut)**, rename the shortcut, and hand that to whoever runs the system day-to-day.

---

## 📦 Production Build (optional)

For a more stable, long-running deployment:

```bash
npm run build
npm start
```

This trades hot-reload convenience for better performance and stability — recommended if the system will run unattended for weeks at a time.

---

## 🔌 API Reference

| Route | Methods | Description |
|---|---|---|
| `/api/teachers` | `GET`, `POST` | List / create teachers |
| `/api/teachers/[id]` | `PUT`, `DELETE` | Update / delete a teacher |
| `/api/duty-types` | `GET`, `POST` | List / create duty types |
| `/api/duty-types/[id]` | `PUT`, `DELETE` | Update / delete a duty type |
| `/api/assignments` | `GET`, `POST`, `DELETE` | List / create / remove duty assignments |
| `/api/assignments/bulk` | `POST` | Bulk-create assignments (e.g. copy a week's pattern) |
| `/api/whatsapp/status` | `GET` | Current WhatsApp connection status |
| `/api/whatsapp/test` | `POST` | Send a one-off test message — `{ "phone": "923001234567", "message": "..." }` |
| `/api/logs` | `GET` | Notification history |
| `/api/dashboard` | `GET` | Aggregated stats for the dashboard |

---

## 🖥️ Pages

| Route | Description |
|---|---|
| `/` | Dashboard — WhatsApp status, stats, today's duties |
| `/teachers` | Manage the teacher directory |
| `/duty-types` | Manage duty types (name, location, start time) |
| `/assign` | Assign duties per day for a chosen month |
| `/schedule` | Read-only monthly view, color-coded, filterable by teacher |
| `/logs` | Notification send history |

---

## ⚠️ Deployment Notes

This project relies on:
- A **persistent, always-running Node.js process** (to keep the WhatsApp session and scheduled jobs alive)
- **Headless Chrome** (for WhatsApp Web automation)

Because of this, it **cannot** run on serverless platforms like **Vercel or Netlify**, or on typical shared/cPanel hosting — both spin processes down between requests, which breaks the WhatsApp session and cancels scheduled reminders.

**What works instead:**
- A VPS with full root/SSH access (e.g. DigitalOcean, Hostinger VPS, Contabo, Hetzner)
- A dedicated always-on machine (e.g. a school office/lab PC) using the one-click `.bat` script above

---

## 🗺️ Roadmap Ideas

- [ ] Multi-school (SaaS) support with per-school login and data isolation
- [ ] Migrate to WhatsApp Business API for multi-tenant scale
- [ ] Subscription/billing for a hosted SaaS offering
- [ ] Teacher self-service portal (view own upcoming duties)

---

## 📄 License

Internal/private project — no license specified.
