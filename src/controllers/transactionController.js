import prisma from "../prismaClient.js";
import { autoCategorize } from "../services/categorization.js"

const ALLOWED_RETURN_PATHS = new Set(['/transactions', '/dashboard']);
function safeReturnTo(value) {
  return ALLOWED_RETURN_PATHS.has(value) ? value : '/transactions';
}

async function listTransactions(req, res) {
    const userId = req.session.user.id;
    const { type, category_id, start_date, end_date } = req.query;

    const where = { userId };
    if (type) where.transactionType = type;
    if (category_id) where.categoryId = Number(category_id);
    if (start_date || end_date) {
        where.transactionDate = {};
        if (start_date) where.transactionDate.gte = new Date(start_date);
        if (end_date) where.transactionDate.lte = new Date(end_date);
    }

    const [ transactions, categories ] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: { category: true },
            orderBy: { transactionDate: "desc" },
        }),
        prisma.category.findMany(),
    ]);

    res.render("transactions", { transactions, categories, filters: req.query, error: null });
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

async function deleteTransaction(req, res) {
    const userId = req.session.user.id;
    const id = Number(req.params.id);

    await prisma.transaction.deleteMany({ where: { id, userId }});
    res.redirect("/transactions");
}

export { listTransactions, createTransaction, deleteTransaction };