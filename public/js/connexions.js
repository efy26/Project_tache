let inputCourriel = document.getElementById("input-courriel");
let inputMotDePasse = document.getElementById("input-mot-de-passe");
let formConnexion = document.getElementById("form-connexion");


formConnexion.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        email: inputCourriel.value,
        motDePasse: inputMotDePasse.value,
    };

    let response = await fetch("/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        window.location.replace("/");
    } else {
        const contentType = response.headers.get("content-type");
    
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            alert("Échec de connexion : " + (data.error || "Erreur inconnue"));
        } else {
            const text = await response.text();
            alert("Erreur inattendue : " + text);
        }
    }
    
    
});
