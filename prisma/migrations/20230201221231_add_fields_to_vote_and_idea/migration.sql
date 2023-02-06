-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "createdAtBlock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "voterWeight" INTEGER NOT NULL DEFAULT 0;
