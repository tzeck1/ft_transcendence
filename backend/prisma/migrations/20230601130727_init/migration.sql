-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "intra_name" TEXT NOT NULL,
    "profile_picture" TEXT,
    "tfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "friends" TEXT[],
    "f_requests" TEXT[],
    "blocks" TEXT[],
    "rank" INTEGER NOT NULL DEFAULT 1000,
    "games_played" INTEGER NOT NULL DEFAULT 0,
    "games_won" INTEGER NOT NULL DEFAULT 0,
    "games_lost" INTEGER NOT NULL DEFAULT 0,
    "hackerman" BOOLEAN NOT NULL DEFAULT false,
    "top_three" BOOLEAN NOT NULL DEFAULT false,
    "zucc" BOOLEAN NOT NULL DEFAULT false,
    "ten_comp" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "intra" TEXT NOT NULL,
    "player" TEXT NOT NULL,
    "enemy" TEXT NOT NULL,
    "player_score" INTEGER NOT NULL,
    "enemy_score" INTEGER NOT NULL,
    "ranked" BOOLEAN NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "paddle_hits_e" INTEGER NOT NULL DEFAULT 0,
    "paddle_hits_m" INTEGER NOT NULL DEFAULT 0,
    "rank_changed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stats" (
    "id" SERIAL NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" SERIAL NOT NULL,
    "player_ids" INTEGER[],
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_intra_name_key" ON "users"("intra_name");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_intra_fkey" FOREIGN KEY ("intra") REFERENCES "users"("intra_name") ON DELETE RESTRICT ON UPDATE CASCADE;
