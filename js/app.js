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
  restoreDefaultsInCloud,
  initMembersSync,
  saveMemberToCloud,
  deleteMemberFromCloud,
  initActivitiesSync,
  saveActivityToCloud,
  deleteActivityFromCloud
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

const DEFAULT_MEMBERS = [
  {
    id: "mem_1",
    name: "DragonLeader",
    rank: "Sindicato",
    role: "Tank",
    secondaryRole: "DPS Melee",
    status: "ACTIVE",
    strikes: [],
    notes: "Fundador / Caller principal",
    updatedAt: Date.now()
  },
  {
    id: "mem_2",
    name: "FrostBite",
    rank: "Oficial",
    role: "DPS Ranged",
    secondaryRole: "",
    status: "ACTIVE",
    strikes: [],
    notes: "Oficial de reclutamiento",
    updatedAt: Date.now()
  },
  {
    id: "mem_3",
    name: "HolyLight",
    rank: "Caller",
    role: "Healer",
    secondaryRole: "Soporte",
    status: "ACTIVE",
    strikes: [],
    notes: "Main healer para CTAs",
    updatedAt: Date.now()
  }
];

const DEFAULT_ACTIVITIES = [
  {
    id: "act_1",
    title: "CTA ZvZ Castillos 18:00 UTC",
    type: "zvz_cta",
    date: new Date().toISOString().slice(0, 16),
    caller: "DragonLeader",
    notes: "Obligatorio T8 equiv. Salida por Arthur's Rest.",
    attendance: {
      "mem_1": "present",
      "mem_3": "present",
      "mem_2": "absent"
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

let activeFilterMemberStatus = "ALL";
let activeFilterMemberRole = "ALL";
let activeFilterMemberSearch = "";
let activeActivityId = null;
let currentEditingMemberId = null;
let currentStrikesMemberId = null;

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
  setupMembersEvents();
  setupAttendanceEvents();
  
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

  initMembersSync({
    onMembersUpdated: (newMembers) => {
      if (Array.isArray(newMembers)) {
        localStorage.setItem("furia_saved_members", JSON.stringify(newMembers));
        renderMembersTable();
        if (activeActivityId) {
          renderActiveActivityAttendance();
        }
      }
    }
  });

  initActivitiesSync({
    onActivitiesUpdated: (newActivities) => {
      if (Array.isArray(newActivities)) {
        localStorage.setItem("furia_saved_activities", JSON.stringify(newActivities));
        renderActivitiesList();
        renderActiveActivityAttendance();
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

  const membersTabBtn = document.getElementById("tab-btn-members");
  const attendanceTabBtn = document.getElementById("tab-btn-attendance");

  if (isOfficer()) {
    if (badgeEl) {
      badgeEl.className = "role-badge role-badge-officer";
    }
    if (iconEl) iconEl.textContent = "";
    if (labelEl) labelEl.textContent = "Modo Oficial / Sindicato";
    if (btnLogin) btnLogin.style.display = "none";
    if (btnLogout) btnLogout.style.display = "inline-flex";
    if (builderTabBtn) builderTabBtn.style.display = "inline-flex";
    if (membersTabBtn) membersTabBtn.style.display = "inline-flex";
    if (attendanceTabBtn) attendanceTabBtn.style.display = "inline-flex";
  } else {
    if (badgeEl) {
      badgeEl.className = "role-badge role-badge-member";
    }
    if (iconEl) iconEl.textContent = "";
    if (labelEl) labelEl.textContent = "Modo Miembro (Solo Lectura)";
    if (btnLogin) btnLogin.style.display = "inline-flex";
    if (btnLogout) btnLogout.style.display = "none";
    if (builderTabBtn) builderTabBtn.style.display = "none";
    if (membersTabBtn) membersTabBtn.style.display = "none";
    if (attendanceTabBtn) attendanceTabBtn.style.display = "none";
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
  }

  const storedBuilds = localStorage.getItem("furia_saved_builds");
  if (storedBuilds === null) {
    localStorage.setItem("furia_saved_builds", JSON.stringify(DEFAULT_BUILDS));
  }

  const storedFolders = localStorage.getItem("furia_custom_folders");
  if (storedFolders === null) {
    localStorage.setItem("furia_custom_folders", JSON.stringify(DEFAULT_FOLDERS));
  }

  if (!localStorage.getItem("furia_saved_members")) {
    localStorage.setItem("furia_saved_members", JSON.stringify(DEFAULT_MEMBERS));
  }

  if (!localStorage.getItem("furia_saved_activities")) {
    localStorage.setItem("furia_saved_activities", JSON.stringify(DEFAULT_ACTIVITIES));
  }
}

function getMembers() {
  try {
    const raw = localStorage.getItem("furia_saved_members");
    return raw ? JSON.parse(raw) : DEFAULT_MEMBERS;
  } catch (e) {
    return DEFAULT_MEMBERS;
  }
}

function saveMembersToStorage(list) {
  localStorage.setItem("furia_saved_members", JSON.stringify(list));
}

function getActivities() {
  try {
    const raw = localStorage.getItem("furia_saved_activities");
    return raw ? JSON.parse(raw) : DEFAULT_ACTIVITIES;
  } catch (e) {
    return DEFAULT_ACTIVITIES;
  }
}

function saveActivitiesToStorage(list) {
  localStorage.setItem("furia_saved_activities", JSON.stringify(list));
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
      if ((tabTarget === "builder" || tabTarget === "members" || tabTarget === "attendance") && !isOfficer()) {
        openOfficerLoginModal();
        showToast("Solo oficiales y sindicato pueden acceder a esta sección.");
        return;
      }
      switchTab(tabTarget);
    });
  });
}

function switchTab(tabTarget) {
  if ((tabTarget === "builder" || tabTarget === "members" || tabTarget === "attendance") && !isOfficer()) {
    openOfficerLoginModal();
    showToast("Se requiere acceso de oficial / sindicato.");
    tabTarget = "saved-builds";
  }

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
  } else if (tabTarget === "members") {
    renderMembersTable();
  } else if (tabTarget === "attendance") {
    renderActivitiesList();
    renderActiveActivityAttendance();
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

  // Notas y Modo de Combate
  const notesEl = document.getElementById("viewer-build-notes");
  if (notesEl) {
    notesEl.textContent = build.notes || "Sin notas adicionales para esta build.";
  }

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
  const potUrl = potItem ? getItemImageUrl(potItem, eq.potion?.tier || "T7", 0, 4) : "https://render.albiononline.com/v1/item/T7_POTION_HEAL.png";
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
  const foodUrl = foodItem ? getItemImageUrl(foodItem, eq.food?.tier || "T8", 0, 4) : "https://render.albiononline.com/v1/item/T8_MEAL_STEW.png";
  
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
    // Casco, Pecho, Botas, Mano Secundaria (si aplica), Capa, Poción, Comida, Montura
    const secondarySlots = ["head", "armor", "shoes", "offhand", "cape", "potion", "food", "mount"];
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

// ==========================================================================
// Módulo: Gestor de Miembros (Roster del Gremio) - Exclusivo Oficiales
// ==========================================================================

function setupMembersEvents() {
  const btnAddMember = document.getElementById("btn-open-add-member");
  const btnCloseModal = document.getElementById("btn-close-member-modal");
  const btnCancelModal = document.getElementById("btn-cancel-member-modal");
  const formMember = document.getElementById("form-member");

  const searchInput = document.getElementById("search-members-input");
  const roleSelect = document.getElementById("filter-member-role-select");
  const statusChips = document.querySelectorAll(".roster-status-chip");

  if (btnAddMember) {
    btnAddMember.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      openMemberModal();
    });
  }

  if (btnCloseModal) btnCloseModal.addEventListener("click", closeMemberModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeMemberModal);

  if (formMember) {
    formMember.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }

      const nameInput = document.getElementById("member-name-input");
      const rankSelect = document.getElementById("member-rank-select");
      const statusSelect = document.getElementById("member-status-select");
      const roleSelect = document.getElementById("member-role-select");
      const secRoleInput = document.getElementById("member-secondary-role-input");
      const notesInput = document.getElementById("member-notes-input");

      const name = (nameInput?.value || "").trim();
      if (!name) {
        alert("Introduce el nick del miembro.");
        return;
      }

      const members = getMembers();
      let targetMember = null;

      if (currentEditingMemberId) {
        targetMember = members.find(m => m.id === currentEditingMemberId);
        if (targetMember) {
          targetMember.name = name;
          targetMember.rank = rankSelect?.value || "Miembro";
          targetMember.status = statusSelect?.value || "ACTIVE";
          targetMember.role = roleSelect?.value || "DPS Melee";
          targetMember.secondaryRole = (secRoleInput?.value || "").trim();
          targetMember.notes = (notesInput?.value || "").trim();
          targetMember.updatedAt = Date.now();
        }
      } else {
        targetMember = {
          id: "mem_" + Date.now(),
          name,
          rank: rankSelect?.value || "Miembro",
          status: statusSelect?.value || "ACTIVE",
          role: roleSelect?.value || "DPS Melee",
          secondaryRole: (secRoleInput?.value || "").trim(),
          notes: (notesInput?.value || "").trim(),
          strikes: [],
          updatedAt: Date.now()
        };
        members.push(targetMember);
      }

      saveMembersToStorage(members);
      if (targetMember) {
        saveMemberToCloud(targetMember);
      }

      closeMemberModal();
      renderMembersTable();
      showToast(currentEditingMemberId ? "Miembro actualizado." : "Miembro registrado con éxito.");
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeFilterMemberSearch = e.target.value.trim().toLowerCase();
      renderMembersTable();
    });
  }

  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      activeFilterMemberRole = e.target.value;
      renderMembersTable();
    });
  }

  statusChips.forEach(chip => {
    chip.addEventListener("click", () => {
      statusChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilterMemberStatus = chip.getAttribute("data-status") || "ALL";
      renderMembersTable();
    });
  });

  // Eventos Modal Amonestaciones (Strikes)
  document.getElementById("btn-close-strikes-modal")?.addEventListener("click", closeStrikesModal);
  document.getElementById("btn-cancel-strikes-modal")?.addEventListener("click", closeStrikesModal);

  const formAddStrike = document.getElementById("form-add-strike");
  if (formAddStrike) {
    formAddStrike.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      if (!currentStrikesMemberId) return;

      const reasonInput = document.getElementById("strike-reason-input");
      const reason = (reasonInput?.value || "").trim();
      if (!reason) return;

      const members = getMembers();
      const member = members.find(m => m.id === currentStrikesMemberId);
      if (member) {
        if (!Array.isArray(member.strikes)) member.strikes = [];
        member.strikes.push({
          id: "str_" + Date.now(),
          date: new Date().toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
          reason,
          officer: "Oficial"
        });
        member.updatedAt = Date.now();
        saveMembersToStorage(members);
        saveMemberToCloud(member);

        if (reasonInput) reasonInput.value = "";
        renderStrikesModalContent(member);
        renderMembersTable();
        showToast(`Amonestación aplicada a ${member.name} (${member.strikes.length}/3).`);
      }
    });
  }
}

