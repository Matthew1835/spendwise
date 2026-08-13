import bcrypt from "bcrypt";
import prisma from "../prismaClient.js";

const SALT_ROUNDS = 12;

const emptyMessages = {
    profileError: null,
    profileSuccess: null,
    passwordError: null,
    profileSuccess: null,
    deleteError: null,
};

function renderProfile (res, user, overrides = {}) {
    res.render("profile", { user, ...emptyMessages, ...overrides });
}

async function showProfile(req, res) {
    const userId = req.session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    renderProfile(res, user);
}

async function updateProfile(req, res) {
    const userId = req.session.user.id;
    const { first_name, last_name, email, monthly_budget } = req.body;

    const conflict = await prisma.user.findFirst({ where: { email, id: { not: userId } } });
    if (conflict) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        return renderProfile(res, user, { profileError: "Email address is already in use." });
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            firstName: first_name,
            lastName: last_name,
            email,
            monthlyBudget: monthly_budget,
        },
    });

    req.session.user.firstName = updated.firstName;
    renderProfile(res, updated, { profileSuccess: "Profile updated successfully." });
}

async function changePassword(req, res) {
    const userId = req.session.user.id;
    const { current_password, new_password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const match = await bcrypt.compare(current_password, user.passwordHash);

    if (!match) {
        return renderProfile(res, user, { passwordError: "Current password is incorrect." });
    }

    const newHash = await bcrypt.hash(new_password, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

    renderProfile(res, user, { passwordSuccess: "Password changed successfully." });
}

async function deleteAccount(req, res) {
    const userId = req.session.user.id;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
        return renderProfile(res, user, { deleteError: "Incorrect password." });
    }

    await prisma.user.delete({ where: { id: userId } });

    req.session.destroy(() => res.redirect("/login"));
}

export { emptyMessages, showProfile, updateProfile, changePassword, deleteAccount };