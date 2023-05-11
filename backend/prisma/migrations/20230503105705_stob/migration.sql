/*
  Warnings:

  - The `profile_picture` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "profile_picture",
ADD COLUMN     "profile_picture" BYTEA;
