"use client";

import React, { useState, useEffect } from "react";
import {
  getTacticalBuilds,
  getActivities,
  saveTacticalBuild,
  saveActivity,
  type TacticalBuild,
} from "@/lib/firebase-sync";
import { getItemImageUrl } from "@/lib/items";
import { ALBION_SPELLS } from "@/lib/spells.js";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { BuildEditor } from "./BuildEditor";

interface GremioViewProps {
  onBack?: () => void;
  isSindicatoAuthenticated?: boolean;
}

// Roles tácticos ordenados estrictamente según directiva
const ROLES_TACTICOS = [
  "CLAPPER",
  "HEALER",
  "STOPER",
  "DPS",
  "PIERCE",
  "SUPPORT",
];

export function GremioView({
  onBack,
  isSindicatoAuthenticated = false,
}: GremioViewProps) {
  const [builds, setBuilds] = useState<TacticalBuild[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtros tácticos
  const [selectedActivity, setSelectedActivity] = useState<string>("TODAS");
  const [selectedRole, setSelectedRole] = useState<string>("TODOS");

  // Estado para el Creador / Editor de Builds
  const [showBuildEditor, setShowBuildEditor] = useState<boolean>(false);
  const [editingBuild, setEditingBuild] = useState<TacticalBuild | null>(null);

  // Modales personalizados (PROHIBIDO window.confirm y window.prompt)
  const [deleteModal, setDeleteModal] = useState<{
    type: "build" | "activity";
    id: string;
    name: string;
  } | null>(null);

  const [activityEditModal, setActivityEditModal] = useState<{
    original: string;
    current: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [tacticalBuilds, activitiesList] = await Promise.all([
          getTacticalBuilds(),
          getActivities(),
        ]);
        setBuilds(tacticalBuilds);
        setActivities(activitiesList);
      } catch (error) {
        console.error("[GremioView] Error sincronizando:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopyDiscord = (build: TacticalBuild) => {
    const eq: Record<string, any> = build.equipamiento || {};
    const text = [
      `🛡️ **FURIA DE DRAGONES // TACTICAL BUILD**`,
      `**Build:** ${build.nombre} | **Rol:** ${build.rol || "DPS"} | **Actividad:** ${build.actividad || "ZVZ"}`,
      `⚔️ **Arma Principal:** ${build.armaPrincipalNombre || build.armaPrincipalId || eq.armaPrincipal || "Arma"}`,
      `🧢 **Cabeza:** ${eq.cabeza?.id || eq.cabeza || "N/A"}`,
      `🥋 **Pecho:** ${eq.pecho?.id || eq.pecho || "N/A"}`,
      `👢 **Botas:** ${eq.zapatos?.id || eq.zapatos || "N/A"}`,
      `🧣 **Capa:** ${eq.capa?.id || eq.capa || "N/A"}`,
      `🧪 **Poción:** ${eq.pocion?.id || eq.pocion || "N/A"} | 🍖 **Comida:** ${eq.comida?.id || eq.comida || "N/A"}`,
      build.notas ? `📝 **Notas:** ${build.notas}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(build.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Apertura del Creador / Editor
  const handleOpenNewBuild = () => {
    setEditingBuild(null);
    setShowBuildEditor(true);
  };

  const handleEditBuild = (build: TacticalBuild) => {
    setEditingBuild(build);
    setShowBuildEditor(true);
  };

  // Modales de eliminación y edición
  const confirmDelete = () => {
    if (!deleteModal) return;
    if (deleteModal.type === "build") {
      setBuilds((prev) => prev.filter((b) => b.id !== deleteModal.id));
      if (expandedId === deleteModal.id) setExpandedId(null);
    } else if (deleteModal.type === "activity") {
      setActivities((prev) => prev.filter((item) => item !== deleteModal.id));
      if (selectedActivity === deleteModal.id) setSelectedActivity("TODAS");
    }
    setDeleteModal(null);
  };

  const confirmEditActivity = () => {
    if (!activityEditModal) return;
    const { original, current } = activityEditModal;
    if (current.trim() && current.trim() !== original) {
      setActivities((prev) =>
        prev.map((item) => (item === original ? current.trim() : item))
      );
      if (selectedActivity === original) setSelectedActivity(current.trim());
    }
    setActivityEditModal(null);
  };

  // Filtrado reactivo
  const filteredBuilds = builds.filter((build) => {
    const actUpper = selectedActivity.toUpperCase();
    const buildActUpper = (build.actividad || "").toUpperCase();
    const matchActivity =
      actUpper === "TODAS" ||
      buildActUpper.includes(actUpper.split(" ")[0]) ||
      actUpper.includes(buildActUpper.split(" ")[0]);

    const roleUpper = selectedRole.toUpperCase();
    const buildRoleUpper = (build.rol || "").toUpperCase();
    const matchRole =
      roleUpper === "TODOS" || buildRoleUpper.includes(roleUpper);

    return matchActivity && matchRole;
  });

  // Color técnico por rol
  const getRoleColor = (rol?: string) => {
    const r = (rol || "").toUpperCase();
    if (r.includes("CLAPPER")) return "text-orange-400";
    if (r.includes("HEALER")) return "text-emerald-400";
    if (r.includes("STOPER") || r.includes("TANK")) return "text-blue-400";
    if (r.includes("PIERCE")) return "text-purple-400";
    if (r.includes("SUPPORT")) return "text-yellow-400";
    if (r.includes("DPS")) return "text-red-400";
    return "text-zinc-400";
  };

  // Helper para obtener URL de spell desde ALBION_SPELLS
  const getSpellIconUrl = (spellId?: string) => {
    if (!spellId) return "";
    if (spellId.startsWith("http://") || spellId.startsWith("https://")) {
      return spellId;
    }
    const spell = ALBION_SPELLS?.[spellId];
    if (spell?.icon) return spell.icon;
    return `https://render.albiononline.com/v1/spell/${spellId}.png`;
  };

  // Renderizador de cada celda del Grid 3x3 denso e inmersivo (gap-2, hechizos absolute -bottom-3)
  const renderVisualGridCell = (
    itemSource: any,
    fallbackId: string,
    alt: string,
    skillSlots?: string[],
    isTwoHandedDisabled: boolean = false,
    weaponGhostId?: string
  ) => {
    // Si es arma de dos manos, renderiza el mismo icono del arma principal con opacidad baja (grayscale opacity-30)
    if (isTwoHandedDisabled) {
      return (
        <div className="relative flex flex-col items-center">
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#08080a] border border-dragon-border/60 rounded-sm flex items-center justify-center p-1 select-none"
            title="Arma a dos manos (mano secundaria ocupada)"
          >
            <img
              src={getItemImageUrl(weaponGhostId || "2H_AXE_AVALON", "T8", 0, 4)}
              alt="Mano secundaria"
              className="w-full h-full object-contain p-1 opacity-30 grayscale"
            />
          </div>
        </div>
      );
    }

    const resolvedId =
      typeof itemSource === "string"
        ? itemSource
        : itemSource?.id || fallbackId;

    const isConsumable =
      resolvedId.includes("POTION") ||
      resolvedId.includes("MEAL") ||
      resolvedId.includes("MOUNT");

    return (
      <div className="relative flex flex-col items-center">
        {/* Recuadro visual del ítem (w-20 h-20 sm:w-24 sm:h-24, fondo casi negro, solo el <img> sin texto) */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#08080a] border border-dragon-border rounded-sm flex items-center justify-center p-1 hover:border-zinc-500 transition-colors">
          <img
            src={getItemImageUrl(resolvedId || fallbackId, "T8", 0, isConsumable ? 1 : 4)}
            alt={alt}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              (e.target as HTMLElement).style.opacity = "0.3";
            }}
          />

          {/* Hechizos sobrepuestos en el borde inferior: absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 */}
          {skillSlots && skillSlots.length > 0 && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {skillSlots.map((spellKey, idx) => {
                const iconUrl = getSpellIconUrl(spellKey);
                const slotLetter =
                  ["Q", "W", "E", "P"][idx] ||
                  ["1", "2"][idx] ||
                  `${idx + 1}`;

                return (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border border-zinc-700 bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0 relative shadow-md"
                    title={`Habilidad: ${spellKey || slotLetter}`}
                  >
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        className="w-full h-full object-cover select-none"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : null}
                    <span className="absolute text-[8px] font-mono text-zinc-500 font-bold -z-0 select-none">
                      {slotLetter}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-dragon-bg overflow-hidden select-none">
      {/* SIDEBAR IZQUIERDO: Actividades / Contenido (w-64, border-r) */}
      <aside className="w-64 shrink-0 border-r border-dragon-border bg-dragon-bg flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dragon-border">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 font-mono text-xs text-zinc-400 transition-colors duration-150 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-dragon-crimson" />
              <span>[ GATEWAY ]</span>
            </button>
          )}
          <span className="font-mono text-[10px] text-zinc-600 tracking-wider">
            FD // 01
          </span>
        </div>

        <div className="px-4 py-2.5 font-mono text-[11px] text-zinc-500 tracking-widest uppercase border-b border-dragon-border/50">
          // ACTIVIDADES
        </div>

        {/* Lista de Actividades con soporte de gestión Sindicato en hover */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-dragon-border/20">
          {activities.map((act) => {
            const isSelected =
              selectedActivity.toUpperCase() === act.toUpperCase();

            return (
              <div
                key={act}
                onClick={() => setSelectedActivity(act)}
                className={`group relative flex items-center justify-between w-full px-4 py-3 font-mono text-sm transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "border-l-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                    : "border-l-2 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-dragon-panel/20 hover:border-dragon-crimson"
                }`}
              >
                <span className="truncate">{act}</span>

                {/* Controles de Sindicato en Hover */}
                {isSindicatoAuthenticated && act !== "TODAS" && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivityEditModal({ original: act, current: act });
                      }}
                      className="p-1 text-zinc-500 hover:text-dragon-ember transition-colors"
                      title="Editar actividad"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({
                          type: "activity",
                          id: act,
                          name: act,
                        });
                      }}
                      className="p-1 text-zinc-500 hover:text-dragon-crimson transition-colors"
                      title="Eliminar actividad"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL: Vistas (Lista de Builds o Editor Táctico Modular) */}
      <main className="flex-1 h-full flex flex-col overflow-hidden bg-dragon-bg">
        {showBuildEditor ? (
          /* Editor de Builds Profesional a Pantalla Completa */
          <BuildEditor
            initialBuild={editingBuild}
            activities={activities}
            onSave={async (savedBuild) => {
              if (editingBuild) {
                setBuilds((prev) =>
                  prev.map((b) => (b.id === savedBuild.id ? savedBuild : b))
                );
              } else {
                setBuilds((prev) => [savedBuild, ...prev]);
              }
              setShowBuildEditor(false);
              setEditingBuild(null);
              await saveTacticalBuild(savedBuild);
            }}
            onCancel={() => {
              setShowBuildEditor(false);
              setEditingBuild(null);
            }}
            onAddActivity={async (newAct) => {
              if (!activities.includes(newAct)) {
                setActivities((prev) => [...prev, newAct]);
                await saveActivity(newAct);
              }
            }}
          />
        ) : (
          /* VISTA PRINCIPAL: BARRA SUPERIOR + LISTA DE BUILDS */
          <>
            {/* Barra Superior: Filtros de Rol y Botón de Nueva Build */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-dragon-border bg-dragon-bg px-6 py-3 shrink-0">
              <div className="flex items-center gap-4 overflow-x-auto">
                <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider shrink-0">
                  ROL:
                </span>

                <button
                  onClick={() => setSelectedRole("TODOS")}
                  className={`px-2.5 py-1 font-mono text-xs uppercase transition-colors duration-150 shrink-0 ${
                    selectedRole === "TODOS"
                      ? "border-b-2 border-dragon-ember text-dragon-ember font-bold"
                      : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  TODOS
                </button>

                {ROLES_TACTICOS.map((rol) => {
                  const isActive = selectedRole.toUpperCase() === rol;
                  return (
                    <button
                      key={rol}
                      onClick={() => setSelectedRole(rol)}
                      className={`px-2.5 py-1 font-mono text-xs uppercase transition-colors duration-150 shrink-0 ${
                        isActive
                          ? "border-b-2 border-dragon-ember text-dragon-ember font-bold"
                          : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {rol}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Botón Nueva Build para Sindicato */}
                {isSindicatoAuthenticated && (
                  <button
                    type="button"
                    onClick={handleOpenNewBuild}
                    className="px-3 py-1 border border-dragon-ember text-dragon-ember hover:bg-dragon-ember hover:text-black font-mono text-xs uppercase tracking-wider font-bold transition-colors shrink-0"
                  >
                    + NUEVA BUILD
                  </button>
                )}

                <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-zinc-500">
                  <span>BUILDS:</span>
                  <span className="text-dragon-ember font-semibold">
                    [{filteredBuilds.length}]
                  </span>
                </div>
              </div>
            </div>

            {/* Contenedor de Builds o Carga */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex h-full min-h-[350px] items-center justify-center font-mono">
                  <div className="flex items-center gap-2 text-xs tracking-widest text-zinc-500 animate-pulse">
                    <span className="text-dragon-crimson font-bold">&gt;</span>
                    <span>SINCRONIZANDO TELEMETRÍA DE BUILDS...</span>
                  </div>
                </div>
              ) : filteredBuilds.length === 0 ? (
                <div className="flex h-full min-h-[350px] flex-col items-center justify-center font-mono text-zinc-600 gap-2">
                  <div className="text-xs tracking-widest">
                    &gt; // NO SE ENCONTRARON BUILDS PARA EL CRITERIO ACTUAL
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Selecciona otra actividad en el panel lateral o cambia de rol.
                  </span>
                </div>
              ) : (
                <div className="w-full divide-y divide-dragon-border">
                  {filteredBuilds.map((build) => {
                    const isExpanded = expandedId === build.id;
                    const eq: Record<string, any> = build.equipamiento || {};
                    const isTwoHanded = Boolean(
                      build.esDosManos ||
                        (!build.armaSecundariaId &&
                          !eq.armaSecundaria &&
                          !eq.offhand)
                    );

                    const weaponId =
                      build.armaPrincipalId ||
                      eq.armaPrincipal?.id ||
                      eq.armaPrincipal ||
                      eq.mainhand?.id ||
                      eq.mainhand ||
                      "2H_AXE_AVALON";

                    // Hechizos verificados de ALBION_SPELLS
                    const spells = build.spells || {};
                    const mainhandSpells =
                      spells.mainhand || ["CLEAVE", "SWORD_SPIN", "MIGHTYBLOW", "PASSIVE_BLEEDCHANCE"];
                    const headSpells =
                      spells.head || ["DEFENSERUN", "PASSIVE_BLEEDCHANCE"];
                    const armorSpells =
                      spells.armor || ["PARRY", "PASSIVE_BLEEDCHANCE"];
                    const shoesSpells =
                      spells.shoes || ["INTERRUPT2", "PASSIVE_BLEEDCHANCE"];

                    return (
                      <div key={build.id} className="w-full">
                        {/* Fila Colapsada: 100% Clickeable para abrir el acordeón */}
                        <div
                          onClick={() => toggleExpand(build.id)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 cursor-pointer transition-colors duration-150 hover:bg-dragon-panel/50 select-none"
                        >
                          {/* Izquierda: Icono Arma Principal Grande + Nombre + Tier + Rol + Arma */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 bg-zinc-950 border border-dragon-border rounded-sm flex items-center justify-center p-1">
                              <img
                                src={getItemImageUrl(weaponId, "T8", 0, 4)}
                                alt={build.nombre}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.opacity = "0.3";
                                }}
                              />
                            </div>

                            <div className="flex flex-col min-w-0 truncate">
                              <div className="flex items-center gap-2.5">
                                <span className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-100 truncate">
                                  {build.nombre}
                                </span>
                                <span className="border border-amber-500/40 text-amber-400 text-[10px] font-mono px-1.5 py-0.5 tracking-wider shrink-0">
                                  Tier {eq.tierEquiv || 8} Eq.
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                                <span
                                  className={`font-semibold tracking-wider ${getRoleColor(
                                    build.rol
                                  )}`}
                                >
                                  {build.rol || "DPS"}
                                </span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-400 font-sans text-xs truncate">
                                  Arma Principal:{" "}
                                  <span className="text-zinc-300 font-mono">
                                    {build.armaPrincipalNombre ||
                                      build.armaPrincipalId ||
                                      "Arma Táctica"}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Derecha: Botones Modernos y Estéticos (text-[10px], SIN corchetes, hover sólido) */}
                          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(build.id);
                              }}
                              className="px-2.5 py-1 border border-dragon-crimson/60 text-dragon-crimson hover:bg-dragon-crimson hover:text-white transition-colors duration-150 tracking-wider uppercase font-semibold"
                            >
                              {isExpanded ? "OCULTAR" : "VER BUILD"}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyDiscord(build);
                              }}
                              className="px-2.5 py-1 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900 transition-colors duration-150 tracking-wider uppercase"
                            >
                              {copiedId === build.id ? "¡COPIADO!" : "COPIAR DISCORD"}
                            </button>

                            {isSindicatoAuthenticated && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditBuild(build);
                                  }}
                                  className="px-2.5 py-1 bg-dragon-crimsonDark hover:bg-dragon-crimson text-white transition-colors duration-150 tracking-wider uppercase"
                                  title="Editar build"
                                >
                                  EDITAR
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModal({
                                      type: "build",
                                      id: build.id,
                                      name: build.nombre,
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-dragon-crimsonDark hover:bg-dragon-crimson text-white transition-colors duration-150 tracking-wider uppercase"
                                  title="Eliminar build"
                                >
                                  ELIMINAR
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Estado Expandido: Blueprint Albion Denso (gap-2, hechizos absolute -bottom-3) */}
                        {isExpanded && (
                          <div className="border-t border-dragon-border bg-[#0a0a0c] px-6 py-6 select-none">
                            {/* Grid 3x3 Compacto (gap-2, w-20 h-20 sm:w-24 sm:h-24) */}
                            <div className="grid grid-cols-3 gap-2 max-w-sm sm:max-w-md mx-auto py-2">
                              {/* Columna Izquierda: Bolsa, Arma Principal (4 skills), Poción */}
                              <div className="flex flex-col items-center gap-2">
                                {renderVisualGridCell(
                                  eq.bolsa,
                                  "BAG",
                                  "Bolsa"
                                )}
                                {renderVisualGridCell(
                                  weaponId,
                                  "2H_AXE_AVALON",
                                  "Arma Principal",
                                  mainhandSpells
                                )}
                                {renderVisualGridCell(
                                  eq.pocion,
                                  "POTION_REVIVE",
                                  "Poción"
                                )}
                              </div>

                              {/* Columna Central: Casco (2 skills), Pecho (2 skills), Botas (2 skills) */}
                              <div className="flex flex-col items-center gap-2">
                                {renderVisualGridCell(
                                  eq.cabeza,
                                  "HEAD_PLATE_SET2",
                                  "Casco",
                                  headSpells
                                )}
                                {renderVisualGridCell(
                                  eq.pecho,
                                  "ARMOR_PLATE_SET3",
                                  "Pecho",
                                  armorSpells
                                )}
                                {renderVisualGridCell(
                                  eq.zapatos,
                                  "SHOES_LEATHER_SET2",
                                  "Botas",
                                  shoesSpells
                                )}
                              </div>

                              {/* Columna Derecha: Capa, Arma Secundaria (o Réplica 2 Manos), Comida */}
                              <div className="flex flex-col items-center gap-2">
                                {renderVisualGridCell(
                                  eq.capa,
                                  "CAPEITEM_FW_FORTSTERLING",
                                  "Capa"
                                )}
                                {renderVisualGridCell(
                                  build.armaSecundariaId || eq.armaSecundaria || eq.offhand,
                                  "OFF_BOOK",
                                  "Arma Secundaria",
                                  undefined,
                                  isTwoHanded,
                                  weaponId
                                )}
                                {renderVisualGridCell(
                                  eq.comida,
                                  "MEAL_STEW",
                                  "Comida"
                                )}
                              </div>
                            </div>

                            {/* Rediseño de Notas: Recuadro simple debajo del grid */}
                            {build.notas && (
                              <div className="w-full max-w-sm sm:max-w-md mx-auto bg-dragon-bg border border-dragon-border rounded-sm p-4 mt-6">
                                <div className="font-mono text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                                  NOTAS
                                </div>
                                <p className="font-sans text-sm text-zinc-300 leading-relaxed">
                                  {build.notas}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ============================================================ */}
      {/* MODAL PERSONALIZADO DE CONFIRMACIÓN DE ELIMINACIÓN            */}
      {/* ============================================================ */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dragon-bg border border-dragon-border p-6 w-96 select-none shadow-none">
            <h3 className="font-display text-base font-bold tracking-wider text-dragon-crimson uppercase mb-2">
              // CONFIRMAR ELIMINACIÓN
            </h3>
            <p className="font-mono text-sm text-zinc-400 mb-6 leading-relaxed">
              {deleteModal.type === "build"
                ? `¿Estás seguro de que deseas eliminar permanentemente la build táctica "${deleteModal.name}"?`
                : `¿Estás seguro de que deseas eliminar la actividad "${deleteModal.name}" de los registros?`}
            </p>

            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase tracking-wider"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3 py-1.5 bg-dragon-crimsonDark hover:bg-dragon-crimson text-white font-semibold transition-colors uppercase tracking-wider"
              >
                PROCEDER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PERSONALIZADO DE EDICIÓN DE ACTIVIDAD                  */}
      {/* ============================================================ */}
      {activityEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dragon-bg border border-dragon-border p-6 w-96 select-none shadow-none">
            <h3 className="font-display text-base font-bold tracking-wider text-zinc-100 uppercase mb-2">
              // EDITAR ACTIVIDAD
            </h3>
            <p className="font-mono text-[11px] text-zinc-500 mb-4">
              Introduce el nuevo identificador para la actividad:
            </p>

            <input
              type="text"
              value={activityEditModal.current}
              onChange={(e) =>
                setActivityEditModal((prev) =>
                  prev ? { ...prev, current: e.target.value } : null
                )
              }
              className="w-full bg-dragon-panel border border-dragon-border px-3 py-2 text-sm font-mono text-zinc-200 focus:border-dragon-ember focus:outline-none mb-6"
              autoFocus
            />

            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActivityEditModal(null)}
                className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase tracking-wider"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={confirmEditActivity}
                className="px-3 py-1.5 bg-dragon-ember hover:bg-orange-500 text-black font-bold transition-colors uppercase tracking-wider"
              >
                GUARDAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
