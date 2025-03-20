import { Router } from "express";
import { 
    addTodo, 
    getTodos1,
    getTodos2,
    getTodos3,
    getTodos4,
    getTodos,
    selecTodo,
    updateTodo,
    deleteTodo,
    getUser,
    trierTaches,
    transferTodo,
    addHistoryEntry,
    getTodosHistorique,
    getTodosSortedByPriority
} from "./model/todo.js";

const router = Router();


                                        //**1 Route des triages*/
//Trier par date
router.get("/api/todos/sorted", async (req, res) => {
    const { table, sortBy = "datecreate", order = "asc" } = req.query;
 
    try {
        if (!table) {
            return res.status(400).json({ error: "Le paramètre 'table' est requis." });
        }
 
        const sortedTodos = await trierTaches(table, sortBy, order);
        res.status(200).json(sortedTodos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//**Test:OK */

//Trier par priorite
router.get("/api/todos/sorted-by-priority", async (req, res) => {
    const { table } = req.query; // Récupère le nom de la table depuis les paramètres de requête

    try {
        // Appeler la fonction pour récupérer les tâches triées par priorité
        const sortedTodos = await getTodosSortedByPriority(table);

        // Réponse en cas de succès
        res.status(200).json({
            success: true,
            message: `Tâches de la table ${table} triées par priorité récupérées avec succès !`,
            data: sortedTodos,
        });
    } catch (error) {
        // Réponse en cas d'erreur
        res.status(500).json({
            success: false,
            message: `Erreur lors de la récupération des tâches triées par priorité : ${error.message}`,
        });
    }
});

                                        //**2 Route des fonctions de bases*/
//Créer une tâche
router.post("/api/todo", async (req, res) => {
    const data = req.body;
    
    try {
        const newTodo = await addTodo(data);
        
        // Ajout dans l'historique
        await addHistoryEntry(newTodo.id, newTodo.status, "AJOUTER");

        res.status(201).json({ todo: newTodo, message: "Tâche créée avec succès" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//**Test:OK */


//Obtenir toutes les tâches de toutes les 4 tables
router.get("/api/todos0", async (req, res) => {
    try {
        const todos1 = await getTodos1();
        const todos2 = await getTodos2();
        const todos3 = await getTodos3();
        const todos4 = await getTodos4();
        res.status(200).json([todos1, todos2, todos3, todos4]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//**Test:OK*/


//Obtenir toutes les tâches d une table
router.get("/api/todos", async (req, res) => {
    const { table } = req.query;

    if (!table) {
        return res.status(400).json({ error: "Le paramètre 'table' est requis." });
    }

    try {
        const todos = await getTodos(table);
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//**Test:OK*/


//Transfert d une tache
router.post("/api/todos/transfer", async (req, res) => {
    const { fromTable, toTable, id } = req.body;

    try {
        // Appeler la fonction transferTodo
        const transferredTodo = await transferTodo(fromTable, toTable, id);
        await addHistoryEntry(transferredTodo.id, transferredTodo.status, "TRANSFERER");

        // Réponse en cas de succès
        res.status(200).json({
            success: true,
            message: `Tâche ID ${id} transférée de ${fromTable} vers ${toTable} avec succès !`,
            data: transferredTodo,
        });
    } catch (error) {
        // Réponse en cas d'erreur
        res.status(500).json({
            success: false,
            message: `Erreur lors du transfert : ${error.message}`,
        });
    }
});
//**Test:OK*/


//Sélectionner une tâche par son ID (A ignorer)
router.get("/api/todo/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const todo = await selecTodo(parseInt(id));
        if (!todo) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }
        res.status(200).json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//**Test: */


//Modifier une tâche
router.put("/api/todo/updateTodo", async (req, res) => {
    const { table, id, data } = req.body;

    try {
        const result = await updateTodo(table, id, data);
        await addHistoryEntry(result.id, result.status, "MODIFIER");
        if (!result) {
            return res.status(400).json({ error: "Erreur lors de la mise à jour de la tâche." });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//**Test:OK*/


//Supprimer une tâche
router.delete("/api/todo/deleteTodo", async (req, res) => {
    const { table, id } = req.body;

    try {
        await addHistoryEntry(id, table, "SUPPRIMER");
        const result = await deleteTodo(table, id);
        if (!result) {
            return res.status(400).json({ error: "Erreur lors de la suppression de la tâche." });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//**Test:OK* /


                                        //**3 Route des l'historique des tâches*/

//Ajout dans l historique
router.post('/api/historique', async (req, res) => {
    const { id, table, action } = req.body;

    if (!id || !table || !action) {
        return res.status(400).json({ error: "Tous les champs (id, table, action) sont requis" });
    }

    try {
        const result = await addHistoryEntry(id, table, action);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//**Test:OK* /


//Recuperer la liste des taches
router.get("/api/todos/historique", async (req, res) => {
    try {
        const todos = await getTodosHistorique();
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//**Test:OK*/


//Mettre a jour just un champ de la tache
// Route pour mettre à jour uniquement le champ auteur d'une tâche
// Route PUT pour mettre à jour l'auteur d'une tâche
router.put("/api/todo/updateAuthor", async (req, res) => {
    const { table, id, newStatus } = req.body;

    if (!table || !id || !newStatus) {
        return res.status(400).json({ error: "Tous les champs (table, id, newAuthor) sont requis." });
    }

    try {
        const updatedTodo = await updateAuthor(table, id, newStatus);

        if (!updatedTodo) {
            return res.status(404).json({ error: `Tâche avec l'ID ${id} introuvable dans ${table}.` });
        }

        return res.status(200).json(updatedTodo);
    } catch (error) {
        console.error(`Erreur serveur : ${error.message}`);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
});         


export default router;
