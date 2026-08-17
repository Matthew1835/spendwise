// Demo/dev data for SPENDwise. NEVER run this against a production
// database — it wipes existing app data before reseeding, so the app
// (dashboard charts, budget/savings progress, admin panel) has enough
// realistic history to actually demo well instead of looking empty.
//
// Run with: npx prisma db seed
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

const EXPENSE_CATEGORIES = [
    { categoryName: 'Groceries', colorCode: '#2FAE72', icon: 'fa-solid fa-cart-shopping' },
    { categoryName: 'Rent', colorCode: '#0A3D2E', icon: 'fa-solid fa-house' },
    { categoryName: 'Transportation', colorCode: '#FF6B6B', icon: 'fa-solid fa-car' },
    { categoryName: 'Dining Out', colorCode: '#FFA94D', icon: 'fa-solid fa-utensils' },
    { categoryName: 'Entertainment', colorCode: '#FFD700', icon: 'fa-solid fa-film' },
    { categoryName: 'Utilities', colorCode: '#1B6B4D', icon: 'fa-solid fa-bolt' },
    { categoryName: 'Shopping', colorCode: '#E85D5D', icon: 'fa-solid fa-bag-shopping' },
    { categoryName: 'Health', colorCode: '#6B7D75', icon: 'fa-solid fa-heart-pulse' },
];

const INCOME_CATEGORIES = [
    { categoryName: 'Salary', colorCode: '#0A3D2E', icon: 'fa-solid fa-money-check-dollar' },
    { categoryName: 'Freelance', colorCode: '#2FAE72', icon: 'fa-solid fa-laptop' },
];

const KEYWORD_RULES = [
    { keyword: 'uber', category: 'Transportation', priority: 5 },
    { keyword: 'lyft', category: 'Transportation', priority: 5 },
    { keyword: 'netflix', category: 'Entertainment', priority: 5 },
    { keyword: 'spotify', category: 'Entertainment', priority: 5 },
    { keyword: 'walmart', category: 'Groceries', priority: 5 },
    { keyword: 'grocery', category: 'Groceries', priority: 3 },
    { keyword: 'rent', category: 'Rent', priority: 8 },
    { keyword: 'electric', category: 'Utilities', priority: 5 },
];

