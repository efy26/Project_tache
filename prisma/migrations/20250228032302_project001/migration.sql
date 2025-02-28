-- CreateTable
CREATE TABLE "Todo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "assigneId" INTEGER DEFAULT 1,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "etat" TEXT NOT NULL DEFAULT 'A_FAIRE',
    CONSTRAINT "Todo_assigneId_fkey" FOREIGN KEY ("assigneId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TodoHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "etat" TEXT NOT NULL
);
