/*
  Warnings:

  - You are about to drop the column `begin` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `end` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `player1` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `player2` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `score1` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `score2` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `blocks` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `friends` on the `users` table. All the data in the column will be lost.
  - Added the required column `date` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enemy` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enemy_score` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player_score` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "begin",
DROP COLUMN "end",
DROP COLUMN "player1",
DROP COLUMN "player2",
DROP COLUMN "score1",
DROP COLUMN "score2",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "enemy" TEXT NOT NULL,
ADD COLUMN     "enemy_score" INTEGER NOT NULL,
ADD COLUMN     "player" TEXT NOT NULL,
ADD COLUMN     "player_score" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "blocks",
DROP COLUMN "friends";

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player_fkey" FOREIGN KEY ("player") REFERENCES "users"("intra_name") ON DELETE RESTRICT ON UPDATE CASCADE;
