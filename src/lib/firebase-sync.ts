// src/lib/firebase-sync.ts
// Sincronización en la nube con Firestore para Builds y Actividades de Furia de Dragones

import { collection, getDocs, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface TacticalBuild {
  id: string;
  nombre: string;
  rol: "CLAPPER" | "HEALER" | "STOPER" | "DPS" | "PIERCE" | "SUPPORT" | string;
  actividad: "ZVZ" | "ROAMING" | "PVE" | "AVALON" | "HELLGATES" | string;
  armaPrincipal: string;
  armaSecundaria?: string | null;
  equipamiento: {
    bolsa?: string;
    cabeza?: string;
    pecho?: string;
    zapatos?: string;
    capa?: string;
    armaPrincipal?: string;
    armaSecundaria?: string | null;
    pocion?: string;
    comida?: string;
    consumibles?: string;
    [key: string]: any;
  };
  notas?: string;
  esDosManos?: boolean;
}

// Actividades predeterminadas estándar del Gremio
export const DEFAULT_ACTIVITIES = [
  "TODAS",
  "ZVZ (50v50)",
  "ROAMING (GANK)",
  "PVE / DUNGEONS",
  "AVALONIAN RAIDS",
  "HELLGATES (5v5)",
];

// Builds de respaldo en caso de inicialización inicial de base de datos
const FALLBACK_BUILDS: TacticalBuild[] = [
  {
    id: "furia_zvz_clapper_01",
    nombre: "CLAPPER - Romperreinos",
    rol: "CLAPPER",
    actividad: "ZVZ (50v50)",
    armaPrincipal: "Hacha Romperreinos T8",
    armaSecundaria: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "Bolsa T8",
      cabeza: "Hábito de Erudito",
      capa: "Capa de Fort Sterling",
      armaPrincipal: "Romperreinos T8",
      armaSecundaria: null,
      pecho: "Chaqueta de Vándalo",
      pocion: "Poción Veneno Mayor",
      zapatos: "Sandalias Reales",
      comida: "Guiso de Ternera",
    },
    notas: "Enganche coordinado tras llamada de caller. Activar Chaqueta antes de impactar la E.",
  },
  {
    id: "furia_zvz_healer_01",
    nombre: "HEALER - Caída Sagrada",
    rol: "HEALER",
    actividad: "ZVZ (50v50)",
    armaPrincipal: "Bastón de Caída Sagrada T8",
    armaSecundaria: "Ojo de los Secretos",
    esDosManos: false,
    equipamiento: {
      bolsa: "Bolsa T8",
      cabeza: "Capucha de Clérigo",
      capa: "Capa de Lymhurst",
      armaPrincipal: "Caída Sagrada T8",
      armaSecundaria: "Ojo de los Secretos",
      pecho: "Túnica de Clérigo",
      pocion: "Poción de Energía",
      zapatos: "Zapatos de Erudito",
      comida: "Tortilla de Cerdo",
    },
    notas: "Priorizar rescate de tanques principales y mantener distancia de las líneas de flanqueo.",
  },
  {
    id: "furia_zvz_stoper_01",
    nombre: "STOPER - Maza Pesada",
    rol: "STOPER",
    actividad: "ZVZ (50v50)",
    armaPrincipal: "Maza Pesada T8",
    armaSecundaria: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "Bolsa T8",
      cabeza: "Yelmo de Soldado",
      capa: "Capa de Martlock",
      armaPrincipal: "Maza Pesada T8",
      armaSecundaria: null,
      pecho: "Armadura de Guardián",
      pocion: "Poción de Piel de Piedra",
      zapatos: "Botas de Cazador",
      comida: "Tortilla de Cerdo",
    },
    notas: "Purgar y silenciar contra-ataques enemigos. Mantener control de choke.",
  },
  {
    id: "furia_zvz_dps_01",
    nombre: "DPS - Creador de Niebla",
    rol: "DPS",
    actividad: "ZVZ (50v50)",
    armaPrincipal: "Llamador de Niebla T8",
    armaSecundaria: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "Bolsa T8",
      cabeza: "Capucha de Asesino",
      capa: "Capa de Caerleon",
      armaPrincipal: "Llamador de Niebla T8",
      armaSecundaria: null,
      pecho: "Túnica de Mago",
      pocion: "Poción de Resistencia",
      zapatos: "Zapatos Reales",
      comida: "Guiso de Ternera",
    },
    notas: "Descarga de burst en puntos de intercepción concentrados.",
  },
  {
    id: "furia_zvz_pierce_01",
    nombre: "PIERCE - Maldito Sombrío",
    rol: "PIERCE",
    actividad: "ZVZ (50v50)",
    armaPrincipal: "Bastón Maldito Sombrío T8",
    armaSecundaria: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "Bolsa T8",
      cabeza: "Hábito Real",
      capa: "Capa de Morgana",
      armaPrincipal: "Bastón Maldito Sombrío",
      armaSecundaria: null,
      pecho: "Túnica Real",
      pocion: "Poción de Veneno",
      zapatos: "Zapatos de Erudito",
      comida: "Tortilla de Cerdo",
    },
    notas: "Aplicar reducción de resistencias 1 segundo antes de la caída del clapper principal.",
  },
  {
    id: "furia_zvz_support_01",
    nombre: "SUPPORT - Locus Arcano",
    rol: "SUPPORT",
    actividad: "ZVZ (50v50)",
    armaPrincipal: "Locus Maléfico T8",
    armaSecundaria: null,
    esDosManos: true,
    equipamiento: {
      bolsa: "Bolsa T8",
      cabeza: "Yelmo de Caballero",
      capa: "Capa de Martlock",
      armaPrincipal: "Locus Maléfico T8",
      armaSecundaria: null,
      pecho: "Armadura de Justiciero",
      pocion: "Poción de Resistencia",
      zapatos: "Zapatos de Cazador",
      comida: "Tortilla de Cerdo",
    },
    notas: "Limpieza de CC y purga masiva de auras enemigas en el choke principal.",
  },
];

