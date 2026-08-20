import prisma from "../prismaClient.js";

function monthBounds(monthsAgo) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59);
    return { start, end, label: start.toLocaleDateString("en-US", { month: "short" }) };
}

async function sumForMonth(userId, type, start, end) {
    const result = await prisma.transaction.aggregate({
        where: { userId, transactionType: type, transactionDate: { gte: start, lte: end }, },
        _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
}

async function savingsForMonth(userId, start, end) {
    const result = await prisma.savingsContribution.aggregate({
        where: { userId, contributionDate: { gte: start, lte: end } },
        _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
}

export async function showDashboard(req, res) {
    const userId = req.session.user.id;
    const now = new Date();
    const monthLabel = now.toLocaleDateString("en-US", { month: "long" });

    const months = [ 5, 4, 3, 2, 1, 0 ].map(monthBounds);

    const monthlyData = await Promise.all(
        months.map(async (m) => {
            const [income, expense, savings] = await Promise.all([
                sumForMonth(userId, "income", m.start, m.end),
                sumForMonth(userId, "expense", m.start, m.end),
                savingsForMonth(userId, m.start, m.end),
            ]);
            return { label: m.label, income, expense, savings, net: income - expense };
        })
    );

    const currentMonth = monthlyData[monthlyData.length - 1];
    const totalIncome = currentMonth.income;
    const totalExpense = currentMonth.expense;
    const netBalance = totalIncome - totalExpense;
    const availableBalance = netBalance - currentMonth.savings;

    const { start: monthStart, end: monthEnd } = monthBounds(0);

    const [categoryBreakdown, recentTransactions, allCategories] = await Promise.all([
        prisma.transaction.groupBy({
            by: ["categoryId"],
            where: { userId, transactionType: "expense", transactionDate: { gte: monthStart, lte: monthEnd } },
            _sum: { amount: true },
        }),
        prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { transactionDate: "desc" },
            take: 10,
        }),
        prisma.category.findMany(),
    ]);

    const categoryIds = categoryBreakdown.map((c) => c.categoryId).filter(Boolean);
    const categories = categoryIds.length
        ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
        : [];
    const categoryMap = new Map(categories.map((c) => [c.id, c.categoryName]));

    const expenseByCategory = categoryBreakdown.map((c) => ({
        name: categoryMap.get(c.categoryId) || "Uncategorized",
        amount: Number(c._sum.amount),
    }));

    res.render("dashboard", {
        monthLabel,
        stats: { totalIncome, totalExpense, netBalance, availableBalance },
        trend: monthlyData,
        expenseByCategory,
        recentTransactions,
        categories: allCategories,
    })
}