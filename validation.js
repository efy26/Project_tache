// validation.js
// Vérifier si le titre et la description sont valides
 
export const isTitleValid = (title) => {
  if (typeof title !== "string") return false;
  const trimmedTitle = title.trim();
  return trimmedTitle.length >= 5 && trimmedTitle.length <= 20;
};
 
export const isDescriptionValid = (description) => {
  if (typeof description !== "string") return false;
  const trimmedDescription = description.trim();
  return trimmedDescription.length >= 5 && trimmedDescription.length <= 50;
};
 


// verifier si l'email est valide
export const isEmailValid = (email) =>
  email &&
  typeof email === "string" &&
  email.length >= 5 &&
  email.length <= 50 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// verifier si le password est valide
export const isPasswordValid = (password) =>
  password &&
  typeof password === "string" &&
  password.length >= 8 &&
  password.length <= 16;
