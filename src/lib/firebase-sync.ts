// src/lib/firebase-sync.ts
// Sincronización en la nube con Firestore para Builds, Roster y Contenidos de Furia de Dragones
// Incluye esquema canónico con FirestoreDataConverter tipados

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import { db } from "./firebase";

export interface TacticalBuild {
  id: string;
  nombre: string;
  rol?: string;
  actividad?: string;
  tierEquiv?: number;
  armaPrincipalId?: string;
  armaPrincipalNombre?: string;
  armaSecundariaId?: string | null;
  armaSecundariaNombre?: string | null;
  esDosManos?: boolean;
  equipamiento: Record<string, any>;
  spells?: Record<string, any>;
  notas?: string;
  updatedAt?: string;
}

export interface RosterMember {
  id: string;
  nombre: string;
  ign: string;
  status: "Nuevo" | "Miembro" | "Miembro Oficial" | "Veterano" | "Sindicato" | "Lider";
  roles: string[];
  estadoActividad: "Activo" | "Inactivo" | "Ausente";
  avisos: number;
  notas?: string;
  updatedAt?: string;
}

export interface GuildContent {
  id: string;
  nombre: string;
  organizador: string;
  fechaHora: string;
  asistentes: string[];
  notas?: string;
  updatedAt?: string;
}

// ============================================================================
// CONVERTERS TIPADOS PARA FIRESTORE (ESQUEMA CANÓNICO)
// ============================================================================