function openMemberModal(member = null) {
  currentEditingMemberId = member ? member.id : null;
  const modal = document.getElementById("modal-member-form");
  const title = document.getElementById("modal-member-title");

  const nameInput = document.getElementById("member-name-input");
  const rankSelect = document.getElementById("member-rank-select");
  const statusSelect = document.getElementById("member-status-select");
  const roleSelect = document.getElementById("member-role-select");
  const secRoleInput = document.getElementById("member-secondary-role-input");
  const notesInput = document.getElementById("member-notes-input");

  if (title) title.textContent = member ? "Modificar Ficha de Miembro" : "Registrar Nuevo Miembro";

  if (nameInput) nameInput.value = member ? member.name : "";
  if (rankSelect) rankSelect.value = member ? member.rank : "Miembro";
  if (statusSelect) statusSelect.value = member ? member.status : "ACTIVE";
  if (roleSelect) roleSelect.value = member ? member.role : "DPS Melee";
  if (secRoleInput) secRoleInput.value = member ? (member.secondaryRole || "") : "";
  if (notesInput) notesInput.value = member ? (member.notes || "") : "";

  if (modal) modal.style.display = "flex";
  setTimeout(() => nameInput?.focus(), 100);
}

function closeMemberModal() {
  const modal = document.getElementById("modal-member-form");
  if (modal) modal.style.display = "none";
  currentEditingMemberId = null;
}

