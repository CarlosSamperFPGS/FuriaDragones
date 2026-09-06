// Furia de Dragones - Controlador Principal del Gestor de Builds

import { ITEMS_DATABASE, getAlbionItemIconUrl } from './data/items.js';
import { SPELLS_DATABASE, getAlbionSpellIconUrl } from './data/spells.js';
import { DEFAULT_BUILDS } from './data/default-builds.js';

// ==========================================================================
// Estado Global
// ==========================================================================
let currentBuild = {
  id: null,
  name: "Nueva Build",
  role: "DPS",
  folder: "ZvZ",
  notes: "",
  equipment: {
    head: null,
    mainhand: null,
    offhand: null,
    armor: null,
    shoes: null,
    cape: null,
    food: null,
    potion: null,
    mount: null
  }
};

let activeSelectedFolder = "ALL";
let activeModalSlot = null;
let activeSpellSlot = null;
let activeSpellType = null;

const DEFAULT_FOLDERS = [
  "ZvZ",
  "Ganking & Roaming",
  "PvE & Dungeons",
  "Small Scale & 5v5",
  "Nieblas & 1v1",
  "Soporte & Healers"
];

// Versión del almacenamiento para migrar datos anteriores
const STORAGE_VERSION = "v2_verified_ids";

// ==========================================================================
// Inicialización
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  setupNavigation();
  setupSlotClickEvents();
  setupModalEvents();
  setupFormEvents();
  setupActionButtons();
  setupFolderEvents();
  
  if (window.location.hash.startsWith("#build=")) {
    loadBuildFromUrlHash();
  } else {
    if (DEFAULT_BUILDS.length > 0) {
      loadBuild(DEFAULT_BUILDS[0]);
    } else {
      renderBuild();
    }
  }

  updateFolderDropdowns();
  renderFoldersSidebar();
  renderSavedBuildsList();
  updateSavedBuildsCount();
});

// ==========================================================================
// Almacenamiento Local (LocalStorage)
// ==========================================================================
function initStorage() {
  const currentVer = localStorage.getItem("furia_storage_ver");
  if (currentVer !== STORAGE_VERSION) {
    localStorage.setItem("furia_saved_builds", JSON.stringify(DEFAULT_BUILDS));
    localStorage.setItem("furia_custom_folders", JSON.stringify(DEFAULT_FOLDERS));
    localStorage.setItem("furia_storage_ver", STORAGE_VERSION);
    return;
  }

  const storedBuilds = localStorage.getItem("furia_saved_builds");
  if (!storedBuilds) {
    localStorage.setItem("furia_saved_builds", JSON.stringify(DEFAULT_BUILDS));
  }

  const storedFolders = localStorage.getItem("furia_custom_folders");
  if (!storedFolders) {
    localStorage.setItem("furia_custom_folders", JSON.stringify(DEFAULT_FOLDERS));
  }
}

function getSavedBuilds() {
  try {
    const raw = localStorage.getItem("furia_saved_builds");
    return raw ? JSON.parse(raw) : DEFAULT_BUILDS;
  } catch (e) {
    return DEFAULT_BUILDS;
  }
}

function saveBuildsToStorage(builds) {
  localStorage.setItem("furia_saved_builds", JSON.stringify(builds));
  updateSavedBuildsCount();
  renderFoldersSidebar();
  renderSavedBuildsList();
}

function getAllFolders() {
  try {
    const custom = JSON.parse(localStorage.getItem("furia_custom_folders") || "[]");
    return [...new Set([...DEFAULT_FOLDERS, ...custom])];
  } catch (e) {
    return DEFAULT_FOLDERS;
  }
}

function saveCustomFolders(folders) {
  localStorage.setItem("furia_custom_folders", JSON.stringify(folders));
  updateFolderDropdowns();
  renderFoldersSidebar();
}

function updateSavedBuildsCount() {
  const countSpan = document.getElementById("saved-count");
  if (countSpan) {
    countSpan.textContent = getSavedBuilds().length;
  }
}

// ==========================================================================
// Navegación por Pestañas
// ==========================================================================
function setupNavigation() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabTarget = btn.getAttribute("data-tab");
      
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".tab-section").forEach(sec => {
        sec.classList.remove("active");
      });

      const activeSection = document.getElementById(`tab-${tabTarget}`);
      if (activeSection) {
        activeSection.classList.add("active");
      }

      if (tabTarget === "saved-builds") {
        renderFoldersSidebar();
        renderSavedBuildsList();
      }
    });
  });
}

// ==========================================================================
// Gestión de Carpetas
// ==========================================================================
function setupFolderEvents() {
  const btnCreateFolder = document.getElementById("btn-create-new-folder");
  if (btnCreateFolder) {
    btnCreateFolder.addEventListener("click", () => {
      const folderName = prompt("Introduce el nombre de la nueva carpeta de contenido:");
      if (folderName && folderName.trim()) {
        addNewFolder(folderName.trim());
      }
    });
  }

  const btnAddFolderInline = document.getElementById("btn-add-folder-inline");
  if (btnAddFolderInline) {
    btnAddFolderInline.addEventListener("click", () => {
      const folderName = prompt("Nombre de la nueva carpeta de contenido:");
      if (folderName && folderName.trim()) {
        addNewFolder(folderName.trim());
        const folderSelect = document.getElementById("build-folder-select");
        if (folderSelect) {
          folderSelect.value = folderName.trim();
          currentBuild.folder = folderName.trim();
        }
      }
    });
  }
}

