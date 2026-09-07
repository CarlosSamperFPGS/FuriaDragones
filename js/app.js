// Furia de Dragones - Controlador Principal del Gestor de Builds
// Gremio de Albion Online

import { ALBION_ITEMS, ITEM_CATEGORIES, TIER_EQUIVALENTS, getItemImageUrl } from './data/items.js';
import { ALBION_SPELLS, ITEM_SPELLS_MAP, getItemSpells } from './data/spells.js';
import { DEFAULT_BUILDS } from './data/default-builds.js';
import {
  initCloudSync,
  saveBuildToCloud,
  deleteBuildFromCloud,
  saveFoldersToCloud,
  restoreDefaultsInCloud
} from './firebase-sync.js';

// ==========================================================================
// Estado Global
function checkOfficerSession() {
  const savedRole = localStorage.getItem("furia_user_role");
  if (savedRole === "OFFICER") {
    const activeToken = localStorage.getItem("furia_active_officer_token");
    const sessionToken = sessionStorage.getItem("furia_officer_session");
    if (activeToken && sessionToken && activeToken === sessionToken) {
      return "OFFICER";
    }
  }
  return "MEMBER";
}

let currentRole = checkOfficerSession();
const DEFAULT_OFFICER_PASSWORDS = ["furiadragones2026", "furia2026", "furiadragones", "1234"];

