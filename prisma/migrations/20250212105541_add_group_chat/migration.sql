/*
  Warnings:

  - You are about to drop the column `usersId` on the `conversation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `conversation` DROP FOREIGN KEY `conversation_usersId_fkey`;

-- DropIndex
DROP INDEX `conversation_usersId_fkey` ON `conversation`;

-- AlterTable
ALTER TABLE `conversation` DROP COLUMN `usersId`;

-- CreateTable
CREATE TABLE `_conversationTousers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_conversationTousers_AB_unique`(`A`, `B`),
    INDEX `_conversationTousers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_conversationTousers` ADD CONSTRAINT `_conversationTousers_A_fkey` FOREIGN KEY (`A`) REFERENCES `conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_conversationTousers` ADD CONSTRAINT `_conversationTousers_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