function addNewFolder(name) {
  const folders = getAllFolders();
  if (!folders.includes(name)) {
    folders.push(name);
    saveCustomFolders(folders);
    showToast(`Carpeta "${name}" creada.`);
  }
}

function updateFolderDropdowns() {
  const select = document.getElementById("build-folder-select");
  if (!select) return;

  const folders = getAllFolders();
  select.innerHTML = "";
  folders.forEach(folder => {
    const opt = document.createElement("option");
    opt.value = folder;
    opt.textContent = `📁 ${folder}`;
    if (folder === currentBuild.folder) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderFoldersSidebar() {
  const listEl = document.getElementById("folders-nav-list");
  if (!listEl) return;

  const allBuilds = getSavedBuilds();
  const folders = getAllFolders();

  listEl.innerHTML = "";

  const allItem = document.createElement("li");
  allItem.className = `folder-nav-item ${activeSelectedFolder === 'ALL' ? 'active' : ''}`;
  allItem.innerHTML = `
    <span>📁 Todas</span>
    <span class="folder-badge-count">${allBuilds.length}</span>
  `;
  allItem.addEventListener("click", () => {
    activeSelectedFolder = "ALL";
    renderFoldersSidebar();
    renderSavedBuildsList();
  });
  listEl.appendChild(allItem);

  folders.forEach(folder => {
    const count = allBuilds.filter(b => (b.folder || "ZvZ") === folder).length;
    const item = document.createElement("li");
    item.className = `folder-nav-item ${activeSelectedFolder === folder ? 'active' : ''}`;
    item.innerHTML = `
      <span title="${folder}">📁 ${folder}</span>
      <span class="folder-badge-count">${count}</span>
    `;
    item.addEventListener("click", () => {
      activeSelectedFolder = folder;
      renderFoldersSidebar();
      renderSavedBuildsList();
    });
    listEl.appendChild(item);
  });
}

// ==========================================================================
// Eventos de Ranuras de Equipamiento
// ==========================================================================
function setupSlotClickEvents() {
  document.querySelectorAll(".slot-icon-wrapper").forEach(wrapper => {
    wrapper.addEventListener("click", () => {
      const slot = wrapper.getAttribute("data-slot");
      openItemPickerModal(slot);
    });
  });

  document.querySelectorAll(".spell-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const slot = btn.getAttribute("data-slot");
      const spellType = btn.getAttribute("data-spell-type");
      openSpellPickerModal(slot, spellType);
    });
  });

  const btnClear = document.getElementById("btn-clear-build");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (confirm("¿Deseas vaciar todas las ranuras del equipamiento?")) {
        currentBuild.equipment = {
          head: null,
          mainhand: null,
          offhand: null,
          armor: null,
          shoes: null,
          cape: null,
          food: null,
          potion: null,
          mount: null
        };
        renderBuild();
        showToast("Equipamiento limpiado.");
      }
    });
  }
}

// ==========================================================================
// Formulario de Build
// ==========================================================================
function setupFormEvents() {
  const nameInput = document.getElementById("build-name-input");
  const roleInput = document.getElementById("build-role-input");
  const folderSelect = document.getElementById("build-folder-select");
  const notesInput = document.getElementById("build-notes-input");

  if (nameInput) {
    nameInput.addEventListener("input", (e) => {
      currentBuild.name = e.target.value;
    });
  }
  if (roleInput) {
    roleInput.addEventListener("input", (e) => {
      currentBuild.role = e.target.value;
    });
  }
  if (folderSelect) {
    folderSelect.addEventListener("change", (e) => {
      currentBuild.folder = e.target.value;
    });
  }
  if (notesInput) {
    notesInput.addEventListener("input", (e) => {
      currentBuild.notes = e.target.value;
    });
  }
}

