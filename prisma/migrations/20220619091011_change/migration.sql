/*
  Warnings:

  - You are about to drop the column `is_published` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Post` DROP COLUMN `is_published`,
    ADD COLUMN `published` BOOLEAN NULL DEFAULT false;
