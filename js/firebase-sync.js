// Furia de Dragones - Módulo de Sincronización en la Nube (Firebase Firestore)
// Proporciona persistencia en tiempo real para builds y carpetas compartidas por el gremio

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración oficial de Firebase del proyecto "furiadragones"
export const firebaseConfig = {
  apiKey: "AIzaSyDPy1LG-tdaH_8H-aQsnz4oT8l8nj-ilDE",
  authDomain: "furiadragones.firebaseapp.com",
  projectId: "furiadragones",
  storageBucket: "furiadragones.firebasestorage.app",
  messagingSenderId: "1046356818741",
  appId: "1:1046356818741:web:70bf459c700624ccac6a7c",
  measurementId: "G-NF18P320W9"
};

let app = null;
let db = null;
let isFirestoreReady = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirestoreReady = true;
  console.log("[Firebase] Inicializado correctamente en proyecto: furiadragones");
} catch (err) {
  console.error("[Firebase] Error en la inicialización:", err);
}

/**
 * Sanitiza un objeto eliminando valores 'undefined' incompatibles con Firestore.
 */
function sanitizeForFirestore(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result;
}

/**
 * Inicializa la escucha en tiempo real de Builds y Carpetas.
 * Si la base de datos está vacía, la inicializa con los valores por defecto automáticamente.
 */
export function initCloudSync({
  onBuildsUpdated,
  onFoldersUpdated,
  onStatusChanged,
  defaultBuilds = [],
  defaultFolders = []
}) {
  if (!isFirestoreReady || !db) {
    if (onStatusChanged) onStatusChanged("offline");
    return;
  }

  if (onStatusChanged) onStatusChanged("syncing");

  let initialBuildsLoaded = false;
  let initialFoldersLoaded = false;

  const checkInitialDone = () => {
    if (initialBuildsLoaded && initialFoldersLoaded && onStatusChanged) {
      onStatusChanged("online");
    }
  };

  // 1. Escuchar la colección "builds" en tiempo real
  try {
    const buildsCol = collection(db, "builds");
    onSnapshot(
      buildsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          if (onBuildsUpdated) {
            onBuildsUpdated([]);
          }
        } else {
          const builds = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            builds.push({
              id: docSnap.id,
              ...data
            });
          });

          // Ordenar builds: primero por updatedAt / createdAt descendente o índice
          builds.sort((a, b) => {
            const timeA = a.updatedAt || a.createdAt || (typeof a.orderIndex === "number" ? 1000 - a.orderIndex : 0);
            const timeB = b.updatedAt || b.createdAt || (typeof b.orderIndex === "number" ? 1000 - b.orderIndex : 0);
            return timeB - timeA;
          });

          if (onBuildsUpdated) {
            onBuildsUpdated(builds);
          }
        }

        initialBuildsLoaded = true;
        checkInitialDone();
      },
      (error) => {
        console.error("[Firebase] Error en onSnapshot(builds):", error);
        if (onStatusChanged) onStatusChanged("error");
      }
    );
  } catch (err) {
    console.error("[Firebase] Excepción al configurar listener de builds:", err);
  }

  // 2. Escuchar el documento de configuración de carpetas "config/folders"
  try {
    const foldersDocRef = doc(db, "config", "folders");
    onSnapshot(
      foldersDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.list) && data.list.length > 0) {
            if (onFoldersUpdated) {
              onFoldersUpdated(data.list);
            }
          }
        } else {
          console.log("[Firebase] Configuración de carpetas no existe. Guardando carpetas por defecto...");
          if (defaultFolders.length > 0) {
            try {
              await setDoc(foldersDocRef, {
                list: defaultFolders,
                updatedAt: Date.now()
              });
              if (onFoldersUpdated) {
                onFoldersUpdated(defaultFolders);
              }
            } catch (err) {
              console.warn("[Firebase] Error al sembrar carpetas iniciales:", err);
            }
          }
        }

        initialFoldersLoaded = true;
        checkInitialDone();
      },
      (error) => {
        console.error("[Firebase] Error en onSnapshot(config/folders):", error);
        if (onStatusChanged) onStatusChanged("error");
      }
    );
  } catch (err) {
    console.error("[Firebase] Excepción al configurar listener de carpetas:", err);
  }
}

/**
 * Guarda o actualiza una build en Firestore.
 */
