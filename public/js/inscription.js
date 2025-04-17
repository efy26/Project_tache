let inputCourrielinsr = document.getElementById("input-courrielins");
let inputMotDePasseinscr = document.getElementById("input-mot-de-passeins");
let formConnexioninscr = document.getElementById("form-inscription");

formConnexioninscr.addEventListener("submit", async (event) => {
    event.preventDefault(); 

    const email = inputCourrielinsr.value.trim();
    const motDePasse = inputMotDePasseinscr.value.trim();

    if (!email || !motDePasse) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (!email.includes("@")) {
        alert("Veuillez entrer un courriel valide.");
        return;
    }

    if (motDePasse.length < 6) {
        alert("Le mot de passe doit contenir au moins 6 caractères.");
        return;
    }

    try {
        const response = await fetch("/inscription", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, motDePasse }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Inscription réussie !");
            window.location.href = "/connexions"; 
        } else {
            alert(`Erreur : ${result.error || "Inscription échouée."}`);
        }
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        alert("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
});