function openStrikesModal(memberId) {
  currentStrikesMemberId = memberId;
  const members = getMembers();
  const member = members.find(m => m.id === memberId);
  if (!member) return;

  const modal = document.getElementById("modal-strikes");
  renderStrikesModalContent(member);
  if (modal) modal.style.display = "flex";
}

function closeStrikesModal() {
  const modal = document.getElementById("modal-strikes");
  if (modal) modal.style.display = "none";
  currentStrikesMemberId = null;
}

function renderStrikesModalContent(member) {
  const summaryEl = document.getElementById("strikes-member-summary");
  const listEl = document.getElementById("strikes-history-list");
  if (summaryEl) {
    const strikesCount = (member.strikes || []).length;
    summaryEl.innerHTML = `Miembro: <strong>${escapeHtml(member.name)}</strong> | Rango: <span class="rank-badge rank-${(member.rank || '').toLowerCase()}">${member.rank}</span> | Sanciones acumuladas: <strong>${strikesCount}/3</strong>`;
  }

  if (listEl) {
    listEl.innerHTML = "";
    const strikes = member.strikes || [];
    if (strikes.length === 0) {
      listEl.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); padding: 8px 0;">Este miembro no tiene amonestaciones registradas. Expediente limpio.</div>`;
      return;
    }

    strikes.forEach((str, index) => {
      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      item.style.background = "#141820";
      item.style.border = "1px solid #222b38";
      item.style.borderRadius = "4px";
      item.style.padding = "8px 12px";
      item.style.marginBottom = "6px";

      item.innerHTML = `
        <div style="font-size: 12px; line-height: 1.4;">
          <div style="color: #e5a93b; font-weight: 600;">Strike #${index + 1} • <span style="color: var(--text-muted); font-weight: normal;">${escapeHtml(str.date || '')}</span></div>
          <div style="color: var(--text-main); margin-top: 2px;">${escapeHtml(str.reason || '')}</div>
        </div>
        <button type="button" class="btn btn-outline btn-sm btn-remove-strike" data-index="${index}" style="font-size: 11px; padding: 2px 6px;">Retirar</button>
      `;

      item.querySelector(".btn-remove-strike")?.addEventListener("click", () => {
        if (!isOfficer()) {
          openOfficerLoginModal();
          return;
        }
        if (confirm(`¿Retirar este strike a ${member.name}?`)) {
          const members = getMembers();
          const target = members.find(m => m.id === member.id);
          if (target && target.strikes) {
            target.strikes.splice(index, 1);
            target.updatedAt = Date.now();
            saveMembersToStorage(members);
            saveMemberToCloud(target);
            renderStrikesModalContent(target);
            renderMembersTable();
            showToast("Amonestación retirada.");
          }
        }
      });

      listEl.appendChild(item);
    });
  }
}

