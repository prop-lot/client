/*
  Warnings:

  - You are about to drop the column `index` on the `Idea` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Idea_communityId_index_key";

-- AlterTable
ALTER TABLE "Idea" DROP COLUMN "index";