export const tacticalBuildConverter: FirestoreDataConverter<TacticalBuild> = {
  toFirestore(build: TacticalBuild) {
    const tierVal = Number(build.tierEquiv || build.equipamiento?.tierEquiv || 8);
    return {
      nombre: build.nombre,
      rol: build.rol || "DPS",
      actividad: build.actividad || "ZVZ",
      tierEquiv: tierVal,
      armaPrincipalId: build.armaPrincipalId || "2H_AXE_AVALON",
      armaPrincipalNombre: build.armaPrincipalNombre || "Arma Principal",
      armaSecundariaId: build.armaSecundariaId || null,
      armaSecundariaNombre: build.armaSecundariaNombre || null,
      esDosManos: build.esDosManos ?? (!build.armaSecundariaId),
      equipamiento: {
        ...build.equipamiento,
        tierEquiv: tierVal,
      },
      spells: build.spells || {},
      notas: build.notas || "",
      updatedAt: build.updatedAt || new Date().toISOString(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): TacticalBuild {
    const data = snapshot.data(options);
    const eq = data.equipamiento || data.equipment || {};
    const tierVal = Number(data.tierEquiv || eq.tierEquiv || data.tier || eq.tier || 8);
    const mainhandId =
      data.armaPrincipalId || eq.mainhand?.id || eq.mainhand || eq.armaPrincipal || "2H_AXE_AVALON";
    const offhandId =
      data.armaSecundariaId !== undefined
        ? data.armaSecundariaId
        : eq.offhand?.id || eq.offhand || eq.armaSecundaria || null;

    return {
      id: snapshot.id,
      nombre: data.nombre || data.name || "TACTICAL_BUILD",
      rol: String(data.rol || data.role || "DPS").toUpperCase(),
      actividad: data.actividad || data.folder || "ZVZ",
      tierEquiv: tierVal,
      armaPrincipalId: mainhandId,
      armaPrincipalNombre: data.armaPrincipalNombre || data.armaPrincipal || "Arma Principal",
      armaSecundariaId: offhandId,
      armaSecundariaNombre: data.armaSecundariaNombre || data.armaSecundaria || null,
      esDosManos: data.esDosManos ?? (!offhandId),
      equipamiento: {
        ...eq,
        bolsa: eq.bolsa || eq.bag?.id || eq.bag || "BAG",
        cabeza: eq.cabeza || eq.head?.id || eq.head || "HEAD_CLOTH_SET2",
        pecho: eq.pecho || eq.armor?.id || eq.armor || "ARMOR_LEATHER_HELL",
        zapatos: eq.zapatos || eq.shoes?.id || eq.shoes || "SHOES_CLOTH_SET1",
        capa: eq.capa || eq.cape?.id || eq.cape || "CAPEITEM_FW_FORTSTERLING",
        armaPrincipal: mainhandId,
        armaSecundaria: offhandId,
        pocion: eq.pocion || eq.potion?.id || eq.potion || "POTION_REVIVE",
        comida: eq.comida || eq.food?.id || eq.food || "MEAL_STEW",
        montura: eq.montura || eq.mount?.id || eq.mount || "MOUNT_ARMORED_HORSE",
        tierEquiv: tierVal,
      },
      spells: data.spells || {
        mainhand: ["RENDINGSPIN", "AXEBOOST", "LETHAL_CLEAVER", "PASSIVE_BLEEDCHANCE"],
        head: ["ICEBLOCK2", "PASSIVE_INCREASED_DAMAGE"],
        armor: ["LIFESTEALAURA", "PASSIVE_ARMOR_BALANCE"],
        shoes: ["CHANNELED_RUN", "PASSIVE_INCREASED_DAMAGE"],
      },
      notas: data.notas || data.notes || "",
      updatedAt: data.updatedAt,
    };
  },
};

export const rosterMemberConverter: FirestoreDataConverter<RosterMember> = {
  toFirestore(member: RosterMember) {
    return {
      nombre: member.nombre,
      ign: member.ign,
      status: member.status,
      roles: member.roles,
      estadoActividad: member.estadoActividad,
      avisos: member.avisos,
      notas: member.notas || "",
      updatedAt: member.updatedAt || new Date().toISOString(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): RosterMember {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      nombre: data.nombre || data.ign || "Miembro",
      ign: data.ign || data.nombre || "",
      status: data.status || "Nuevo",
      roles: Array.isArray(data.roles) ? data.roles : ["DPS"],
      estadoActividad: data.estadoActividad || "Activo",
      avisos: typeof data.avisos === "number" ? data.avisos : 0,
      notas: data.notas || "",
      updatedAt: data.updatedAt,
    };
  },
};

export const guildContentConverter: FirestoreDataConverter<GuildContent> = {
  toFirestore(content: GuildContent) {
    return {
      nombre: content.nombre,
      organizador: content.organizador,
      fechaHora: content.fechaHora,
      asistentes: content.asistentes,
      notas: content.notas || "",
      updatedAt: content.updatedAt || new Date().toISOString(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): GuildContent {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      nombre: data.nombre || "CONTENIDO_OFICIAL",
      organizador: data.organizador || "Sindicato",
      fechaHora: data.fechaHora || new Date().toISOString(),
      asistentes: Array.isArray(data.asistentes) ? data.asistentes : [],
      notas: data.notas || "",
      updatedAt: data.updatedAt,
    };
  },
};

// ============================================================================
// BUILDS CRUD
// ============================================================================

export async function getTacticalBuilds(): Promise<TacticalBuild[]> {
  try {
    const buildsCol = collection(db, "builds").withConverter(tacticalBuildConverter);
    const querySnapshot = await getDocs(buildsCol);
    if (querySnapshot.empty) {
      return [];
    }
    return querySnapshot.docs.map((docSnap) => docSnap.data());
  } catch (error) {
    console.warn("[FirebaseSync] Error fetching builds from Firestore:", error);
    return [];
  }
}

export async function saveTacticalBuild(build: TacticalBuild): Promise<boolean> {
  try {
    const buildRef = doc(db, "builds", build.id).withConverter(tacticalBuildConverter);
    await setDoc(
      buildRef,
      {
        ...build,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error saving build to Firestore:", error);
    return false;
  }
}

export async function deleteTacticalBuild(buildId: string): Promise<boolean> {
  try {
    const buildRef = doc(db, "builds", buildId);
    await deleteDoc(buildRef);
    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error deleting build from Firestore:", error);
    return false;
  }
}

// ============================================================================
// ACTIVIDADES / CONTENIDOS DE LA IZQUIERDA (Persistencia Real y Permanente)
// ============================================================================

export async function getActivities(): Promise<string[]> {
  try {
    // 1. Consultar documento central de configuración de actividades
    const configRef = doc(db, "config", "activities");
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      const data = configSnap.data();
      const rawList: string[] = data.list || [];
      const cleanList = rawList.filter((a) => a && a.toUpperCase() !== "TODAS");
      return ["TODAS", ...cleanList];
    }

    // 2. Si no hay documento en config, verificar si hay colección individual
    const colSnap = await getDocs(collection(db, "activities"));
    if (!colSnap.empty) {
      const list: string[] = ["TODAS"];
      colSnap.forEach((d) => {
        const name = d.data().name || d.data().nombre;
        if (name && name.toUpperCase() !== "TODAS" && !list.includes(name)) {
          list.push(name);
        }
      });
      return list;
    }

    // Cero datos falsos: solo la opción global
    return ["TODAS"];
  } catch (error) {
    console.warn("[FirebaseSync] Error fetching activities:", error);
    return ["TODAS"];
  }
}

export async function saveActivity(name: string): Promise<boolean> {
  try {
    const cleanName = name.trim();
    if (!cleanName || cleanName.toUpperCase() === "TODAS") return false;

    // Obtener actividades existentes
    const currentActivities = await getActivities();
    const updatedList = Array.from(
      new Set([...currentActivities.filter((a) => a !== "TODAS"), cleanName])
    );

    // Guardar en documento central como única fuente de verdad
    const configRef = doc(db, "config", "activities");
    await setDoc(
      configRef,
      {
        list: updatedList,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error saving activity:", error);
    return false;
  }
}

export async function deleteActivity(name: string): Promise<boolean> {
  try {
    const cleanName = name.trim();
    const currentActivities = await getActivities();
    const updatedList = currentActivities.filter(
      (a) => a !== "TODAS" && a.toLowerCase() !== cleanName.toLowerCase()
    );

    // Actualizar documento central
    const configRef = doc(db, "config", "activities");
    await setDoc(
      configRef,
      {
        list: updatedList,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error deleting activity:", error);
    return false;
  }
}

// ============================================================================
// ROSTER CRUD
// ============================================================================

export async function getRosterMembers(): Promise<RosterMember[]> {
  try {
    const rosterCol = collection(db, "roster").withConverter(rosterMemberConverter);
    const docSnap = await getDocs(rosterCol);
    if (docSnap.empty) {
      return [];
    }
    return docSnap.docs.map((d) => d.data());
  } catch (error) {
    console.warn("[FirebaseSync] Error fetching roster from Firestore:", error);
    return [];
  }
}

export async function saveRosterMember(member: RosterMember): Promise<boolean> {
  try {
    const memberRef = doc(db, "roster", member.id).withConverter(rosterMemberConverter);
    await setDoc(
      memberRef,
      {
        ...member,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error saving roster member:", error);
    return false;
  }
}

export async function deleteRosterMember(memberId: string): Promise<boolean> {
  try {
    const memberRef = doc(db, "roster", memberId);
    await deleteDoc(memberRef);
    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error deleting roster member:", error);
    return false;
  }
}

export async function bulkSaveRosterMembers(newMembers: RosterMember[]): Promise<boolean> {
  try {
    if (!newMembers || newMembers.length === 0) return true;
    const promises = newMembers.map((m) => {
      const memberRef = doc(db, "roster", m.id).withConverter(rosterMemberConverter);
      return setDoc(
        memberRef,
        {
          ...m,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error bulk saving roster members:", error);
    return false;
  }
}

// ============================================================================
// GUILD CONTENTS CRUD
// ============================================================================

export async function getGuildContents(): Promise<GuildContent[]> {
  try {
    const contentsCol = collection(db, "contents").withConverter(guildContentConverter);
    const docSnap = await getDocs(contentsCol);
    if (docSnap.empty) {
      return [];
    }
    return docSnap.docs.map((d) => d.data());
  } catch (error) {
    console.warn("[FirebaseSync] Error fetching contents from Firestore:", error);
    return [];
  }
}

export async function saveGuildContent(content: GuildContent): Promise<boolean> {
  try {
    const contentRef = doc(db, "contents", content.id).withConverter(guildContentConverter);
    await setDoc(
      contentRef,
      {
        ...content,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error saving guild content:", error);
    return false;
  }
}

export async function deleteGuildContent(contentId: string): Promise<boolean> {
  try {
    const contentRef = doc(db, "contents", contentId);
    await deleteDoc(contentRef);
    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error deleting guild content:", error);
    return false;
  }
}
