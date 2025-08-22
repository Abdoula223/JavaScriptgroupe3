// Récupérer la référence du tbody du tableau des smartphones
const phonesTbody = document.getElementById("phones-tbody");

// Tableau local pour stocker les smartphones chargés depuis l'API
let smartphones = [];

// URL dynamique (local ou Render)
const API_BASE =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000/smartphones"
    : "https://javascriptgroupe3.onrender.com/smartphones";

// Fonction pour afficher une section et cacher les autres (list, detail, add)
function showSection(id) {
  ["list", "detail", "add"].forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = sectionId === id ? "block" : "none";
    }
  });
}

// Fonction pour créer et ajouter une ligne (tr) dans le tableau
function creerSmartphone(id, nom, prix) {
  const tr = document.createElement("tr");
  tr.dataset.id = id;

  tr.innerHTML = `
    <td class="px-4 py-2">${id}</td>
    <td class="px-4 py-2">${nom}</td>
    <td class="px-4 py-2">${Number(prix).toLocaleString("fr-FR")} FCFA</td>
    <td class="px-4 py-2">
      <button type="button" onclick="detaillerSmartphone('${id}')" 
        class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition mr-2">
        Voir
      </button>
      <button type="button" onclick="supprimerSmartphone('${id}')" 
        class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
        Supprimer
      </button>
    </td>
  `;

  phonesTbody.appendChild(tr);
}

// Fonction pour charger la liste des smartphones depuis l'API
async function loadSmartphones() {
  try {
    const res = await fetch(API_BASE);
    smartphones = await res.json();
    phonesTbody.innerHTML = "";
    smartphones.forEach(p => creerSmartphone(p.id, p.nom, p.prix));
  } catch (error) {
    console.error("Erreur lors du chargement :", error);
  }
}

// Fonction pour afficher le détail d’un smartphone
function detaillerSmartphone(id) {
  const phone = smartphones.find(p => p.id == id);
  if (!phone) return alert("Smartphone introuvable !");

  const imgContainer = document.getElementById('detail-img-container');
  imgContainer.innerHTML = "";
  const img = document.createElement('img');
  img.src = phone.photo || 'images/default.jpg';
  img.alt = phone.nom;
  img.className = "w-full h-48 object-cover";
  imgContainer.appendChild(img);

  document.getElementById('detail-nom').textContent = phone.nom;
  document.getElementById('detail-marque').textContent = phone.marque;
  document.getElementById('detail-prix').textContent =
    Number(phone.prix).toLocaleString("fr-FR") + " FCFA";
  document.getElementById('detail-ram').textContent = phone.ram + " RAM";
  document.getElementById('detail-rom').textContent = phone.rom + " ROM";
  document.getElementById('detail-description').textContent = phone.description;
  document.getElementById('detail-ecran').textContent = phone.ecran;

  const couleursContainer = document.getElementById('detail-couleurs');
  couleursContainer.innerHTML = "";
  if (phone.couleurs && phone.couleurs.length > 0) {
    phone.couleurs.forEach(c => {
      const span = document.createElement('span');
      span.style.backgroundColor = c;
      span.className =
        "px-2 py-1 text-xs rounded-full border border-gray-300 inline-block mr-1";
      couleursContainer.appendChild(span);
    });
  }

  showSection("detail");
}

// Fonction pour supprimer un smartphone
async function supprimerSmartphone(id) {
  const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce smartphone ?");
  if (!confirmation) return;

  smartphones = smartphones.filter(p => p.id != id);
  document.querySelector(`tr[data-id="${id}"]`)?.remove();

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Erreur serveur");
  } catch (error) {
    console.error("Erreur lors de la suppression à distance:", error);
    localStorage.setItem("smartphones", JSON.stringify(smartphones));
  }

  showSection("list");
}

async function ajouterSmartphone(e) {
  e.preventDefault();
  const form = e.target;

  const nouveauPhone = {
    nom: form.nom.value,
    marque: form.marque.value,
    description: form.description.value,
    prix: Number(form.prix.value),
    ram: form.ram.value,
    rom: form.rom.value,
    ecran: form.ecran.value,
    couleurs: [form.couleurs.value],
    photo: "images/default.jpg" // provisoire
  };

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nouveauPhone)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error("Erreur lors de l'ajout : " + errText);
    }

    const phoneAjoute = await res.json();
    smartphones.push(phoneAjoute);
    creerSmartphone(phoneAjoute.id, phoneAjoute.nom, phoneAjoute.prix);

    form.reset();
    showSection("list");
    loadSmartphones();
  } catch (err) {
    console.error("❌ Erreur ajout :", err);
    alert(err.message);
  }
}

});
