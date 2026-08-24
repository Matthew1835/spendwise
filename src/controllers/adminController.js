import prisma from "../prismaClient.js";

// Dashboard

async function dashboard(req, res) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [ totalUsers, activeUserIds, totalTransactions, totalCategories, totalKeywords, 
        recentRegistrations, recentActivity, last7DaysUsers, ] = await Promise.all([
        prisma.user.count(),
        prisma.transaction.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            distinct: ["userId"], // no duplicates
            select: { userId: true },
        }),
        prisma.transaction.count(),
        prisma.category.count(),
        prisma.categorizationRule.count({ where: { isActive: true } }),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { id: true, username: true, email: true, createdAt: true },
        }),
        prisma.user.findMany({ 
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }, 
        }),
    ]);

    const signupTrend = Array.from({ length: 7 }, (_, i) => {
        const day = new Date();
        day.setDate(day.getDate() - (6 - i));
        const dayKey = day.toISOString().slice(0, 10);
        const count = last7DaysUsers.filter((u) => u.createdAt.toISOString().slice(0, 10) === dayKey).length;
        return { label: day.toLocaleDateString("en-US", { weekday: "short" }), count };
    });

    res.render("admin/dashboard", {
        stats: {
            totalUsers,
            activeUsers: activeUserIds.length,
            totalTransactions,
            totalCategories,
            totalKeywords,
            recentRegistrations,
        },
        recentActivity,
        signupTrend,
    });
}

// Users

function buildUserWhere(query) {
    const { search, role, is_active } = query;
    const where = {};
    if (search) {
        where.OR = [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
        ];
    }
    if (role) where.role = role;
    if (is_active !== undefined && is_active !== "") where.isActive = is_active === "true";
    return where;
}

async function loadUsersWithStats(query = {}) {
    const users = await prisma.user.findMany({
        where: buildUserWhere(query),
        orderBy: { createdAt: "desc" },
        include: { 
            _count: { select: { transactions: true } }, 
            transactions: { select: { amount: true, transactionType: true } },
        },
    });

    return users.map((u) => {
        const totalExpenses = u.transactions.filter((t) => t.transactionType === "expense").reduce((s, t) => s + Number(t.amount), 0);
        const totalIncome = u.transactions.filter((t) => t.transactionType === "income").reduce((s, t) => s + Number(t.amount), 0);
        const { transactions, _count, ...rest } = u;
        return { ...rest, transactionCount: _count.transactions, totalExpenses, totalIncome };
    });
}

async function listUsers(req, res) {
    const users = await loadUsersWithStats(req.query);
    res.render("admin/users", { users, filters: req.query, error: null });
}

async function toggleUserStatus(req, res) {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
        await prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
        });
    }
    res.redirect("/admin/users");
}

async function deleteUser(req, res) {
    const id = Number(req.params.id);
    if (id === req.session.user.id) {
        return res.render("admin/users", {
            users: await loadUsersWithStats({}),
            filters: {},
            error: "Cannot delete your own account.",
        });
    }
    await prisma.user.delete({ where: { id } });
    res.redirect("/admin/users");
}

// Categories

async function loadCategoriesWithUsage() {
    const categories = await prisma.category.findMany({
        where: { userId: null },
        include: { _count: { select: { transactions: true } } },
        orderBy: [{ categoryType: "asc" }, { categoryName: "asc" }],
    });
    return categories.map((c) => ({ ...c, usageCount: c._count.transactions, }));
}

async function listCategories(req, res) {
    res.render("admin/categories", { categories: await loadCategoriesWithUsage(), error: null, });
}

async function createCategory(req, res) {
    const { category_name, category_type, description, color_code, icon } = req.body;
    await prisma.category.create({
        data: {
            categoryName: category_name,
            categoryType: category_type,
            description,
            colorCode: color_code || '#007bff',
            icon: icon || 'fas fa-circle',
        },
    });
    res.redirect("/admin/categories");
}

async function updateCategory(req, res){
    const id = Number(req.params.id);
    const { category_name, category_type, description, color_code, icon } = req.body;
    const result = await prisma.category.updateMany({
        where: { id, userId: null },
        data: {
            categoryName: category_name,
            categoryType: category_type,
            description,
            colorCode: color_code,
            icon,
        },
    });
    if (result.count === 0) {
        return res.status(404).render("error", { message: "Category not found." });
    }
    res.redirect("/admin/categories");
}

async function deleteCategory(req, res) {
    const id = Number(req.params.id);
    const usageCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (usageCount > 0) {
        return res.render("admin/categories", {
            categories: await loadCategoriesWithUsage(),
            error: "Cannot delete a category that is in use.",
        });
    }
    await prisma.category.deleteMany({ where: { id, userId: null } });
    res.redirect("/admin/categories");
}

// Keyword rules

async function loadKeywordsAndCategories(where = {}) {
    const [keywords, categories] = await Promise.all([
        prisma.categorizationRule.findMany({
            where,
            include: { category: true },
            orderBy: [{ priority: "desc" }, { usageCount: "desc" }],
        }),
        prisma.category.findMany(),
    ]);
    return { keywords, categories };
}

async function listKeywords(req, res) {
    const { search, category_id, is_active } = req.query;

    const where = {};
    if (search) where.keywords = { contains: search, mode: "insensitive" };
    if (category_id) where.categoryId = Number(category_id);
    if (is_active !== undefined && is_active !== "") where.isActive = is_active === "true";

    const { keywords, categories } = await loadKeywordsAndCategories(where);
    res.render("admin/keywords", { 
        keywords, 
        categories, 
        filters: req.query, 
        error: null 
    });
}

async function createKeyword(req, res) {
    const { keyword, category_id, priority, rule_type } = req.body;
    await prisma.categorizationRule.create({
        data: {
            keyword: keyword.toLowerCase(),
            categoryId: Number(category_id),
            priority: priority ? Number(priority) : 1,
            ruleType: rule_type || "contains",
        },
    });
    res.redirect("/admin/keywords");
}

async function updateKeyword(req, res) {
    const id = Number(req.params.id);
    const { keyword, category_id, priority, rule_type } = req.body;
    await prisma.categorizationRule.update({
        where: { id },
        data: {
            keyword: keyword.toLowerCase(),
            categoryId: Number(category_id),
            priority: Number(priority),
            ruleType: rule_type,
        },
    });
    res.redirect("/admin/keywords");
}

async function toggleKeywordStatus(req, res) {
    const id = Number(req.params.id);
    const rule = await prisma.categorizationRule.findUnique({ where: { id } });
    if (rule) {
        await prisma.categorizationRule.update({
            where: { id },
            data: { isActive: !rule.isActive },
        });
    }
    res.redirect("/admin/keywords");
}

async function deleteKeyword(req, res) {
    const id = Number(req.params.id);
    await prisma.categorizationRule.delete({ where: { id } });
    res.redirect("/admin/keywords");
}

export {
    dashboard,
    loadUsersWithStats, listUsers, toggleUserStatus, deleteUser,
    loadCategoriesWithUsage, listCategories, createCategory, updateCategory, deleteCategory,
    loadKeywordsAndCategories, listKeywords, createKeyword, updateKeyword, toggleKeywordStatus, deleteKeyword,
}