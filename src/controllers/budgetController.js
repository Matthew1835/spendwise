import prisma from "../prismaClient.js";

async function findOverlappingBudget(userId, categoryId, startDate, endDate, excludeBudgetId = null) {
    return prisma.budget.findFirst({
        where: {
            userId,
            categoryId,
            id: excludeBudgetId ? { not: excludeBudgetId } : undefined,
            OR: [
                { startDate: { lte: startDate }, endDate: { gte: startDate } },
                { startDate: { lte: endDate }, endDate: { gte: endDate } },
            ],
        },
    });
}

async function getSpending(userId, categoryId, startDate, endDate) {
    const [sumResult, count] = await Promise.all([
        prisma.transaction.aggregate({
            where: { userId, categoryId, transactionType: "expense", transactionDate: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        }),
        prisma.transaction.count({
            where: { userId, categoryId, transactionType: "expense", transactionDate: { gte: startDate, lte: endDate } }, 
        }),
    ]);
    return { spent: Number(sumResult._sum.amount ?? 0), count };
}

async function attachProgress(userId, budgets) {
    return Promise.all(
        budgets.map(async (b) => {
            const { spent, count } = await getSpending(userId, b.categoryId, b.startDate, b.endDate);
            const budgetAmount = Number(b.budgetAmount);
            const percentUsed = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 999) : 0;
            const alertThreshold = Number(b.alertThreshold ?? 0.8);
            
            return {
                ...b,
                spentAmount: spent,
                transactionCount: count,
                percentUsed,
                isOverThreshold: budgetAmount > 0 && spent / budgetAmount >= alertThreshold,
                isOverBudget: spent > budgetAmount,
            };
        })
    );
}

async function loadBudgetsPageData(req) {
    const userId = req.session.user.id;
    const [budgets, categories] = await Promise.all([
        prisma.budget.findMany({ where: { userId }, include: { category: true }, orderBy: { startDate: "desc" } }),
        prisma.category.findMany({ where: { categoryType: "expense" } }),
    ]);

    const budgetsWithProgress = await attachProgress(userId, budgets);

    const totals = budgetsWithProgress.reduce(
        (acc, b) => ({
            totalBudget: acc.totalBudget + Number(b.budgetAmount),
            totalSpent: acc.totalSpent + b.spentAmount,
        }),
        { totalBudget: 0, totalSpent: 0 }
    );
    totals.totalRemaining = totals.totalBudget - totals.totalSpent;
    totals.overallProgress = totals.totalBudget > 0 ? (totals.totalSpent / totals.totalBudget) * 100 : 0;

    return { budgets: budgetsWithProgress, categories, totals };
}

async function listBudgets(req, res) {
    const data = await loadBudgetsPageData(req);
    res.render("budgets", { ...data, error: null });
}

async function createBudget(req, res) {
    const userId = req.session.user.id;
    const { category_id, budget_amount, period_type, start_date, end_date, alert_threshold } = req.body;
    const categoryId = Number(category_id);
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const overlap = await findOverlappingBudget(userId, categoryId, startDate, endDate);
    
    if (overlap) {
        const [budgets, categories] = await Promise.all([
            prisma.budget.findMany({ where: { userId }, include: { category: true }, orderBy: { startDate: "desc" }, }),
            prisma.category.findMany({ where: { categoryType: "expense" } }),
        ]);
        return res.render("budgets", {
            budgets,
            categories,
            error: "A budget already exists for this category in the selected period.",
        });
    }

    await prisma.budget.create({
        data: {
            userId,
            categoryId,
            budgetAmount: budget_amount,
            periodType: period_type || "monthly",
            startDate,
            endDate,
            alertThreshold: alert_threshold || 0.8,
        },
    });

    res.redirect("/budgets");
}

async function updateBudget(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);
    const { category_id, budget_amount, period_type, start_date, end_date, alert_threshold } = req.body;
    const categoryId = Number(category_id);
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const overlap = await findOverlappingBudget(userId, categoryId, startDate, endDate, id);
    if (overlap) {
        return res.render("budgets", {
            ...(await loadBudgetsPageData(req)),
            error: "Another budget already exists for this category in the selected period.",
        });
    }

    const result = await prisma.budget.updateMany({
        where: { id, userId },
        data: {
            categoryId,
            budgetAmount: budget_amount,
            periodType: period_type || "monthly",
            startDate,
            endDate,
            alertThreshold: alert_threshold || 0.8,
        },
    });

    if (result.count === 0) {
        return res.status(404).render("error", { message: "Budget not found." });
    }

    res.redirect("/budgets");
}

async function deleteBudget(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);

    await prisma.budget.deleteMany({ where: { id, userId } });
    res.redirect("/budgets");
}

export { loadBudgetsPageData, listBudgets, createBudget, updateBudget, deleteBudget };