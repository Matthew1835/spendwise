-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('weekly', 'monthly', 'yearly');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "monthly_budget" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_type" "TransactionType" NOT NULL,
    "description" TEXT,
    "color_code" TEXT,
    "icon" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transaction_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "transaction_date" DATE NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'cash',
    "notes" TEXT,
    "auto_categorized" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "budget_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "budget_amount" DECIMAL(10,2) NOT NULL,
    "period_type" "PeriodType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "alert_threshold" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("budget_id")
);

-- CreateTable
CREATE TABLE "savings_goals" (
    "goal_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "goal_name" TEXT NOT NULL,
    "target_amount" DECIMAL(10,2) NOT NULL,
    "current_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deadline" DATE,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "category" TEXT,
    "description" TEXT,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "savings_contributions" (
    "contribution_id" SERIAL NOT NULL,
    "goal_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "contribution_date" DATE NOT NULL,
    "notes" TEXT,

    CONSTRAINT "savings_contributions_pkey" PRIMARY KEY ("contribution_id")
);

-- CreateTable
CREATE TABLE "categorization_rules" (
    "rule_id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "rule_type" TEXT NOT NULL DEFAULT 'contains',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorization_rules_pkey" PRIMARY KEY ("rule_id")
);

-- CreateTable
CREATE TABLE "user_categorization_rules" (
    "user_rule_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "rule_type" TEXT NOT NULL DEFAULT 'contains',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "confidence_score" INTEGER NOT NULL DEFAULT 0,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "learned_from_transaction_id" INTEGER,

    CONSTRAINT "user_categorization_rules_pkey" PRIMARY KEY ("user_rule_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "savings_goals"("goal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorization_rules" ADD CONSTRAINT "categorization_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_categorization_rules" ADD CONSTRAINT "user_categorization_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_categorization_rules" ADD CONSTRAINT "user_categorization_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;
