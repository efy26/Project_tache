import { PrismaClient, Action } from "@prisma/client";

const prisma = new PrismaClient();

export const trierTaches = async (table, sortBy = "datecreate") => {
    try {
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error("Table invalide !");
        }
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

const defautUser = 1;

export const addTodo = async (data) => {
    const {
        titre,
        description,
        status,
        assigne,
        dateLimite,
        priorite,
        userId
    } = data;

    try {
        const todo = await prisma.AFaire.create({
            data: {
                titre,
                description,
                status: "AFaire",
                dateLimite: new Date(dateLimite),
                priorite,
                user: {
                    connect: { id: defautUser }
                }
            },
        });

        return todo;
    } catch (error) {
        throw new Error(`Erreur lors de l'ajout de la tâche : ${error.message}`);
    }
};

export const deleteTodo = async (table, id) => {
    try {
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error(`Table "${table}" invalide.`);
        }

        const todoId = parseInt(id);
        if (isNaN(todoId)) {
            throw new Error(`L'ID "${id}" n'est pas valide.`);
        }

        const todoExists = await prisma[table].findUnique({ where: { id: todoId } });
        if (!todoExists) {
            throw new Error(`Aucune tâche trouvée avec l'ID ${todoId} dans ${table}.`);
        }

        const deletedTodo = await prisma[table].delete({ where: { id: todoId } });

        return deletedTodo;
    } catch (error) {
        console.error(`❌ Erreur lors de la suppression : ${error.message}`);
        return null;
    }
};

export const transferTodo = async (fromTable, toTable, id) => {
    try {
        const validTables = ["AFaire", "Encours", "Enrevision", "Termine"];
        if (!validTables.includes(fromTable) || !validTables.includes(toTable)) {
            throw new Error("Nom de table invalide !");
        }

        const todo = await prisma[fromTable].findUnique({ where: { id } });

        if (!todo) {
            throw new Error(`❌ Aucune tâche trouvée avec l'ID ${id} dans ${fromTable}`);
        }

        const transtodo = await prisma[toTable].create({ data: { ...todo, status: toTable, id: undefined } });

        await prisma[fromTable].delete({ where: { id } });

        console.log(`✅ Tâche ID ${id} transférée de ${fromTable} vers ${toTable} avec succès !`);
        return transtodo;
    } catch (error) {
        console.error(`⚠️ Erreur lors du transfert : ${error.message}`);
        throw error;
    }
};

export const getTodos1 = async () => {
    const todos = await prisma.AFaire.findMany();
    return todos;
};

export const getTodos2 = async () => {
    const todos = await prisma.Encours.findMany();
    return todos;
};

export const getTodos3 = async () => {
    const todos = await prisma.Enrevision.findMany();
    return todos;
};

export const getTodos4 = async () => {
    const todos = await prisma.Termine.findMany();
    return todos;
};

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

export const updateTodo = async (table, id, data) => {
    const { titre, description, dateLimite, priorite } = data;

    try {
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error(`Table "${table}" invalide.`);
        }

        const todoExists = await prisma[table].findUnique({ where: { id } });

        if (!todoExists) {
            throw new Error(`Tâche avec l'ID ${id} introuvable dans ${table}.`);
        }

        const updatedTodo = await prisma[table].update({
            where: { id },
            data: {
                titre,
                description,
                dateLimite: dateLimite ? new Date(dateLimite) : null,
                priorite,
            }
        });

        return updatedTodo;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la tâche : ${error.message}`);
        return null;
    }
};

export const addHistoryEntry = async (id, table, action) => {
    try {
        const existingTodo = await prisma[table].findUnique({ where: { id } });
        if (!existingTodo) throw new Error("Tâche introuvable");

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

export const getTodosHistorique = async () => {
    const todos = await prisma.TodoHistory.findMany();
    return todos;
};

export const getUser = async () => {
    const todos = await prisma.User.findMany();
    return todos;
};

export const selecTodo = async (id) => {
    const todo = await prisma.Todo.findUnique({ where: { id } });
    return todo;
};

export const selectitreTodo = async (titre) => {
    const todo = await prisma.Todo.findUnique({ where: { titre } });
    return todo;
};

export const updateAuthor = async (table, id, newStatus) => {
    try {
        if (!["AFaire", "Encours", "Enrevision", "Termine"].includes(table)) {
            throw new Error(`Table "${table}" invalide.`);
        }

        const todoExists = await prisma[table].findUnique({ where: { id } });

        if (!todoExists) {
            throw new Error(`Tâche avec l'ID ${id} introuvable dans ${table}.`);
        }

        const updatedTodo = await prisma[table].update({
            where: { id },
            data: {
                status: newStatus,
            }
        });

        return updatedTodo;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'auteur : ${error.message}`);
        return null;
    }
};

export const createUtilisateur = async ({ nom, email, motDePasse }) => {
    return prisma.Utilisateur.create({
        data: { nom, email, motDePasse },
    });
};

export const utilisateurExiste = async ({ id, email }) => {
    if (!id && !email) throw new Error("id ou email requis");
    const user = await prisma.Utilisateur.findUnique({
        where: id ? { id } : { email },
        select: { id: true },
    });
    return !!user;
};

export const motDePasseOK = async (email, plainPassword) => {
    const user = await prisma.Utilisateur.findUnique({ where: { email } });
    if (!user) return false;
    return user.motDePasse === plainPassword;
};
