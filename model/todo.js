// importer le client prisma
import { PrismaClient, Action } from "@prisma/client";

// Créer une instance du client prisma
const prisma = new PrismaClient();

                                   //**1.Fonction des triage par Date limite; Date de creation et priorite*/

/**
 * Fonction générique pour trier les tâches d'une table donnée
 * @param {string} table - Nom de la table Prisma ("AFaire", "Encours", "Enrevision", "Termine")
 * @param {string} sortBy - Champ par lequel trier ("datecreate" ou "dateLimite")
 * @param {string} order - Ordre du tri ("asc" ou "desc")
 * @returns {Promise<Array>} - Liste des tâches triées
 */
export const trierTaches = async (table, sortBy = "datecreate") => {
    try {
            //Vérifie si la table est entrée correctement
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error("Table invalide !");
        }
            //Vérifie si la date est entrée correctement
        if (!["datecreate", "dateLimite"].includes(sortBy)) {
            throw new Error("Champ de tri invalide !");
        }

        const todos = await prisma[table].findMany({
            orderBy: {
                [sortBy]: "asc",
            },
        });

        return todos;
    } catch (error) {
        console.error(`Erreur lors du tri des tâches pour ${table} : ${error.message}`);
        throw new Error("Impossible de récupérer les tâches triées.");
    }
};

//Trier par priorite
export const getTodosSortedByPriority = async (table) => {
    try {
        const todos = await prisma[table].findMany();

        const priorityOrder = { HAUTE: 1, MOYEN: 2, INFERIOR: 3 };

        return todos.sort((a, b) => priorityOrder[a.priorite] - priorityOrder[b.priorite]);
    } catch (error) {
        console.error("Erreur lors de la récupération des tâches triées par priorité :", error);
        throw new Error("Impossible de récupérer les tâches triées par priorité");
    }
};






                                    //**2 Fonction de bases pour gerer les 4 principales tables*/



//Creation d une tache. TOute taches créer est par defaut dans la table AFaire(seulement)
export const addTodo = async (data) => {
    const { titre, description, status, assigne, dateLimite, priorite } = data; // Déstructuration

    try {
        const todo = await prisma.AFaire.create({
            data: {
                titre,         
                description,       
                status: "AFaire",        
                assigne,       
                dateLimite: new Date(dateLimite),
                priorite,      // Priorité (Faible, Moyenne, Elevee)
            },
        });

        return todo; // Retourne la tâche nouvellement créée
    } catch (error) {
        throw new Error(`Erreur lors de l'ajout de la tâche : ${error.message}`);
    }
};

//Suppresion des taches
/**
 * Suppression d'une tâche dans une table donnée.
 * @param {string} table - Nom de la table (AFaire, Encours, Enrevision, Termine).
 * @param {number} id - ID de la tâche à supprimer.
 * @returns {Promise<object|null>} - Tâche supprimée ou null en cas d'erreur.
 */
export const deleteTodo = async (table, id) => {
    try {
        // Vérification de la table
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error(`Table "${table}" invalide.`);
        }

        // Vérification que l'ID est un entier
        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            throw new Error(`L'ID "${id}" n'est pas valide.`);
        }

        // Vérifier si la tâche existe
        const todoExists = await prisma[table].findUnique({ where: { id: todoId } });
        if (!todoExists) {
            throw new Error(`Aucune tâche trouvée avec l'ID ${todoId} dans ${table}.`);
        }

        // Supprimer la tâche
        const deletedTodo = await prisma[table].delete({ where: { id: todoId } });

        return deletedTodo; // Retourne la tâche supprimée
    } catch (error) {
        console.error(`❌ Erreur lors de la suppression : ${error.message}`);
        return null;
    }
};

//Transfert d'une tache d'une table à l'autre
/**
 * Transfère une tâche d'une table à une autre
 * @param {string} fromTable - Nom de la table source
 * @param {string} toTable - Nom de la table cible
 * @param {number} id - ID de la tâche à transférer
 * @returns {Promise<Object>} - La tâche transférée
 */
export const transferTodo = async (fromTable, toTable, id) => {
    try {
        // Vérification des noms de tables valides
        const validTables = ["AFaire", "Encours", "Enrevision", "Termine"];
        if (!validTables.includes(fromTable) || !validTables.includes(toTable)) {
            throw new Error("Nom de table invalide !");
        }

        // 1️⃣ Récupérer la tâche depuis la table source
        const todo = await prisma[fromTable].findUnique({ where: { id } });

        if (!todo) {
            throw new Error(`❌ Aucune tâche trouvée avec l'ID ${id} dans ${fromTable}`);
        }

        // 2️⃣ Insérer la tâche dans la table cible
        const transtodo = await prisma[toTable].create({ data: { ...todo, status: toTable, id: undefined } });

        // 3️⃣ Supprimer la tâche de la table source
        await prisma[fromTable].delete({ where: { id } });

        console.log(`✅ Tâche ID ${id} transférée de ${fromTable} vers ${toTable} avec succès !`);
        return transtodo;
    } catch (error) {
        console.error(`⚠️ Erreur lors du transfert : ${error.message}`);
        throw error;
    }
};



