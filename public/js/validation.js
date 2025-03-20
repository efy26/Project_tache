//.js/validation.js
const inputText = document.getElementById("taskTitle");
const due_date = document.getElementById("taskDeadline");
const errorMsg = document.getElementById("edit-error-msg");
const errorMsgDate = document.getElementById("edit-error-date");
 
export const validateTitle = () => {
 if (inputText.validity.valid) {
  errorMsg.innerHTML = "";
  return true;
 } else {
  if (inputText.validity.valueMissing) {
   errorMsg.innerHTML = "Ce champ est obligatoire";
   return false;
  } else {
   if (inputText.validity.tooShort) {
    errorMsg.innerHTML = "Veuillez entrer au moins 5 caractères";
    return false;
   }
  }
 }
};
 
// Fonction pour valider la date
export const validateDate = () => {
 const currentDate = new Date(); // Date actuelle avec l'heure (complet)
 
 // On formate la date actuelle au format 'YYYY-MM-DD' pour comparaison
 const currentDateString = currentDate.toISOString().split("T")[0]; // Format 'YYYY-MM-DD'
 
 // Vérifier si la date est vide
 if (!due_date.value) {
  errorMsgDate.innerHTML = "La date est obligatoire."; // Message d'erreur si la date est vide
  return false; // Retourner faux si la validation échoue
 }
 
 /*
 // Vérifier si la date est inférieure à la date actuelle
 if (due_date.value < currentDateString) {
  errorMsgDate.innerHTML =
   "La date doit être égale ou supérieure à aujourd'hui."; // Message d'erreur si la date est invalide
  return false; // Retourner faux si la validation échoue
 }*/
 
 // Si toutes les conditions sont remplies
 errorMsgDate.innerHTML = ""; // Supprimer le message d'erreur
 return true; // Retourner vrai si la validation réussit
};