export async function saveBuildToCloud(build) {
  if (!isFirestoreReady || !db || !build || !build.id) return false;
  try {
    const docRef = doc(db, "builds", String(build.id));
    const payload = {
      ...sanitizeForFirestore(build),
      updatedAt: Date.now()
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firebase] Error al guardar build "${build.id}" en la nube:`, err);
    return false;
  }
}

/**
 * Elimina una build de Firestore.
 */
export async function deleteBuildFromCloud(buildId) {
  if (!isFirestoreReady || !db || !buildId) return false;
  try {
    const docRef = doc(db, "builds", String(buildId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`[Firebase] Error al eliminar build "${buildId}" de la nube:`, err);
    return false;
  }
}

/**
 * Guarda la lista de carpetas en Firestore.
 */
export async function saveFoldersToCloud(foldersList) {
  if (!isFirestoreReady || !db || !Array.isArray(foldersList)) return false;
  try {
    const docRef = doc(db, "config", "folders");
    await setDoc(docRef, {
      list: foldersList,
      updatedAt: Date.now()
    });
    return true;
  } catch (err) {
    console.error("[Firebase] Error al guardar carpetas en la nube:", err);
    return false;
  }
}

/**
 * Restaura todas las builds y carpetas por defecto en Firestore.
 */
export async function restoreDefaultsInCloud(defaultBuilds, defaultFolders) {
  if (!isFirestoreReady || !db) return false;
  try {
    // 1. Obtener todas las builds actuales para eliminarlas o actualizarlas
    const snapshot = await getDocs(collection(db, "builds"));
    const batch = writeBatch(db);
    
    snapshot.forEach(d => {
      batch.delete(d.ref);
    });

    // 2. Insertar las builds por defecto
    defaultBuilds.forEach((build, idx) => {
      const docRef = doc(db, "builds", String(build.id));
      batch.set(docRef, {
        ...sanitizeForFirestore(build),
        orderIndex: idx,
        createdAt: Date.now() - (defaultBuilds.length - idx) * 1000,
        updatedAt: Date.now()
      });
    });

    // 3. Restaurar carpetas por defecto
    const foldersRef = doc(db, "config", "folders");
    batch.set(foldersRef, {
      list: defaultFolders,
      updatedAt: Date.now()
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.error("[Firebase] Error al restaurar builds por defecto en la nube:", err);
    return false;
  }
}

/**
 * Inicializa la escucha en tiempo real de los Miembros del Gremio.
 */
export function initMembersSync({ onMembersUpdated }) {
  if (!isFirestoreReady || !db) return;
  try {
    const membersCol = collection(db, "members");
    onSnapshot(
      membersCol,
      (snapshot) => {
        const members = [];
        snapshot.forEach((docSnap) => {
          members.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        // Ordenar alfabéticamente por nombre
        members.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        if (onMembersUpdated) {
          onMembersUpdated(members);
        }
      },
      (error) => {
        console.error("[Firebase] Error en onSnapshot(members):", error);
      }
    );
  } catch (err) {
    console.error("[Firebase] Excepción al configurar listener de miembros:", err);
  }
}

/**
 * Guarda o actualiza un miembro en Firestore.
 */
export async function saveMemberToCloud(member) {
  if (!isFirestoreReady || !db || !member || !member.id) return false;
  try {
    const docRef = doc(db, "members", String(member.id));
    const payload = {
      ...sanitizeForFirestore(member),
      updatedAt: Date.now()
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firebase] Error al guardar miembro "${member.id}" en la nube:`, err);
    return false;
  }
}

/**
 * Elimina un miembro de Firestore.
 */
export async function deleteMemberFromCloud(memberId) {
  if (!isFirestoreReady || !db || !memberId) return false;
  try {
    const docRef = doc(db, "members", String(memberId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`[Firebase] Error al eliminar miembro "${memberId}" de la nube:`, err);
    return false;
  }
}

/**
 * Inicializa la escucha en tiempo real de Actividades y Eventos.
 */
export function initActivitiesSync({ onActivitiesUpdated }) {
  if (!isFirestoreReady || !db) return;
  try {
    const actCol = collection(db, "activities");
    onSnapshot(
      actCol,
      (snapshot) => {
        const activities = [];
        snapshot.forEach((docSnap) => {
          activities.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        // Ordenar por fecha o createdAt descendente
        activities.sort((a, b) => {
          const timeA = a.date ? new Date(a.date).getTime() : (a.createdAt || 0);
          const timeB = b.date ? new Date(b.date).getTime() : (b.createdAt || 0);
          return timeB - timeA;
        });
        if (onActivitiesUpdated) {
          onActivitiesUpdated(activities);
        }
      },
      (error) => {
        console.error("[Firebase] Error en onSnapshot(activities):", error);
      }
    );
  } catch (err) {
    console.error("[Firebase] Excepción al configurar listener de actividades:", err);
  }
}

/**
 * Guarda o actualiza una actividad en Firestore.
 */
export async function saveActivityToCloud(activity) {
  if (!isFirestoreReady || !db || !activity || !activity.id) return false;
  try {
    const docRef = doc(db, "activities", String(activity.id));
    const payload = {
      ...sanitizeForFirestore(activity),
      updatedAt: Date.now()
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firebase] Error al guardar actividad "${activity.id}" en la nube:`, err);
    return false;
  }
}

/**
 * Elimina una actividad de Firestore.
 */
export async function deleteActivityFromCloud(activityId) {
  if (!isFirestoreReady || !db || !activityId) return false;
  try {
    const docRef = doc(db, "activities", String(activityId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`[Firebase] Error al eliminar actividad "${activityId}" de la nube:`, err);
    return false;
  }
}

