import prisma from "../prismaClient.js";

async function projectGoalCompletion(goal) {
    const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
    if (remaining <= 0) return { completed: true };

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recent = await prisma.savingsContribution.findMany({
        where: { 
            goalId: goal.id, 
            userId: goal.userId,
            contributionDate: { gte: threeMonthsAgo }
        },
    });

    if (recent.length < 2) return { insufficientData: true };

    const sortedRecent = [...recent].sort((a, b) => a.contributionDate - b.contributionDate);
    const firstDate = sortedRecent[0].contributionDate;
    const lastDate = sortedRecent[sortedRecent.length - 1].contributionDate;
    const daysSpan = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
    const monthsSpan = daysSpan / 30;

    const totalContributed = recent.reduce((sum, c) => sum + Number(c.amount), 0);
    const avgMonthlyContribution = totalContributed / Math.max(1, monthsSpan);

    if (avgMonthlyContribution <= 0) return { insufficientData: true };

    const monthsToComplete = remaining / avgMonthlyContribution;
    const daysToComplete = Math.round(monthsToComplete * 30);
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysToComplete);

    let needsAcceleration = false;
    let recommendedIncrease = 0;

    if (goal.deadline) {
        const deadlineDate = new Date(goal.deadline);
        if (predictedDate > deadlineDate) {
            needsAcceleration = true;
            const daysUntilDeadline = Math.max(1, (deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
            const monthsUntilDeadline = daysUntilDeadline / 30;
            const requiredMonthly = remaining / Math.max(1, monthsUntilDeadline);
            recommendedIncrease = requiredMonthly - avgMonthlyContribution;
        }
    }

    return {
        avgMonthlyContribution,
        monthsToComplete,
        predictedDate,
        needsAcceleration,
        recommendedIncrease,
        onTrack: !needsAcceleration,
    };
}

async function loadSavingsPageData(req) {
    const userId = req.session.user.id;

    const [goals, recentContributions] = await Promise.all([
        prisma.savingsGoal.findMany({ where: { userId }, orderBy: [{ isCompleted: "asc" }, { deadline: "asc" }] }),
        prisma.savingsContribution.findMany({
            where: { userId },
            include: { goal: true },
            orderBy: { contributionDate: "desc" },
            take: 10,
        }),
    ]);

    const goalsWithProjection = await Promise.all(
        goals.map(async (g) => ({ ...g, projection: await projectGoalCompletion(g) }))
    );

    const activeGoals = goalsWithProjection.filter((g) => !g.isCompleted);
    const totalSavings = goalsWithProjection.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const totalTarget = goalsWithProjection.reduce((sum, g) => sum + Number(g.targetAmount), 0);
    const avgProgress = goalsWithProjection.length
        ? goalsWithProjection.reduce((sum, g) => {
            return sum + Math.min((Number(g.currentAmount) / Number(g.targetAmount)) * 100, 100), 0 
        }) / goalsWithProjection.length
        : 0;

    return {
        goals: goalsWithProjection,
        recentContributions,
        totals: { activeCount: activeGoals.length, totalSavings, totalTarget, avgProgress }
    };
}

async function listGoals(req, res) {
    const data = await loadSavingsPageData(req);
    res.render("savings", { ...data, error: null });
}

async function createGoal(req, res) {
    const userId = req.session.user.id;
    const { goal_name, target_amount, current_amount, deadline, priority, description } = req.body;

    await prisma.savingsGoal.create({
        data: {
            userId,
            goalName: goal_name,
            targetAmount: target_amount,
            currentAmount: current_amount || 0,
            deadline: new Date(deadline),
            priority: priority || "medium",
            description,
        },
    });

    res.redirect("/savings");
}

async function updateGoal(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);
    const { goal_name, target_amount, deadline, priority, description } = req.body;

    const result = await prisma.savingsGoal.updateMany({
        where: { id, userId },
        data: {
            goalName: goal_name,
            targetAmount: target_amount,
            deadline: new Date(deadline),
            priority: priority || "medium",
            description,
        },
    });

    if (result.count === 0) {
        return res.status(404).render("error", { message: "Savings goal not found." });
    }

    res.redirect("/savings");
}

async function addContribution(req, res) {
    const userId = req.session.user.id;
    const goalId = Number(req.params.id);
    const { amount, contribution_date, notes } = req.body;

    const goal = await prisma.savingsGoal.findFirst({
        where: { id: goalId, userId }
    });
    if (!goal) {
        return res.status(404).render("error", { message: "Savings goal not found." });
    }

    await prisma.$transaction(async (tx) => {
        await tx.savingsContribution.create({
            data: { 
                goalId,
                userId,
                amount,
                contributionDate: new Date(contribution_date),
                notes,
            }
        });

        const updated = await tx.savingsGoal.update({
            where: { id: goalId },
            data: { currentAmount: { increment: amount } },
        });

        if (!updated.isCompleted && Number(updated.currentAmount) >= Number(updated.targetAmount)) {
            await tx.savingsGoal.update({
                where: { id: goalId },
                data: { isCompleted: true, completedAt: new Date() },
            });
        }
    });

    res.redirect("/savings");
}

async function deleteGoal(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);

    await prisma.savingsGoal.deleteMany({ where: { id, userId } });
    res.redirect("/savings");
}

export { loadSavingsPageData, listGoals, createGoal, updateGoal, addContribution, deleteGoal };