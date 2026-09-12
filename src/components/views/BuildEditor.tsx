"use client";

import React, { useState, useMemo } from "react";
import { getItemImageUrl, ALBION_ITEMS, type AlbionItemLike } from "@/lib/items";
import { getItemSpells, ALBION_SPELLS } from "@/lib/spells.js";
import type { TacticalBuild } from "@/lib/firebase-sync";
import { X, Search, Plus } from "lucide-react";

interface BuildEditorProps {
  initialBuild?: TacticalBuild | null;
  activities: string[];
  onSave: (build: TacticalBuild) => void;
  onCancel: () => void;
  onAddActivity?: (activityName: string) => void;
}

// Roles tácticos ordenados estrictamente
const ROLES_TACTICOS = [
  "CLAPPER",
  "HEALER",
  "STOPER",
  "DPS",
  "PIERCE",
  "SUPPORT",
];

export function BuildEditor({
  initialBuild,
  activities,
  onSave,
  onCancel,
  onAddActivity,
}: BuildEditorProps) {
  // Estado de la build que se está editando
  const [formData, setFormData] = useState<TacticalBuild>(() => {
    if (initialBuild) {
      const tierVal = Number(initialBuild.tierEquiv || initialBuild.equipamiento?.tierEquiv || 8);
      return {
        ...initialBuild,
        tierEquiv: tierVal,
        equipamiento: {
          ...initialBuild.equipamiento,
          tierEquiv: tierVal,
        },
        spells: {
          mainhand: initialBuild.spells?.mainhand || [],
          head: initialBuild.spells?.head || [],
          armor: initialBuild.spells?.armor || [],
          shoes: initialBuild.spells?.shoes || [],
        },
      };
    }
    return {
      id: `furia_custom_${Date.now()}`,
      nombre: "NUEVA BUILD TÁCTICA",
      rol: "DPS",
      actividad: activities.find((a) => a !== "TODAS") || "ZVZ (50v50)",
      armaPrincipalId: "2H_AXE_AVALON",
      armaPrincipalNombre: "Hacha Romperreinos",
      armaSecundariaId: null,
      armaSecundariaNombre: null,
      esDosManos: true,
      equipamiento: {
        cabeza: "HEAD_CLOTH_SET2",
        pecho: "ARMOR_LEATHER_HELL",
        zapatos: "SHOES_CLOTH_SET1",
        capa: "CAPEITEM_FW_FORTSTERLING",
        armaPrincipal: "2H_AXE_AVALON",
        armaSecundaria: null,
        pocion: "POTION_REVIVE",
        comida: "MEAL_STEW",
        montura: "MOUNT_ARMORED_HORSE",
        tierEquiv: 8,
      },
      spells: {
        mainhand: ["CLEAVE", "SWORD_SPIN", "MIGHTYBLOW", "PASSIVE_BLEEDCHANCE"],
        head: ["DEFENSERUN", "PASSIVE_BLEEDCHANCE"],
        armor: ["PARRY", "PASSIVE_BLEEDCHANCE"],
        shoes: ["INTERRUPT2", "PASSIVE_BLEEDCHANCE"],
      },
      notas: "",
    };
  });

  // Modal de Selección de Ítem y Filtros
  const [itemSelectModal, setItemSelectModal] = useState<{
    slotKey: string;
    slotType: string;
    label: string;
  } | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [subFilter, setSubFilter] = useState<string>("TODAS");

  // Modal de Selección de Habilidad (Simplificado)
  const [spellSelectModal, setSpellSelectModal] = useState<{
    itemBaseId: string;
    itemSlotName: "mainhand" | "head" | "armor" | "shoes";
    spellSlotType: string;
    spellIndex: number;
    label: string;
  } | null>(null);

  // Modal para Añadir Nueva Actividad
  const [newActivityModalOpen, setNewActivityModalOpen] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");

  // Categorías de armas extraídas dinámicamente de ALBION_ITEMS
  const weaponCategories = useMemo(() => {
    const cats = new Set<string>();
    ALBION_ITEMS.forEach((it) => {
      if (it.slot === "mainhand" && it.category) {
        cats.add(it.category);
      }
    });
    return ["TODAS", ...Array.from(cats)];
  }, []);

  // Helper estricto de renderizado de imagen según reglas
  const getRenderUrl = (itemId?: string | null, slotType?: string) => {
    if (!itemId) return "";
    const isConsumableOrMount =
      ["food", "potion", "mount"].includes((slotType || "").toLowerCase()) ||
      itemId.includes("POTION") ||
      itemId.includes("MEAL") ||
      itemId.includes("MOUNT");

    // Armas, armaduras, cascos, botas y capas: Tier 8, Calidad 4 (Sobresaliente)
    // Comidas, pociones y monturas: Tier 8, Enchant 0, Calidad 1
    return getItemImageUrl(
      itemId,
      "T8",
      0,
      isConsumableOrMount ? 1 : 4
    );
  };

  // Helper para URL de icono de hechizo (propiedad icon en spells.js)
  const getSpellIcon = (spellId?: string) => {
    if (!spellId) return "";
    if (spellId.startsWith("http://") || spellId.startsWith("https://")) {
      return spellId;
    }
    const spell = ALBION_SPELLS?.[spellId];
    if (spell?.icon) return spell.icon;
    return `https://render.albiononline.com/v1/spell/${spellId}.png`;
  };

  // Filtrar ítems de ALBION_ITEMS para el slot activo con filtros dinámicos y limpieza de monturas
  const filteredItemsForModal = useMemo(() => {
    if (!itemSelectModal) return [];
    const targetSlot = itemSelectModal.slotType.toLowerCase();
    const query = itemSearchQuery.trim().toLowerCase();

    return ALBION_ITEMS.filter((item) => {
      const matchSlot = (item.slot || "").toLowerCase() === targetSlot;
      if (!matchSlot) return false;

      // Directiva 4: Limpieza de Monturas
      // Excluir tiers bajos (T2 al T7) únicamente de los animales genéricos: _HORSE, _OX, y _ARMORED_HORSE
      if (targetSlot === "mount") {
        const isGenericLowTier = /^(T[2-7])_MOUNT_(HORSE|OX|ARMORED_HORSE)$/.test(item.id);
        if (isGenericLowTier) {
          return false;
        }
      }

      // Directiva 3: Filtros Dinámicos en el Selector de Ítems
      // Si el slot es Cabeza, Pecho o Botas: TODAS | PLACAS | CUERO | TELA
      if (["head", "armor", "shoes"].includes(targetSlot)) {
        if (subFilter !== "TODAS") {
          const cat = (item.category || "").toLowerCase();
          if (subFilter === "PLACAS" && !cat.includes("placa")) return false;
          if (subFilter === "CUERO" && !cat.includes("cuero")) return false;
          if (subFilter === "TELA" && !cat.includes("tela")) return false;
        }
      }

      // Si el slot es Arma Principal: Filtro por categoría de arma
      if (targetSlot === "mainhand") {
        if (subFilter !== "TODAS") {
          if (item.category !== subFilter) return false;
        }
      }

      if (!query) return true;
      return (
        (item.name || "").toLowerCase().includes(query) ||
        (item.id || "").toLowerCase().includes(query)
      );
    });
  }, [itemSelectModal, itemSearchQuery, subFilter]);

  // Selección de ítem desde el modal
  const handleSelectItem = (item: AlbionItemLike) => {
    if (!itemSelectModal) return;
    const { slotKey } = itemSelectModal;

    const newEquip = { ...formData.equipamiento };
    let newIsDosManos = formData.esDosManos;
    let newMainhandId = formData.armaPrincipalId;
    let newMainhandNombre = formData.armaPrincipalNombre;
    let newOffhandId = formData.armaSecundariaId;
    let newOffhandNombre = formData.armaSecundariaNombre;
    const newSpells = { ...formData.spells };

    if (slotKey === "armaPrincipal") {
      newMainhandId = item.id;
      newMainhandNombre = item.name;
      newEquip.armaPrincipal = item.id;
      newIsDosManos = Boolean(item.twoHanded);
      if (item.twoHanded) {
        newOffhandId = null;
        newOffhandNombre = null;
        newEquip.armaSecundaria = null;
      }
      // Cargar habilidades por defecto del arma
      const qSpells = getItemSpells(item.id, "q");
      const wSpells = getItemSpells(item.id, "w");
      const eSpells = getItemSpells(item.id, "e");
      const pSpells = getItemSpells(item.id, "passive");
      newSpells.mainhand = [
        qSpells[0]?.id || "CLEAVE",
        wSpells[0]?.id || "SWORD_SPIN",
        eSpells[0]?.id || "MIGHTYBLOW",
        pSpells[0]?.id || "PASSIVE_BLEEDCHANCE",
      ];
    } else if (slotKey === "armaSecundaria") {
      newOffhandId = item.id;
      newOffhandNombre = item.name;
      newEquip.armaSecundaria = item.id;
      newIsDosManos = false;
    } else if (slotKey === "cabeza") {
      newEquip.cabeza = item.id;
      const act = getItemSpells(item.id, "active");
      const pas = getItemSpells(item.id, "passive");
      newSpells.head = [act[0]?.id || "DEFENSERUN", pas[0]?.id || "PASSIVE_BLEEDCHANCE"];
    } else if (slotKey === "pecho") {
      newEquip.pecho = item.id;
      const act = getItemSpells(item.id, "active");
      const pas = getItemSpells(item.id, "passive");
      newSpells.armor = [act[0]?.id || "PARRY", pas[0]?.id || "PASSIVE_BLEEDCHANCE"];
    } else if (slotKey === "zapatos") {
      newEquip.zapatos = item.id;
      const act = getItemSpells(item.id, "active");
      const pas = getItemSpells(item.id, "passive");
      newSpells.shoes = [act[0]?.id || "INTERRUPT2", pas[0]?.id || "PASSIVE_BLEEDCHANCE"];
    } else {
      newEquip[slotKey] = item.id;
    }

    setFormData({
      ...formData,
      armaPrincipalId: newMainhandId,
      armaPrincipalNombre: newMainhandNombre,
      armaSecundariaId: newOffhandId,
      armaSecundariaNombre: newOffhandNombre,
      esDosManos: newIsDosManos,
      equipamiento: newEquip,
      spells: newSpells,
    });

    setItemSelectModal(null);
    setItemSearchQuery("");
  };

  // Obtener hechizos disponibles para el slot de hechizo seleccionado
  const availableSpellsForModal = useMemo(() => {
    if (!spellSelectModal) return [];
    const { itemBaseId, spellSlotType } = spellSelectModal;
    return getItemSpells(itemBaseId, spellSlotType);
  }, [spellSelectModal]);

  // Selección de habilidad
  const handleSelectSpell = (spell: any) => {
    if (!spellSelectModal) return;
    const { itemSlotName, spellIndex } = spellSelectModal;
    const currentList = [...(formData.spells?.[itemSlotName] || [])];
    currentList[spellIndex] = spell.id;

    setFormData({
      ...formData,
      spells: {
        ...formData.spells,
        [itemSlotName]: currentList,
      },
    });

    setSpellSelectModal(null);
  };

  // Añadir nueva actividad
  const handleCreateActivity = () => {
    const name = newActivityName.trim();
    if (!name) return;
    if (onAddActivity) onAddActivity(name);
    setFormData({ ...formData, actividad: name });
    setNewActivityName("");
    setNewActivityModalOpen(false);
  };

  // Configuración de los 9 huecos de equipamiento
  const eq = formData.equipamiento || {};
  const isTwoHanded = Boolean(formData.esDosManos);

  const EQUIP_SLOTS = [
    {
      slotKey: "cabeza",
      slotType: "head",
      label: "Casco",
      itemId: eq.cabeza,
      spellsSlot: "head" as const,
      spellTypes: ["active", "passive"],
      spellLabels: ["D", "P"],
    },
    {
      slotKey: "capa",
      slotType: "cape",
      label: "Capa",
      itemId: eq.capa,
      spellsSlot: null,
    },
    {
      slotKey: "montura",
      slotType: "mount",
      label: "Montura",
      itemId: eq.montura || "MOUNT_ARMORED_HORSE",
      spellsSlot: null,
    },
    {
      slotKey: "armaPrincipal",
      slotType: "mainhand",
      label: "Arma Principal",
      itemId: formData.armaPrincipalId || eq.armaPrincipal,
      spellsSlot: "mainhand" as const,
      spellTypes: ["q", "w", "e", "passive"],
      spellLabels: ["Q", "W", "E", "P"],
    },
    {
      slotKey: "pecho",
      slotType: "armor",
      label: "Pecho",
      itemId: eq.pecho,
      spellsSlot: "armor" as const,
      spellTypes: ["active", "passive"],
      spellLabels: ["R", "P"],
    },
    {
      slotKey: "armaSecundaria",
      slotType: "offhand",
      label: "Mano Secundaria",
      itemId: isTwoHanded
        ? formData.armaPrincipalId || eq.armaPrincipal
        : formData.armaSecundariaId || eq.armaSecundaria,
      isGhosted: isTwoHanded,
      spellsSlot: null,
    },
    {
      slotKey: "zapatos",
      slotType: "shoes",
      label: "Botas",
      itemId: eq.zapatos,
      spellsSlot: "shoes" as const,
      spellTypes: ["active", "passive"],
      spellLabels: ["F", "P"],
    },
    {
      slotKey: "pocion",
      slotType: "potion",
      label: "Poción",
      itemId: eq.pocion,
      spellsSlot: null,
    },
    {
      slotKey: "comida",
      slotType: "food",
      label: "Comida",
      itemId: eq.comida,
      spellsSlot: null,
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-dragon-bg select-none">
      {/* Barra Superior del Editor */}
      <div className="flex items-center justify-between border-b border-dragon-border bg-dragon-bg px-6 py-3 shrink-0">
        <span className="font-mono text-xs text-dragon-ember font-bold tracking-widest uppercase">
          {initialBuild ? "// EDITAR BUILD TÁCTICA" : "// NUEVA BUILD TÁCTICA"}
        </span>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase tracking-wider"
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-4 py-1.5 bg-dragon-ember hover:bg-orange-500 text-black font-bold transition-colors uppercase tracking-wider"
          >
            GUARDAR
          </button>
        </div>
      </div>

      {/* Split a Dos Columnas */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA: Cuadrícula de Equipamiento (9 huecos grandes) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">
            EQUIPAMIENTO Y HECHIZOS
          </div>

          {/* Grid de 3x3 para los 9 huecos (con espacio vertical amplio para hechizos agrandados) */}
          <div className="grid grid-cols-3 gap-y-12 sm:gap-y-14 gap-x-6 sm:gap-x-8 p-6 bg-[#09090b] border border-dragon-border rounded-sm max-w-2xl">
            {EQUIP_SLOTS.map((slot) => {
              const currentImageUrl = getRenderUrl(slot.itemId, slot.slotType);
              const equippedSpells = slot.spellsSlot
                ? formData.spells?.[slot.spellsSlot] || []
                : [];

              return (
                <div key={slot.slotKey} className="relative flex flex-col items-center">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase mb-1 tracking-wider">
                    {slot.label}
                  </span>

                  {/* Botón Grande del Hueco (w-28 h-28 sm:w-32 sm:h-32) */}
                  <button
                    type="button"
                    disabled={slot.isGhosted}
                    onClick={() => {
                      setItemSearchQuery("");
                      setSubFilter("TODAS");
                      setItemSelectModal({
                        slotKey: slot.slotKey,
                        slotType: slot.slotType,
                        label: slot.label,
                      });
                    }}
                    className={`relative w-28 h-28 sm:w-32 sm:h-32 bg-dragon-panel border border-dragon-border rounded-sm flex items-center justify-center p-1 transition-all ${slot.isGhosted
                      ? "cursor-not-allowed opacity-50"
                      : "hover:border-dragon-ember hover:bg-zinc-900"
                      }`}
                  >
                    {slot.itemId ? (
                      <img
                        src={currentImageUrl}
                        alt={slot.label}
                        className={`w-full h-full object-contain p-1 ${slot.isGhosted ? "opacity-30 grayscale" : ""
                          }`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-600 gap-1">
                        <Plus className="h-6 w-6" />
                        <span className="font-mono text-[9px] uppercase">
                          EQUIPAR
                        </span>
                      </div>
                    )}

                    {/* Ranuras de Hechizos sobrepuestas mordiendo el borde inferior (-bottom-6 sm:-bottom-7, w-10 h-10 sm:w-12 sm:h-12) */}
                    {slot.spellsSlot && slot.itemId && !slot.isGhosted && (
                      <div className="absolute -bottom-6 sm:-bottom-7 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-20">
                        {slot.spellTypes.map((sType, idx) => {
                          const spellId = equippedSpells[idx];
                          const iconUrl = getSpellIcon(spellId);
                          const labelChar = slot.spellLabels[idx];

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSpellSelectModal({
                                  itemBaseId: slot.itemId!,
                                  itemSlotName: slot.spellsSlot!,
                                  spellSlotType: sType,
                                  spellIndex: idx,
                                  label: `${slot.label} - Slot ${labelChar}`,
                                });
                              }}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-zinc-700 bg-zinc-950 overflow-hidden flex items-center justify-center relative hover:border-dragon-ember hover:scale-110 transition-transform shrink-0 shadow-xl cursor-pointer"
                              title={`Cambiar hechizo (${labelChar})`}
                            >
                              {iconUrl ? (
                                <img
                                  src={iconUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[9px] font-mono text-zinc-500 font-bold">
                                  {labelChar}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {slot.isGhosted && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-zinc-500 uppercase tracking-wider bg-zinc-950/80 px-1 border border-zinc-800">
                        2 MANOS
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: Configuración Táctica */}
        <div className="lg:col-span-5 flex flex-col space-y-4 font-mono text-xs">
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest border-b border-dragon-border pb-2">
            CONFIGURACIÓN TÁCTICA DE LA BUILD
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">
              NOMBRE DE LA BUILD:
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 font-mono text-sm p-2 focus:border-dragon-ember outline-none"
              placeholder="Nombre de la build (ej. Bruiser - Romperreinos)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 uppercase mb-1">
                ROL:
              </label>
              <select
                value={formData.rol || "DPS"}
                onChange={(e) =>
                  setFormData({ ...formData, rol: e.target.value })
                }
                className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 font-mono text-xs p-2 focus:border-dragon-ember outline-none"
              >
                {ROLES_TACTICOS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 uppercase mb-1">
                TIER EQUIVALENTE:
              </label>
              <select
                value={formData.tierEquiv || formData.equipamiento?.tierEquiv || 8}
                onChange={(e) => {
                  const newTier = Number(e.target.value);
                  setFormData({
                    ...formData,
                    tierEquiv: newTier,
                    equipamiento: {
                      ...formData.equipamiento,
                      tierEquiv: newTier,
                    },
                  });
                }}
                className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 font-mono text-xs p-2 focus:border-dragon-ember outline-none"
              >
                {[4, 5, 6, 7, 8].map((t) => (
                  <option key={t} value={t}>
                    Tier {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Actividad con botón táctico [+] al lado */}
          <div>
            <label className="block text-zinc-400 uppercase mb-1">
              ACTIVIDAD / CONTENIDO:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={formData.actividad}
                onChange={(e) =>
                  setFormData({ ...formData, actividad: e.target.value })
                }
                className="flex-1 bg-dragon-panel border border-dragon-border text-zinc-200 font-mono text-xs p-2 focus:border-dragon-ember outline-none"
              >
                {activities
                  .filter((a) => a !== "TODAS")
                  .map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
              </select>

              <button
                type="button"
                onClick={() => setNewActivityModalOpen(true)}
                className="h-8 w-8 shrink-0 bg-dragon-panel border border-dragon-border text-dragon-ember hover:border-dragon-ember hover:bg-zinc-800 flex items-center justify-center font-bold"
                title="Añadir nueva actividad"
              >
                +
              </button>
            </div>
          </div>

          {/* Toggle de Dos Manos */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editorDosManos"
              checked={Boolean(formData.esDosManos)}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData({
                  ...formData,
                  esDosManos: checked,
                  armaSecundariaId: checked ? null : "OFF_BOOK",
                  equipamiento: {
                    ...formData.equipamiento,
                    armaSecundaria: checked ? null : "OFF_BOOK",
                  },
                });
              }}
              className="h-4 w-4 bg-dragon-panel border-dragon-border text-dragon-crimson rounded-none focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="editorDosManos"
              className="text-zinc-400 uppercase tracking-wider text-[11px] cursor-pointer"
            >
              Arma a Dos Manos
            </label>
          </div>

          {/* Textarea de Notas Tácticas */}
          <div className="pt-2 flex-1 flex flex-col">
            <label className="block text-zinc-400 uppercase mb-1">
              NOTAS:
            </label>
            <textarea
              value={formData.notas || ""}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              placeholder="Directivas y notas de la build: posicionamiento, combos de habilidades, requisitos de IP..."
              className="w-full flex-1 min-h-[140px] bg-dragon-panel border border-dragon-border text-zinc-200 font-mono text-xs p-3 focus:border-dragon-ember outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL DE SELECCIÓN DE ÍTEMS (CON FILTROS Y BOTONES GRANDES)  */}
      {/* ============================================================ */}
      {itemSelectModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dragon-bg border border-dragon-border w-full max-w-4xl max-h-[85vh] flex flex-col select-none shadow-2xl">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-dragon-border px-6 py-3.5 shrink-0">
              <span className="font-mono text-xs text-dragon-ember font-bold uppercase tracking-wider">
                SELECCIÓN DE ÍTEM: {itemSelectModal.label}
              </span>
              <button
                type="button"
                onClick={() => setItemSelectModal(null)}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Barra de Filtros Dinámicos */}
            {["head", "armor", "shoes"].includes(
              itemSelectModal.slotType.toLowerCase()
            ) && (
                <div className="flex items-center gap-1.5 border-b border-dragon-border px-6 py-2.5 bg-zinc-950/60 overflow-x-auto">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase mr-2 tracking-wider shrink-0">
                    TIPO:
                  </span>
                  {["TODAS", "PLACAS", "CUERO", "TELA"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSubFilter(cat)}
                      className={`font-mono text-xs px-3 py-1 uppercase tracking-wider transition-colors duration-150 shrink-0 ${subFilter === cat
                        ? "border-b-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                        : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

            {itemSelectModal.slotType.toLowerCase() === "mainhand" && (
              <div className="border-b border-dragon-border px-6 py-3 bg-zinc-950/70">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    CATEGORÍAS DE ARMAS ({weaponCategories.length - 1} TIPOS):
                  </span>
                  <select
                    value={subFilter}
                    onChange={(e) => setSubFilter(e.target.value)}
                    className="bg-dragon-panel border border-dragon-border text-zinc-200 font-mono text-xs px-2 py-1 focus:border-dragon-ember outline-none"
                  >
                    {weaponCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "TODAS" ? "TODAS LAS CATEGORÍAS" : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {weaponCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSubFilter(cat)}
                      className={`font-mono text-xs px-2.5 py-1 uppercase tracking-wider transition-colors duration-150 rounded-none ${subFilter === cat
                        ? "border-b-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel"
                        : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Barra de Búsqueda */}
            <div className="p-4 border-b border-dragon-border bg-zinc-950/60 flex items-center gap-2">
              <Search className="h-4 w-4 text-zinc-500 shrink-0" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Buscar objeto por nombre o identificación en Albion..."
                className="w-full bg-transparent font-mono text-xs text-zinc-200 focus:outline-none placeholder-zinc-600"
                autoFocus
              />
              {itemSearchQuery && (
                <button
                  type="button"
                  onClick={() => setItemSearchQuery("")}
                  className="text-xs font-mono text-zinc-500 hover:text-white"
                >
                  LIMPIAR
                </button>
              )}
            </div>

            {/* Grid de Ítems (Botones grandes con icono w-20 h-20 sm:w-24 sm:h-24 centrado) */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItemsForModal.length === 0 ? (
                <div className="col-span-full py-16 text-center font-mono text-xs text-zinc-600">
                  &gt; NO SE ENCONTRARON ÍTEMS COINCIDENTES PARA ESTE HUECO O FILTRO
                </div>
              ) : (
                filteredItemsForModal.map((item) => {
                  const imgUrl = getRenderUrl(item.id, item.slot);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="group flex flex-col items-center justify-between p-3 bg-dragon-panel border border-dragon-border rounded-sm hover:border-dragon-ember hover:bg-zinc-900 transition-all text-center min-h-[140px]"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center p-1 mb-1">
                        <img
                          src={imgUrl}
                          alt={item.name}
                          className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
                          loading="lazy"
                        />
                      </div>
                      <span className="font-mono text-[11px] text-zinc-300 group-hover:text-dragon-ember font-medium line-clamp-2 leading-tight">
                        {item.name}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE SELECCIÓN DE HABILIDAD (SIMPLIFICADO Y ULTRA LIMPIO) */}
      {/* ============================================================ */}
      {spellSelectModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dragon-bg border border-dragon-border w-full max-w-md max-h-[80vh] flex flex-col select-none shadow-2xl">
            <div className="flex items-center justify-between border-b border-dragon-border px-6 py-3.5 shrink-0">
              <span className="font-mono text-xs text-dragon-ember font-bold uppercase tracking-wider">
                // {spellSelectModal.label}
              </span>
              <button
                type="button"
                onClick={() => setSpellSelectModal(null)}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lista Vertical Extremadamente Limpia (Solo Icono w-10 h-10 y Nombre font-display) */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-dragon-border/40">
              {availableSpellsForModal.length === 0 ? (
                <div className="py-8 text-center font-mono text-xs text-zinc-600">
                  &gt; NO SE ENCONTRARON HABILIDADES DISPONIBLES EN spells.js
                </div>
              ) : (
                availableSpellsForModal.map((spell: any) => (
                  <button
                    key={spell.id}
                    type="button"
                    onClick={() => handleSelectSpell(spell)}
                    className="w-full flex items-center gap-4 p-3 text-left hover:bg-dragon-panel transition-colors rounded-sm group"
                  >
                    <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center group-hover:border-dragon-ember">
                      <img
                        src={spell.icon}
                        alt={spell.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-display text-lg font-bold tracking-wide text-zinc-200 group-hover:text-dragon-ember uppercase truncate">
                      {spell.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA AÑADIR NUEVA ACTIVIDAD                            */}
      {/* ============================================================ */}
      {newActivityModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dragon-bg border border-dragon-border w-96 p-6 select-none shadow-2xl">
            <h3 className="font-display text-base font-bold tracking-wider text-zinc-100 uppercase mb-2">
              NUEVA ACTIVIDAD / CONTENIDO
            </h3>
            <p className="font-mono text-[11px] text-zinc-500 mb-4">
              Escribe el nombre de la nueva categoría para organizar las builds:
            </p>

            <input
              type="text"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              placeholder="Nombre de la nueva sección de contenido (ej. Ganking Avaloniano)"
              className="w-full bg-dragon-panel border border-dragon-border px-3 py-2 text-sm font-mono text-zinc-200 focus:border-dragon-ember focus:outline-none mb-6"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateActivity();
              }}
            />

            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setNewActivityName("");
                  setNewActivityModalOpen(false);
                }}
                className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase tracking-wider"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleCreateActivity}
                className="px-3 py-1.5 bg-dragon-ember hover:bg-orange-500 text-black font-bold transition-colors uppercase tracking-wider"
              >
                CREAR ACTIVIDAD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