let currentBuild = {
  id: null,
  name: "Nueva Build",
  role: "DPS Melee",
  tierEquiv: 8,
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

let viewingBuild = null;
let activeSelectedFolder = "ALL";
let activeSelectedRole = "ALL";
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

const STORAGE_VERSION = "v7_furia_albion_full_sobresaliente";

// ==========================================================================
// Helpers de Texto y Tier Equivalente
// ==========================================================================
export function getTierEquivExample(tier) {
  switch (Number(tier)) {
    case 6: return "6.0, 5.1, 4.2";
    case 7: return "7.0, 6.1, 5.2, 4.3";
    case 8: return "8.0, 7.1, 6.2, 5.3, 4.4";
    case 9: return "8.1, 7.2, 6.3, 5.4";
    case 10: return "8.2, 7.3, 6.4";
    case 11: return "8.3, 7.4";
    case 12: return "8.4";
    default: return "8.0+";
  }
}

export function getSpellShortCode(type, slot = "") {
  if (type === "active") {
    if (slot === "head") return "D";
    if (slot === "armor") return "R";
    if (slot === "shoes") return "F";
    return "ACT";
  }
  if (type === "passive") return "P";
  return type.toUpperCase();
}

// ==========================================================================
// Inicialización Segura
// ==========================================================================
function initApp() {
  initStorage();
  updateRoleUI();
  setupNavigation();
  setupAuthEvents();
  setupSlotClickEvents();
  setupModalEvents();
  setupFormEvents();
  setupActionButtons();
  setupFolderEvents();
  setupRoleFilterEvents();
  setupViewerModalEvents();
  
  if (window.location.hash.startsWith("#build=")) {
    loadBuildFromUrlHash();
  } else {
    const saved = getSavedBuilds();
    if (saved && saved.length > 0) {
      currentBuild = JSON.parse(JSON.stringify(saved[0]));
    }
    renderBuild();
  }

  updateFolderDropdowns();
  renderFoldersSidebar();
  renderSavedBuildsList();
  updateSavedBuildsCount();
  setupCloudSync();
}

function setupCloudSync() {
  initCloudSync({
    defaultBuilds: DEFAULT_BUILDS,
    defaultFolders: DEFAULT_FOLDERS,
    onStatusChanged: (status) => {
      const badge = document.getElementById("cloud-sync-badge");
      const label = document.getElementById("cloud-sync-label");
      if (!badge || !label) return;

      if (status === "online") {
        badge.className = "cloud-sync-badge online";
        label.textContent = "Sincronizado";
      } else if (status === "syncing") {
        badge.className = "cloud-sync-badge syncing";
        label.textContent = "Sincronizando...";
      } else if (status === "error") {
        badge.className = "cloud-sync-badge error";
        label.textContent = "Error Nube";
      } else {
        badge.className = "cloud-sync-badge offline";
        label.textContent = "Modo Local";
      }
    },
    onBuildsUpdated: (newBuilds) => {
      if (Array.isArray(newBuilds)) {
        localStorage.setItem("furia_saved_builds", JSON.stringify(newBuilds));
        updateSavedBuildsCount();
        renderSavedBuildsList();
        renderFoldersSidebar();
      }
    },
    onFoldersUpdated: (newFolders) => {
      if (Array.isArray(newFolders) && newFolders.length > 0) {
        localStorage.setItem("furia_custom_folders", JSON.stringify(newFolders));
        updateFolderDropdowns();
        renderFoldersSidebar();
        renderSavedBuildsList();
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// ==========================================================================
// Control de Roles y Autenticación de Oficial
// ==========================================================================
function isOfficer() {
  return currentRole === "OFFICER";
}

function updateRoleUI() {
  document.body.className = isOfficer() ? "role-officer" : "role-member";

  const badgeEl = document.getElementById("user-role-badge");
  const iconEl = document.getElementById("user-role-icon");
  const labelEl = document.getElementById("user-role-label");
  const btnLogin = document.getElementById("btn-open-login-modal");
  const btnLogout = document.getElementById("btn-logout-officer");
  const builderTabBtn = document.getElementById("tab-btn-builder");

  if (isOfficer()) {
    if (badgeEl) {
      badgeEl.className = "role-badge role-badge-officer";
    }
    if (iconEl) iconEl.textContent = "";
    if (labelEl) labelEl.textContent = "Modo Oficial (Editor)";
    if (btnLogin) btnLogin.style.display = "none";
    if (btnLogout) btnLogout.style.display = "inline-flex";
    if (builderTabBtn) builderTabBtn.style.display = "inline-flex";
  } else {
    if (badgeEl) {
      badgeEl.className = "role-badge role-badge-member";
    }
    if (iconEl) iconEl.textContent = "";
    if (labelEl) labelEl.textContent = "Modo Miembro (Solo Lectura)";
    if (btnLogin) btnLogin.style.display = "inline-flex";
    if (btnLogout) btnLogout.style.display = "none";
    if (builderTabBtn) builderTabBtn.style.display = "none";
  }

  renderFoldersSidebar();
}

function setupAuthEvents() {
  const btnOpenLogin = document.getElementById("btn-open-login-modal");
  const btnCloseLogin = document.getElementById("btn-close-login-modal");
  const btnCancelLogin = document.getElementById("btn-cancel-login-modal");
  const formLogin = document.getElementById("form-officer-login");
  const btnLogout = document.getElementById("btn-logout-officer");
  const btnTogglePass = document.getElementById("btn-toggle-password");
  const passInput = document.getElementById("officer-password-input");

  if (btnOpenLogin) {
    btnOpenLogin.addEventListener("click", () => {
      openOfficerLoginModal();
    });
  }

  if (btnCloseLogin) {
    btnCloseLogin.addEventListener("click", () => {
      closeOfficerLoginModal();
    });
  }

  if (btnCancelLogin) {
    btnCancelLogin.addEventListener("click", () => {
      closeOfficerLoginModal();
    });
  }

  if (btnTogglePass && passInput) {
    btnTogglePass.addEventListener("click", () => {
      if (passInput.type === "password") {
        passInput.type = "text";
        btnTogglePass.textContent = "Ocultar";
      } else {
        passInput.type = "password";
        btnTogglePass.textContent = "Ver";
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = (passInput?.value || "").trim();
      const errorMsg = document.getElementById("login-error-msg");

      if (DEFAULT_OFFICER_PASSWORDS.includes(entered.toLowerCase())) {
        const sessionToken = "officer_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem("furia_officer_session", sessionToken);
        localStorage.setItem("furia_active_officer_token", sessionToken);
        localStorage.setItem("furia_user_role", "OFFICER");
        currentRole = "OFFICER";

        updateRoleUI();
        renderFoldersSidebar();
        renderSavedBuildsList();
        closeOfficerLoginModal();
        if (errorMsg) errorMsg.style.display = "none";
        showToast("Sesión de oficial iniciada.");
      } else {
        if (errorMsg) errorMsg.style.display = "block";
        if (passInput) passInput.focus();
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("furia_active_officer_token");
      sessionStorage.removeItem("furia_officer_session");
      localStorage.setItem("furia_user_role", "MEMBER");
      currentRole = "MEMBER";

      updateRoleUI();
      renderFoldersSidebar();
      renderSavedBuildsList();
      switchTab("saved-builds");
      showToast("Sesión cerrada. Modo Solo Lectura activado.");
    });
  }

  // Escuchar cambios de sesión desde otras pestañas o ventanas
  window.addEventListener("storage", (e) => {
    if (e.key === "furia_active_officer_token") {
      const myToken = sessionStorage.getItem("furia_officer_session");
      if (currentRole === "OFFICER" && e.newValue !== myToken) {
        currentRole = "MEMBER";
        sessionStorage.removeItem("furia_officer_session");
        updateRoleUI();
        renderFoldersSidebar();
        renderSavedBuildsList();
        showToast("La sesión de oficial se cerró porque se inició en otro navegador.");
      }
    }
  });

  // Verificación periódica de concurrencia de sesión única
  setInterval(() => {
    if (currentRole === "OFFICER") {
      const activeToken = localStorage.getItem("furia_active_officer_token");
      const myToken = sessionStorage.getItem("furia_officer_session");
      if (!activeToken || activeToken !== myToken) {
        currentRole = "MEMBER";
        sessionStorage.removeItem("furia_officer_session");
        updateRoleUI();
        renderFoldersSidebar();
        renderSavedBuildsList();
        showToast("La sesión de oficial se cerró porque se inició en otro navegador.");
      }
    }
  }, 2000);
}

function openOfficerLoginModal() {
  const modal = document.getElementById("modal-officer-login");
  const passInput = document.getElementById("officer-password-input");
  const errorMsg = document.getElementById("login-error-msg");

  if (modal) {
    if (passInput) passInput.value = "";
    if (errorMsg) errorMsg.style.display = "none";
    modal.style.display = "flex";
    setTimeout(() => passInput?.focus(), 100);
  }
}

function closeOfficerLoginModal() {
  const modal = document.getElementById("modal-officer-login");
  if (modal) modal.style.display = "none";
}

// ==========================================================================
// Almacenamiento Local (LocalStorage con Autorreparación)
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
  if (storedBuilds === null) {
    localStorage.setItem("furia_saved_builds", JSON.stringify(DEFAULT_BUILDS));
  }

  const storedFolders = localStorage.getItem("furia_custom_folders");
  if (storedFolders === null) {
    localStorage.setItem("furia_custom_folders", JSON.stringify(DEFAULT_FOLDERS));
  }
}

function getSavedBuilds() {
  try {
    const raw = localStorage.getItem("furia_saved_builds");
    if (raw === null) return DEFAULT_BUILDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_BUILDS;
  } catch (e) {
    return [];
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
    const stored = localStorage.getItem("furia_custom_folders");
    if (!stored) return DEFAULT_FOLDERS;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_FOLDERS;
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
      if (tabTarget === "builder" && !isOfficer()) {
        openOfficerLoginModal();
        showToast("Solo los oficiales pueden acceder al editor.");
        return;
      }
      switchTab(tabTarget);
    });
  });
}

function switchTab(tabTarget) {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(b => {
    if (b.getAttribute("data-tab") === tabTarget) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

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
}

// ==========================================================================
// Gestión de Carpetas
// ==========================================================================
function setupFolderEvents() {
  const btnCreateFolder = document.getElementById("btn-create-new-folder");
  if (btnCreateFolder) {
    btnCreateFolder.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        showToast("Inicia sesión como Oficial para crear carpetas.");
        return;
      }
      const folderName = prompt("Introduce el nombre de la nueva carpeta de contenido:");
      if (folderName && folderName.trim()) {
        addNewFolder(folderName.trim());
      }
    });
  }

  const btnManageFolders = document.getElementById("btn-manage-folders");
  if (btnManageFolders) {
    btnManageFolders.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        showToast("Inicia sesión como Oficial para gestionar carpetas.");
        return;
      }
      openManageFoldersModal();
    });
  }

  const btnCloseManageModal = document.getElementById("btn-close-manage-folders-modal");
  if (btnCloseManageModal) {
    btnCloseManageModal.addEventListener("click", closeManageFoldersModal);
  }

  const btnCancelManageModal = document.getElementById("btn-cancel-manage-folders-modal");
  if (btnCancelManageModal) {
    btnCancelManageModal.addEventListener("click", closeManageFoldersModal);
  }

  const btnManageAdd = document.getElementById("btn-manage-add-folder");
  const inputManageNew = document.getElementById("manage-new-folder-input");
  if (btnManageAdd && inputManageNew) {
    const handleAdd = () => {
      const name = (inputManageNew.value || "").trim();
      if (!name) return;
      addNewFolder(name);
      inputManageNew.value = "";
    };

    btnManageAdd.addEventListener("click", handleAdd);
    inputManageNew.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
      }
    });
  }

  const btnAddFolderInline = document.getElementById("btn-add-folder-inline");
  if (btnAddFolderInline) {
    btnAddFolderInline.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        showToast("Inicia sesión como Oficial para crear carpetas.");
        return;
      }
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

  const btnCreateFromList = document.getElementById("btn-create-build-from-list");
  if (btnCreateFromList) {
    btnCreateFromList.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      startNewBuild();
    });
  }
}

function openManageFoldersModal() {
  const modal = document.getElementById("modal-manage-folders");
  if (modal) {
    renderManageFoldersList();
    modal.style.display = "flex";
    const input = document.getElementById("manage-new-folder-input");
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 100);
    }
  }
}

function closeManageFoldersModal() {
  const modal = document.getElementById("modal-manage-folders");
  if (modal) modal.style.display = "none";
}

