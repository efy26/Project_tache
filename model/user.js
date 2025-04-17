import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Créer une instance du client prisma
const prisma = new PrismaClient();

// Pour récupérer un utilisateur par son email
export const getUserByEmail = async (email) => {
    const utilisateur = await prisma.utilisateur.findUnique({
        where: {
            email,
        },
    });
    return utilisateur;
};

// Pour ajouter un utilisateur
export const addUser = async (email, motDePasse) => {
    const utilisateur = await prisma.utilisateur.create({
        data: {
            email,
            motDePasse: await bcrypt.hash(motDePasse, 10)
        },
    });
    return utilisateur;
};

// Pour comparer le mot de passe
export const validatePassword = async (motDePasse, motDePasseHache) => {
    const match = await bcrypt.compare(motDePasse, motDePasseHache);
    return match; 
};
