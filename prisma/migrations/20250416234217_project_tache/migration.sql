-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AFaire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "datecreate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "AFaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Encours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "datecreate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Encours_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enrevision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "datecreate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Enrevision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Termine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "datecreate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Termine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TodoHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "datecreate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "TodoHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");
