import prisma from "../prismaClient.js";
import { autoCategorize } from "../services/categorization.js";
import { loadUsableCategories } from './categoryController.js';

const ALLOWED_RETURN_PATHS = new Set(['/transactions', '/dashboard']);
function safeReturnTo(value) {
    return ALLOWED_RETURN_PATHS.has(value) ? value : '/transactions';
}

function buildWhere(userId, query) {
    const { type, category_id, start_date, end_date } = query;
    const where = { userId };
    if (type) where.transactionType = type;
    if (category_id) where.categoryId = Number(category_id);
    if (start_date || end_date) {
        where.transactionDate = {};
        if (start_date) where.transactionDate.gte = new Date(start_date);
        if (end_date) where.transactionDate.lte = new Date(end_date);
    }
    return where;
}

async function loadTransactionsPageData(req) {
    const userId = req.session.user.id;
    const where = buildWhere(req.session.user.id, req.query);

    const [transactions, categories] = await Promise.all([
        prisma.transaction.findMany({ where, include: { category: true }, orderBy: { transactionDate: "desc" } }),
        loadUsableCategories(userId),
    ]);

    return { transactions, categories, filters: req.query };
}

async function listTransactions(req, res) {
    const data = await loadTransactionsPageData(req);
    res.render("transactions", { ...data, error: null });
}

async function createTransaction(req, res) {
    const userId = req.session.user.id;
    const { amount, description, transaction_date, transaction_type, payment_method, notes } = req.body;
    let categoryId = req.body.category_id ? Number(req.body.category_id) : null;
    let autoCategorized = false;

    if (!categoryId && description) {
        const match = await autoCategorize(description, transaction_type, userId);
        if (match) {
            categoryId = match.categoryId;
            autoCategorized = true;
        }
    }

    await prisma.transaction.create({
        data: {
            userId,
            categoryId,
            amount,
            description,
            transactionDate: new Date(transaction_date),
            transactionType: transaction_type,
            paymentMethod: payment_method || "cash",
            notes,
            autoCategorized,
        },
    });

    res.redirect(safeReturnTo(req.body.return_to));
}

async function updateTransaction(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);
    const { amount, description, transaction_date, transaction_type, payment_method, notes } = req.body;
    const categoryId = req.body.category_id ? Number(req.body.category_id) : null;
    
    const result = await prisma.transaction.updateMany({
        where: { id, userId },
        data: {
            categoryId, 
            amount,
            description,
            transactionDate: new Date(transaction_date),
            transactionType: transaction_type,
            paymentMethod: payment_method || "cash",
            notes,
            autoCategorized: false,
        },
    });
    
    if (result.count === 0) {
        return res.status(404).render("error", { message: "Transaction not found." });
    }

    res.redirect(safeReturnTo(req.body.return_to));
}

async function deleteTransaction(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);

    await prisma.transaction.deleteMany({ where: { id, userId }});
    res.redirect("/transactions");
}

export { loadTransactionsPageData, listTransactions, createTransaction, updateTransaction, deleteTransaction };