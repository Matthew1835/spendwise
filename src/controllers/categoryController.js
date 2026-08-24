import prisma from '../prismaClient.js';

const DEFAULT_COLOR = { income: '#2FAE72', expense: '#0A3D2E' };
const DEFAULT_ICON = { income: 'fa-solid fa-money-bill-trend-up', expense: 'fa-solid fa-tag' };

// Every category a user can pick from: global (admin-managed, userId
// null) plus their own personal ones. Used by transaction/budget forms
// and by the "My Categories" page (which also needs the global ones shown
// for reference, even though only personal ones are editable there).
async function loadUsableCategories(userId, categoryType = undefined) {
    return prisma.category.findMany({
        where: {
            OR: [{ userId: null }, { userId }],
            ...(categoryType ? { categoryType } : {}),
        },
        orderBy: [{ categoryType: 'asc' }, { categoryName: 'asc' }],
    });
}

async function loadMyCategoriesPageData(userId) {
    const categories = await prisma.category.findMany({
        where: { OR: [{ userId: null }, { userId }] },
        include: { _count: { select: { transactions: true } } },
        orderBy: [{ categoryType: 'asc' }, { categoryName: 'asc' }],
    });
    return categories.map((c) => ({ ...c, usageCount: c._count.transactions, isMine: c.userId === userId }));
}

async function listMyCategories(req, res) {
    const categories = await loadMyCategoriesPageData(req.session.user.id);
    res.render('categories', { categories, error: null });
}

// Used both by the "My Categories" page's own add form (redirects) and by
// the quick-add popup inside the transaction/budget modals (returns JSON,
// requested via an Accept: application/json header from fetch()) — one
// endpoint, two response modes, rather than duplicating the create logic.
async function createMyCategory(req, res) {
    const userId = req.session.user.id;
    const { category_name, category_type, color_code } = req.body;

    const category = await prisma.category.create({
        data: {
            userId,
            categoryName: category_name,
            categoryType: category_type,
            colorCode: color_code || DEFAULT_COLOR[category_type],
            icon: DEFAULT_ICON[category_type],
        },
    });

    if (req.get('Accept') === 'application/json') {
        return res.json({
            id: category.id,
            categoryName: category.categoryName,
            categoryType: category.categoryType,
            colorCode: category.colorCode,
            icon: category.icon,
        });
    }

    res.redirect('/categories');
}

async function updateMyCategory(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);
    const { category_name, category_type, color_code } = req.body;

    const result = await prisma.category.updateMany({
        where: { id, userId }, // ownership-scoped: can't edit a global category or someone else's
        data: { categoryName: category_name, categoryType: category_type, colorCode: color_code },
    });

    if (result.count === 0) {
        return res.status(404).render('error', { message: 'Category not found.' });
    }

    res.redirect('/categories');
}

// Same "can't delete if in use" safety check as the admin panel's version.
async function deleteMyCategory(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);

    const usageCount = await prisma.transaction.count({ where: { categoryId: id, userId } });
    if (usageCount > 0) {
        return res.render('categories', {
            categories: await loadMyCategoriesPageData(userId),
            error: 'Cannot delete a category that is in use.',
        });
    }

    await prisma.category.deleteMany({ where: { id, userId } }); // ownership-scoped
    res.redirect('/categories');
}

export { loadUsableCategories, loadMyCategoriesPageData, listMyCategories, createMyCategory, updateMyCategory, deleteMyCategory };