function renderMembersTable() {
  const tbody = document.getElementById("members-table-body");
  const summaryEl = document.getElementById("members-count-summary");
  if (!tbody) return;

  const members = getMembers();
  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === "ACTIVE").length;

  if (summaryEl) {
    summaryEl.textContent = `${activeCount} activos • ${totalCount} miembros totales`;
  }

  // Filtrado
  const filtered = members.filter(m => {
    // Filtro por estado
    if (activeFilterMemberStatus === "ACTIVE" && m.status !== "ACTIVE") return false;
    if (activeFilterMemberStatus === "INACTIVE" && m.status !== "INACTIVE" && m.status !== "LEAVE") return false;
    if (activeFilterMemberStatus === "STRIKES" && (!m.strikes || m.strikes.length === 0)) return false;

    // Filtro por rol
    if (activeFilterMemberRole !== "ALL" && m.role !== activeFilterMemberRole) return false;

    // Filtro por búsqueda de texto
    if (activeFilterMemberSearch) {
      const q = activeFilterMemberSearch;
      const matchName = (m.name || "").toLowerCase().includes(q);
      const matchNotes = (m.notes || "").toLowerCase().includes(q);
      const matchRole = (m.role || "").toLowerCase().includes(q);
      const matchSecRole = (m.secondaryRole || "").toLowerCase().includes(q);
      if (!matchName && !matchNotes && !matchRole && !matchSecRole) return false;
    }

    return true;
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px 10px;">
          No se encontraron miembros con los filtros seleccionados.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(m => {
    const tr = document.createElement("tr");

    const strikesCount = (m.strikes || []).length;
    const dot1Class = strikesCount >= 1 ? "active-1" : "";
    const dot2Class = strikesCount >= 2 ? "active-2" : "";
    const dot3Class = strikesCount >= 3 ? "active-3" : "";

    const rankLower = (m.rank || "miembro").toLowerCase();
    const statusLower = (m.status || "active").toLowerCase();
    const statusLabel = m.status === "ACTIVE" ? "Activo" : (m.status === "LEAVE" ? "Permiso" : "Inactivo");

    tr.innerHTML = `
      <td>
        <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(m.name)}</div>
        ${m.secondaryRole ? `<div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(m.secondaryRole)}</div>` : ''}
      </td>
      <td>
        <span class="rank-badge rank-${rankLower}">${escapeHtml(m.rank || 'Miembro')}</span>
      </td>
      <td>
        <span class="combat-role-tag">${escapeHtml(m.role || 'DPS Melee')}</span>
      </td>
      <td>
        <span class="status-pill ${statusLower}">${statusLabel}</span>
      </td>
      <td>
        <div class="strikes-container" title="Gestionar amonestaciones de ${escapeHtml(m.name)}">
          <span class="strike-dot ${dot1Class}"></span>
          <span class="strike-dot ${dot2Class}"></span>
          <span class="strike-dot ${dot3Class}"></span>
          <span style="font-size: 11px; font-weight: 600; color: ${strikesCount > 0 ? 'var(--text-gold)' : 'var(--text-muted)'}; margin-left: 4px;">
            ${strikesCount}/3
          </span>
        </div>
      </td>
      <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted); font-size: 12px;" title="${escapeHtml(m.notes || '')}">
        ${m.notes ? escapeHtml(m.notes) : '<span style="opacity: 0.4;">—</span>'}
      </td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 4px;">
          <button type="button" class="btn btn-outline btn-sm btn-edit-member" title="Editar miembro">Editar</button>
          <button type="button" class="btn btn-secondary btn-sm btn-toggle-status" title="Cambiar estado">${m.status === 'ACTIVE' ? 'Inactivar' : 'Activar'}</button>
          <button type="button" class="btn btn-danger btn-sm btn-delete-member" title="Eliminar miembro">&times;</button>
        </div>
      </td>
    `;

    // Abrir Strikes
    tr.querySelector(".strikes-container")?.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      openStrikesModal(m.id);
    });

    // Editar
    tr.querySelector(".btn-edit-member")?.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      openMemberModal(m);
    });

    // Toggle estado activo/inactivo
    tr.querySelector(".btn-toggle-status")?.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      const members = getMembers();
      const target = members.find(item => item.id === m.id);
      if (target) {
        target.status = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        target.updatedAt = Date.now();
        saveMembersToStorage(members);
        saveMemberToCloud(target);
        renderMembersTable();
        showToast(`Estado de ${target.name} cambiado a ${target.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}.`);
      }
    });

    // Eliminar
    tr.querySelector(".btn-delete-member")?.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      if (confirm(`¿Eliminar al miembro "${m.name}" del roster?`)) {
        const remaining = getMembers().filter(item => item.id !== m.id);
        saveMembersToStorage(remaining);
        deleteMemberFromCloud(m.id);
        renderMembersTable();
        showToast(`Miembro "${m.name}" eliminado.`);
      }
    });

    tbody.appendChild(tr);
  });
}