function renderManageFoldersList() {
  const container = document.getElementById("manage-folders-list");
  if (!container) return;

  const folders = getAllFolders();
  const allBuilds = getSavedBuilds();

  container.innerHTML = "";
  folders.forEach(folder => {
    const count = allBuilds.filter(b => (b.folder || "ZvZ") === folder).length;
    const row = document.createElement("div");
    row.className = "manage-folder-row";

    const isOnlyOne = folders.length <= 1;

    row.innerHTML = `
      <div>
        <span style="font-weight: 600; font-size: 13px; color: var(--text-main);">${folder}</span>
        <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(${count} builds)</span>
      </div>
      <button type="button" class="btn btn-danger btn-sm btn-modal-del-folder" ${isOnlyOne ? 'disabled style="opacity:0.4; cursor:not-allowed;" title="Debe quedar al menos 1 carpeta activa"' : `title="Eliminar carpeta ${folder}"`}>
        Eliminar
      </button>
    `;

    if (!isOnlyOne) {
      row.querySelector(".btn-modal-del-folder")?.addEventListener("click", () => {
        deleteFolder(folder);
      });
    }

    container.appendChild(row);
  });
}

function addNewFolder(name) {
  const folders = getAllFolders();
  const exists = folders.some(f => f.toLowerCase() === name.toLowerCase());
  if (exists) {
    showToast(`La carpeta "${name}" ya existe.`);
    return;
  }
  folders.push(name);
  saveCustomFolders(folders);
  saveFoldersToCloud(folders);
  renderFoldersSidebar();
  renderManageFoldersList();
  showToast(`Carpeta "${name}" creada.`);
}

