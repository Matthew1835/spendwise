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

async function getSpentAmount(userId, categoryId, startDate, endDate) {
    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            categoryId,
            transactionType: "expense",
            transactionDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
}

async function listBudgets(req, res) {
    const userId = req.session.user.id;

    const [budgets, categories] = await Promise.all([
        prisma.budget.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { startDate: "desc" },
        }),
        prisma.category.findMany({ where: { categoryType: "expense" } }),
    ]);

    const budgetsWithProgress = await Promise.all(
        budgets.map(async (b) => {
            const spent = await getSpentAmount(userId, b.categoryId, b.startDate, b.endDate);
            const budgetAmount = Number(b.budgetAmount);
            const spentAmount = Number(spent);
            const percentUsed = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 999) : 0;
            const alertThreshold = Number(b.alertThreshold ?? 0.8);
            return {
                ...b,
                spentAmount,
                percentUsed,
                isOverThreshold: budgetAmount > 0 && spentAmount / budgetAmount >= alertThreshold,
                isOverBudget: spentAmount > budgetAmount, 
            };
        })
    );

    res.render("budgets", { 
        budgets: budgetsWithProgress, 
        categories, 
        error: null 
    });
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

async function deleteBudget(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);

    await prisma.budget.deleteMany({ where: { id, userId } });
    res.redirect("/budgets");
}

export { listBudgets, createBudget, deleteBudget };