// ==========================================================================
// Botones de Acción
// ==========================================================================
function setupActionButtons() {
  const btnSave = document.getElementById("btn-save-build");
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      const builds = getSavedBuilds();
      const buildToSave = JSON.parse(JSON.stringify(currentBuild));
      
      if (!buildToSave.id) {
        buildToSave.id = "build_" + Date.now();
      }
      
      const existingIdx = builds.findIndex(b => b.id === buildToSave.id);
      if (existingIdx >= 0) {
        builds[existingIdx] = buildToSave;
      } else {
        builds.unshift(buildToSave);
      }

      saveBuildsToStorage(builds);
      showToast(`¡Build guardada en "${buildToSave.folder || 'ZvZ'}"!`);
    });
  }

  const btnDiscord = document.getElementById("btn-copy-discord");
  if (btnDiscord) {
    btnDiscord.addEventListener("click", () => {
      const discordText = generateDiscordText(currentBuild);
      copyToClipboard(discordText, "¡Ficha para Discord copiada al portapapeles!");
    });
  }

  const btnShare = document.getElementById("btn-share-link");
  if (btnShare) {
    btnShare.addEventListener("click", () => {
      const serialized = encodeURIComponent(JSON.stringify(currentBuild));
      const shareUrl = `${window.location.origin}${window.location.pathname}#build=${serialized}`;
      copyToClipboard(shareUrl, "¡Enlace a la build copiado!");
    });
  }

  const btnExport = document.getElementById("btn-export-json");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentBuild, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${(currentBuild.name || 'build').replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Archivo JSON descargado.");
    });
  }

  const btnImport = document.getElementById("btn-import-json");
  const fileImport = document.getElementById("file-import-json");
  if (btnImport && fileImport) {
    btnImport.addEventListener("click", () => {
      fileImport.click();
    });

    fileImport.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported && imported.equipment) {
            loadBuild(imported);
            showToast("Build importada con éxito.");
          } else {
            alert("El archivo JSON no tiene el formato de build correcto.");
          }
        } catch (err) {
          alert("Error al leer el archivo JSON.");
        }
      };
      reader.readAsText(file);
      fileImport.value = "";
    });
  }

  const searchSaved = document.getElementById("search-saved-builds");
  if (searchSaved) {
    searchSaved.addEventListener("input", () => {
      renderSavedBuildsList();
    });
  }
}

// ==========================================================================
// Renderizado Principal de la Build
// ==========================================================================
function renderBuild() {
  const nameInput = document.getElementById("build-name-input");
  const roleInput = document.getElementById("build-role-input");
  const folderSelect = document.getElementById("build-folder-select");
  const notesInput = document.getElementById("build-notes-input");

  if (nameInput) nameInput.value = currentBuild.name || "";
  if (roleInput) roleInput.value = currentBuild.role || "";
  if (folderSelect) folderSelect.value = currentBuild.folder || "ZvZ";
  if (notesInput) notesInput.value = currentBuild.notes || "";

  const slots = ["head", "cape", "mainhand", "offhand", "armor", "shoes", "food", "potion", "mount"];
  
  const mainHandItem = getItemFromDb("mainhand", currentBuild.equipment.mainhand?.id);
  const isTwoHanded = mainHandItem && mainHandItem.twoHanded;

  slots.forEach(slotKey => {
    const slotData = currentBuild.equipment[slotKey];
    const dbItem = getItemFromDb(slotKey, slotData?.id);

    const imgEl = document.getElementById(`img-${slotKey}`);
    const emptyEl = document.getElementById(`empty-${slotKey}`);
    const nameEl = document.getElementById(`name-${slotKey}`);
    const badgeEl = document.getElementById(`badge-${slotKey}`);

    if (slotKey === "offhand" && isTwoHanded) {
      if (imgEl) imgEl.style.display = "none";
      if (emptyEl) {
        emptyEl.style.display = "block";
        emptyEl.textContent = "Ocupado (2M)";
      }
      if (nameEl) nameEl.textContent = "Arma a 2 Manos";
      if (badgeEl) badgeEl.textContent = "Bloqueado";
      return;
    }

    if (slotData && dbItem) {
      const tier = slotData.tier || "T4";
      const enchant = slotData.enchant !== undefined ? slotData.enchant : 0;
      const quality = slotData.quality || 1;

      if (imgEl) {
        imgEl.src = getAlbionItemIconUrl(dbItem, tier, enchant, quality);
        imgEl.style.display = "block";
        imgEl.onerror = () => {
          imgEl.style.display = "none";
          if (emptyEl) {
            emptyEl.style.display = "block";
            emptyEl.textContent = dbItem.name;
          }
        };
      }
      if (emptyEl) emptyEl.style.display = "none";
      if (nameEl) nameEl.textContent = dbItem.name;
      if (badgeEl) {
        badgeEl.textContent = slotKey.match(/food|potion|mount/) ? tier : `${tier}.${enchant}`;
      }
    } else {
      if (imgEl) {
        imgEl.src = "";
        imgEl.style.display = "none";
      }
      if (emptyEl) {
        emptyEl.style.display = "block";
        emptyEl.textContent = "+ Equipar";
      }
      if (nameEl) nameEl.textContent = "Ninguno";
      if (badgeEl) badgeEl.textContent = "Vacío";
    }
  });

  renderSpellButtons();
  renderQuickSummary();
}

