import bcrypt from "bcrypt";
import prisma from "../prismaClient.js";

const SALT_ROUNDS = 12;

async function showRegister(req, res) {
    res.render("register", { error: null, formData: {} });
}

async function register(req, res) {
    const { username, email, password, first_name, last_name, monthly_budget, currency } = req.body;

    const existing = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
    });
    if (existing) {
        return res.render("register", {
            error: "Username or email already in use.",
            formData: req.body,
        });
    }
    
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
            firstName: first_name,
            lastName: last_name,
            monthlyBudget: monthly_budget ? Number(monthly_budget) : null,
            currency: currency || "USD",
        },
    });

    req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
    };

    res.redirect("/dashboard");
}

async function showLogin(req, res) {
    res.render("login", { error: null });
}

async function login(req, res) {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({
        where: { OR: [{ username }, { email: username }] },
    });

    if (!user || !user.isActive) {
        return res.render("login", { error: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        return res.render("login", { error: "Invalid credentials." });
    }

    req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
    };

    if (user.role === "admin") {
        return res.redirect("/admin/dashboard");
    }
    res.redirect("/dashboard");
}

function logout(req, res) {
    req.session.destroy(() => {
        res.redirect("/login");
    });
}

export { showRegister, register, showLogin, login, logout };