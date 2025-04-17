document.addEventListener("DOMContentLoaded", function () {
    const openHistoryBtn = document.getElementById("openHistory");
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopupBtn = document.getElementById("closePopup");
    const toggleFormBtn = document.getElementById("toggleForm");
    const taskForm = document.getElementById("taskForm");
    const taskLists = document.querySelectorAll(".task-list");
    
    const sortPrio = document.getElementById("sortPriority");
    const sortPrioritySelect = document.getElementById("sortPrioritySelect");
    const sortDateL = document.getElementById("sortDateLimite");
    const sortDateC = document.getElementById("sortDateCreate");
    // updateSatut.addEventListener("click", statutUpdate)

    //Triage
    sortPrio.addEventListener("click", () => displayAllTasks2("priorite"));
    sortDateL.addEventListener("click", () => displayAllTasks3("dateLimite"));
    sortDateC.addEventListener("click", () => displayAllTasks3("datecreate"));
    // URLs des routes backend
    const API_BASE_URL = "http://localhost:5005/api";

    // Ouvrir la popup d'historique
    openHistoryBtn.addEventListener("click", async () => {
        popupOverlay.style.display = "flex";
        await fetchAndDisplayHistory();
    });

    // Fermer la popup
    closePopupBtn.addEventListener("click", () => {
        popupOverlay.style.display = "none";
    });

    // Fermer en cliquant en dehors du popup
    popupOverlay.addEventListener("click", (event) => {
        if (event.target === popupOverlay) {
            popupOverlay.style.display = "none";
        }
    });

    // Afficher/Cacher le formulaire
    toggleFormBtn.addEventListener("click", () => {
        taskForm.classList.toggle("hidden");
    });

    // Gérer la soumission du formulaire
    taskForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = document.getElementById("taskTitle").value.trim();
        const description = document.getElementById("taskDescription").value.trim();
        const priority = document.getElementById("taskPriority").value;
        const assignedTo = document.getElementById("taskAssigned").value.trim();
        const deadline = document.getElementById("taskDeadline").value;
        const status = document.getElementById("taskStatus").value.trim();

        if (title && description && assignedTo && deadline) {
            const taskData = { titre: title, description, priorite: priority, assigne: assignedTo, dateLimite: deadline, status: status };
            await createTask(taskData); // Créer la tâche dans le backend
            await displayAllTasks()// Rafraîchir les tâches affichées
            alert("Tâche ajoutée avec succès !");
            taskForm.reset();
            taskForm.classList.add("hidden");
        } else {
            alert("Veuillez remplir tous les champs !");
        }
    });