function renderSpellButtons() {
  const mhData = currentBuild.equipment.mainhand;
  const mhItem = getItemFromDb("mainhand", mhData?.id);
  const spellsBarMh = document.getElementById("spells-mainhand");
  
  if (spellsBarMh) {
    if (!mhItem) {
      spellsBarMh.style.display = "none";
    } else {
      spellsBarMh.style.display = "flex";
      updateSpellButton("mainhand", "q", mhData.qSpell);
      updateSpellButton("mainhand", "w", mhData.wSpell);
      updateSpellButton("mainhand", "e", mhData.eSpell);
      updateSpellButton("mainhand", "passive", mhData.passiveSpell);
    }
  }

  const headData = currentBuild.equipment.head;
  const headItem = getItemFromDb("head", headData?.id);
  const spellsBarHead = document.getElementById("spells-head");
  if (spellsBarHead) {
    if (!headItem) {
      spellsBarHead.style.display = "none";
    } else {
      spellsBarHead.style.display = "flex";
      updateSpellButton("head", "active", headData.activeSpell);
      updateSpellButton("head", "passive", headData.passiveSpell);
    }
  }

  const armorData = currentBuild.equipment.armor;
  const armorItem = getItemFromDb("armor", armorData?.id);
  const spellsBarArmor = document.getElementById("spells-armor");
  if (spellsBarArmor) {
    if (!armorItem) {
      spellsBarArmor.style.display = "none";
    } else {
      spellsBarArmor.style.display = "flex";
      updateSpellButton("armor", "active", armorData.activeSpell);
      updateSpellButton("armor", "passive", armorData.passiveSpell);
    }
  }

  const shoesData = currentBuild.equipment.shoes;
  const shoesItem = getItemFromDb("shoes", shoesData?.id);
  const spellsBarShoes = document.getElementById("spells-shoes");
  if (spellsBarShoes) {
    if (!shoesItem) {
      spellsBarShoes.style.display = "none";
    } else {
      spellsBarShoes.style.display = "flex";
      updateSpellButton("shoes", "active", shoesData.activeSpell);
      updateSpellButton("shoes", "passive", shoesData.passiveSpell);
    }
  }
}

function updateSpellButton(slot, type, spellId) {
  const imgEl = document.getElementById(`spell-img-${slot}-${type}`);
  const txtEl = document.getElementById(`spell-txt-${slot}-${type}`);

  if (spellId) {
    if (imgEl) {
      imgEl.src = getAlbionSpellIconUrl(spellId);
      imgEl.style.display = "block";
      imgEl.onerror = () => {
        imgEl.style.display = "none";
        if (txtEl) {
          txtEl.style.display = "block";
          txtEl.textContent = getSpellShortCode(type);
        }
      };
    }
    if (txtEl) txtEl.style.display = "none";
  } else {
    if (imgEl) {
      imgEl.src = "";
      imgEl.style.display = "none";
    }
    if (txtEl) {
      txtEl.style.display = "block";
      txtEl.textContent = getSpellShortCode(type, slot);
    }
  }
}

function getSpellShortCode(type, slot = "") {
  if (type === "active") {
    if (slot === "head") return "D";
    if (slot === "armor") return "R";
    if (slot === "shoes") return "F";
    return "ACT";
  }
  if (type === "passive") return "P";
  return type.toUpperCase();
}

function renderQuickSummary() {
  const summaryEl = document.getElementById("build-summary-list");
  if (!summaryEl) return;

  const eq = currentBuild.equipment;
  const headItem = getItemFromDb("head", eq.head?.id);
  const mhItem = getItemFromDb("mainhand", eq.mainhand?.id);
  const armorItem = getItemFromDb("armor", eq.armor?.id);
  const shoesItem = getItemFromDb("shoes", eq.shoes?.id);
  const capeItem = getItemFromDb("cape", eq.cape?.id);

  summaryEl.innerHTML = `
    <li><strong>Cabeza:</strong> ${headItem ? `${headItem.name} [${eq.head.tier}.${eq.head.enchant || 0}]` : '<em>Sin equipar</em>'}</li>
    <li><strong>Arma:</strong> ${mhItem ? `${mhItem.name} [${eq.mainhand.tier}.${eq.mainhand.enchant || 0}]` : '<em>Sin equipar</em>'}</li>
    <li><strong>Pecho:</strong> ${armorItem ? `${armorItem.name} [${eq.armor.tier}.${eq.armor.enchant || 0}]` : '<em>Sin equipar</em>'}</li>
    <li><strong>Botas:</strong> ${shoesItem ? `${shoesItem.name} [${eq.shoes.tier}.${eq.shoes.enchant || 0}]` : '<em>Sin equipar</em>'}</li>
    <li><strong>Capa:</strong> ${capeItem ? `${capeItem.name} [${eq.cape.tier}.${eq.cape.enchant || 0}]` : '<em>Sin equipar</em>'}</li>
  `;
}

// ==========================================================================
// Modal: Selector de Items
// ==========================================================================
function openItemPickerModal(slot) {
  activeModalSlot = slot;
  const modal = document.getElementById("modal-item-picker");
  const modalTitle = document.getElementById("modal-item-title");
  const categorySelect = document.getElementById("item-category-select");
  const searchInput = document.getElementById("item-search-input");
  const enchantWrapper = document.getElementById("config-enchant-wrapper");

  if (!modal) return;

  const slotTitles = {
    head: "Seleccionar Casco / Cabeza",
    cape: "Seleccionar Capa",
    mainhand: "Seleccionar Arma Principal",
    offhand: "Seleccionar Mano Secundaria",
    armor: "Seleccionar Armadura / Pecho",
    shoes: "Seleccionar Botas / Calzado",
    food: "Seleccionar Comida",
    potion: "Seleccionar Poción",
    mount: "Seleccionar Montura"
  };

  modalTitle.textContent = slotTitles[slot] || "Seleccionar Item";

  if (enchantWrapper) {
    enchantWrapper.style.display = slot.match(/food|potion|mount/) ? "none" : "block";
  }

  const currentSlotData = currentBuild.equipment[slot];
  const tierSelect = document.getElementById("item-tier-select");
  const enchantSelect = document.getElementById("item-enchant-select");
  const qualitySelect = document.getElementById("item-quality-select");

  if (tierSelect) tierSelect.value = currentSlotData?.tier || "T8";
  if (enchantSelect) enchantSelect.value = currentSlotData?.enchant !== undefined ? currentSlotData.enchant : "0";
  if (qualitySelect) qualitySelect.value = currentSlotData?.quality || "2";

  populateCategoriesForSlot(slot);

  if (searchInput) searchInput.value = "";
  if (categorySelect) categorySelect.value = "ALL";

  renderItemsList();
  modal.style.display = "flex";
}

