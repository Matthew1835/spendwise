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

function attachUserToViews(req, res, next) {
    res.locals.currentUser = req.session.user || null;
    next();
}

export { requireLogin, requireAdmin, attachUserToViews };