// ==========================================================================
// Módulo: Gestor de Asistencias (Eventos & CTAs) - Exclusivo Oficiales
// ==========================================================================

function setupAttendanceEvents() {
  const btnCreateAct = document.getElementById("btn-open-create-activity");
  const btnCloseModal = document.getElementById("btn-close-activity-modal");
  const btnCancelModal = document.getElementById("btn-cancel-activity-modal");
  const formActivity = document.getElementById("form-activity");

  const btnCloseDiscord = document.getElementById("btn-close-discord-modal");
  const btnCancelDiscord = document.getElementById("btn-cancel-discord-modal");
  const btnProcessDiscord = document.getElementById("btn-process-discord-attendance");

  if (btnCreateAct) {
    btnCreateAct.addEventListener("click", () => {
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }
      openActivityModal();
    });
  }

  if (btnCloseModal) btnCloseModal.addEventListener("click", closeActivityModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeActivityModal);

  if (formActivity) {
    formActivity.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!isOfficer()) {
        openOfficerLoginModal();
        return;
      }

      const titleInput = document.getElementById("activity-title-input");
      const typeSelect = document.getElementById("activity-type-select");
      const callerInput = document.getElementById("activity-caller-input");
      const notesInput = document.getElementById("activity-notes-input");

      const title = (titleInput?.value || "").trim();
      if (!title) {
        alert("Introduce el nombre del evento.");
        return;
      }

      const activities = getActivities();
      let act = null;

      if (window._editingActivityId) {
        act = activities.find(a => a.id === window._editingActivityId);
        if (act) {
          act.title = title;
          act.type = typeSelect?.value || "zvz_cta";
          act.caller = (callerInput?.value || "").trim();
          act.notes = (notesInput?.value || "").trim();
          act.updatedAt = Date.now();
        }
      } else {
        act = {
          id: "act_" + Date.now(),
          title,
          type: typeSelect?.value || "zvz_cta",
          date: new Date().toISOString().slice(0, 16),
          caller: (callerInput?.value || "").trim(),
          notes: (notesInput?.value || "").trim(),
          attendance: {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        activities.unshift(act);
      }

      saveActivitiesToStorage(activities);
      if (act) {
        saveActivityToCloud(act);
        activeActivityId = act.id;
      }

      closeActivityModal();
      renderActivitiesList();
      renderActiveActivityAttendance();
      showToast(window._editingActivityId ? "Actividad actualizada." : "Nueva actividad registrada.");
    });
  }

  if (btnCloseDiscord) btnCloseDiscord.addEventListener("click", closeDiscordAttendanceModal);
  if (btnCancelDiscord) btnCancelDiscord.addEventListener("click", closeDiscordAttendanceModal);
  if (btnProcessDiscord) {
    btnProcessDiscord.addEventListener("click", () => {
      processDiscordAttendance();
    });
  }
}

