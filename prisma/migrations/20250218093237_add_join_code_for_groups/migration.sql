/*
  Warnings:

  - A unique constraint covering the columns `[joinCode]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Conversation` ADD COLUMN `joinCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Conversation_joinCode_key` ON `Conversation`(`joinCode`);
