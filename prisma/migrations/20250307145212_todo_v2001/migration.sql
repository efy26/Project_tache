-- CreateTable
CREATE TABLE "AFaire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "assigne" TEXT,
    "datecreate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLimite" DATETIME,
    "priorite" TEXT
);

-- CreateTable
CREATE TABLE "Encours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "assigne" TEXT,
    "datecreate" DATETIME,
    "dateLimite" DATETIME,
    "priorite" TEXT
);

-- CreateTable
CREATE TABLE "Enrevision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "assigne" TEXT,
    "datecreate" DATETIME,
    "dateLimite" DATETIME,
    "priorite" TEXT
);

-- CreateTable
CREATE TABLE "Termine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "assigne" TEXT,
    "datecreate" DATETIME,
    "dateLimite" DATETIME,
    "priorite" TEXT
);

-- CreateTable
CREATE TABLE "TodoHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "etat" TEXT NOT NULL,
    "datecreate" DATETIME,
    "action" TEXT
);
