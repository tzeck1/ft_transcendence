-- AlterTable
ALTER TABLE "games" ADD COLUMN     "paddle_hits_e" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paddle_hits_m" INTEGER NOT NULL DEFAULT 0;
