/*
  Warnings:

  - A unique constraint covering the columns `[communityId,index]` on the table `Idea` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Idea" ALTER COLUMN "index" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Idea_communityId_index_key" ON "Idea"("communityId", "index");
