/*
  Warnings:

  - You are about to drop the column `etat` on the `TodoHistory` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TodoHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auteur" TEXT,
    "dateLimite" DATETIME,
    "priorite" TEXT,
    "datecreate" DATETIME,
    "action" TEXT
);
INSERT INTO "new_TodoHistory" ("action", "auteur", "dateLimite", "datecreate", "description", "id", "priorite", "titre") SELECT "action", "auteur", "dateLimite", "datecreate", "description", "id", "priorite", "titre" FROM "TodoHistory";
DROP TABLE "TodoHistory";
ALTER TABLE "new_TodoHistory" RENAME TO "TodoHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