function openActivityModal(activity = null) {
  window._editingActivityId = activity ? activity.id : null;
  const modal = document.getElementById("modal-activity-form");
  const modalTitle = document.getElementById("modal-activity-title");

  const titleInput = document.getElementById("activity-title-input");
  const typeSelect = document.getElementById("activity-type-select");
  const callerInput = document.getElementById("activity-caller-input");
  const notesInput = document.getElementById("activity-notes-input");

  if (modalTitle) modalTitle.textContent = activity ? "Modificar Actividad" : "Nueva Actividad / Evento";

  if (titleInput) titleInput.value = activity ? activity.title : "";
  if (typeSelect) typeSelect.value = activity ? activity.type : "zvz_cta";
  if (callerInput) callerInput.value = activity ? (activity.caller || "") : "";
  if (notesInput) notesInput.value = activity ? (activity.notes || "") : "";

  if (modal) modal.style.display = "flex";
  setTimeout(() => titleInput?.focus(), 100);
}

function closeActivityModal() {
  const modal = document.getElementById("modal-activity-form");
  if (modal) modal.style.display = "none";
  window._editingActivityId = null;
}

function openDiscordAttendanceModal() {
  const modal = document.getElementById("modal-discord-attendance");
  const textarea = document.getElementById("discord-attendance-textarea");
  const summary = document.getElementById("discord-parsed-summary");

  if (textarea) textarea.value = "";
  if (summary) summary.textContent = "";

  if (modal) modal.style.display = "flex";
  setTimeout(() => textarea?.focus(), 100);
}

function closeDiscordAttendanceModal() {
  const modal = document.getElementById("modal-discord-attendance");
  if (modal) modal.style.display = "none";
}

