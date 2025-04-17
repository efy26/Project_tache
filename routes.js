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
    getTodosSortedByPriority,
    updateAuthor
} from "./model/todo.js";
import passport from "passport";
import { addUser } from "./model/user.js";
import {
    isDescriptionValid,
    isEmailValid,
    isPasswordValid,
} from "./validation.js";

const router = Router();

import { Strategy as LocalStrategy } from "passport-local";
import { getUserByEmail, validatePassword } from "./model/user.js";

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'motDePasse',
    },
    async (email, motDePasse, done) => {
        try {
            const utilisateur = await getUserByEmail(email);
            if (!utilisateur) {
                return done(null, false, { message: 'Email non trouvé' });
            }

            const isPasswordValid = await validatePassword(motDePasse, utilisateur.motDePasse);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Mot de passe incorrect' });
            }

            return done(null, utilisateur);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((utilisateur, done) => {
    done(null, utilisateur.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const utilisateur = await getUserById(id);
        done(null, utilisateur);
    } catch (error) {
        done(error);
    }
});

router.post("/connexion", (request, response, next) => {
    if (
        isEmailValid(request.body.email) &&
        isPasswordValid(request.body.motDePasse)
    ) {
        passport.authenticate("local", (erreur, Utilisateur, info) => {
            if (erreur) {
                console.error("Erreur d'authentification:", erreur);
                return next(erreur);
            } 
            
            if (!Utilisateur) {
                return response.status(401).json({
                    error: info ? info.message : "Identifiants incorrects"
                });
            }

            request.logIn(Utilisateur, (erreur) => {
                if (erreur) {
                    console.error("Erreur lors de l'ajout de l'utilisateur dans la session :", erreur);
                    return next(erreur);
                }

                if (!request.session.Utilisateur) {
                    request.session.Utilisateur = Utilisateur;
                }

                response.status(200).json({
                    message: "Connexion réussie",
                    Utilisateur,
                });
            });
        })(request, response, next);
    } else {
        response.status(400).json({
            error: "Email ou mot de passe invalide"
        });
    }
});

router.get("/profil", (request, response) => {
    if (request.isAuthenticated()) {
        response.status(200).json({
            message: "Utilisateur connecté",
            utilisateur: request.user,
        });
    } else {
        response.status(401).json({
            message: "Utilisateur non connecté",
        });
    }
});

router.post("/inscription", async (request, response) => {
    const { email, motDePasse } = request.body;

    if (!isEmailValid(email)) {
        return response.status(400).json({ error: "Email invalide" });
    }

    if (!isPasswordValid(motDePasse)) {
        return response.status(400).json({ error: "Mot de passe invalide (min 6 caractères par exemple)" });
    }

    try {
        const Utilisateur = await addUser(email, motDePasse);
        response.status(200).json({ Utilisateur, message: "Utilisateur ajouté avec succès" });
    } catch (error) {
        if (error.code === "P2002") {
            response.status(409).json({ error: "Email déjà utilisé" });
        } else {
            response.status(400).json({ error: error.message });
        }
    }
});

router.get("/connexions", (request, response) => {
    response.render("connexions", {
        titre: "Connexions",
        styles: ["css/style.css"],
        scripts: ["./js/main.js"],
    });
});

router.get("/inscription", (request, response) => {
    response.render("inscription", {
        titre: "Inscription",
        styles: ["css/style.css"],
        scripts: ["./js/main.js"],
    });
});

router.post("/login", async (req, res) => {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const ok = await motDePasseOK(email, motDePasse);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });

    res.json({ message: "Connexion réussie" });
});

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

router.get("/api/todos/sorted-by-priority", async (req, res) => {
    const { table } = req.query;

    try {
        const sortedTodos = await getTodosSortedByPriority(table);
        res.status(200).json({
            success: true,
            message: `Tâches de la table ${table} triées par priorité récupérées avec succès !`,
            data: sortedTodos,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Erreur lors de la récupération des tâches triées par priorité : ${error.message}`,
        });
    }
});

router.post("/api/todo", async (req, res) => {
    const data = req.body;
    
    try {
        const newTodo = await addTodo(data);
        await addHistoryEntry(newTodo.id, newTodo.status, "AJOUTER");

        res.status(201).json({ todo: newTodo, message: "Tâche créée avec succès" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

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

router.post("/api/todos/transfer", async (req, res) => {
    const { fromTable, toTable, id } = req.body;

    try {
        const transferredTodo = await transferTodo(fromTable, toTable, id);
        await addHistoryEntry(transferredTodo.id, transferredTodo.status, "TRANSFERER");

        res.status(200).json({
            success: true,
            message: `Tâche ID ${id} transférée de ${fromTable} vers ${toTable} avec succès !`,
            data: transferredTodo,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Erreur lors du transfert : ${error.message}`,
        });
    }
});

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

router.get("/api/todos/historique", async (req, res) => {
    try {
        const todos = await getTodosHistorique();
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
});

export default router;
