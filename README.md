# SpendWise

A personal budgeting and expense-tracking app built with **Node.js**, **Express**, **PostgreSQL**, **Prisma**, and **EJS** — a full rewrite of an earlier PHP version of the same project, redone from the ground up with a modern stack, a custom design system, and a fair number of bugs from the original found and fixed along the way.

![Project Screenshot](./screenshots/landing.png)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://spendwise-jm98.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-blue)](https://github.com/Matthew1835/spendwise)

---

## Table of Contents

- [About](#about)
- [Pages](#pages)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Deployment](#deployment)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Additional Features](#additional-features)
- [Contact](#contact)
- [License](#license)

---

## About

- SpendWise started as a PHP app and was rewritten from scratch in Node.js/Express/Prisma as a personal portfolio project.
- It's a budgeting app: log income and expenses, set category budgets, track savings goals, and see it all summarized on a dashboard with real charts.
- The original PHP version had an AI/ML spending-forecast feature (a separate Python/scikit-learn service). It was deliberately removed in this rewrite rather than ported — this version has no AI features.
- Along the way, several real bugs in the original app's logic were found and fixed rather than carried over — see [Additional Features](#additional-features).

---

## Pages

- **Landing** — hero page with a spinning animated badge
- **Register / Login** — real-time username availability check, live password strength meter, reCAPTCHA
- **Dashboard** — monthly overview, income vs. expense chart, spending-by-category chart, recent transactions, quick-add popup
- **Transactions** — full history with filters (type, category, date range) and "load more" pagination
- **Budgets** — per-category spending limits with progress bars and a budget-vs-spending chart
- **Categories** — personal categories layered on top of admin-managed global ones
- **Savings Goals** — contribution tracking with a completion-date projection based on your own contribution history
- **Profile** — account settings, password change, CSV export, account deletion
- **Admin Panel** — separate from the regular app: manage users, global categories, and keyword auto-categorization rules (admins don't get a personal dashboard/transactions/budgets — they manage the app, not use it)

---

## Features

- Sign up / log in / log out with session-based auth (bcrypt password hashing, sessions stored in PostgreSQL)
- reCAPTCHA v2 on register and login
- Real-time username availability check and password strength meter on registration
- Transactions with keyword-based auto-categorization (rule matching, not AI)
- Personal categories in addition to admin-managed global ones, with quick-add directly from the transaction/budget forms
- Budgets with overlap prevention and spend-vs-threshold progress tracking
- Savings goals with a plain-arithmetic completion projection ("at your current pace, you'll hit this goal by...")
- CSV export (full transaction history and a monthly summary report)
- Admin panel for managing users, global categories, and keyword rules — kept structurally separate from the regular user experience
- CSRF protection, rate limiting on auth routes, and centralized error handling
- Custom two-mode design system: a flat, bold color-block style for landing/login/register, and a glassmorphism style for the logged-in app
- Fully responsive, mobile-first layout

---

## Tech Stack

- **Frontend:** EJS, vanilla JavaScript, Chart.js, Font Awesome, Google Fonts
- **Backend:** Node.js, Express 5
- **Database:** PostgreSQL, Prisma ORM 7
- **Authentication:** express-session, connect-pg-simple, bcrypt, Google reCAPTCHA v2
- **Validation & Security:** express-validator, csrf-sync, express-rate-limit
- **Environment:** dotenv
- **Development Tools:** Git, GitHub, npm, VS Code

---

## Installation

1. Clone & install
    ```bash
    git clone https://github.com/Matthew1835/spendwise
    cd spendwise
    npm install
    ```

2. Create a PostgreSQL database
    ```bash
    createdb spendwise
    ```

3. Configure environment
    ```bash
    cp .env.example .env
    ```
    Edit `.env`:
    ```
    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/spendwise?schema=public"
    SESSION_SECRET="some-long-random-string"
    RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
    RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
    PORT=3000
    ```
    (Register a free reCAPTCHA v2 checkbox key at [google.com/recaptcha/admin](https://google.com/recaptcha/admin).)

4. Set up the database
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```

5. (Optional) Seed demo data — ~6 months of realistic transactions, budgets, and savings goals, plus a demo admin account:
    ```bash
    npm run db:seed
    ```
    Log in with `demo` / `Demo1234!` (regular user) or `admin` / `Demo1234!` (admin). This wipes existing data — only run it against a fresh database.

6. Start the server
    ```bash
    npm run dev     # development (nodemon)
    npm start       # production
    ```

Visit: http://localhost:3000

---

## Deployment

### Neon (database) + Render (hosting)

**1. Create the database on Neon**
1. Sign up at [neon.tech](https://neon.tech) → New Project.
2. On the project dashboard, click **Connect** and copy the connection strings:
   - The **pooled** one (hostname contains `-pooler`) — this is your `DATABASE_URL`.
3. (Optional) You can seed demo data via your local terminal after running `npx prisma generate` and `npx prisma migrate deploy`
   by running `npm run db:seed`. This wipes existing data, so only do this once, before real users sign up.

**2. Deploy the app on Render**
1. Push your project to GitHub.
2. Render dashboard → New → Web Service → connect your repo.
3. Build command:
   ```
   npm install && npx prisma generate && npm run prisma:deploy
   ```
4. Start command: `npm start`
5. Environment variables (Render dashboard → Environment):
   - `DATABASE_URL` — the pooled Neon connection string
   - `SESSION_SECRET` — a fresh long random value (e.g. `openssl rand -base64 32`), not whatever you used locally
   - `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
   - `NODE_ENV=production` — this flips the session cookie to `secure: true`, required once you're on HTTPS (Render always serves HTTPS)
6. Deploy. Render will run the build command (installs deps, generates the Prisma client, applies migrations) and then start the app.

**3. After first deploy**
1. Add your Render domain (e.g. `your-app.onrender.com`, or your custom domain) to the allowed domains list in the [reCAPTCHA admin console](https://google.com/recaptcha/admin) — the widget silently fails on unregistered domains.
2. Verify: register an account, log a transaction, check a chart renders, try a CSV export.

**A Neon-specific gotcha to know about:** Neon's free tier scales compute to zero after 5 minutes of inactivity. The first request after idling triggers a "cold start" (typically under a few seconds, but noticeable) while it wakes back up — this is normal, not a bug, and only affects the first request after a quiet period.

---

## Usage

1. Register an account (or log in with the seeded demo account).
2. Land on the dashboard — see your monthly overview, charts, and recent activity.
3. Log transactions; leave the category blank to let keyword auto-categorization guess it, or pick one (including a category you create yourself).
4. Set up budgets per category and watch the progress bars as you spend.
5. Create savings goals and log contributions — the app projects when you'll hit each goal at your current pace.
6. Export your data as CSV any time from the Profile page.
7. (Admin accounts) Manage users, global categories, and keyword rules from the Admin panel.

---

## Screenshots

> Add your own screenshots to the `screenshots/` folder and update the paths below.

| Landing | Register | Login |
|---------|----------|-------|
| ![Landing](./screenshots/landing.png) | ![Register](./screenshots/register.png) | ![Login](./screenshots/login.png) |

| Dashboard | Transactions | Budgets |
|-----------|--------------|---------|
| ![Dashboard](./screenshots/dashboard.png) | ![Transactions](./screenshots/transactions.png) | ![Budgets](./screenshots/budgets.png) |

| Categories | Savings Goals | Profile |
|------------|---------------|---------|
| ![Categories](./screenshots/categories.png) | ![Savings Goals](./screenshots/savings.png) | ![Profile](./screenshots/profile.png) |

| Admin Panel | Mobile View |
|-------------|-------------|
| ![Admin Panel](./screenshots/admin-panel.png) | ![Mobile View](./screenshots/mobile.png) |

---

## Project Structure

```
spendwise/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
│   ├── css/
│   │   ├── tokens.css        # shared design tokens (colors, type, spacing)
│   │   ├── auth.css          # landing/login/register style
│   │   └── app.css           # glassmorphism app-shell style
│   └── js/                   # per-feature client scripts (modals, charts, forms)
├── src/
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimit.js
│   │   ├── recaptcha.js
│   │   └── validate.js
│   ├── routes/
│   ├── services/
│   │   ├── categorization.js  # keyword-based auto-categorization
│   │   └── recaptcha.js
│   ├── validators/
│   ├── views/
│   │   ├── admin/
│   │   ├── partials/
│   │   └── *.ejs
│   ├── prismaClient.js
│   └── server.js
├── prisma.config.ts
└── package.json
```

---

## Additional Features

### Personal + global categories
Categories are either global (admin-managed, visible to everyone) or personal (created by a user, visible only to them). Both show up together in the same dropdown, and new categories can be created without leaving the transaction/budget form via a quick-add popup.

---

## Contact

**Myat Thuta (Matthew)**
- Portfolio: *https://matthew1835.github.io/my-portfolio/*
- LinkedIn: *https://www.linkedin.com/in/myat-thuta-26051a273/*
- Email: *myatthuta1835@gmail.com*
- GitHub: [@Matthew1835](https://github.com/Matthew1835)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

*⭐ If you found this project interesting, feel free to star the repo!*
