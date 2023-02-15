/*
  Warnings:

  - You are about to drop the column `name` on the `Community` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uname]` on the table `Community` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uname` to the `Community` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Community_name_key";

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "name",
ADD COLUMN     "uname" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Community_uname_key" ON "Community"("uname");
