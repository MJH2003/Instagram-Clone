/*
  Warnings:

  - You are about to drop the `_conversationTousers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_conversationTousers` DROP FOREIGN KEY `_conversationTousers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_conversationTousers` DROP FOREIGN KEY `_conversationTousers_B_fkey`;

-- AlterTable
ALTER TABLE `conversation` ADD COLUMN `isGroup` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `usersId` INTEGER NULL;

-- DropTable
DROP TABLE `_conversationTousers`;

-- AddForeignKey
ALTER TABLE `conversation` ADD CONSTRAINT `conversation_usersId_fkey` FOREIGN KEY (`usersId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
