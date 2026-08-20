/*
  Warnings:

  - You are about to alter the column `alert_threshold` on the `budgets` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,2)`.

*/
-- AlterTable
ALTER TABLE "budgets" ALTER COLUMN "alert_threshold" SET DEFAULT 0.80,
ALTER COLUMN "alert_threshold" SET DATA TYPE DECIMAL(3,2);

-- AlterTable
ALTER TABLE "categorization_rules" ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "savings_goals" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false;
