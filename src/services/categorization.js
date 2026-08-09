import prisma from "../prismaClient.js";

async function autoCategorize(description, transactionType, userId) {
    if (!description) return null;
    const desc = description.toLowerCase();

    // User-specific rules first (highest priority, then confidence)
    const userRules = await prisma.userCategorizationRule.findMany({
        where: { userId, category: { categoryType: transactionType } },
        include: { category: true },
        orderBy: [{ priority: "desc" }, { confidenceScore: "desc" }],
    });

    const userMatch = userRules.find((r) => matchesRule(desc, r.keyword.toLowerCase(), r.ruleType));
    if (userMatch) {
        await prisma.userCategorizationRule.update({
            where: { id: userMatch.id },
            data: { usageCount: { increment: 1 } },
        });
        return { categoryId: userMatch.categoryId, source: "user" };
    }

    // Fall back to global rules
    const globalRules = await prisma.categorizationRule.findMany({
        where: { isActive: true, category: { categoryType: transactionType } },
        include: { category: true },
        orderBy: { priority: "desc" },
    });

    const globalMatch = globalRules.find((r) => matchesRule(desc, r.keyword.toLowerCase(), r.ruleType));
    if (globalMatch) {
        return { categoryId: globalMatch.categoryId, source: "global" };
    }

    return null;
}

function matchesRule(description, keyword, ruleType) {
    switch (ruleType) {
        case "exact_match":
            return description === keyword;
        case "starts_with":
            return description.startsWith(keyword);
        case "contains":
        default:
            return description.includes(keyword);
    }
}

// Learn a new user keyword
async function learnUserRule(userId, keyword, categoryId, transactionId) {
    const existing = await prisma.userCategorizationRule.findFirst({
        where: { userId, keyword, categoryId },
    });
    if (existing) return false;

    await prisma.userCategorizationRule.create({
        data: {
            userId,
            keyword,
            categoryId,
            ruleType: "contains",
            priority: 8,
            learnedFromTransactionId: transactionId,
        },
    });
    return true;
}

export { autoCategorize, learnUserRule };