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

// Importer Passport et la stratégie locale
import { Strategy as LocalStrategy } from "passport-local";
import { getUserByEmail, validatePassword } from "./model/user.js"; // Exemple de fonction pour vérifier l'email et le mot de passe

// Configurer la stratégie locale
passport.use(new LocalStrategy(
    {
        usernameField: 'email', // ou 'username' si vous utilisez un nom d'utilisateur
        passwordField: 'motDePasse', // 'motDePasse' selon votre modèle
    },
    async (email, motDePasse, done) => {
        try {
            // Vérifiez l'utilisateur dans la base de données (fonction à adapter)
            const utilisateur = await getUserByEmail(email);
            if (!utilisateur) {
                return done(null, false, { message: 'Email non trouvé' });
            }

            // Vérifiez si le mot de passe est correct (fonction à adapter)
            const isPasswordValid = await validatePassword(motDePasse, utilisateur.motDePasse);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Mot de passe incorrect' });
            }

            // Si tout est OK, l'utilisateur est authentifié
            return done(null, utilisateur);
        } catch (error) {
            return done(error);
        }
    }
));

// Sérialiser l'utilisateur dans la session
passport.serializeUser((utilisateur, done) => {
    done(null, utilisateur.id); // Par exemple, on stocke l'ID dans la session
});

// Désérialiser l'utilisateur depuis la session
passport.deserializeUser(async (id, done) => {
    try {
        const utilisateur = await getUserById(id); // Fonction pour retrouver l'utilisateur par son ID
        done(null, utilisateur);
    } catch (error) {
        done(error);
    }
});

router.post("/connexion", (request, response, next) => {
    // On vérifie si le courriel et le mot de passe sont valides
    if (
        isEmailValid(request.body.email) &&
        isPasswordValid(request.body.motDePasse)
    ) {
        // On lance l'authentification avec passport.js
        passport.authenticate("local", (erreur, Utilisateur, info) => {
            if (erreur) {
                // S'il y a une erreur lors de l'authentification, on la passe au serveur
                console.error("Erreur d'authentification:", erreur);
                return next(erreur);
            } 
            
            if (!Utilisateur) {
                // Si l'utilisateur n'est pas trouvé (mauvais identifiants), on renvoie une erreur 401
                return response.status(401).json({
                    error: info ? info.message : "Identifiants incorrects"
                });
            }

            // Si tout fonctionne, on ajoute l'utilisateur dans la session et on renvoie une réponse 200
            request.logIn(Utilisateur, (erreur) => {
                if (erreur) {
                    // En cas d'erreur lors de la connexion dans la session
                    console.error("Erreur lors de l'ajout de l'utilisateur dans la session :", erreur);
                    return next(erreur);
                }

                // On stocke l'utilisateur dans la session si ce n'est pas déjà fait
                if (!request.session.Utilisateur) {
                    request.session.Utilisateur = Utilisateur;
                }

                // Réponse de succès avec l'utilisateur
                response.status(200).json({
                    message: "Connexion réussie",
                    Utilisateur,
                });
            });
        })(request, response, next);
    } else {
        // Si l'email ou le mot de passe est invalide, on renvoie une erreur 400
        response.status(400).json({
            error: "Email ou mot de passe invalide"
        });
    }
});


//Route pour ajouter un utilisateur
router.post("/inscription", async (request, response) => {
    const { email, motDePasse } = request.body;

    // Validation des champs
    if (!isEmailValid(email)) {
        return response.status(400).json({ error: "Email invalide" });
    }

    if (!isPasswordValid(motDePasse)) {
        return response.status(400).json({ error: "Mot de passe invalide (min 6 caractères par exemple)" });
    }

    try {
        const Utilisateur = await addUser(email, motDePasse);
        response
            .status(200)
            .json({ Utilisateur, message: "Utilisateur ajouté avec succès" });
    } catch (error) {
        console.log("error", error.code);
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
