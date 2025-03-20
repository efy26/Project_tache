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
 