function deleteFolder(folderName) {
  if (!isOfficer()) {
    openOfficerLoginModal();
    showToast("Inicia sesión como Oficial para eliminar carpetas.");
    return;
  }

  const allFolders = getAllFolders();
  if (allFolders.length <= 1) {
    alert("No puedes eliminar la única carpeta que queda en el sistema.");
    return;
  }

  if (confirm(`¿Estás seguro de eliminar la carpeta "${folderName}"?\n\nTodas las builds que contenga se moverán automáticamente a otra carpeta existente.`)) {
    const remainingFolders = allFolders.filter(f => f !== folderName);
    const fallbackFolder = remainingFolders[0] || "ZvZ";

    const builds = getSavedBuilds();
    let reallocatedCount = 0;
    builds.forEach(b => {
      if (b.folder === folderName) {
        b.folder = fallbackFolder;
        reallocatedCount++;
      }
    });

    if (currentBuild.folder === folderName) {
      currentBuild.folder = fallbackFolder;
    }

    if (activeSelectedFolder === folderName) {
      activeSelectedFolder = "ALL";
    }

    // Persistir carpetas primero y luego builds localmente y en la nube
    saveCustomFolders(remainingFolders);
    saveFoldersToCloud(remainingFolders);
    saveBuildsToStorage(builds);
    builds.forEach(b => {
      if (b.folder === fallbackFolder) {
        saveBuildToCloud(b);
      }
    });

    renderFoldersSidebar();
    renderSavedBuildsList();
    renderManageFoldersList();
    
    showToast(`Carpeta "${folderName}" eliminada (${reallocatedCount} builds movidas a "${fallbackFolder}").`);
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
    opt.textContent = folder;
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
    <span>Todas</span>
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
    const canDelete = folders.length > 1 && isOfficer();

    item.innerHTML = `
      <span title="${folder}" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${folder}</span>
      <div class="folder-nav-right">
        <span class="folder-badge-count">${count}</span>
        ${canDelete ? `<button type="button" class="folder-delete-btn" title="Eliminar carpeta ${folder}">×</button>` : ''}
      </div>
    `;

    item.addEventListener("click", () => {
      activeSelectedFolder = folder;
      renderFoldersSidebar();
      renderSavedBuildsList();
    });

    if (canDelete) {
      const delBtn = item.querySelector(".folder-delete-btn");
      if (delBtn) {
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteFolder(folder);
        });
      }
    }

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
  const tierEquivSelect = document.getElementById("build-tier-equiv-select");
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
  if (tierEquivSelect) {
    tierEquivSelect.addEventListener("change", (e) => {
      currentBuild.tierEquiv = parseInt(e.target.value, 10) || 8;
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
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
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
      saveBuildToCloud(buildToSave);
      showToast(`¡Build guardada en "${buildToSave.folder || 'ZvZ'}"!`);

      // Redirigir a consultar builds, seleccionar carpeta y resaltar la build guardada
      const savedFolder = buildToSave.folder || "ALL";
      activeSelectedFolder = savedFolder;
      switchTab("saved-builds");
      renderFoldersSidebar();
      renderSavedBuildsList(buildToSave.id);
    });
  }

  const btnCancelBuilder = document.getElementById("btn-cancel-builder");
  if (btnCancelBuilder) {
    btnCancelBuilder.addEventListener("click", () => {
      switchTab("saved-builds");
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
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
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
            editBuild(imported);
            showToast("Build importada en el creador.");
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

  const btnRestore = document.getElementById("btn-restore-defaults");
  if (btnRestore) {
    btnRestore.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        showToast("Inicia sesión como Oficial para restaurar builds.");
        return;
      }
      if (confirm("¿Deseas restaurar las builds oficiales por defecto del gremio?\nEsto restaurará las guías iniciales en la nube.")) {
        saveBuildsToStorage(DEFAULT_BUILDS);
        saveCustomFolders(DEFAULT_FOLDERS);
        restoreDefaultsInCloud(DEFAULT_BUILDS, DEFAULT_FOLDERS);
        showToast("¡Builds y carpetas por defecto restauradas en la nube!");
      }
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
// Creador / Modificador de Build
// ==========================================================================
function startNewBuild() {
  if (!isOfficer()) {
    openOfficerLoginModal();
    return;
  }
  currentBuild = {
    id: "build_" + Date.now(),
    name: "Nueva Build",
    role: "DPS Melee",
    tierEquiv: 8,
    folder: activeSelectedFolder !== "ALL" ? activeSelectedFolder : "ZvZ",
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

  const editorTitle = document.getElementById("editor-title");
  if (editorTitle) editorTitle.textContent = "Creador de Nueva Build";

  renderBuild();
  switchTab("builder");
  showToast("Creador listo para una nueva build.");
}

function editBuild(build) {
  if (!isOfficer()) {
    openOfficerLoginModal();
    return;
  }
  currentBuild = JSON.parse(JSON.stringify(build));
  if (!currentBuild.tierEquiv) currentBuild.tierEquiv = 8;

  const editorTitle = document.getElementById("editor-title");
  if (editorTitle) editorTitle.textContent = `Editando: ${build.name || 'Build'}`;

  renderBuild();
  switchTab("builder");
  showToast(`Cargada "${build.name}" en el editor.`);
}

function renderBuild() {
  const nameInput = document.getElementById("build-name-input");
  const roleInput = document.getElementById("build-role-input");
  const tierEquivSelect = document.getElementById("build-tier-equiv-select");
  const folderSelect = document.getElementById("build-folder-select");
  const notesInput = document.getElementById("build-notes-input");

  if (nameInput) nameInput.value = currentBuild.name || "";
  if (roleInput) roleInput.value = currentBuild.role || "";
  if (tierEquivSelect) tierEquivSelect.value = String(currentBuild.tierEquiv || 8);
  if (folderSelect) folderSelect.value = currentBuild.folder || "ZvZ";
  if (notesInput) notesInput.value = currentBuild.notes || "";

  const slots = ["head", "cape", "mainhand", "offhand", "armor", "shoes", "food", "potion", "mount"];
  
  const mainHandItem = ALBION_ITEMS.find(i => i.id === currentBuild.equipment.mainhand?.id);
  const isTwoHanded = mainHandItem && mainHandItem.twoHanded;

  slots.forEach(slotKey => {
    const slotData = currentBuild.equipment[slotKey];
    const dbItem = ALBION_ITEMS.find(i => i.id === slotData?.id);

    const imgEl = document.getElementById(`img-${slotKey}`);
    const emptyEl = document.getElementById(`empty-${slotKey}`);
    const nameEl = document.getElementById(`name-${slotKey}`);
    const badgeEl = document.getElementById(`badge-${slotKey}`);

    const cardEl = document.getElementById(`slot-card-${slotKey}`);
    if (slotKey === "offhand") {
      if (isTwoHanded) {
        if (cardEl) cardEl.classList.add("slot-card-blocked");
        if (imgEl) imgEl.style.display = "none";
        if (emptyEl) {
          emptyEl.style.display = "block";
          emptyEl.textContent = "2 Manos (Bloqueado)";
        }
        if (nameEl) nameEl.textContent = "Arma a 2 Manos";
        if (badgeEl) badgeEl.textContent = "Bloqueado";
        return;
      } else {
        if (cardEl) cardEl.classList.remove("slot-card-blocked");
      }
    }

    if (slotData && dbItem) {
      const tier = slotData.tier || dbItem.fixedTier || "T8";
      const enchant = slotData.enchant !== undefined ? slotData.enchant : 0;
      const quality = slotData.quality || 4;

      if (imgEl) {
        imgEl.src = getItemImageUrl(dbItem, tier, enchant, quality);
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
        if (slotKey.match(/food|potion|mount/)) {
          badgeEl.textContent = tier;
        } else {
          badgeEl.textContent = "T8 Sobresaliente";
        }
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
      if (nameEl) nameEl.textContent = "Vacío";
      if (badgeEl) badgeEl.textContent = "Ninguno";
    }
  });

  renderSpellButtons();
}

function renderSpellButtons() {
  const mhData = currentBuild.equipment.mainhand;
  const mhItem = ALBION_ITEMS.find(i => i.id === mhData?.id);
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
  const headItem = ALBION_ITEMS.find(i => i.id === headData?.id);
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
  const armorItem = ALBION_ITEMS.find(i => i.id === armorData?.id);
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
  const shoesItem = ALBION_ITEMS.find(i => i.id === shoesData?.id);
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
  const spell = ALBION_SPELLS[spellId];

  if (spellId && spell) {
    if (imgEl) {
      imgEl.src = spell.icon || `https://render.albiononline.com/v1/spell/${spellId}.png`;
      imgEl.style.display = "block";
      imgEl.onerror = () => {
        imgEl.style.display = "none";
        if (txtEl) {
          txtEl.style.display = "block";
          txtEl.textContent = getSpellShortCode(type, slot);
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

// ==========================================================================
// Modal: Selector de Items (Fijado en T8 Sobresaliente)
// ==========================================================================
function openItemPickerModal(slot) {
  if (!isOfficer()) {
    openOfficerLoginModal();
    return;
  }

  if (slot === "offhand") {
    const mainHandItem = ALBION_ITEMS.find(i => i.id === currentBuild.equipment.mainhand?.id);
    if (mainHandItem && mainHandItem.twoHanded) {
      showToast("No puedes equipar mano secundaria con un arma a 2 manos.");
      return;
    }
  }

  activeModalSlot = slot;
  const modal = document.getElementById("modal-item-picker");
  const modalTitle = document.getElementById("modal-item-title");
  const categorySelect = document.getElementById("item-category-select");
  const searchInput = document.getElementById("item-search-input");

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

  if (modalTitle) modalTitle.textContent = slotTitles[slot] || "Seleccionar Item";
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
  return ALBION_ITEMS.filter(item => item.slot === slot);
}

function renderItemsList() {
  const container = document.getElementById("items-list-container");
  if (!container || !activeModalSlot) return;

  const searchVal = (document.getElementById("item-search-input")?.value || "").toLowerCase().trim();
  const selectedCat = document.getElementById("item-category-select")?.value || "ALL";

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
    
    // Default tier T8, enchant 0, quality 4 (Sobresaliente)
    const iconUrl = getItemImageUrl(item, item.fixedTier || "T8", 0, 4);

    card.innerHTML = `
      <img class="item-option-img" src="${iconUrl}" alt="${item.name}" loading="lazy" onerror="this.src=''; this.style.display='none';">
      <div class="item-option-info">
        <div class="item-option-name" title="${item.name}">${item.name}</div>
        <div class="item-option-cat">${item.category}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      equipItemToSlot(activeModalSlot, item);
      closeItemPickerModal();
    });

    container.appendChild(card);
  });
}

function equipItemToSlot(slot, item) {
  currentBuild.equipment[slot] = {
    id: item.id,
    tier: item.fixedTier || "T8",
    enchant: 0,
    quality: 4
  };

  if (slot === "mainhand" && item.twoHanded) {
    currentBuild.equipment.offhand = null;
  }

  const itemSpells = ITEM_SPELLS_MAP[item.id] || {};

  if (slot === "mainhand") {
    currentBuild.equipment.mainhand.qSpell = itemSpells.q?.[0] || null;
    currentBuild.equipment.mainhand.wSpell = itemSpells.w?.[0] || null;
    currentBuild.equipment.mainhand.eSpell = itemSpells.e?.[0] || null;
    currentBuild.equipment.mainhand.passiveSpell = itemSpells.passive?.[0] || null;
  } else if (slot === "head" || slot === "armor" || slot === "shoes") {
    const activeList = itemSpells.active || [];
    currentBuild.equipment[slot].activeSpell = activeList.length > 0 ? activeList[activeList.length - 1] : null;
    currentBuild.equipment[slot].passiveSpell = itemSpells.passive?.[0] || null;
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
  if (!isOfficer()) {
    openOfficerLoginModal();
    return;
  }
  activeSpellSlot = slot;
  activeSpellType = spellType;

  const modal = document.getElementById("modal-spell-picker");
  const modalTitle = document.getElementById("modal-spell-title");
  const container = document.getElementById("spells-list-container");

  if (!modal || !container) return;

  const itemData = currentBuild.equipment[slot];
  const dbItem = ALBION_ITEMS.find(i => i.id === itemData?.id);

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

  if (modalTitle) modalTitle.textContent = `Seleccionar Habilidad (${spellType.toUpperCase()}) - ${dbItem.name}`;
  container.innerHTML = "";

  const currentSelectedSpellId = getCurrentSpellId(slot, spellType);

  spellList.forEach(spell => {
    const card = document.createElement("div");
    card.className = `spell-option-card ${currentSelectedSpellId === spell.id ? 'active-spell' : ''}`;

    const iconUrl = spell.icon || `https://render.albiononline.com/v1/spell/${spell.id}.png`;

    const metaParts = [];
    if (spell.cooldown) metaParts.push(spell.cooldown);
    if (spell.energy) metaParts.push(`${spell.energy} energía`);
    if (spell.castTime) metaParts.push(spell.castTime);

    card.innerHTML = `
      <div class="spell-option-icon">
        <img src="${iconUrl}" alt="${spell.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-weight:bold; font-size:12px;\\'>${getSpellShortCode(spellType, slot)}</span>';">
      </div>
      <div class="spell-option-content">
        <div class="spell-option-name">${spell.name}</div>
        <div class="spell-option-meta" style="font-size: 11px; color: var(--text-gold); margin-bottom: 2px;">
          ${metaParts.join(" • ")}
        </div>
        ${spell.desc ? `<div class="spell-option-desc" style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">${spell.desc}</div>` : ''}
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
  const itemSpells = ITEM_SPELLS_MAP[item.id] || {};
  let ids = [];

  if (slot === "mainhand") {
    if (spellType === "q") ids = itemSpells.q || [];
    else if (spellType === "w") ids = itemSpells.w || [];
    else if (spellType === "e") ids = itemSpells.e || [];
    else if (spellType === "passive") ids = itemSpells.passive || [];
  } else {
    if (spellType === "active") ids = itemSpells.active || [];
    else if (spellType === "passive") ids = itemSpells.passive || [];
  }

  return ids.map(id => ALBION_SPELLS[id]).filter(Boolean);
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

// ==========================================================================
// Visor de Build: Estilo Oficial Albion Online In-Game
// ==========================================================================
function openBuildViewerModal(build) {
  viewingBuild = build;
  const modal = document.getElementById("modal-build-viewer");
  if (!modal) return;

  // Encabezado & Metadatos
  const titleEl = document.getElementById("viewer-build-title");
  const roleEl = document.getElementById("viewer-build-role");
  const tierEl = document.getElementById("viewer-build-tier");
  const folderEl = document.getElementById("viewer-build-folder");

  if (titleEl) titleEl.textContent = build.name || "Sin título";
  if (roleEl) roleEl.textContent = build.role || "General";
  const tEq = build.tierEquiv || 8;
  if (tierEl) tierEl.textContent = `Tier ${tEq} Equivalente (${getTierEquivExample(tEq)})`;
  if (folderEl) folderEl.textContent = build.folder || 'ZvZ';

  // Rueda 3x3 de Equipamiento estilo Albion
  const wheelContainer = document.getElementById("viewer-albion-wheel");
  if (wheelContainer) {
    renderAlbionLoadoutWheel(build, wheelContainer);
  }

  // Lista Detallada de Habilidades
  const spellsContainer = document.getElementById("viewer-spells-container");
  const notesEl = document.getElementById("viewer-build-notes");
  const eq = build.equipment || {};

  if (spellsContainer) {
    spellsContainer.innerHTML = "";
    const spellsToRender = [];

    if (eq.mainhand) {
      if (eq.mainhand.qSpell) spellsToRender.push({ spellId: eq.mainhand.qSpell, key: "Q (Arma)" });
      if (eq.mainhand.wSpell) spellsToRender.push({ spellId: eq.mainhand.wSpell, key: "W (Arma)" });
      if (eq.mainhand.eSpell) spellsToRender.push({ spellId: eq.mainhand.eSpell, key: "E (Especial)" });
      if (eq.mainhand.passiveSpell) spellsToRender.push({ spellId: eq.mainhand.passiveSpell, key: "Pasiva (Arma)" });
    }

    if (eq.head) {
      if (eq.head.activeSpell) spellsToRender.push({ spellId: eq.head.activeSpell, key: "D (Cabeza)" });
      if (eq.head.passiveSpell) spellsToRender.push({ spellId: eq.head.passiveSpell, key: "Pasiva (Cabeza)" });
    }

    if (eq.armor) {
      if (eq.armor.activeSpell) spellsToRender.push({ spellId: eq.armor.activeSpell, key: "R (Pecho)" });
      if (eq.armor.passiveSpell) spellsToRender.push({ spellId: eq.armor.passiveSpell, key: "Pasiva (Pecho)" });
    }

    if (eq.shoes) {
      if (eq.shoes.activeSpell) spellsToRender.push({ spellId: eq.shoes.activeSpell, key: "F (Botas)" });
      if (eq.shoes.passiveSpell) spellsToRender.push({ spellId: eq.shoes.passiveSpell, key: "Pasiva (Botas)" });
    }

    if (spellsToRender.length === 0) {
      spellsContainer.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); font-size: 12px; padding: 10px;">No hay habilidades seleccionadas para esta build.</div>`;
    } else {
      spellsToRender.forEach(sObj => {
        const spell = ALBION_SPELLS[sObj.spellId];
        if (!spell) return;

        const row = document.createElement("div");
        row.className = "viewer-spell-row";
        row.id = `spell-detail-${sObj.spellId}`;
        const iconUrl = spell.icon || `https://render.albiononline.com/v1/spell/${spell.id}.png`;

        const metaParts = [];
        if (spell.cooldown) metaParts.push(spell.cooldown);
        if (spell.energy) metaParts.push(`${spell.energy} energía`);
        if (spell.castTime) metaParts.push(spell.castTime);

        row.innerHTML = `
          <div class="viewer-spell-icon">
            <img src="${iconUrl}" alt="${spell.name}" onerror="this.style.display='none'; this.parentElement.textContent='${sObj.key.split(' ')[0]}';">
          </div>
          <div class="viewer-spell-details">
            <div class="viewer-spell-header">
              <span class="viewer-spell-title">${spell.name}</span>
              <span class="viewer-spell-slotkey">${sObj.key}</span>
            </div>
            <div class="viewer-spell-meta">
              ${metaParts.join(" • ")}
            </div>
            ${spell.desc ? `<div class="viewer-spell-desc">${spell.desc}</div>` : ''}
          </div>
        `;
        spellsContainer.appendChild(row);
      });
    }
  }

  // Notas
  if (notesEl) {
    notesEl.textContent = build.notes || "Sin notas adicionales para esta build.";
  }

  switchViewerSubtab("spells");
  modal.style.display = "flex";
}

function renderAlbionLoadoutWheel(build, container) {
  container.innerHTML = "";
  const eq = build.equipment || {};
  const mhItem = ALBION_ITEMS.find(i => i.id === eq.mainhand?.id);
  const isTwoHanded = mhItem && mhItem.twoHanded;

  function createSlotElement(slotHtml) {
    const div = document.createElement("div");
    div.innerHTML = slotHtml.trim();
    return div.firstElementChild;
  }

  // 1. Mochila (Bag) - Top Left
  const bagHtml = `
    <div class="albion-slot-card" title="Bolsa de Anciano (T8 Sobresaliente)">
      <img class="albion-slot-img" src="https://render.albiononline.com/v1/item/T8_BAG.png?quality=4" alt="Mochila T8">
    </div>
  `;
  container.appendChild(createSlotElement(bagHtml));

  // 2. Casco (Head) - Top Center
  container.appendChild(createAlbionSlot(eq.head, [
    { id: eq.head?.activeSpell, key: "D" },
    { id: eq.head?.passiveSpell, key: "P" }
  ], "Casco / Cabeza"));

  // 3. Capa (Cape) - Top Right
  const capeItem = ALBION_ITEMS.find(i => i.id === eq.cape?.id);
  const capeUrl = capeItem ? getItemImageUrl(capeItem, eq.cape?.tier || "T8", 0, 4) : "https://render.albiononline.com/v1/item/T8_CAPE.png?quality=4";
  const capeHtml = `
    <div class="albion-slot-card" title="${capeItem ? capeItem.name : 'Capa'}">
      <img class="albion-slot-img" src="${capeUrl}" alt="${capeItem ? capeItem.name : 'Capa'}">
    </div>
  `;
  container.appendChild(createSlotElement(capeHtml));

  // 4. Arma Principal (Mainhand) - Middle Left
  container.appendChild(createAlbionSlot(eq.mainhand, [
    { id: eq.mainhand?.qSpell, key: "Q" },
    { id: eq.mainhand?.wSpell, key: "W" },
    { id: eq.mainhand?.eSpell, key: "E" },
    { id: eq.mainhand?.passiveSpell, key: "P" }
  ], "Arma Principal"));

  // 5. Armadura (Armor) - Middle Center
  container.appendChild(createAlbionSlot(eq.armor, [
    { id: eq.armor?.activeSpell, key: "R" },
    { id: eq.armor?.passiveSpell, key: "P" }
  ], "Armadura / Pecho"));

  // 6. Mano Secundaria (Offhand) - Middle Right
  if (isTwoHanded) {
    const offhandHtml = `
      <div class="albion-slot-card albion-slot-blocked" title="Arma a 2 Manos (Ranura Mano Secundaria Bloqueada)">
        <div class="albion-twohanded-cross">
          <svg viewBox="0 0 24 24" width="46" height="46" stroke="#525d6b" stroke-width="2.2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </div>
    `;
    container.appendChild(createSlotElement(offhandHtml));
  } else {
    const offItem = ALBION_ITEMS.find(i => i.id === eq.offhand?.id);
    if (offItem) {
      const offUrl = getItemImageUrl(offItem, eq.offhand?.tier || "T8", 0, 4);
      const offHtml = `
        <div class="albion-slot-card" title="${offItem.name}">
          <img class="albion-slot-img" src="${offUrl}" alt="${offItem.name}">
        </div>
      `;
      container.appendChild(createSlotElement(offHtml));
    } else {
      const offHtml = `
        <div class="albion-slot-card" title="Mano secundaria (Vacía)">
          <span class="albion-empty-slot-icon">Offhand</span>
        </div>
      `;
      container.appendChild(createSlotElement(offHtml));
    }
  }

  // 7. Poción (Potion) - Bottom Left
  const potItem = ALBION_ITEMS.find(i => i.id === eq.potion?.id);
  const potUrl = potItem ? getItemImageUrl(potItem, eq.potion?.tier || "T7", 0, 4) : "https://render.albiononline.com/v1/item/T7_POTION_HEAL.png?quality=4";
  const potHtml = `
    <div class="albion-slot-card" title="${potItem ? potItem.name : 'Poción'}">
      <img class="albion-slot-img" src="${potUrl}" alt="${potItem ? potItem.name : 'Poción'}">
    </div>
  `;
  container.appendChild(createSlotElement(potHtml));

  // 8. Botas (Shoes) - Bottom Center
  container.appendChild(createAlbionSlot(eq.shoes, [
    { id: eq.shoes?.activeSpell, key: "F" },
    { id: eq.shoes?.passiveSpell, key: "P" }
  ], "Botas / Calzado"));

  // 9. Comida y Montura (Food & Mount) - Bottom Right
  const foodItem = ALBION_ITEMS.find(i => i.id === eq.food?.id);
  const mountItem = ALBION_ITEMS.find(i => i.id === eq.mount?.id);
  const foodUrl = foodItem ? getItemImageUrl(foodItem, eq.food?.tier || "T8", 0, 4) : "https://render.albiononline.com/v1/item/T8_MEAL_STEW.png?quality=4";
  
  let foodMountHtml = `
    <div class="albion-slot-card" title="${foodItem ? foodItem.name : 'Comida'}">
      <img class="albion-slot-img" src="${foodUrl}" alt="${foodItem ? foodItem.name : 'Comida'}">
  `;

  if (mountItem) {
    const mountUrl = getItemImageUrl(mountItem, eq.mount?.tier || "T6", 0, 4);
    foodMountHtml += `
      <div class="albion-mini-mount-badge" title="Montura: ${mountItem.name}">
        <img src="${mountUrl}" alt="${mountItem.name}">
      </div>
    `;
  }

  foodMountHtml += `</div>`;
  container.appendChild(createSlotElement(foodMountHtml));
}

function createAlbionSlot(slotData, spellsList, defaultLabel) {
  const item = ALBION_ITEMS.find(i => i.id === slotData?.id);
  const slotCard = document.createElement("div");
  slotCard.className = "albion-slot-card";

  if (!item) {
    slotCard.title = `${defaultLabel} (Vacío)`;
    slotCard.innerHTML = `<span class="albion-empty-slot-icon">${defaultLabel}</span>`;
    return slotCard;
  }

  const url = getItemImageUrl(item, slotData.tier || "T8", 0, 4);
  slotCard.title = `${item.name} (T8 Sobresaliente)`;

  const img = document.createElement("img");
  img.className = "albion-slot-img";
  img.src = url;
  img.alt = item.name;
  slotCard.appendChild(img);

  const activeSpells = spellsList.filter(s => s && s.id);
  if (activeSpells.length > 0) {
    const overlay = document.createElement("div");
    overlay.className = `albion-spells-overlay ${activeSpells.length >= 4 ? 'spells-4' : ''}`;

    activeSpells.forEach(sObj => {
      const spell = ALBION_SPELLS[sObj.id];
      const spellCircle = document.createElement("div");
      spellCircle.className = "albion-spell-circle";
      const spellTitle = spell ? `${spell.name} [${sObj.key}]${spell.cooldown ? ' - Enfriamiento: ' + spell.cooldown : ''}` : sObj.key;
      spellCircle.title = spellTitle;

      const spellIconUrl = spell?.icon || `https://render.albiononline.com/v1/spell/${sObj.id}.png`;
      const spellImg = document.createElement("img");
      spellImg.src = spellIconUrl;
      spellImg.alt = sObj.key;
      spellImg.onerror = () => {
        spellImg.style.display = 'none';
        spellCircle.textContent = sObj.key;
      };
      spellCircle.appendChild(spellImg);

      spellCircle.addEventListener("click", (e) => {
        e.stopPropagation();
        switchViewerSubtab("spells");
        const targetRow = document.getElementById(`spell-detail-${sObj.id}`);
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          targetRow.style.borderColor = "var(--text-gold)";
          setTimeout(() => {
            targetRow.style.borderColor = "var(--border-color)";
          }, 1500);
        }
      });

      overlay.appendChild(spellCircle);
    });

    slotCard.appendChild(overlay);
  }

  return slotCard;
}

function switchViewerSubtab(tabName) {
  document.querySelectorAll(".albion-subtab-btn").forEach(btn => {
    if (btn.getAttribute("data-subtab") === tabName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.querySelectorAll(".albion-subtab-pane").forEach(pane => {
    pane.classList.remove("active");
  });

  const activePane = document.getElementById(`subtab-content-${tabName}`);
  if (activePane) {
    activePane.classList.add("active");
  }
}

function closeBuildViewerModal() {
  const modal = document.getElementById("modal-build-viewer");
  if (modal) modal.style.display = "none";
  viewingBuild = null;
}

function setupViewerModalEvents() {
  document.getElementById("btn-close-viewer-modal")?.addEventListener("click", closeBuildViewerModal);
  document.getElementById("btn-cancel-viewer-modal")?.addEventListener("click", closeBuildViewerModal);

  document.querySelectorAll(".albion-subtab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const subtab = btn.getAttribute("data-subtab");
      if (subtab) switchViewerSubtab(subtab);
    });
  });

  document.getElementById("btn-viewer-copy-discord")?.addEventListener("click", () => {
    if (viewingBuild) {
      const text = generateDiscordText(viewingBuild);
      copyToClipboard(text, "¡Ficha de build para Discord copiada!");
    }
  });

  document.getElementById("btn-viewer-share-link")?.addEventListener("click", () => {
    if (viewingBuild) {
      const serialized = encodeURIComponent(JSON.stringify(viewingBuild));
      const shareUrl = `${window.location.origin}${window.location.pathname}#build=${serialized}`;
      copyToClipboard(shareUrl, "¡Enlace a la build copiado!");
    }
  });

  document.getElementById("btn-viewer-edit-build")?.addEventListener("click", () => {
    if (viewingBuild) {
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      const toEdit = JSON.parse(JSON.stringify(viewingBuild));
      closeBuildViewerModal();
      editBuild(toEdit);
    }
  });
}

function setupModalEvents() {
  document.getElementById("btn-close-item-modal")?.addEventListener("click", closeItemPickerModal);
  document.getElementById("btn-cancel-item-modal")?.addEventListener("click", closeItemPickerModal);
  document.getElementById("item-search-input")?.addEventListener("input", renderItemsList);
  document.getElementById("item-category-select")?.addEventListener("change", renderItemsList);

  document.getElementById("btn-remove-item")?.addEventListener("click", () => {
    if (!isOfficer()) {
      openOfficerLoginModal();
      return;
    }
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
    const viewerModal = document.getElementById("modal-build-viewer");
    const loginModal = document.getElementById("modal-officer-login");
    const manageModal = document.getElementById("modal-manage-folders");

    if (e.target === itemModal) closeItemPickerModal();
    if (e.target === spellModal) closeSpellPickerModal();
    if (e.target === viewerModal) closeBuildViewerModal();
    if (e.target === loginModal) closeOfficerLoginModal();
    if (e.target === manageModal) closeManageFoldersModal();
  });
}

// ==========================================================================
// Renderizado de Builds por Carpeta
// ==========================================================================
function setupRoleFilterEvents() {
  const chips = document.querySelectorAll(".role-filter-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeSelectedRole = chip.getAttribute("data-role") || "ALL";
      renderSavedBuildsList();
    });
  });
}

function renderSavedBuildsList(highlightBuildId = null) {
  const container = document.getElementById("saved-builds-container");
  const folderTitle = document.getElementById("current-folder-title");
  const folderCount = document.getElementById("current-folder-count");
  const searchInput = document.getElementById("search-saved-builds");
  const searchVal = (searchInput?.value || "").toLowerCase().trim();

  if (!container) return;

  const allBuilds = getSavedBuilds();
  let filtered = allBuilds;
  if (activeSelectedFolder !== "ALL") {
    filtered = filtered.filter(b => (b.folder || "ZvZ") === activeSelectedFolder);
  }

  if (activeSelectedRole !== "ALL") {
    filtered = filtered.filter(b => (b.role || "").toLowerCase() === activeSelectedRole.toLowerCase());
  }

  if (searchVal) {
    filtered = filtered.filter(b => {
      const mhItem = b.equipment?.mainhand ? ALBION_ITEMS.find(i => i.id === b.equipment.mainhand.id) : null;
      const weaponName = (mhItem?.name || "").toLowerCase();
      return (b.name || "").toLowerCase().includes(searchVal) || 
             (b.role || "").toLowerCase().includes(searchVal) ||
             (b.notes || "").toLowerCase().includes(searchVal) ||
             weaponName.includes(searchVal);
    });
  }

  const allFolders = getAllFolders();
  const officerMode = isOfficer();

  if (folderTitle) {
    folderTitle.textContent = activeSelectedFolder === "ALL" ? "Todas las Builds" : activeSelectedFolder;
  }
  if (folderCount) {
    folderCount.textContent = `${filtered.length} builds encontradas`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px 20px; background: rgba(22, 27, 34, 0.4); border-radius: var(--radius); border: 1px dashed var(--border-color);">
        <div style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">
          ${allBuilds.length === 0 ? "No hay ninguna build guardada" : "No hay builds en esta carpeta"}
        </div>
        <p style="font-size: 13px; color: var(--text-muted); max-width: 420px; margin: 0 auto 16px;">
          ${allBuilds.length === 0 
            ? "Todas las builds han sido eliminadas. Los oficiales pueden crear nuevas builds desde el editor." 
            : `No se encontraron builds en "${activeSelectedFolder}".`}
        </p>
        ${officerMode ? `<button type="button" class="btn btn-primary btn-sm" id="btn-create-empty-state">Crear Nueva Build</button>` : ''}
      </div>
    `;
    container.querySelector("#btn-create-empty-state")?.addEventListener("click", () => {
      startNewBuild();
    });
    return;
  }

  container.innerHTML = "";

  filtered.forEach(build => {
    const row = document.createElement("div");
    row.className = `saved-build-row ${highlightBuildId === build.id ? 'flash-highlight' : ''}`;
    
    if (highlightBuildId && build.id === highlightBuildId) {
      setTimeout(() => {
        row.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }

    const eq = build.equipment || {};
    const mhData = eq.mainhand;
    const mhItem = mhData ? ALBION_ITEMS.find(i => i.id === mhData.id) : null;
    const mhUrl = mhItem ? getItemImageUrl(mhItem, mhData.tier || mhItem.fixedTier || "T8", 0, 4) : null;

    // Equipamiento secundario ordenado al estilo oficial Albion:
    // Casco, Pecho, Botas, Mano Secundaria (si aplica), Capa, Poción, Comida
    const secondarySlots = ["head", "armor", "shoes", "offhand", "cape", "potion", "food"];
    let secondaryThumbsHtml = "";

    secondarySlots.forEach(slotKey => {
      const slotData = eq[slotKey];
      if (slotData) {
        const item = ALBION_ITEMS.find(i => i.id === slotData.id);
        if (item) {
          const iconUrl = getItemImageUrl(item, slotData.tier || item.fixedTier || "T8", 0, 4);
          secondaryThumbsHtml += `
            <div class="build-equip-slot" title="${item.name}">
              <img class="build-equip-img" src="${iconUrl}" alt="${item.name}" onerror="this.style.display='none';">
            </div>
          `;
        }
      }
    });

    let folderOptionsHtml = "";
    allFolders.forEach(f => {
      folderOptionsHtml += `<option value="${f}" ${f === (build.folder || 'ZvZ') ? 'selected' : ''}>${f}</option>`;
    });

    const tierEquiv = build.tierEquiv || 8;

    row.innerHTML = `
      <div class="build-folder-pill">${build.folder || 'ZvZ'}</div>

      <div class="build-row-main">
        <!-- Arma Principal Destacada (Hero Slot a la izquierda) -->
        <div class="build-hero-slot" title="${mhItem ? mhItem.name : 'Sin arma principal'}">
          ${mhUrl 
            ? `<img class="build-hero-img" src="${mhUrl}" alt="${mhItem.name}" onerror="this.style.display='none';">`
            : `<div class="build-hero-empty">Sin Arma</div>`}
        </div>

        <!-- Info & Equipamiento -->
        <div class="build-row-content">
          <div class="build-row-header">
            <h3 class="build-row-title">${build.name || 'Sin título'}</h3>
            <div class="build-row-tags">
              <span class="build-tag-role">${build.role || 'General'}</span>
              <span class="build-tag-tier">Tier ${tierEquiv} Eq.</span>
            </div>
          </div>

          ${build.notes ? `<div class="build-row-notes">"${build.notes}"</div>` : ''}

          <div class="build-row-equipment">
            ${secondaryThumbsHtml || '<span style="font-size: 11px; color: var(--text-muted);">Sin equipo secundario</span>'}
          </div>
        </div>
      </div>

      <!-- Acciones a la derecha -->
      <div class="build-row-actions">
        ${officerMode ? `
          <div class="build-move-box" onclick="event.stopPropagation();">
            <label>Mover:</label>
            <select class="form-control form-control-sm select-move-folder">
              ${folderOptionsHtml}
            </select>
          </div>
        ` : ''}
        <div class="build-btn-group">
          <button type="button" class="btn btn-primary btn-sm btn-view-build">Ver Build</button>
          <button type="button" class="btn btn-secondary btn-sm btn-discord-build" title="Copiar formato Discord">Copiar Discord</button>
          ${officerMode ? `
            <button type="button" class="btn btn-secondary btn-sm btn-edit-build">Editar</button>
            <button type="button" class="btn btn-danger btn-sm btn-delete-build">Eliminar</button>
          ` : ''}
        </div>
      </div>
    `;

    row.querySelector(".btn-view-build")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openBuildViewerModal(build);
    });

    row.querySelector(".btn-edit-build")?.addEventListener("click", (e) => {
      e.stopPropagation();
      editBuild(build);
    });

    row.querySelector(".btn-discord-build")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const discordText = generateDiscordText(build);
      copyToClipboard(discordText, "¡Ficha para Discord copiada!");
    });

    const moveSelect = row.querySelector(".select-move-folder");
    if (moveSelect) {
      moveSelect.addEventListener("click", (e) => e.stopPropagation());
      moveSelect.addEventListener("change", (e) => {
        const newFolder = e.target.value;
        const all = getSavedBuilds();
        const targetBuild = all.find(b => b.id === build.id);
        if (targetBuild) {
          targetBuild.folder = newFolder;
          saveBuildsToStorage(all);
          saveBuildToCloud(targetBuild);
          showToast(`Build movida a "${newFolder}".`);
        }
      });
    }

    row.querySelector(".btn-delete-build")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`¿Eliminar la build "${build.name}"?`)) {
        const remaining = getSavedBuilds().filter(b => b.id !== build.id);
        saveBuildsToStorage(remaining);
        deleteBuildFromCloud(build.id);
        showToast("Build eliminada.");
      }
    });

    row.addEventListener("click", () => {
      openBuildViewerModal(build);
    });

    container.appendChild(row);
  });
}

function loadBuildFromUrlHash() {
  try {
    const rawData = decodeURIComponent(window.location.hash.replace("#build=", ""));
    const parsed = JSON.parse(rawData);
    if (parsed && parsed.equipment) {
      openBuildViewerModal(parsed);
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
  const tEq = build.tierEquiv || 8;

  function getItemLine(slotKey, label) {
    const slotData = eq[slotKey];
    if (!slotData) return `• **${label}:** *Sin equipar*`;
    const item = ALBION_ITEMS.find(i => i.id === slotData.id);
    if (!item) return `• **${label}:** *Sin equipar*`;

    let spellsStr = "";

    if (slotKey === "mainhand") {
      const spells = [];
      if (slotData.qSpell && ALBION_SPELLS[slotData.qSpell]) spells.push(`Q: ${ALBION_SPELLS[slotData.qSpell].name}`);
      if (slotData.wSpell && ALBION_SPELLS[slotData.wSpell]) spells.push(`W: ${ALBION_SPELLS[slotData.wSpell].name}`);
      if (slotData.eSpell && ALBION_SPELLS[slotData.eSpell]) spells.push(`E: ${ALBION_SPELLS[slotData.eSpell].name}`);
      if (slotData.passiveSpell && ALBION_SPELLS[slotData.passiveSpell]) spells.push(`P: ${ALBION_SPELLS[slotData.passiveSpell].name}`);
      if (spells.length > 0) spellsStr = ` (${spells.join(" | ")})`;
    } else if (slotKey === "head" || slotKey === "armor" || slotKey === "shoes") {
      const spells = [];
      const actKey = slotKey === "head" ? "D" : (slotKey === "armor" ? "R" : "F");
      if (slotData.activeSpell && ALBION_SPELLS[slotData.activeSpell]) spells.push(`${actKey}: ${ALBION_SPELLS[slotData.activeSpell].name}`);
      if (slotData.passiveSpell && ALBION_SPELLS[slotData.passiveSpell]) spells.push(`P: ${ALBION_SPELLS[slotData.passiveSpell].name}`);
      if (spells.length > 0) spellsStr = ` (${spells.join(" | ")})`;
    }

    return `• **${label}:** ${item.name}${spellsStr}`;
  }

  return `🐉 **Furia de Dragones - Guía de Build**
📁 **Carpeta:** ${build.folder || 'ZvZ'} | **Rol:** ${build.role || 'General'}
⭐ **Tier Equivalente:** Tier ${tEq} Equivalente (${getTierEquivExample(tEq)})
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
📝 **Notas & Combo:** ${build.notes || 'Ninguna'}
`;
}

// ==========================================================================
// Utilidades
// ==========================================================================
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
