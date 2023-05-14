-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "legacyLockedScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "legacyTokenCount" INTEGER NOT NULL DEFAULT 0;