function processDiscordAttendance() {
  if (!activeActivityId) {
    alert("No hay una actividad seleccionada.");
    return;
  }

  const textarea = document.getElementById("discord-attendance-textarea");
  const rawText = (textarea?.value || "").trim();
  if (!rawText) {
    alert("Pega la lista de nicks de Discord.");
    return;
  }

  // Separar por saltos de línea, comas, tabuladores o punto y coma
  const rawNames = rawText.split(/[\r\n,;\t]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
  if (rawNames.length === 0) {
    alert("No se detectaron nombres válidos en el texto.");
    return;
  }

  const activities = getActivities();
  const act = activities.find(a => a.id === activeActivityId);
  if (!act) return;

  if (!act.attendance) act.attendance = {};

  const members = getMembers();
  let matchedCount = 0;

  members.forEach(m => {
    const mName = (m.name || "").trim().toLowerCase();
    // Búsqueda exacta o coincidencia contenida
    const matched = rawNames.some(pasted => {
      return pasted === mName || pasted.includes(mName) || mName.includes(pasted);
    });

    if (matched) {
      act.attendance[m.id] = "present";
      matchedCount++;
    }
  });

  act.updatedAt = Date.now();
  saveActivitiesToStorage(activities);
  saveActivityToCloud(act);

  closeDiscordAttendanceModal();
  renderActiveActivityAttendance();
  showToast(`¡${matchedCount} miembros marcados como presentes desde Discord!`);
}

function getActivityTypeLabel(type) {
  switch (type) {
    case "zvz_cta": return "CTA ZvZ";
    case "zvz_casual": return "ZvZ Casual";
    case "roaming": return "Roaming / Gank";
    case "avalonian": return "Mazmorra Ava";
    case "pve": return "PvE & Fama";
    default: return "Evento";
  }
}

function renderActivitiesList() {
  const listEl = document.getElementById("activities-nav-list");
  const countEl = document.getElementById("activities-count");
  if (!listEl) return;

  const activities = getActivities();
  if (countEl) countEl.textContent = `${activities.length} registradas`;

  listEl.innerHTML = "";

  if (activities.length === 0) {
    listEl.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); padding: 12px; text-align: center;">No hay actividades registradas aún.</div>`;
    renderActiveActivityAttendance();
    return;
  }

  if (!activeActivityId || !activities.some(a => a.id === activeActivityId)) {
    activeActivityId = activities[0].id;
  }

  activities.forEach(act => {
    const card = document.createElement("div");
    card.className = `activity-card-item ${act.id === activeActivityId ? 'active' : ''}`;

    const dateFormatted = act.date ? new Date(act.date).toLocaleString("es-ES", {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    }) : 'Fecha no especificada';

    const presentCount = Object.values(act.attendance || {}).filter(v => v === "present").length;

    card.innerHTML = `
      <div class="activity-item-title">${escapeHtml(act.title)}</div>
      <div class="activity-item-meta">
        <span>${dateFormatted}</span>
        <span style="color: var(--text-gold); font-weight: 600;">${getActivityTypeLabel(act.type)}</span>
      </div>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
        Asistentes: <strong style="color: #3fb950;">${presentCount}</strong>
      </div>
    `;

    card.addEventListener("click", () => {
      activeActivityId = act.id;
      renderActivitiesList();
      renderActiveActivityAttendance();
    });

    listEl.appendChild(card);
  });
}