function populateCategoriesForSlot(slot) {
  const categorySelect = document.getElementById("item-category-select");
  if (!categorySelect) return;

  const items = getItemsPoolForSlot(slot);
  const categories = [...new Set(items.map(i => i.category))];

  categorySelect.innerHTML = `<option value="ALL">Todas las categorías (${categories.length})</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

function getItemsPoolForSlot(slot) {
  switch (slot) {
    case "head": return ITEMS_DATABASE.head || [];
    case "mainhand": return ITEMS_DATABASE.weapons || [];
    case "offhand": return ITEMS_DATABASE.offhands || [];
    case "armor": return ITEMS_DATABASE.armor || [];
    case "shoes": return ITEMS_DATABASE.shoes || [];
    case "cape": return ITEMS_DATABASE.cape || [];
    case "food": return ITEMS_DATABASE.food || [];
    case "potion": return ITEMS_DATABASE.potion || [];
    case "mount": return ITEMS_DATABASE.mount || [];
    default: return [];
  }
}

function renderItemsList() {
  const container = document.getElementById("items-list-container");
  if (!container || !activeModalSlot) return;

  const searchVal = (document.getElementById("item-search-input")?.value || "").toLowerCase().trim();
  const selectedCat = document.getElementById("item-category-select")?.value || "ALL";
  const currentTier = document.getElementById("item-tier-select")?.value || "T8";
  const currentEnchant = parseInt(document.getElementById("item-enchant-select")?.value || "0", 10);
  const currentQuality = parseInt(document.getElementById("item-quality-select")?.value || "1", 10);

  const pool = getItemsPoolForSlot(activeModalSlot);
  const filtered = pool.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchVal);
    const matchesCat = selectedCat === "ALL" || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">No se encontraron items.</div>`;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-option-card";
    
    const iconUrl = getAlbionItemIconUrl(item, currentTier, currentEnchant, currentQuality);

    card.innerHTML = `
      <img class="item-option-img" src="${iconUrl}" alt="${item.name}" loading="lazy" onerror="this.src=''; this.style.display='none';">
      <div class="item-option-info">
        <div class="item-option-name" title="${item.name}">${item.name}</div>
        <div class="item-option-cat">${item.category}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      equipItemToSlot(activeModalSlot, item, currentTier, currentEnchant, currentQuality);
      closeItemPickerModal();
    });

    container.appendChild(card);
  });
}

function equipItemToSlot(slot, item, tier, enchant, quality) {
  currentBuild.equipment[slot] = {
    id: item.id,
    tier: tier,
    enchant: enchant,
    quality: quality
  };

  if (slot === "mainhand" && item.twoHanded) {
    currentBuild.equipment.offhand = null;
  }

  if (slot === "mainhand") {
    const tree = SPELLS_DATABASE.weapons[item.spellTree];
    if (tree) {
      currentBuild.equipment.mainhand.qSpell = tree.q?.[0]?.id || null;
      currentBuild.equipment.mainhand.wSpell = tree.w?.[0]?.id || null;
      currentBuild.equipment.mainhand.eSpell = tree.e?.[item.id]?.id || null;
      currentBuild.equipment.mainhand.passiveSpell = tree.passive?.[0]?.id || null;
    }
  } else if (slot === "head") {
    const tree = SPELLS_DATABASE.head[item.armorType];
    if (tree) {
      currentBuild.equipment.head.activeSpell = tree.active?.[0]?.id || null;
      currentBuild.equipment.head.passiveSpell = tree.passive?.[0]?.id || null;
    }
  } else if (slot === "armor") {
    const tree = SPELLS_DATABASE.armor[item.armorType];
    if (tree) {
      currentBuild.equipment.armor.activeSpell = tree.active?.[0]?.id || null;
      currentBuild.equipment.armor.passiveSpell = tree.passive?.[0]?.id || null;
    }
  } else if (slot === "shoes") {
    const tree = SPELLS_DATABASE.shoes[item.armorType];
    if (tree) {
      currentBuild.equipment.shoes.activeSpell = tree.active?.[0]?.id || null;
      currentBuild.equipment.shoes.passiveSpell = tree.passive?.[0]?.id || null;
    }
  }

  renderBuild();
  showToast(`Equipado: ${item.name}`);
}

function closeItemPickerModal() {
  const modal = document.getElementById("modal-item-picker");
  if (modal) modal.style.display = "none";
  activeModalSlot = null;
}

// ==========================================================================
// Modal: Selector de Habilidades (Spells)
// ==========================================================================
function openSpellPickerModal(slot, spellType) {
  activeSpellSlot = slot;
  activeSpellType = spellType;

  const modal = document.getElementById("modal-spell-picker");
  const modalTitle = document.getElementById("modal-spell-title");
  const container = document.getElementById("spells-list-container");

  if (!modal || !container) return;

  const itemData = currentBuild.equipment[slot];
  const dbItem = getItemFromDb(slot, itemData?.id);

  if (!dbItem) {
    alert("Primero debes equipar un item en esta ranura.");
    return;
  }

  const spellList = getSpellsListForSlot(slot, dbItem, spellType);
  if (spellList.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No hay habilidades disponibles para esta casilla.</div>`;
    modal.style.display = "flex";
    return;
  }

  modalTitle.textContent = `Seleccionar Habilidad (${spellType.toUpperCase()}) - ${dbItem.name}`;
  container.innerHTML = "";

  const currentSelectedSpellId = getCurrentSpellId(slot, spellType);

  spellList.forEach(spell => {
    const card = document.createElement("div");
    card.className = `spell-option-card ${currentSelectedSpellId === spell.id ? 'active-spell' : ''}`;

    const iconUrl = getAlbionSpellIconUrl(spell.icon || spell.id);

    card.innerHTML = `
      <div class="spell-option-icon">
        <img src="${iconUrl}" alt="${spell.name}" onerror="this.style.display='none'; this.parentElement.textContent='${getSpellShortCode(spellType, slot)}';">
      </div>
      <div class="spell-option-content">
        <div class="spell-option-name">${spell.name}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      assignSpellToSlot(slot, spellType, spell.id);
      closeSpellPickerModal();
    });

    container.appendChild(card);
  });

  modal.style.display = "flex";
}

function getSpellsListForSlot(slot, item, spellType) {
  if (slot === "mainhand") {
    const tree = SPELLS_DATABASE.weapons[item.spellTree];
    if (!tree) return [];
    if (spellType === "q") return tree.q || [];
    if (spellType === "w") return tree.w || [];
    if (spellType === "e") return tree.e?.[item.id] ? [tree.e[item.id]] : [];
    if (spellType === "passive") return tree.passive || [];
  } else if (slot === "head") {
    const tree = SPELLS_DATABASE.head[item.armorType];
    if (!tree) return [];
    if (spellType === "active") return tree.active || [];
    if (spellType === "passive") return tree.passive || [];
  } else if (slot === "armor") {
    const tree = SPELLS_DATABASE.armor[item.armorType];
    if (!tree) return [];
    if (spellType === "active") return tree.active || [];
    if (spellType === "passive") return tree.passive || [];
  } else if (slot === "shoes") {
    const tree = SPELLS_DATABASE.shoes[item.armorType];
    if (!tree) return [];
    if (spellType === "active") return tree.active || [];
    if (spellType === "passive") return tree.passive || [];
  }
  return [];
}

function getCurrentSpellId(slot, spellType) {
  const eq = currentBuild.equipment[slot];
  if (!eq) return null;
  if (slot === "mainhand") {
    if (spellType === "q") return eq.qSpell;
    if (spellType === "w") return eq.wSpell;
    if (spellType === "e") return eq.eSpell;
    if (spellType === "passive") return eq.passiveSpell;
  } else {
    if (spellType === "active") return eq.activeSpell;
    if (spellType === "passive") return eq.passiveSpell;
  }
  return null;
}

function assignSpellToSlot(slot, spellType, spellId) {
  if (!currentBuild.equipment[slot]) return;

  if (slot === "mainhand") {
    if (spellType === "q") currentBuild.equipment.mainhand.qSpell = spellId;
    if (spellType === "w") currentBuild.equipment.mainhand.wSpell = spellId;
    if (spellType === "e") currentBuild.equipment.mainhand.eSpell = spellId;
    if (spellType === "passive") currentBuild.equipment.mainhand.passiveSpell = spellId;
  } else {
    if (spellType === "active") currentBuild.equipment[slot].activeSpell = spellId;
    if (spellType === "passive") currentBuild.equipment[slot].passiveSpell = spellId;
  }

  renderBuild();
  showToast("Habilidad seleccionada.");
}

function closeSpellPickerModal() {
  const modal = document.getElementById("modal-spell-picker");
  if (modal) modal.style.display = "none";
  activeSpellSlot = null;
  activeSpellType = null;
}

function setupModalEvents() {
  document.getElementById("btn-close-item-modal")?.addEventListener("click", closeItemPickerModal);
  document.getElementById("btn-cancel-item-modal")?.addEventListener("click", closeItemPickerModal);
  document.getElementById("item-search-input")?.addEventListener("input", renderItemsList);
  document.getElementById("item-category-select")?.addEventListener("change", renderItemsList);
  document.getElementById("item-tier-select")?.addEventListener("change", renderItemsList);
  document.getElementById("item-enchant-select")?.addEventListener("change", renderItemsList);
  document.getElementById("item-quality-select")?.addEventListener("change", renderItemsList);

  document.getElementById("btn-remove-item")?.addEventListener("click", () => {
    if (activeModalSlot) {
      currentBuild.equipment[activeModalSlot] = null;
      renderBuild();
      closeItemPickerModal();
      showToast("Item retirado.");
    }
  });

  document.getElementById("btn-close-spell-modal")?.addEventListener("click", closeSpellPickerModal);
  document.getElementById("btn-cancel-spell-modal")?.addEventListener("click", closeSpellPickerModal);

  window.addEventListener("click", (e) => {
    const itemModal = document.getElementById("modal-item-picker");
    const spellModal = document.getElementById("modal-spell-picker");
    if (e.target === itemModal) closeItemPickerModal();
    if (e.target === spellModal) closeSpellPickerModal();
  });
}

// ==========================================================================
// Renderizado de Builds por Carpeta
// ==========================================================================
function renderSavedBuildsList() {
  const container = document.getElementById("saved-builds-container");
  const folderTitle = document.getElementById("current-folder-title");
  const folderCount = document.getElementById("current-folder-count");
  const searchVal = (document.getElementById("search-saved-builds")?.value || "").toLowerCase().trim();

  if (!container) return;

  const allBuilds = getSavedBuilds();
  
  let filtered = allBuilds;
  if (activeSelectedFolder !== "ALL") {
    filtered = filtered.filter(b => (b.folder || "ZvZ") === activeSelectedFolder);
  }

  if (searchVal) {
    filtered = filtered.filter(b => {
      return (b.name || "").toLowerCase().includes(searchVal) || 
             (b.role || "").toLowerCase().includes(searchVal) ||
             (b.notes || "").toLowerCase().includes(searchVal);
    });
  }

  if (folderTitle) {
    folderTitle.textContent = activeSelectedFolder === "ALL" ? "📁 Todas las Builds" : `📁 ${activeSelectedFolder}`;
  }
  if (folderCount) {
    folderCount.textContent = `${filtered.length} builds encontradas`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
        No hay builds en esta carpeta todavía.
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  const allFolders = getAllFolders();

  filtered.forEach(build => {
    const card = document.createElement("div");
    card.className = "saved-build-card";

    const eq = build.equipment || {};
    const slots = ["head", "mainhand", "offhand", "armor", "shoes", "cape", "food", "potion", "mount"];
    let thumbsHtml = "";

    slots.forEach(slotKey => {
      const slotData = eq[slotKey];
      if (slotData) {
        const item = getItemFromDb(slotKey, slotData.id);
        if (item) {
          const iconUrl = getAlbionItemIconUrl(item, slotData.tier || "T4", slotData.enchant || 0, slotData.quality || 1);
          thumbsHtml += `<img class="saved-item-thumb" src="${iconUrl}" title="${item.name} (${slotData.tier || 'T4'})" alt="${item.name}" onerror="this.style.display='none';">`;
        }
      }
    });

    let folderOptionsHtml = "";
    allFolders.forEach(f => {
      folderOptionsHtml += `<option value="${f}" ${f === (build.folder || 'ZvZ') ? 'selected' : ''}>📁 ${f}</option>`;
    });

    card.innerHTML = `
      <div class="saved-build-header">
        <div>
          <div class="saved-build-title">${build.name || 'Sin título'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${build.role || 'General'}</div>
        </div>
        <span class="saved-build-badge">${build.folder || 'ZvZ'}</span>
      </div>

      <div class="saved-build-notes">
        ${build.notes ? `"${build.notes}"` : '<em>Sin notas</em>'}
      </div>

      <div class="saved-build-items-preview">
        ${thumbsHtml || '<span style="font-size: 11px; color: var(--text-muted);">Sin items</span>'}
      </div>

      <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
        <label style="font-size: 11px; color: var(--text-muted);">Mover a:</label>
        <select class="form-control form-control-sm select-move-folder" style="width: auto; flex: 1;">
          ${folderOptionsHtml}
        </select>
      </div>

      <div class="saved-build-actions">
        <button type="button" class="btn btn-primary btn-sm btn-load-build">Cargar</button>
        <button type="button" class="btn btn-secondary btn-sm btn-discord-build">Copiar Discord</button>
        <button type="button" class="btn btn-danger btn-sm btn-delete-build">Eliminar</button>
      </div>
    `;

    card.querySelector(".btn-load-build").addEventListener("click", () => {
      loadBuild(build);
      document.querySelector('[data-tab="builder"]').click();
      showToast(`Build "${build.name}" cargada.`);
    });

    card.querySelector(".btn-discord-build").addEventListener("click", () => {
      const discordText = generateDiscordText(build);
      copyToClipboard(discordText, "¡Ficha para Discord copiada!");
    });

    const moveSelect = card.querySelector(".select-move-folder");
    moveSelect.addEventListener("change", (e) => {
      const newFolder = e.target.value;
      const all = getSavedBuilds();
      const targetBuild = all.find(b => b.id === build.id);
      if (targetBuild) {
        targetBuild.folder = newFolder;
        saveBuildsToStorage(all);
        showToast(`Build movida a "${newFolder}".`);
      }
    });

    card.querySelector(".btn-delete-build").addEventListener("click", () => {
      if (confirm(`¿Eliminar la build "${build.name}"?`)) {
        const remaining = getSavedBuilds().filter(b => b.id !== build.id);
        saveBuildsToStorage(remaining);
        showToast("Build eliminada.");
      }
    });

    container.appendChild(card);
  });
}

function loadBuild(build) {
  currentBuild = JSON.parse(JSON.stringify(build));
  renderBuild();
}

function loadBuildFromUrlHash() {
  try {
    const rawData = decodeURIComponent(window.location.hash.replace("#build=", ""));
    const parsed = JSON.parse(rawData);
    if (parsed && parsed.equipment) {
      loadBuild(parsed);
      showToast("Build cargada desde el enlace.");
    }
  } catch (e) {
    console.error("Error al cargar build desde URL:", e);
  }
}

// ==========================================================================
// Generador de Texto para Discord
// ==========================================================================
function generateDiscordText(build) {
  const eq = build.equipment || {};

  function getItemLine(slotKey, label) {
    const slotData = eq[slotKey];
    if (!slotData) return `• **${label}:** *Sin equipar*`;
    const item = getItemFromDb(slotKey, slotData.id);
    if (!item) return `• **${label}:** *Sin equipar*`;

    const tierStr = slotKey.match(/food|potion|mount/) ? `[${slotData.tier || 'T4'}]` : `[${slotData.tier || 'T4'}.${slotData.enchant || 0}]`;
    let spellsStr = "";

    if (slotKey === "mainhand") {
      const spells = [];
      if (slotData.qSpell) spells.push(`Q: ${getSpellName(slotData.qSpell)}`);
      if (slotData.wSpell) spells.push(`W: ${getSpellName(slotData.wSpell)}`);
      if (slotData.eSpell) spells.push(`E: ${getSpellName(slotData.eSpell)}`);
      if (slotData.passiveSpell) spells.push(`P: ${getSpellName(slotData.passiveSpell)}`);
      if (spells.length > 0) spellsStr = ` (${spells.join(" | ")})`;
    } else if (slotKey === "head" || slotKey === "armor" || slotKey === "shoes") {
      const spells = [];
      const actKey = slotKey === "head" ? "D" : (slotKey === "armor" ? "R" : "F");
      if (slotData.activeSpell) spells.push(`${actKey}: ${getSpellName(slotData.activeSpell)}`);
      if (slotData.passiveSpell) spells.push(`P: ${getSpellName(slotData.passiveSpell)}`);
      if (spells.length > 0) spellsStr = ` (${spells.join(" | ")})`;
    }

    return `• **${label}:** ${item.name} ${tierStr}${spellsStr}`;
  }

  return `🐉 **Furia de Dragones - Ficha de Build**
📁 **Carpeta:** ${build.folder || 'ZvZ'} | **Rol:** ${build.role || 'General'}
⚔️ **Nombre:** ${build.name || 'Sin título'}
━━━━━━━━━━━━━━━━━━━━━━━━━━
${getItemLine("head", "Cabeza")}
${getItemLine("mainhand", "Arma Principal")}
${getItemLine("offhand", "Mano Secundaria")}
${getItemLine("armor", "Pecho / Armadura")}
${getItemLine("shoes", "Botas / Calzado")}
${getItemLine("cape", "Capa")}
${getItemLine("food", "Comida")}
${getItemLine("potion", "Poción")}
${getItemLine("mount", "Montura")}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 **Notas:** ${build.notes || 'Ninguna'}
`;
}

function getSpellName(spellId) {
  for (const treeKey in SPELLS_DATABASE.weapons) {
    const tree = SPELLS_DATABASE.weapons[treeKey];
    const qMatch = tree.q?.find(s => s.id === spellId);
    if (qMatch) return qMatch.name.split(" (")[0];
    const wMatch = tree.w?.find(s => s.id === spellId);
    if (wMatch) return wMatch.name.split(" (")[0];
    for (const eKey in tree.e || {}) {
      if (tree.e[eKey].id === spellId) return tree.e[eKey].name;
    }
    const pMatch = tree.passive?.find(s => s.id === spellId);
    if (pMatch) return pMatch.name;
  }

  for (const slotKey of ["head", "armor", "shoes"]) {
    for (const typeKey in SPELLS_DATABASE[slotKey]) {
      const typeObj = SPELLS_DATABASE[slotKey][typeKey];
      const actMatch = typeObj.active?.find(s => s.id === spellId);
      if (actMatch) return actMatch.name.split(" (")[0];
      const passMatch = typeObj.passive?.find(s => s.id === spellId);
      if (passMatch) return passMatch.name;
    }
  }

  return spellId;
}

// ==========================================================================
// Utilidades
// ==========================================================================
function getItemFromDb(slot, itemId) {
  if (!itemId) return null;
  const pool = getItemsPoolForSlot(slot);
  return pool.find(i => i.id === itemId) || null;
}

function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    alert("No se pudo copiar automáticamente.");
  }
  textArea.remove();
}

function showToast(message) {
  const toast = document.getElementById("toast-message");
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}