// Fonction pour créer une tâche
async function createTask(taskData) {
    try {
        const response = await fetch(`http://localhost:5005/api/todo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData),
        });
        if (!response.ok) throw new Error("Erreur lors de la création de la tâche");
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}



    // Fonction pour afficher les tâches

    async function fetchAndDisplayTasks(table) {
        try {
            const response = await fetch(`http://localhost:5005/api/todos?table=${table}`);
            if (!response.ok) throw new Error(`Erreur lors de la récupération des tâches pour la table ${table}`);
            const tasks = await response.json();

            const taskList = document.getElementById(`${table}`);
            if (!taskList) {
                console.error(`La liste de tâches pour la table ${table} n'existe pas.`);
                return;
            }

            taskList.innerHTML = "";

            tasks.forEach(task => {
                addTaskToDOM(task, taskList);
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function displayAllTasks() {
        const tables = ["AFaire", "Encours", "Enrevision", "Termine"];
        for (const table of tables) {
            await fetchAndDisplayTasks(table);
        }
    }


    //AFfichage des tries
    async function fetchAndDisplayTaskstrie(table, sortBy, sortPrioritySelects) {
        try {
            const response = await fetch(`http://localhost:5005/api/todos/sorted-by-priority?table=${table}&sortBy=${sortBy}`);
            if (!response.ok) throw new Error(`Erreur lors de la récupération des tâches pour la table ${table}`);
            const tasks = (await response.json()).data;

            const selectValues = tasks.filter(task => task.priorite === sortPrioritySelects)
                
                
            const taskList = document.getElementById(`${table}`);

            
            if (!taskList) {
                console.error(`La liste de tâches pour la table ${table} n'existe pas.`);
                return;
            }

            taskList.innerHTML = "";

            selectValues.forEach(task => {
                addTaskToDOM(task, taskList);
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function displayAllTasks2(sortBy) {
        const tables = ["AFaire", "Encours", "Enrevision", "Termine"];
        const value = sortPrioritySelect.value
        for (const table of tables) {

            await fetchAndDisplayTaskstrie(table, sortBy, value);
        }

        
    }

    async function fetchAndDisplayTaskstrie2(table, sortBy) {
        try {
            const response = await fetch(`http://localhost:5005/api/todos/sorted?table=${table}&sortBy=${sortBy}`);
            if (!response.ok) throw new Error(`Erreur lors de la récupération des tâches pour la table ${table}`);
            const tasks = await response.json();

            const taskList = document.getElementById(`${table}`);
            if (!taskList) {
                console.error(`La liste de tâches pour la table ${table} n'existe pas.`);
                return;
            }

            taskList.innerHTML = "";

            tasks.forEach(task => {
                addTaskToDOM(task, taskList);
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function displayAllTasks3(sortBy) {
        const tables = ["AFaire", "Encours", "Enrevision", "Termine"];
        for (const table of tables) {
            await fetchAndDisplayTaskstrie2(table, sortBy);
        }
    }




    // Fonction pour afficher l'historique
    async function fetchAndDisplayHistory() {
        try {
            const response = await fetch('http://localhost:5005/api/todos/historique');
            if (!response.ok) throw new Error("Erreur lors de la récupération de l'historique");
            const history = await response.json();

            const historyContent = document.querySelector("#popupOverlay .popup-content p");
            historyContent.innerHTML = history.map(entry => `
                <div>
                    <strong>${entry.titre}</strong> - ${entry.action} le ${new Date(entry.datecreate).toLocaleDateString()}
                    <p>Par : User 1</p>
                </div>
            `).join("");
        } catch (error) {
            console.error(error);
        }
    }

    // Fonction pour ajouter une tâche au DOM
    function addTaskToDOM(task, taskList) {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        taskItem.setAttribute("draggable", true);
        taskItem.setAttribute("data-id", task.id);

        const priorityClass = task.priorite === "basse" ? "priority-basse" :
            task.priorite === "moyenne" ? "priority-moyenne" : "priority-haute";

        taskItem.innerHTML = `
            <div class="task-text">
                <strong>${task.titre}</strong><br>
                <small>Date: ${new Date(task.dateLimite).toLocaleDateString()}</small>
            </div>
            <span class="task-priority ${priorityClass}">${task.priorite}</span>
            <button class="voir-plus-btn">Voir+</button>
        `;

        taskList.appendChild(taskItem);

        // Gérer le bouton "Voir+"
        const voirPlusBtn = taskItem.querySelector(".voir-plus-btn");
        voirPlusBtn.addEventListener("click", () => showTaskDetails(task));
    }

    // Fonction pour afficher les détails d'une tâche
    function showTaskDetails(task, table) {
        const popup = document.createElement("div");
        popup.classList.add("popup");

        popup.innerHTML = `
        <div class="popup-content">
            <h3>${task.titre}</h3>
            <p><strong>Description :</strong> ${task.description}</p>
            <p><strong>Assigné à :</strong> ${task.assigne}</p>
            <p><strong>Date de création :</strong> ${task.datecreate}</p>
            <p><strong>Date limite :</strong> ${new Date(task.dateLimite).toLocaleDateString()}</p>
            <div class="popup-buttons">
                <button class="modifier-btn">Modification</button>
                <button class="supprimer-btn">Suppression</button>
                <button class="done-btn">Done</button>
                <button class="close-btn"><i class="fas fa-times"></i> Fermer</button>
            </div>
        </div>
    `;

        document.body.appendChild(popup);

        // Gérer les boutons du popup
        const modifierBtn = popup.querySelector(".modifier-btn");
        const supprimerBtn = popup.querySelector(".supprimer-btn");
        const doneBtn = popup.querySelector(".done-btn");
        const closeBtn = popup.querySelector(".close-btn");
        const table2 = task.status; // Remplace par la vraie table
        const taskId = task.id; // Remplace par l'ID de la tâche
        const newStatus = task.status; // Remplace par le nouvel status
        //Modifier dans le voir +
        // Affichage du popup de modification
        modifierBtn.addEventListener("click", () => {
            showEditPopup(task, table2, popup);
        });
        //Fermer le popup
        closeBtn.addEventListener("click", () => {
            popup.classList.add("hidden"); // Ajouter une classe pour l'animation
            setTimeout(() => popup.remove(), 300); // Supprimer le popup après l'animation
        });

        //Modif le status
        updateAuthor(table2, taskId, newStatus);
        //Popup de transfert
        // Ouvrir un deuxième popup pour choisir la table de destination


        doneBtn.addEventListener("click", () => {
            // Masquer le premier popup
            popup.classList.add("hidden");

            // Créer le deuxième popup pour choisir la table de destination
            const tableSelectionPopup = document.createElement("div");
            tableSelectionPopup.classList.add("popup");

            tableSelectionPopup.innerHTML = `
            <div class="popup-content">
                <h3>Choisir la table de destination</h3>
                <div class="popup-buttons">
                    <button class="table-btn" data-table="AFaire">À faire</button>
                    <button class="table-btn" data-table="Encours">En cours</button>
                    <button class="table-btn" data-table="Enrevision">En révision</button>
                    <button class="table-btn" data-table="Termine">Terminé</button>
                    <button class="close-btn"><i class="fas fa-times"></i> Annuler</button>
                </div>
            </div>
        `;
            document.body.appendChild(tableSelectionPopup);

            // Gérer la sélection de la table de destination
            const tableButtons = tableSelectionPopup.querySelectorAll(".table-btn");
            const closeTablePopupBtn = tableSelectionPopup.querySelector(".close-btn");
            

            tableButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const toTable = button.getAttribute("data-table");

                    transferTask(task.id, task.status, toTable); // Appeler transferTask avec la table sélectionnée
                    tableSelectionPopup.remove(); // Fermer le deuxième popup
                    popup.remove(); // Fermer le premier popup
                });
            });

            // Fermer le deuxième popup sans sélectionner de table
            closeTablePopupBtn.addEventListener("click", () => {
                tableSelectionPopup.remove();
                popup.classList.remove("hidden"); // Réafficher le premier popup
            });
        });




        // Ouvrir un deuxième popup pour choisir la table lors de la suppression
        supprimerBtn.addEventListener("click", () => {
            // Créer le deuxième popup
            const tableSelectionPopup = document.createElement("div");
            tableSelectionPopup.classList.add("popup");

            tableSelectionPopup.innerHTML = `
            <div class="popup-content">
                <h3>Dans quelle table voulais vous supprimer</h3>
                <div class="popup-buttons">
                    <button class="table-btn" data-table="AFaire">À faire</button>
                    <button class="table-btn" data-table="Encours">En cours</button>
                    <button class="table-btn" data-table="Enrevision">En révision</button>
                    <button class="table-btn" data-table="Termine">Terminé</button>
                    <button class="close-btn"><i class="fas fa-times"></i> Annuler</button>
                </div>
            </div>
        `;

            document.body.appendChild(tableSelectionPopup);

            // Gérer la sélection de la table
            const tableButtons = tableSelectionPopup.querySelectorAll(".table-btn");
            const closeTablePopupBtn = tableSelectionPopup.querySelector(".close-btn");

            tableButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const selectedTable = button.getAttribute("data-table");
                    deleteTask(selectedTable, task.id); // Appeler deleteTask avec la table sélectionnée
                    tableSelectionPopup.remove(); // Fermer le deuxième popup
                });
            });

            // Fermer le deuxième popup sans sélectionner de table
            closeTablePopupBtn.addEventListener("click", () => {
                tableSelectionPopup.remove();
            });
        });
    }


    //uptade un champ dun tache
    // Fonction pour mettre à jour uniquement le champ auteur d'une tâche
    async function updateAuthor(table, taskId, newStatus) {
        try {
            const response = await fetch(`http://localhost:5005/api/todo/updateAuthor`, {
                method: "PUT", // Utiliser PUT pour une mise à jour partielle
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    table: table, // Nom de la table où se trouve la tâche
                    id: taskId, // ID de la tâche à modifier
                    newStatus: newStatus // Nouvelle valeur pour le champ auteur
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'auteur");

            console.log(`Tâche mise à jour : Table = ${table}, ID = ${taskId}, Nouvel Auteur = ${newStatus}`);

            await displayAllTasks(); // Rafraîchir les tâches affichées après la mise à jour
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'auteur :", error);
        }
    }




    // Fonction pour transférer une tâche
    async function transferTask(taskId, fromTable, toTable) {
        try {
            const response = await fetch(`http://localhost:5005/api/todos/transfer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromTable, // Table d'origine (valeur de l'auteur)
                    toTable,    // Table de destination (choisie par l'utilisateur)
                    id: taskId, // ID de la tâche
                    status: toTable // Mettre à jour l'auteur avec la table de destination
                }),
            });
            if (!response.ok) throw new Error("Erreur lors du transfert de la tâche");

            await displayAllTasks(); // Rafraîchir les tâches affichées
        } catch (error) {
            console.error(error);
        }
    }

    // Fonction pour supprimer une tâche
    async function deleteTask(table, taskId) {
        try {
            const response = await fetch(`/api/todo/deleteTodo`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table, id: taskId }),
            });
            if (!response.ok) throw new Error("Erreur lors de la suppression de la tâche");
            await displayAllTasks(); // Rafraîchir les tâches affichées
        } catch (error) {
            console.error(error);
        }
    }

    // Fonction pour modifier une tâche
    // Fonction pour afficher le popup de modification
    function showEditPopup(task, table, parentPopup) {
        const editPopup = document.createElement("div");
        editPopup.classList.add("popup");

        editPopup.innerHTML = `
    <div class="popup-content">
        <h3>Modifier la tâche</h3>
        <label>Titre :</label>
        <input type="text" id="edit-title" value="${task.titre}">

        <label>Description :</label>
        <textarea id="edit-description">${task.description}</textarea>

        <label>Date limite :</label>
        <input type="date" id="edit-date" value="${task.dateLimite ? new Date(task.dateLimite).toISOString().split("T")[0] : ''}">

        <label>Priorité :</label>
        <select id="edit-priority">
            <option value="INFERIOR" ${task.priorite === "INFERIOR" ? "selected" : ""}>Basse</option>
            <option value="MOYEN" ${task.priorite === "MOYEN" ? "selected" : ""}>Moyenne</option>
            <option value="HAUT" ${task.priorite === "HAUT" ? "selected" : ""}>Haute</option>
        </select>

        <div class="popup-buttons">
            <button class="save-btn">Enregistrer</button>
            <button class="close-edit-btn"><i class="fas fa-times"></i> Annuler</button>
        </div>
    </div>
    `;

        document.body.appendChild(editPopup);

        // Gérer la fermeture du popup de modification
        const closeEditBtn = editPopup.querySelector(".close-edit-btn");
        closeEditBtn.addEventListener("click", () => {
            editPopup.remove();
        });

        // Sauvegarde des modifications
        const saveBtn = editPopup.querySelector(".save-btn");
        saveBtn.addEventListener("click", async () => {
            const newTitle = document.getElementById("edit-title").value;
            const newDescription = document.getElementById("edit-description").value;
            const newDate = document.getElementById("edit-date").value;
            const newPriority = document.getElementById("edit-priority").value;

            // Appel à la mise à jour
            await updateTask(table, task.id, {
                titre: newTitle,
                description: newDescription,
                dateLimite: newDate,
                priorite: newPriority
            });

            // Fermer les popups après mise à jour
            editPopup.remove();
            parentPopup.remove();
        });
    }

    // Fonction pour mettre à jour une tâche via l'API
    async function updateTask(table, taskId, data) {
        try {
            const response = await fetch("http://localhost:5005/api/todo/updateTodo", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table, id: taskId, data }),
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour de la tâche");

            console.log("Tâche mise à jour avec succès !");
            await displayAllTasks(); // Rafraîchir l'affichage
        } catch (error) {
            console.error(error);
        }
    }

    // Gestion du drag-and-drop
    taskLists.forEach(list => {
        list.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        list.addEventListener("drop", async (e) => {
            e.preventDefault();
            const taskHTML = e.dataTransfer.getData("text/plain");
            const taskId = taskHTML.match(/data-id="(\d+)"/)[1];
            const toTable = e.target.closest(".task-column").id;
            await transferTask(taskId, toTable);
        });
    });

    // Charger les tâches au démarrage
    displayAllTasks();
});

