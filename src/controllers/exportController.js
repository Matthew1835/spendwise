import { stringify } from "csv-stringify";
import prisma from "../prismaClient.js";

function sendCsv(res, filename, rows) {
    const csv = stringify(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\uFEFF" + csv);
}

async function exportTransactions(req, res) {
    const userId = req.session.user.id;

    const transactions = await prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { transactionDate: "desc" },
    });

    const rows = [
        ["Date", "Type", "Category", "Amount", "Description", "Payment Method", "Notes", "Created At"],
        ...transactions.map((t) => [
            t.transactionDate.toISOString().slice(0, 10),
            t.transactionType[0].toUpperCase() + t.transactionType.slice(1),
            t.category ? t.category.categoryName : "Uncategorized",
            Number(t.amount).toFixed(2),
            t.description || "",
            (t.paymentMethod || "").replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
            t.notes || "",
            t.createdAt.toISOString(),
        ]),
    ];

    const filename = `SpendWise_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    sendCsv(res, filename, rows);
}

async function exportMonthlySummary(req, res) {
    const userId = req.session.user.id;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // first day of the month
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of the month (0 means the day before the first day)
    const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const [incomeAgg, expenseAgg, savingsAgg, categoryBreakdown, budgets, goals] = await Promise.all([
        prisma.transaction.aggregate({
            where: { userId, transactionType: "income", transactionDate: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { userId, transactionType: "expense", transactionDate: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        }),
        prisma.savingsContribution.aggregate({
            where: { userId, contributionDate: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        }),
        prisma.transaction.groupBy({
            by: ["categoryId"], // group by category
            where: { userId, transactionType: "expense", transactionDate: { gte: startDate, lte: endDate } },
            _sum: { amount: true }, // calculate total amount
            _count: { id: true }, // count how many transactions belong to each category
            orderBy: { _sum: { amount: "desc" } },
        }),
        prisma.budget.findMany({
            where: { userId, isActive: true, startDate: { lte: now }, endDate: { gte: now } },
            include: { category: true },
        }),
        prisma.savingsGoal.findMany({
            where: { userId, isCompleted: false },
            orderBy: { priority: "desc" },
        }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expenses = Number(expenseAgg._sum.amount ?? 0);
    const savings = Number(savingsAgg._sum.amount ?? 0);
    const netBalance = income - expenses;
    const available = netBalance - savings;

    const rows = [];
    rows.push(["SpendWise Monthly Summary Report"]);
    rows.push([`Generated for: ${req.session.user.username}`]);
    rows.push([`Period: ${monthLabel}`]);
    rows.push([`Generated on: ${now.toISOString()}`]);
    rows.push([]);

    rows.push(["FINANCIAL OVERVIEW"]);
    rows.push(["Metric", " Amount"]);
    rows.push(["Total Income", `$${income.toFixed(2)}`]);
    rows.push(["Total Expenses", `$${expenses.toFixed(2)}`]);
    rows.push(["Savings Contributions", `$${savings.toFixed(2)}`]);
    rows.push(["Net Balance", `$${netBalance.toFixed(2)}`]);
    rows.push(["Available Balance", `$${available.toFixed(2)}`]);
    rows.push([]);

    if (categoryBreakdown.length > 0) {
        // categoryBreakdown = [ { categoryId, _sum: { amount }, _count: { id } }, ]
        const categories = await prisma.category.findMany({
            where: { id: { in: categoryBreakdown.map((c) => c.categoryId).filter(Boolean) } },
        });
        const categoryMap = new Map(categories.map((c) => [c.id, c.categoryName])); // create a lookup table (id => name)
        const total = categoryBreakdown.reduce((sum, c) => sum + Number(c._sum.amount), 0);

        rows.push(["EXPENSE BREAKDOWN BY CATEGORY"]);
        rows.push(["Category", "Amount", "Transactions", "Percentage"]);
        categoryBreakdown.forEach((c) => {
            const amount = Number(c._sum.amount);
            const percentage = total > 0 ? (amount / total) * 100 : 0;
            rows.push([
                categoryMap.get(c.categoryId) || "Uncategorized",
                `$${amount.toFixed(2)}`,
                c._count.id,
                `${percentage.toFixed(1)}%`,
            ]);
        });
        rows.push([]);
    }

    if (budgets.length > 0) {
        const budgetRows = await Promise.all(
            budgets.map(async (b) => {
                const spentAgg = await prisma.transaction.aggregate({
                    where: { 
                        userId, 
                        categoryId: b.categoryId, 
                        transactionType: "expense",
                        transactionDate: { gte: b.startDate, lte: b.endDate },
                    },
                    _sum: { amount: true },
                });
                const spent = Number(spentAgg._sum.amount ?? 0);
                const budgetAmount = Number(b.budgetAmount);
                const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                return [
                    b.category ? b.category.categoryName : "Uncategorized",
                    `$${budgetAmount.toFixed(2)}`,
                    `$${spent.toFixed(2)}`,
                    `$${(budgetAmount - spent).toFixed(2)}`,
                    `${progress.toFixed(2)}%`,
                ];
            })
        );

        rows.push(["BUDGET STATUS"]);
        rows.push(["Category", "Budget", "Spent", "Remaining", "Progress"]);
        rows.push(...budgetRows);
        rows.push([]);
    }

    if (goals.length > 0) {
        rows.push(["SAVINGS GOALS"]);
        rows.push(["Goal", "Target", "Current", "Remaining", "Progress", "Deadline"]);
        goals.forEach((g) => {
            const target = Number(g.targetAmount);
            const current = Number(g.currentAmount);
            const progress = target > 0 ? (current / target) * 100 : 0;
            rows.push([
                g.goalName,
                `$${target.toFixed(2)}`,
                `$${current.toFixed(2)}`,
                `$${(target - current).toFixed(2)}`,
                `${progress.toFixed(1)}%`,
                g.deadline ? g.deadline.toISOString().slice(0, 10) : "No deadline",
            ]);
        });
    }

    const filename = `SpendWise_Summary_${now.toISOString().slice(0, 7).csv}`;
    sendCsv(res, filename, rows);
}

export { exportTransactions, exportMonthlySummary };