function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).render("error", { message: "Admins only." });
    }
    next();
}

function blockAdmin (req, res, next) {
    if (req.session.user.role && req.session.user.role === "admin") {
        return res.redirect("/admin/dashboard");
    }
    next();
}

function attachUserToViews(req, res, next) {
    res.locals.currentUser = req.session.user || null;
    next();
}

export { requireLogin, requireAdmin, blockAdmin, attachUserToViews };