function renderActiveActivityAttendance() {
  const panel = document.getElementById("attendance-active-panel");
  if (!panel) return;

  const activities = getActivities();
  const act = activities.find(a => a.id === activeActivityId);

  if (!act) {
    panel.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <h3 style="color: var(--text-main); margin-bottom: 8px;">No hay actividad seleccionada</h3>
        <p style="font-size: 13px;">Crea una nueva actividad o selecciona una existente de la lista lateral para tomar lista de asistencia.</p>
      </div>
    `;
    return;
  }

  if (!act.attendance) act.attendance = {};

  const allMembers = getMembers();
  const activeMembers = allMembers.filter(m => m.status === "ACTIVE");

  let presentCount = 0;
  let absentCount = 0;
  let excusedCount = 0;
  let lateCount = 0;

  activeMembers.forEach(m => {
    const st = act.attendance[m.id];
    if (st === "present") presentCount++;
    else if (st === "absent") absentCount++;
    else if (st === "excused") excusedCount++;
    else if (st === "late") lateCount++;
  });

  const dateFormatted = act.date ? new Date(act.date).toLocaleString("es-ES", {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Fecha no especificada';

  panel.innerHTML = `
    <div class="attendance-event-header">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="alliance-tag" style="background: rgba(229, 169, 59, 0.15); color: var(--text-gold); border-color: rgba(229, 169, 59, 0.3);">
              ${getActivityTypeLabel(act.type)}
            </span>
            <span style="font-size: 12px; color: var(--text-muted);">${dateFormatted}</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">${escapeHtml(act.title)}</h2>
          <div style="font-size: 12px; color: var(--text-muted);">
            Caller / Líder: <strong style="color: var(--text-main);">${escapeHtml(act.caller || 'Sin asignar')}</strong>
            ${act.notes ? ` • <span>${escapeHtml(act.notes)}</span>` : ''}
          </div>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-open-discord-paste">
            Pegado Rápido (Discord)
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-edit-current-act">
            Editar
          </button>
          <button type="button" class="btn btn-danger btn-sm" id="btn-delete-current-act">
            Eliminar
          </button>
        </div>
      </div>

      <!-- Resumen de Asistencia -->
      <div class="attendance-summary-stats">
        <div class="stat-box">
          Presentes: <span class="stat-number" style="color: #3fb950;">${presentCount}</span>
        </div>
        <div class="stat-box">
          Ausentes: <span class="stat-number" style="color: #f85149;">${absentCount}</span>
        </div>
        <div class="stat-box">
          Justificados: <span class="stat-number" style="color: #d29922;">${excusedCount}</span>
        </div>
        <div class="stat-box">
          Tarde: <span class="stat-number" style="color: #58a6ff;">${lateCount}</span>
        </div>
        <div class="stat-box">
          Roster Activo: <span class="stat-number">${activeMembers.length}</span>
        </div>
      </div>
    </div>

    <!-- Lista de Miembros para Marcar Asistencia -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="font-size: 14px; font-weight: 700; color: var(--text-gold); text-transform: uppercase; letter-spacing: 0.5px;">
        Lista de Asistencia del Roster
      </h3>
      <span style="font-size: 11px; color: var(--text-muted);">
        Haz clic en cada botón para alternar el estado del miembro
      </span>
    </div>

    <div class="attendance-roster-list" id="attendance-roster-rows">
      <!-- Renglones de miembros -->
    </div>
  `;

  // Asignar botones de cabecera
  panel.querySelector("#btn-open-discord-paste")?.addEventListener("click", () => {
    if (!isOfficer()) {
      openOfficerLoginModal();
      return;
    }
    openDiscordAttendanceModal();
  });

  panel.querySelector("#btn-edit-current-act")?.addEventListener("click", () => {
    if (!isOfficer()) {
      openOfficerLoginModal();
      return;
    }
    openActivityModal(act);
  });

  panel.querySelector("#btn-delete-current-act")?.addEventListener("click", () => {
    if (!isOfficer()) {
      openOfficerLoginModal();
      return;
    }
    if (confirm(`¿Eliminar la actividad "${act.title}"?`)) {
      const remaining = getActivities().filter(a => a.id !== act.id);
      saveActivitiesToStorage(remaining);
      deleteActivityFromCloud(act.id);
      activeActivityId = remaining.length > 0 ? remaining[0].id : null;
      renderActivitiesList();
      renderActiveActivityAttendance();
      showToast("Actividad eliminada.");
    }
  });

  // Renderizar filas de miembros
  const rowsContainer = panel.querySelector("#attendance-roster-rows");
  if (!rowsContainer) return;

  if (activeMembers.length === 0) {
    rowsContainer.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); padding: 12px; text-align: center;">No hay miembros activos registrados en el gremio.</div>`;
    return;
  }

  activeMembers.forEach(m => {
    const currentStatus = act.attendance[m.id] || "";
    const row = document.createElement("div");
    row.className = "attendance-row-item";

    const rankLower = (m.rank || 'miembro').toLowerCase();

    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="rank-badge rank-${rankLower}" style="font-size: 10px; padding: 2px 6px;">${escapeHtml(m.rank)}</span>
        <div>
          <span style="font-weight: 700; color: var(--text-main); font-size: 13px;">${escapeHtml(m.name)}</span>
          <span class="combat-role-tag" style="margin-left: 6px; font-size: 10px;">${escapeHtml(m.role)}</span>
        </div>
      </div>

      <div class="attendance-status-btns">
        <button type="button" class="att-btn ${currentStatus === 'present' ? 'active-present' : ''}" data-status="present">Presente</button>
        <button type="button" class="att-btn ${currentStatus === 'absent' ? 'active-absent' : ''}" data-status="absent">Ausente</button>
        <button type="button" class="att-btn ${currentStatus === 'excused' ? 'active-excused' : ''}" data-status="excused">Justificado</button>
        <button type="button" class="att-btn ${currentStatus === 'late' ? 'active-late' : ''}" data-status="late">Tarde</button>
      </div>
    `;

    // Manejar clics de estado
    row.querySelectorAll(".att-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!isOfficer()) {
          openOfficerLoginModal();
          return;
        }

        const clickedStatus = btn.getAttribute("data-status");
        // Toggle si ya está seleccionado
        const newStatus = act.attendance[m.id] === clickedStatus ? null : clickedStatus;

        if (newStatus) {
          act.attendance[m.id] = newStatus;
        } else {
          delete act.attendance[m.id];
        }

        act.updatedAt = Date.now();
        saveActivitiesToStorage(activities);
        saveActivityToCloud(act);

        renderActiveActivityAttendance();
        renderActivitiesList();
      });
    });

    rowsContainer.appendChild(row);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
