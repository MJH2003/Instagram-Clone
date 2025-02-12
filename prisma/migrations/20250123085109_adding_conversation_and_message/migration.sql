/*
  Warnings:

  - You are about to drop the column `receiverId` on the `message` table. All the data in the column will be lost.
  - Added the required column `conversationId` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_receiverId_fkey`;

-- DropIndex
DROP INDEX `message_receiverId_fkey` ON `message`;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `receiverId`,
    ADD COLUMN `conversationId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_conversationTousers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_conversationTousers_AB_unique`(`A`, `B`),
    INDEX `_conversationTousers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_conversationTousers` ADD CONSTRAINT `_conversationTousers_A_fkey` FOREIGN KEY (`A`) REFERENCES `conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_conversationTousers` ADD CONSTRAINT `_conversationTousers_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
