import "dotenv/config";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { csrfSync } from "csrf-sync";
import path from "path";
import { fileURLToPath } from "url";

import { attachUserToViews } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PgSession = connectPgSimple(session);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Session
app.use(
    session({
        store: new PgSession({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        },
    })
);
app.use(attachUserToViews);

// CSRF protection
const { csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) => req.body._csrf,
});
app.use(csrfSynchronisedProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Routes
app.get("/", (req, res) => res.render("landing"));
app.use("/", authRoutes);
app.use("/transactions", transactionRoutes);

app.get("/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("dashboard");
});

app.use((req, res) => res.status(404).render("error", { message: "Page not found." }));

// Error handler
app.use((err, req, res, next) => {
    if (err && err.message === "invalid csrf token") {
        return res.status(403).render("error", { message: "Your session expired. Please go back and try again." });
    }
    console.error(err);
    res.status(500).render("error", { message: "Something went wrong on our end." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SpendWise runnign on https://localhost:${PORT}`));
