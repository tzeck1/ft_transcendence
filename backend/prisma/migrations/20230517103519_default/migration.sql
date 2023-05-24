/*
  Warnings:

  - Added the required column `intra` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_player_fkey";

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "intra" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_intra_fkey" FOREIGN KEY ("intra") REFERENCES "users"("intra_name") ON DELETE RESTRICT ON UPDATE CASCADE;
