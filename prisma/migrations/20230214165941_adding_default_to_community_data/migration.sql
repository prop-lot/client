-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{ "pfp": "" }';
