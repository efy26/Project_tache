//Doit etre en debut de fichier pour charger les variables d'environnement
import "dotenv/config";

//importer les routes
import routerExterne from "./routes.js";
import userRoutes from "./user.js";

// Importation des fichiers et librairies
import express, { json } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cspOption from "./csp-options.js";

// Crréation du serveur expressn
const app = express();

// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());

//Middeleware integre a express pour gerer la partie static du serveur
//le dossier 'public' est la partie statique de notre serveur
app.use(express.static("public"));

// Ajout des routes
app.use(routerExterne);
app.use(userRoutes);

// Renvoyer une erreur 404 pour les routes non définies
app.use((request, response) => {
 // Renvoyer simplement une chaîne de caractère indiquant que la page n'existe pas
 response.status(404).send(`${request.originalUrl} Route introuvable.`);
});

//Démarrage du serveur
app.listen(process.env.PORT);
console.info("Serveur démarré :");
console.info(`http://localhost:${process.env.PORT}`);
