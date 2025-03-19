/*
  Warnings:

  - You are about to drop the column `auteur` on the `AFaire` table. All the data in the column will be lost.
  - You are about to drop the column `auteur` on the `Encours` table. All the data in the column will be lost.
  - You are about to drop the column `auteur` on the `Enrevision` table. All the data in the column will be lost.
  - You are about to drop the column `auteur` on the `Termine` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AFaire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "assigne" TEXT,
    "datecreate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLimite" DATETIME,
    "priorite" TEXT
);
INSERT INTO "new_AFaire" ("assigne", "dateLimite", "datecreate", "description", "id", "priorite", "titre") SELECT "assigne", "dateLimite", "datecreate", "description", "id", "priorite", "titre" FROM "AFaire";
DROP TABLE "AFaire";
ALTER TABLE "new_AFaire" RENAME TO "AFaire";
CREATE TABLE "new_Encours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "assigne" TEXT,
    "datecreate" DATETIME,
    "dateLimite" DATETIME,
    "priorite" TEXT
);
INSERT INTO "new_Encours" ("assigne", "dateLimite", "datecreate", "description", "id", "priorite", "titre") SELECT "assigne", "dateLimite", "datecreate", "description", "id", "priorite", "titre" FROM "Encours";
DROP TABLE "Encours";
ALTER TABLE "new_Encours" RENAME TO "Encours";
CREATE TABLE "new_Enrevision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "assigne" TEXT,
    "datecreate" DATETIME,
    "dateLimite" DATETIME,
    "priorite" TEXT
);
INSERT INTO "new_Enrevision" ("assigne", "dateLimite", "datecreate", "description", "id", "priorite", "titre") SELECT "assigne", "dateLimite", "datecreate", "description", "id", "priorite", "titre" FROM "Enrevision";
DROP TABLE "Enrevision";
ALTER TABLE "new_Enrevision" RENAME TO "Enrevision";
CREATE TABLE "new_Termine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "assigne" TEXT,
    "datecreate" DATETIME,
    "dateLimite" DATETIME,
    "priorite" TEXT
);
INSERT INTO "new_Termine" ("assigne", "dateLimite", "datecreate", "description", "id", "priorite", "titre") SELECT "assigne", "dateLimite", "datecreate", "description", "id", "priorite", "titre" FROM "Termine";
DROP TABLE "Termine";
ALTER TABLE "new_Termine" RENAME TO "Termine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