function randomBetween(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

async function main() {
    console.log('Clearing existing data…');
    // Delete order respects foreign keys (children before parents).
    await prisma.savingsContribution.deleteMany();
    await prisma.savingsGoal.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.userCategorizationRule.deleteMany();
    await prisma.categorizationRule.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('Creating categories…');
    const expenseCategories = [];
    for (const c of EXPENSE_CATEGORIES) {
        expenseCategories.push(await prisma.category.create({ data: { ...c, categoryType: 'expense' } }));
    }
    const incomeCategories = [];
    for (const c of INCOME_CATEGORIES) {
        incomeCategories.push(await prisma.category.create({ data: { ...c, categoryType: 'income' } }));
    }

    console.log('Creating keyword rules…');
    for (const rule of KEYWORD_RULES) {
        const category = expenseCategories.find((c) => c.categoryName === rule.category);
        if (category) {
        await prisma.categorizationRule.create({
            data: { keyword: rule.keyword, categoryId: category.id, priority: rule.priority },
        });
        }
    }

    console.log('Creating users…');
    const demoPasswordHash = await bcrypt.hash('Demo1234!', SALT_ROUNDS);

    const demoUser = await prisma.user.create({
        data: {
        username: 'demo',
        email: 'demo@spendwise.test',
        passwordHash: demoPasswordHash,
        firstName: 'Jamie',
        lastName: 'Rivera',
        role: 'user',
        monthlyBudget: 3200,
        createdAt: daysAgo(190),
        },
    });

    const adminUser = await prisma.user.create({
        data: {
        username: 'admin',
        email: 'admin@spendwise.test',
        passwordHash: demoPasswordHash,
        firstName: 'Alex',
        lastName: 'Morgan',
        role: 'admin',
        createdAt: daysAgo(200),
        },
    });

    // A handful of extra users so the admin panel's stats/charts aren't empty.
    for (let i = 0; i < 6; i++) {
        await prisma.user.create({
        data: {
            username: `user${i + 1}`,
            email: `user${i + 1}@spendwise.test`,
            passwordHash: demoPasswordHash,
            firstName: ['Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan'][i],
            lastName: ['Lee', 'Kim', 'Patel', 'Brown', 'Garcia', 'Chen'][i],
            role: 'user',
            createdAt: daysAgo(Math.floor(Math.random() * 6)), // spread across the last week, for the signup trend chart
        },
        });
    }

    console.log('Creating 6 months of transactions for the demo user…');
    for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - monthsAgo, 1);

        // Paycheck, twice a month.
        for (const day of [1, 15]) {
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
        if (date <= new Date()) {
            await prisma.transaction.create({
            data: {
                userId: demoUser.id,
                categoryId: incomeCategories[0].id,
                amount: 1450,
                description: 'Paycheck',
                transactionDate: date,
                transactionType: 'income',
                paymentMethod: 'bank_transfer',
            },
            });
        }
        }

        // Rent, once a month.
        const rentDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
        if (rentDate <= new Date()) {
        const rentCategory = expenseCategories.find((c) => c.categoryName === 'Rent');
        await prisma.transaction.create({
            data: {
            userId: demoUser.id,
            categoryId: rentCategory.id,
            amount: 1200,
            description: 'Monthly rent',
            transactionDate: rentDate,
            transactionType: 'expense',
            paymentMethod: 'bank_transfer',
            },
        });
        }

        // 10-15 scattered expenses across the month, across every category
        // except Rent (that's charged once a month above, not scattered).
        const scatterCategories = expenseCategories.filter((c) => c.categoryName !== 'Rent');
        const expenseCount = 10 + Math.floor(Math.random() * 6);
        for (let i = 0; i < expenseCount; i++) {
        const day = 1 + Math.floor(Math.random() * 27);
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
        if (date > new Date()) continue;

        const category = scatterCategories[Math.floor(Math.random() * scatterCategories.length)];
        const amountRanges = {
            Groceries: [20, 120],
            Transportation: [8, 45],
            'Dining Out': [12, 65],
            Entertainment: [8, 40],
            Utilities: [40, 150],
            Shopping: [15, 200],
            Health: [10, 90],
        };
        const [min, max] = amountRanges[category.categoryName] || [10, 60];

        await prisma.transaction.create({
            data: {
            userId: demoUser.id,
            categoryId: category.id,
            amount: randomBetween(min, max),
            description: category.categoryName,
            transactionDate: date,
            transactionType: 'expense',
            paymentMethod: Math.random() > 0.5 ? 'card' : 'cash',
            },
        });
        }
    }

    console.log('Creating budgets for the current month…');
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    for (const name of ['Groceries', 'Dining Out', 'Entertainment']) {
        const category = expenseCategories.find((c) => c.categoryName === name);
        await prisma.budget.create({
        data: {
            userId: demoUser.id,
            categoryId: category.id,
            budgetAmount: { Groceries: 400, 'Dining Out': 200, Entertainment: 100 }[name],
            periodType: 'monthly',
            startDate: currentMonthStart,
            endDate: currentMonthEnd,
            alertThreshold: 0.8,
        },
        });
    }

    console.log('Creating savings goals with contribution history…');
    const laptopGoal = await prisma.savingsGoal.create({
        data: {
        userId: demoUser.id,
        goalName: 'New Laptop Fund',
        targetAmount: 1500,
        currentAmount: 0,
        deadline: daysAgo(-90), // 90 days from now
        priority: 'high',
        category: 'tech',
        },
    });
    let laptopTotal = 0;
    for (const [daysBack, amount] of [[85, 200], [60, 200], [35, 150], [10, 180]]) {
        await prisma.savingsContribution.create({
        data: { goalId: laptopGoal.id, userId: demoUser.id, amount, contributionDate: daysAgo(daysBack) },
        });
        laptopTotal += amount;
    }
    await prisma.savingsGoal.update({ where: { id: laptopGoal.id }, data: { currentAmount: laptopTotal } });

    const emergencyGoal = await prisma.savingsGoal.create({
        data: {
        userId: demoUser.id,
        goalName: 'Emergency Fund',
        targetAmount: 1000,
        currentAmount: 0,
        deadline: daysAgo(-30),
        priority: 'high',
        category: 'general',
        },
    });
    let emergencyTotal = 0;
    for (const [daysBack, amount] of [[80, 300], [50, 300], [20, 400]]) {
        await prisma.savingsContribution.create({
        data: { goalId: emergencyGoal.id, userId: demoUser.id, amount, contributionDate: daysAgo(daysBack) },
        });
        emergencyTotal += amount;
    }
    await prisma.savingsGoal.update({
        where: { id: emergencyGoal.id },
        data: { currentAmount: emergencyTotal, isCompleted: emergencyTotal >= 1000, completedAt: emergencyTotal >= 1000 ? new Date() : null },
    });

    console.log('\nDone. Log in with:');
    console.log('  Regular user  -> username: demo   password: Demo1234!');
    console.log('  Admin user    -> username: admin  password: Demo1234!');
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });