-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_followerId_fkey`;

-- DropForeignKey
ALTER TABLE `follows` DROP FOREIGN KEY `follows_followingId_fkey`;

-- DropIndex
DROP INDEX `follows_followingId_fkey` ON `follows`;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
