/*
  Warnings:

  - Added the required column `warrantyPeriod` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `warrantyPeriod` VARCHAR(191) NOT NULL;