//Recuperation des taches

//Version bourrinée et peut etre utile
//AFaire
export const getTodos1 = async () => {
    const todos = await prisma.AFaire.findMany();
    return todos;
};

//Encours
export const getTodos2 = async () => {
    const todos = await prisma.Encours.findMany();
    return todos;
};

//Enrevision
export const getTodos3 = async () => {
    const todos = await prisma.Enrevision.findMany();
    return todos;
};

//Termine
export const getTodos4 = async () => {
    const todos = await prisma.Termine.findMany();
    return todos;
};


//Version finale
/**
 * Fonction générique pour récupérer les tâches d'une table donnée
 * @param {string} table - Nom de la table Prisma ("AFaire", "Encours", "Enrevision", "Termine")
 * @returns {Promise<Array>} - Liste des tâches
 */
export const getTodos = async (table) => {
    try {
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error("Table invalide !");
        }

        return await prisma[table].findMany();
    } catch (error) {
        console.error(`Erreur lors de la récupération des tâches pour ${table} : ${error.message}`);
        throw new Error("Impossible de récupérer les tâches.");
    }
};



//Modification d une tache
/**
 * Mise à jour d'une tâche dans une table donnée.
 * @param {string} table - Nom de la table (AFaire, Encours, Enrevision, Termine).
 * @param {number} id - ID de la tâche à mettre à jour.
 * @param {object} data - Données mises à jour (titre, description, dateLimite, priorite).
 * @returns {Promise<object|null>} - Tâche mise à jour ou null en cas d'erreur.
 */
export const updateTodo = async (table, id, data) => {
    const { titre, description, dateLimite, priorite } = data;

    try {
        // Vérification que la table est valide
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error(`Table "${table}" invalide.`);
        }

        // Vérifier si la tâche existe
        const todoExists = await prisma[table].findUnique({ where: { id } });

        if (!todoExists) {
            throw new Error(`Tâche avec l'ID ${id} introuvable dans ${table}.`);
        }

        // Mise à jour de la tâche
        const updatedTodo = await prisma[table].update({
            where: { id },
            data: {
                titre,
                
                description,
                dateLimite: dateLimite ? new Date(dateLimite) : null, // Conversion en DateTime si fourni
                priorite,
            }
        });

        return updatedTodo; // Retourne la tâche mise à jour
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la tâche : ${error.message}`);
        return null;
    }
};





                                                    //**3Les fonctions de l historique*/

//Fonction pour copier dans la table d historique toutes les taches ajouter, modifier ou supprimer
export const addHistoryEntry = async (id, table, action) => {
    try {
        // Récupérer la tâche concernée
        const existingTodo = await prisma[table].findUnique({ where: { id } });
        if (!existingTodo) throw new Error("Tâche introuvable");

        // Ajouter l'entrée dans l'historique
        await prisma.TodoHistory.create({
            data: {
                titre: existingTodo.titre,
                description: existingTodo.description,
                auteur: existingTodo.auteur,
                dateLimite: existingTodo.dateLimite,
                priorite: existingTodo.priorite,
                datecreate: new Date(),
                action: action,
            },
        });

        return { message: `Historique mis à jour : ${action}` };
    } catch (error) {
        console.error("Erreur lors de l'ajout à l'historique :", error);
        throw new Error("Impossible d'ajouter l'entrée dans l'historique");
    }
};


//Fonction pour recuperer les taches dans la table d historique
export const getTodosHistorique = async () => {
    const todos = await prisma.TodoHistory.findMany();
    return todos;
};






//Juste les ignorer PLS
export const getUser = async () => {
    const todos = await prisma.User.findMany();
    return todos;
};
export const selecTodo = async (id) => {
    const todo = await prisma.Todo.findUnique({
        where: {
            id,
        },

    });
    return todo
};
export const selectitreTodo = async (titre) => {
    const todo = await prisma.Todo.findUnique({
        where: {
            titre,
        },
    });
    return todo
};

export const updateAuthor = async (table, id, newStatus) => {
    try {
        // Vérification que la table est valide
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error(`Table "${table}" invalide.`);
        }

        // Vérifier si la tâche existe
        const todoExists = await prisma[table].findUnique({ where: { id } });

        if (!todoExists) {
            throw new Error(`Tâche avec l'ID ${id} introuvable dans ${table}.`);
        }

        // Mise à jour uniquement du champ auteur
        const updatedTodo = await prisma[table].update({
            where: { id },
            data: {
                status: newStatus, // Mettre à jour uniquement le champ auteur
            }
        });

        return updatedTodo; // Retourne la tâche mise à jour
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'auteur : ${error.message}`);
        return null;
    }
};