/**
 * Obtiene todas las builds tácticas desde Firestore, con soporte para fallback
 */
export async function getTacticalBuilds(): Promise<TacticalBuild[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "builds"));
    if (querySnapshot.empty) {
      return FALLBACK_BUILDS;
    }

    const builds: TacticalBuild[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      builds.push({
        id: docSnap.id,
        nombre: data.nombre || data.name || "TACTICAL_BUILD",
        rol: (data.rol || data.role || "DPS").toUpperCase(),
        actividad: data.actividad || data.folder || "ZVZ (50v50)",
        armaPrincipal: data.armaPrincipal || data.equipment?.mainhand?.id || data.equipment?.mainhand?.name || "Arma Principal",
        armaSecundaria: data.armaSecundaria || data.equipment?.offhand?.id || data.equipment?.offhand?.name || null,
        esDosManos: data.esDosManos ?? (!data.armaSecundaria && !data.equipment?.offhand),
        equipamiento: {
          bolsa: data.equipamiento?.bolsa || data.equipment?.bag || "Bolsa T8",
          cabeza: data.equipamiento?.cabeza || data.equipment?.head?.id || data.equipment?.head?.name || "Casco",
          pecho: data.equipamiento?.pecho || data.equipment?.armor?.id || data.equipment?.armor?.name || "Pecho",
          zapatos: data.equipamiento?.zapatos || data.equipment?.shoes?.id || data.equipment?.shoes?.name || "Botas",
          capa: data.equipamiento?.capa || data.equipment?.cape?.id || data.equipment?.cape?.name || "Capa",
          armaPrincipal: data.equipamiento?.armaPrincipal || data.equipment?.mainhand?.id || data.armaPrincipal || "Arma",
          armaSecundaria: data.equipamiento?.armaSecundaria || data.equipment?.offhand?.id || null,
          pocion: data.equipamiento?.pocion || data.equipment?.potion?.id || "Poción",
          comida: data.equipamiento?.comida || data.equipment?.food?.id || "Comida",
        },
        notas: data.notas || data.notes || "",
      });
    });

    return builds.length > 0 ? builds : FALLBACK_BUILDS;
  } catch (error) {
    console.warn("[FirebaseSync] Firestore error, using fallback telemetry:", error);
    return FALLBACK_BUILDS;
  }
}

/**
 * Obtiene la lista de actividades configuradas
 */
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

/**
 * Suscripción en tiempo real a builds
 */
export function subscribeTacticalBuilds(
  onUpdate: (builds: TacticalBuild[]) => void,
  onError?: (err: any) => void
) {
  try {
    return onSnapshot(
      collection(db, "builds"),
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(FALLBACK_BUILDS);
          return;
        }
        const builds: TacticalBuild[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          builds.push({
            id: docSnap.id,
            nombre: data.nombre || data.name || "TACTICAL_BUILD",
            rol: (data.rol || data.role || "DPS").toUpperCase(),
            actividad: data.actividad || data.folder || "ZVZ (50v50)",
            armaPrincipal: data.armaPrincipal || data.equipment?.mainhand?.id || "Arma Principal",
            armaSecundaria: data.armaSecundaria || data.equipment?.offhand?.id || null,
            esDosManos: data.esDosManos ?? (!data.armaSecundaria && !data.equipment?.offhand),
            equipamiento: data.equipamiento || data.equipment || {},
            notas: data.notas || data.notes || "",
          });
        });
        onUpdate(builds.length > 0 ? builds : FALLBACK_BUILDS);
      },
      (error) => {
        if (onError) onError(error);
        onUpdate(FALLBACK_BUILDS);
      }
    );
  } catch (err) {
    onUpdate(FALLBACK_BUILDS);
    return () => {};
  }
}
