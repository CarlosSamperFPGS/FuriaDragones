"use client";

import React, { useState, useEffect } from "react";
import {
  getTacticalBuilds,
  getActivities,
  type TacticalBuild,
} from "@/lib/firebase-sync";
import { getItemImageUrl } from "@/lib/items";
import { ArrowLeft } from "lucide-react";

interface GremioViewProps {
  onBack?: () => void;
  isSindicatoAuthenticated?: boolean;
}

// Roles tácticos ordenados estrictamente según especificación
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

  // Estados de filtro
  const [selectedActivity, setSelectedActivity] = useState<string>("TODAS");
  const [selectedRole, setSelectedRole] = useState<string>("TODOS");

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

  const handleDeleteBuild = (id: string) => {
    if (confirm(`// CONFIRMAR: ¿Eliminar build táctica [${id}]?`)) {
      setBuilds((prev) => prev.filter((b) => b.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  const handleEditBuild = (build: TacticalBuild) => {
    alert(`[SINDICATO_ROOT] Módulo de edición táctica para: ${build.nombre}`);
  };

  // Filtrado de builds
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

  // Color de rol táctico
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

  // Renderizador de celda visual del Grid 3x3 usando getItemImageUrl
  const renderVisualGridCell = (
    itemSource: any,
    fallbackId: string,
    alt: string,
    skillSlots?: string[],
    isTwoHandedDisabled: boolean = false
  ) => {
    if (isTwoHandedDisabled) {
      return (
        <div className="flex flex-col items-center">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-zinc-950/80 border border-dragon-border/60 rounded-sm flex items-center justify-center select-none">
            <span className="font-mono text-zinc-700 text-2xl">✕</span>
          </div>
          <span className="font-mono text-[9px] text-zinc-600 mt-2 uppercase tracking-wider">
            [ 2 MANOS ]
          </span>
        </div>
      );
    }

    const resolvedId =
      typeof itemSource === "string"
        ? itemSource
        : itemSource?.id || fallbackId;

    return (
      <div className="flex flex-col items-center">
        {/* Recuadro visual del ítem de Albion Online */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-dragon-bg border border-dragon-border rounded-sm flex items-center justify-center p-2 hover:border-zinc-500 transition-colors">
          <img
            src={getItemImageUrl(resolvedId || fallbackId)}
            alt={alt}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.opacity = "0.3";
            }}
          />
        </div>

        {/* Habilidades (Spells): Contenedores circulares técnicos */}
        {skillSlots && skillSlots.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {skillSlots.map((slot, idx) => (
              <div
                key={idx}
                className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-[8px] font-mono text-zinc-500 font-bold select-none"
                title={`Slot de habilidad ${slot}`}
              >
                {slot}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-dragon-bg overflow-hidden select-none">
      {/* Sidebar Izquierdo: Actividades / Contenido (w-64, border-r) */}
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

        <div className="flex-1 overflow-y-auto py-2 divide-y divide-dragon-border/20">
          {activities.map((act) => {
            const isSelected =
              selectedActivity.toUpperCase() === act.toUpperCase();

            return (
              <button
                key={act}
                onClick={() => setSelectedActivity(act)}
                className={`w-full text-left px-4 py-3 font-mono text-sm transition-all duration-150 block ${
                  isSelected
                    ? "border-l-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                    : "border-l-2 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-dragon-panel/20 hover:border-dragon-crimson"
                }`}
              >
                {act}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Área Principal: Filtros de Rol y Lista de Builds */}
      <main className="flex-1 h-full flex flex-col overflow-hidden bg-dragon-bg">
        {/* Barra Superior: Filtros de Rol */}
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

          <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-zinc-500">
            <span>BUILDS:</span>
            <span className="text-dragon-ember font-semibold">
              [{filteredBuilds.length}]
            </span>
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

                return (
                  <div key={build.id} className="w-full">
                    {/* Fila Colapsada (Data Row Rico en Información Visual) */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-6 py-3.5 transition-colors duration-150 hover:bg-dragon-panel/50">
                      {/* Izquierda: Icono Grande de Arma Principal + Metadata */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-14 shrink-0 bg-dragon-bg border border-dragon-border rounded-sm flex items-center justify-center p-1">
                          <img
                            src={getItemImageUrl(weaponId)}
                            alt={build.nombre}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.opacity = "0.3";
                            }}
                          />
                        </div>

                        <div className="flex flex-col truncate">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display text-lg font-bold uppercase tracking-wider text-zinc-100 truncate">
                              {build.nombre}
                            </span>
                            <span className="border border-amber-500/40 text-amber-400 text-[10px] font-mono px-1.5 py-0.5 tracking-wider shrink-0">
                              Tier 8 Eq.
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
                              {build.armaPrincipalNombre ||
                                build.armaPrincipalId ||
                                "Arma Táctica"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Centro: Fila compacta de iconos pequeños (w-10 h-10) de equipamiento */}
                      <div className="hidden lg:flex items-center gap-2 shrink-0">
                        {[
                          {
                            label: "Cabeza",
                            source: eq.cabeza,
                            fallback: "HEAD_PLATE_SET2",
                          },
                          {
                            label: "Pecho",
                            source: eq.pecho,
                            fallback: "ARMOR_PLATE_SET3",
                          },
                          {
                            label: "Botas",
                            source: eq.zapatos,
                            fallback: "SHOES_LEATHER_SET2",
                          },
                          {
                            label: "Capa",
                            source: eq.capa,
                            fallback: "CAPEITEM_FW_FORTSTERLING",
                          },
                          {
                            label: "Poción",
                            source: eq.pocion,
                            fallback: "POTION_REVIVE",
                          },
                          {
                            label: "Comida",
                            source: eq.comida,
                            fallback: "MEAL_STEW",
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="h-10 w-10 shrink-0 bg-dragon-bg border border-dragon-border rounded-sm flex items-center justify-center p-1"
                            title={item.label}
                          >
                            <img
                              src={getItemImageUrl(
                                item.source?.id || item.source || item.fallback
                              )}
                              alt={item.label}
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.opacity = "0.2";
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Derecha: Botones de Acción Estilo Terminal */}
                      <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                        {/* Botón Ver Build (borde rojo sutil) */}
                        <button
                          onClick={() => toggleExpand(build.id)}
                          className="px-3 py-1.5 border border-dragon-crimson/50 text-dragon-crimson hover:bg-dragon-crimson hover:text-white transition-colors duration-150"
                        >
                          {isExpanded ? "[ Ocultar ]" : "[ Ver Build ]"}
                        </button>

                        {/* Botón Copiar Discord (borde gris) */}
                        <button
                          onClick={() => handleCopyDiscord(build)}
                          className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors duration-150"
                        >
                          {copiedId === build.id
                            ? "[ ¡Copiado! ]"
                            : "[ Copiar Discord ]"}
                        </button>

                        {/* Controles de Sindicato (Editar / Eliminar en rojo mate) */}
                        {isSindicatoAuthenticated && (
                          <>
                            <button
                              onClick={() => handleEditBuild(build)}
                              className="px-2.5 py-1.5 bg-dragon-crimsonDark hover:bg-dragon-crimson text-white transition-colors duration-150"
                              title="Editar build (Sindicato)"
                            >
                              [ Editar ]
                            </button>
                            <button
                              onClick={() => handleDeleteBuild(build.id)}
                              className="px-2.5 py-1.5 bg-dragon-crimsonDark hover:bg-dragon-crimson text-white transition-colors duration-150"
                              title="Eliminar build (Sindicato)"
                            >
                              [ Eliminar ]
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Estado Expandido: Blueprint Albion Puramente Visual (Grid 3x3) */}
                    {isExpanded && (
                      <div className="border-t border-dragon-border bg-dragon-panel/40 px-6 py-6 select-none">
                        {/* Grid 3x3 Replicando Inventario de Albion */}
                        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto py-2">
                          {/* Columna Izquierda: Bolsa, Arma Principal (4 skills), Poción */}
                          <div className="flex flex-col items-center gap-6">
                            {renderVisualGridCell(
                              eq.bolsa,
                              "BAG",
                              "Bolsa"
                            )}
                            {renderVisualGridCell(
                              weaponId,
                              "2H_AXE_AVALON",
                              "Arma Principal",
                              ["Q", "W", "E", "P"]
                            )}
                            {renderVisualGridCell(
                              eq.pocion,
                              "POTION_REVIVE",
                              "Poción"
                            )}
                          </div>

                          {/* Columna Central: Casco (2 skills), Pecho (2 skills), Botas (2 skills) */}
                          <div className="flex flex-col items-center gap-6">
                            {renderVisualGridCell(
                              eq.cabeza,
                              "HEAD_PLATE_SET2",
                              "Casco",
                              ["D", "P"]
                            )}
                            {renderVisualGridCell(
                              eq.pecho,
                              "ARMOR_PLATE_SET3",
                              "Pecho",
                              ["R", "P"]
                            )}
                            {renderVisualGridCell(
                              eq.zapatos,
                              "SHOES_LEATHER_SET2",
                              "Botas",
                              ["F", "P"]
                            )}
                          </div>

                          {/* Columna Derecha: Capa, Arma Secundaria (o X si 2 manos), Comida */}
                          <div className="flex flex-col items-center gap-6">
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
                              isTwoHanded
                            )}
                            {renderVisualGridCell(
                              eq.comida,
                              "MEAL_STEW",
                              "Comida"
                            )}
                          </div>
                        </div>

                        {/* Notas Tácticas (si existen) */}
                        {build.notas && (
                          <div className="mt-6 max-w-xl mx-auto border-l-2 border-dragon-crimson pl-4 py-1 text-left">
                            <div className="font-mono text-[10px] uppercase tracking-wider text-dragon-crimson">
                              DIRECTIVAS DE COMBATE // NOTAS
                            </div>
                            <p className="mt-1 font-sans text-xs leading-relaxed text-zinc-400">
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
      </main>
    </div>
  );
}
