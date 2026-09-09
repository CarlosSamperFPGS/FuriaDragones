// src/lib/firebase-sync.ts
// Sincronización en la nube con Firestore para Builds y Actividades de Furia de Dragones

import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export interface TacticalBuild {
  id: string;
  nombre: string;
  rol?: string;
  actividad?: string;
  armaPrincipalId?: string;
  armaPrincipalNombre?: string;
  armaSecundariaId?: string | null;
  armaSecundariaNombre?: string | null;
  esDosManos?: boolean;
  equipamiento: Record<string, any>;
  spells?: Record<string, any>;
  notas?: string;
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

export const DEFAULT_ACTIVITIES = [
  "TODAS",
  "ZVZ (50v50)",
  "ROAMING (GANK)",
  "PVE / DUNGEONS",
  "AVALONIAN RAIDS",
  "HELLGATES (5v5)",
];

export async function getTacticalBuilds(): Promise<TacticalBuild[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "builds"));
    if (querySnapshot.empty) {
      return [];
    }

    const builds: TacticalBuild[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const eq = data.equipamiento || data.equipment || {};
      const mainhandId =
        eq.mainhand?.id || eq.mainhand || eq.armaPrincipal || data.armaPrincipalId || "2H_AXE_AVALON";
      const offhandId =
        eq.offhand?.id || eq.offhand || eq.armaSecundaria || data.armaSecundariaId || null;

      builds.push({
        id: docSnap.id,
        nombre: data.nombre || data.name || "TACTICAL_BUILD",
        rol: (data.rol || data.role || "DPS").toUpperCase(),
        actividad: data.actividad || data.folder || "ZVZ (50v50)",
        armaPrincipalId: mainhandId,
        armaPrincipalNombre: data.armaPrincipal || data.armaPrincipalNombre || "Arma Principal",
        armaSecundariaId: offhandId,
        armaSecundariaNombre: data.armaSecundaria || data.armaSecundariaNombre || null,
        esDosManos: data.esDosManos ?? (!offhandId),
        equipamiento: {
          bolsa: eq.bolsa || eq.bag?.id || eq.bag || "BAG",
          cabeza: eq.cabeza || eq.head?.id || eq.head || "HEAD_CLOTH_SET2",
          pecho: eq.pecho || eq.armor?.id || eq.armor || "ARMOR_LEATHER_HELL",
          zapatos: eq.zapatos || eq.shoes?.id || eq.shoes || "SHOES_CLOTH_SET1",
          capa: eq.capa || eq.cape?.id || eq.cape || "CAPEITEM_FW_FORTSTERLING",
          armaPrincipal: mainhandId,
          armaSecundaria: offhandId,
          pocion: eq.pocion || eq.potion?.id || eq.potion || "POTION_REVIVE",
          comida: eq.comida || eq.food?.id || eq.food || "MEAL_STEW",
        },
        spells: data.spells || {
          mainhand: ["RENDINGSPIN", "AXEBOOST", "LETHAL_CLEAVER", "PASSIVE_BLEEDCHANCE"],
          head: ["ICEBLOCK2", "PASSIVE_INCREASED_DAMAGE"],
          armor: ["LIFESTEALAURA", "PASSIVE_ARMOR_BALANCE"],
          shoes: ["CHANNELED_RUN", "PASSIVE_INCREASED_DAMAGE"],
        },
        notas: data.notas || data.notes || "",
      });
    });

    return builds;
  } catch (error) {
    console.warn("[FirebaseSync] Error fetching builds from Firestore:", error);
    return [];
  }
}

export async function getActivities(): Promise<string[]> {
  try {
    const docSnap = await getDocs(collection(db, "activities"));
    if (docSnap.empty) {
      return DEFAULT_ACTIVITIES;
    }
    const list: string[] = ["TODAS"];
    docSnap.forEach((d) => {
      const name = d.data().name || d.data().nombre;
      if (name && !list.includes(name)) list.push(name);
    });
    return list.length > 1 ? list : DEFAULT_ACTIVITIES;
  } catch (error) {
    return DEFAULT_ACTIVITIES;
  }
}

export async function saveTacticalBuild(build: TacticalBuild): Promise<boolean> {
  try {
    const buildRef = doc(db, "builds", build.id);
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

export async function saveActivity(name: string): Promise<boolean> {
  try {
    const actId = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const actRef = doc(db, "activities", actId);
    await setDoc(
      actRef,
      {
        name,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("[FirebaseSync] Error saving activity to Firestore:", error);
    return false;
  }
}

export async function getRosterMembers(): Promise<RosterMember[]> {
  try {
    const docSnap = await getDocs(collection(db, "roster"));
    if (docSnap.empty) {
      return [];
    }
    const members: RosterMember[] = [];
    docSnap.forEach((d) => {
      members.push({ id: d.id, ...d.data() } as RosterMember);
    });
    return members;
  } catch (error) {
    console.warn("[FirebaseSync] Error fetching roster from Firestore:", error);
    return [];
  }
}

export async function saveRosterMember(member: RosterMember): Promise<boolean> {
  try {
    const memberRef = doc(db, "roster", member.id);
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

export async function getGuildContents(): Promise<GuildContent[]> {
  try {
    const docSnap = await getDocs(collection(db, "contents"));
    if (docSnap.empty) {
      return [];
    }
    const contents: GuildContent[] = [];
    docSnap.forEach((d) => {
      contents.push({ id: d.id, ...d.data() } as GuildContent);
    });
    return contents;
  } catch (error) {
    console.warn("[FirebaseSync] Error fetching contents from Firestore:", error);
    return [];
  }
}

export async function saveGuildContent(content: GuildContent): Promise<boolean> {
  try {
    const contentRef = doc(db, "contents", content.id);
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


