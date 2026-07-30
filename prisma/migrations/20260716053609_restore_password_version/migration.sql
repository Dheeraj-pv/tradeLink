/*
  Warnings:

  - You are about to drop the column `passwordChangedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordChangedAt",
ADD COLUMN     "passwordVersion" INTEGER NOT NULL DEFAULT 0;
