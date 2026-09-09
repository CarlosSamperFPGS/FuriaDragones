// src/lib/firebase-sync.ts
// Sincronización en la nube con Firestore para Builds y Actividades de Furia de Dragones

import { collection, getDocs, doc, setDoc, onSnapshot } from "firebase/firestore";
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

export const DEFAULT_ACTIVITIES = [
  "TODAS",
  "ZVZ (50v50)",
  "ROAMING (GANK)",
  "PVE / DUNGEONS",
  "AVALONIAN RAIDS",
  "HELLGATES (5v5)",
];

// Builds tácticas predeterminadas con IDs verificados de la API de Albion Online
export const FALLBACK_BUILDS: TacticalBuild[] = [
  {
    id: "furia_zvz_clapper_01",
    nombre: "CLAPPER - Romperreinos",
    rol: "CLAPPER",
    actividad: "ZVZ (50v50)",
    armaPrincipalId: "2H_AXE_AVALON",
    armaPrincipalNombre: "Hacha Romperreinos",
    armaSecundariaId: null,
    armaSecundariaNombre: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "BAG",
      cabeza: "HEAD_CLOTH_SET2",
      pecho: "ARMOR_LEATHER_HELL",
      zapatos: "SHOES_CLOTH_SET1",
      capa: "CAPEITEM_FW_FORTSTERLING",
      armaPrincipal: "2H_AXE_AVALON",
      armaSecundaria: null,
      pocion: "POTION_REVIVE",
      comida: "MEAL_STEW",
    },
    spells: {
      mainhand: ["RENDINGSPIN", "AXEBOOST", "LETHAL_CLEAVER", "PASSIVE_BLEEDCHANCE"],
      head: ["ICEBLOCK2", "PASSIVE_INCREASED_DAMAGE"],
      armor: ["LIFESTEALAURA", "PASSIVE_ARMOR_BALANCE"],
      shoes: ["CHANNELED_RUN", "PASSIVE_INCREASED_DAMAGE"],
    },
    notas: "Enganche coordinado tras llamada de caller. Activar Chaqueta de Vándalo antes de impactar la E.",
  },
  {
    id: "furia_zvz_healer_01",
    nombre: "HEALER - Caída Sagrada",
    rol: "HEALER",
    actividad: "ZVZ (50v50)",
    armaPrincipalId: "MAIN_HOLYSTAFF_AVALON",
    armaPrincipalNombre: "Bastón de Caída Sagrada",
    armaSecundariaId: "OFF_BOOK",
    armaSecundariaNombre: "Tomo de Hechizos",
    esDosManos: false,
    equipamiento: {
      bolsa: "BAG",
      cabeza: "HEAD_CLOTH_SET1",
      pecho: "ARMOR_CLOTH_SET2",
      zapatos: "SHOES_CLOTH_SET2",
      capa: "CAPEITEM_FW_LYMHURST",
      armaPrincipal: "MAIN_HOLYSTAFF_AVALON",
      armaSecundaria: "OFF_BOOK",
      pocion: "POTION_ENERGY",
      comida: "MEAL_OMELETTE",
    },
    spells: {
      mainhand: ["HOLY_FLASH", "HOLY_BEAM", "HOLY_HEAVENLYFALL", "PASSIVE_ENERGY_REGEN"],
      head: ["FORCEFIELD", "PASSIVE_INCREASED_HEALING"],
      armor: ["ENERGYSHIELD", "PASSIVE_ARMOR_MAGIC"],
      shoes: ["RUN", "PASSIVE_INCREASED_SPEED"],
    },
    notas: "Priorizar rescate de tanques principales y mantener distancia de las líneas de contra-engage.",
  },
  {
    id: "furia_zvz_stoper_01",
    nombre: "STOPER - Maza Pesada",
    rol: "STOPER",
    actividad: "ZVZ (50v50)",
    armaPrincipalId: "2H_MACE",
    armaPrincipalNombre: "Maza Pesada",
    armaSecundariaId: null,
    armaSecundariaNombre: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "BAG",
      cabeza: "HEAD_PLATE_SET2",
      pecho: "ARMOR_PLATE_SET3",
      zapatos: "SHOES_LEATHER_SET2",
      capa: "CAPEITEM_FW_MARTLOCK",
      armaPrincipal: "2H_MACE",
      armaSecundaria: null,
      pocion: "POTION_STONESKIN",
      comida: "MEAL_OMELETTE",
    },
    spells: {
      mainhand: ["DEFENSIVESLAM", "GROUNDSHAKER", "SHRIEKMACE", "PASSIVE_STUNCHANCE"],
      head: ["DISRUPTIONIMMUNITY", "PASSIVE_MR_AR"],
      armor: ["TAUNT", "PASSIVE_ARMOR_MR_AR"],
      shoes: ["OVERSPRINT", "PASSIVE_MAXLOAD_SHOES"],
    },
    notas: "Purgar y silenciar contra-ataques enemigos en chokes estrechos.",
  },
  {
    id: "furia_zvz_dps_01",
    nombre: "DPS - Creador de Niebla",
    rol: "DPS",
    actividad: "ZVZ (50v50)",
    armaPrincipalId: "2H_CURSEDSTAFF_MORGANA",
    armaPrincipalNombre: "Llamador de Sombras",
    armaSecundariaId: null,
    armaSecundariaNombre: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "BAG",
      cabeza: "HEAD_LEATHER_SET1",
      pecho: "ARMOR_CLOTH_SET3",
      zapatos: "SHOES_CLOTH_SET1",
      capa: "CAPEITEM_FW_CAERLEON",
      armaPrincipal: "2H_CURSEDSTAFF_MORGANA",
      armaSecundaria: null,
      pocion: "POTION_COOLDOWN",
      comida: "MEAL_STEW",
    },
    spells: {
      mainhand: ["SICKLE", "CURSED_ARMOR", "SHADOW_CALL", "PASSIVE_DAMAGE_INCREASE"],
      head: ["MEDITATION", "PASSIVE_INCREASED_DAMAGE"],
      armor: ["MAGIC_CIRCLE", "PASSIVE_ARMOR_BALANCE"],
      shoes: ["CHANNELED_RUN", "PASSIVE_INCREASED_DAMAGE"],
    },
    notas: "Descarga continua de burst en formaciones enemigas agrupadas.",
  },
  {
    id: "furia_zvz_pierce_01",
    nombre: "PIERCE - Espada Sombría",
    rol: "PIERCE",
    actividad: "ZVZ (50v50)",
    armaPrincipalId: "2H_CLEAVER_HELL",
    armaPrincipalNombre: "Espada Tallada",
    armaSecundariaId: null,
    armaSecundariaNombre: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "BAG",
      cabeza: "HEAD_LEATHER_ROYAL",
      pecho: "ARMOR_CLOTH_ROYAL",
      zapatos: "SHOES_CLOTH_SET2",
      capa: "CAPEITEM_FW_MORGANA",
      armaPrincipal: "2H_CLEAVER_HELL",
      armaSecundaria: null,
      pocion: "POTION_SLOW",
      comida: "MEAL_OMELETTE",
    },
    spells: {
      mainhand: ["CLEAVE", "SPLITTINGSLASH", "FEAR_SLASH", "PASSIVE_BLEEDCHANCE"],
      head: ["ENERGY_AURA", "PASSIVE_INCREASED_DAMAGE"],
      armor: ["MAGIC_CIRCLE", "PASSIVE_ARMOR_BALANCE"],
      shoes: ["RUN", "PASSIVE_INCREASED_SPEED"],
    },
    notas: "Aplicar perforación de defensas 1 segundo antes de la caída del clapper principal.",
  },
  {
    id: "furia_zvz_support_01",
    nombre: "SUPPORT - Locus Arcano",
    rol: "SUPPORT",
    actividad: "ZVZ (50v50)",
    armaPrincipalId: "2H_ENIGMATICORB_MORGANA",
    armaPrincipalNombre: "Locus Maléfico",
    armaSecundariaId: null,
    armaSecundariaNombre: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "BAG",
      cabeza: "HEAD_PLATE_SET1",
      pecho: "ARMOR_PLATE_SET1",
      zapatos: "SHOES_LEATHER_SET1",
      capa: "CAPEITEM_FW_MARTLOCK",
      armaPrincipal: "2H_ENIGMATICORB_MORGANA",
      armaSecundaria: null,
      pocion: "POTION_STONESKIN",
      comida: "MEAL_OMELETTE",
    },
    spells: {
      mainhand: ["ARCANE_ORB", "ENERGY_BEAM", "TIME_VOID", "PASSIVE_ENERGY_REGEN"],
      head: ["WINDWALL", "PASSIVE_MR_AR"],
      armor: ["ENFEEBLE_AURA", "PASSIVE_ARMOR_MR_AR"],
      shoes: ["DODGE", "PASSIVE_MAXLOAD_SHOES"],
    },
    notas: "Limpieza masiva de CC y purga de auras enemigas en el choke central.",
  },
];

export async function getTacticalBuilds(): Promise<TacticalBuild[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "builds"));
    if (querySnapshot.empty) {
      return FALLBACK_BUILDS;
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

    return builds.length > 0 ? builds : FALLBACK_BUILDS;
  } catch (error) {
    console.warn("[FirebaseSync] Using fallback builds:", error);
    return FALLBACK_BUILDS;
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

