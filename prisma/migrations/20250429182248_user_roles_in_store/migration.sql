/*
  Warnings:

  - Added the required column `role` to the `UserOnShop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StoreRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- AlterTable
ALTER TABLE "UserOnShop" ADD COLUMN     "role" "StoreRole" NOT NULL;
