"use client";

import React, { useState, useEffect } from "react";
import {
  getTacticalBuilds,
  getActivities,
  type TacticalBuild,
} from "@/lib/firebase-sync";
import {
  Flame,
  Activity as HealerPulse,
  ShieldAlert,
  Swords,
  Crosshair,
  Zap,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Terminal,
} from "lucide-react";

interface GremioViewProps {
  onBack?: () => void;
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

export function GremioView({ onBack }: GremioViewProps) {
  const [builds, setBuilds] = useState<TacticalBuild[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Estados de filtrado
  const [selectedActivity, setSelectedActivity] = useState<string>("TODAS");
  const [selectedRole, setSelectedRole] = useState<string>("TODOS");

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Llamada a las utilidades exportadas por firebase-sync.js
        const [tacticalBuilds, activitiesList] = await Promise.all([
          getTacticalBuilds(),
          getActivities(),
        ]);

        setBuilds(tacticalBuilds);
        setActivities(activitiesList);
      } catch (error) {
        console.error("[GremioView] Error sincronizando telemetría:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Normalización y filtrado
  const filteredBuilds = builds.filter((build) => {
    // Filtro de Actividad
    const actUpper = selectedActivity.toUpperCase();
    const buildActUpper = (build.actividad || "").toUpperCase();
    const matchActivity =
      actUpper === "TODAS" ||
      buildActUpper.includes(actUpper.split(" ")[0]) ||
      actUpper.includes(buildActUpper.split(" ")[0]);

    // Filtro de Rol
    const roleUpper = selectedRole.toUpperCase();
    const buildRoleUpper = (build.rol || "").toUpperCase();
    const matchRole =
      roleUpper === "TODOS" || buildRoleUpper.includes(roleUpper);

    return matchActivity && matchRole;
  });

  // Selector tipográfico de icono de rol táctico
  const renderRoleIcon = (rol: string) => {
    const r = (rol || "").toUpperCase();
    if (r.includes("CLAPPER")) return <Flame className="h-4 w-4 text-orange-500" />;
    if (r.includes("HEALER")) return <HealerPulse className="h-4 w-4 text-emerald-400" />;
    if (r.includes("STOPER") || r.includes("TANK")) return <ShieldAlert className="h-4 w-4 text-blue-400" />;
    if (r.includes("PIERCE")) return <Crosshair className="h-4 w-4 text-purple-400" />;
    if (r.includes("SUPPORT")) return <Zap className="h-4 w-4 text-yellow-400" />;
    if (r.includes("DPS")) return <Swords className="h-4 w-4 text-red-500" />;
    return <Terminal className="h-4 w-4 text-zinc-400" />;
  };

  // Componente de celda de inventario técnico (Blueprint Albion 3x3)
  const renderInventoryCell = (
    label: string,
    itemName?: string | null,
    skillCount: number = 0,
    skillLabels: string[] = [],
    isTwoHandedOffhand: boolean = false
  ) => {
    if (isTwoHandedOffhand) {
      return (
        <div className="flex flex-col items-center">
          <span className="font-mono text-[9px] tracking-widest text-zinc-600 uppercase mb-1">
            // {label}
          </span>
          <div className="h-20 w-20 sm:h-24 sm:w-24 border border-dragon-border/60 bg-zinc-950/80 rounded-sm flex items-center justify-center text-zinc-700 font-mono text-xl select-none">
            ✕
          </div>
          <span className="mt-1.5 font-mono text-[10px] text-zinc-600 tracking-wider">
            [2 MANOS]
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase mb-1">
          // {label}
        </span>
        <div className="h-20 w-20 sm:h-24 sm:w-24 border border-dragon-border bg-dragon-bg rounded-sm flex flex-col items-center justify-center p-2 text-center transition-colors hover:border-zinc-500">
          <span className="font-mono text-[10px] text-zinc-300 font-medium leading-tight line-clamp-3">
            {itemName || "---"}
          </span>
        </div>

        {/* Círculos de slots de habilidad */}
        {skillCount > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {skillLabels.map((slot, idx) => (
              <div
                key={idx}
                className="h-3 w-3 rounded-full border border-zinc-600 flex items-center justify-center text-[7px] font-mono text-zinc-400 bg-zinc-950"
                title={`Habilidad ${slot}`}
              >
                {slot}
              </div>
            ))}
          </div>
        )}

        <span className="mt-1 max-w-[96px] truncate font-mono text-[10px] text-zinc-500 text-center">
          {itemName || "VACÍO"}
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-dragon-bg overflow-hidden select-none">
      {/* 1. SIDEBAR IZQUIERDO: Actividades / Contenido (w-64, border-r) */}
      <aside className="w-64 shrink-0 border-r border-dragon-border bg-dragon-bg flex flex-col h-full">
        {/* Header del Sidebar con Retorno */}
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

        {/* Título de Sección */}
        <div className="px-4 py-2.5 font-mono text-[11px] text-zinc-500 tracking-widest uppercase border-b border-dragon-border/50">
          // ACTIVIDADES
        </div>

        {/* Lista Vertical de Actividades */}
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

      {/* 2. ÁREA PRINCIPAL: Filtros de Rol y Lista de Builds */}
      <main className="flex-1 h-full flex flex-col overflow-hidden bg-dragon-bg">
        {/* Barra Superior: Filtros de Rol Tácticos */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-dragon-border bg-dragon-bg px-6 py-3 shrink-0">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider shrink-0">
              ROL:
            </span>

            {/* Opción para Ver Todos */}
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

            {/* Roles en el orden estricto solicitado */}
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

          {/* Contador de Builds Visibles */}
          <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-zinc-500">
            <span>REGISTROS:</span>
            <span className="text-dragon-ember font-semibold">
              [{filteredBuilds.length}]
            </span>
          </div>
        </div>

        {/* 3. Contenido Principal: Estado de Carga o Lista de Builds */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            /* 4. Estado de Carga: Terminal Pulse */
            <div className="flex h-full min-h-[350px] items-center justify-center font-mono">
              <div className="flex items-center gap-2 text-xs tracking-widest text-zinc-500 animate-pulse">
                <span className="text-dragon-crimson font-bold">&gt;</span>
                <span>SINCRONIZANDO TELEMETRÍA DE BUILDS...</span>
              </div>
            </div>
          ) : filteredBuilds.length === 0 ? (
            /* Estado Vacío */
            <div className="flex h-full min-h-[350px] flex-col items-center justify-center font-mono text-zinc-600 gap-2">
              <div className="text-xs tracking-widest">
                &gt; // NO SE ENCONTRARON BUILDS PARA EL CRITERIO ACTUAL
              </div>
              <span className="text-[11px] text-zinc-500">
                Selecciona otra actividad en el panel lateral o restablece los roles.
              </span>
            </div>
          ) : (
            /* Lista de Builds (Data Rows Interactivos 100% Ancho) */
            <div className="w-full divide-y divide-dragon-border">
              {filteredBuilds.map((build) => {
                const isExpanded = expandedId === build.id;
                const eq = build.equipamiento || {};
                const isTwoHanded =
                  build.esDosManos || (!build.armaSecundaria && !eq.armaSecundaria);

                return (
                  <div key={build.id} className="w-full">
                    {/* Fila Colapsada (Data Row) */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(build.id)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-150 hover:bg-dragon-panel focus:outline-none"
                    >
                      {/* Izquierda: Icono Rol + Nombre + Arma Principal */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-dragon-border bg-dragon-bg">
                          {renderRoleIcon(build.rol)}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4 truncate">
                          <span className="font-display text-lg font-bold uppercase tracking-wider text-zinc-100 truncate">
                            {build.nombre}
                          </span>
                          <span className="font-sans text-sm text-zinc-400 truncate">
                            {build.armaPrincipal}
                          </span>
                        </div>
                      </div>

                      {/* Derecha: Tags técnicos + Chevron */}
                      <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                        <span className="hidden md:inline-block px-2 py-0.5 border border-dragon-border text-zinc-400 uppercase tracking-widest text-[10px]">
                          {build.actividad}
                        </span>
                        <span className="hidden sm:inline-block text-zinc-500 uppercase tracking-wider text-[10px]">
                          {build.rol}
                        </span>
                        <div className="text-zinc-500 transition-colors duration-150">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-dragon-ember" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-zinc-500" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Estado Expandido: Blueprint Técnico Albion (Grid 3x3 Centrado) */}
                    {isExpanded && (
                      <div className="border-t border-dragon-border bg-dragon-panel/40 px-6 py-6">
                        <div className="text-center mb-4 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                          // BLUEPRINT DE INVENTARIO TÁCTICO
                        </div>

                        {/* Grid 3 Columnas x 3 Filas Centrado */}
                        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto py-2">
                          {/* Columna Izquierda: Bolsa, Arma Principal (4 slots), Poción */}
                          <div className="flex flex-col items-center gap-6">
                            {renderInventoryCell("BOLSA", eq.bolsa || "Bolsa T8")}
                            {renderInventoryCell(
                              "ARMA PRINCIPAL",
                              build.armaPrincipal || eq.armaPrincipal || "Arma",
                              4,
                              ["Q", "W", "E", "P"]
                            )}
                            {renderInventoryCell("POCIÓN", eq.pocion || "Poción")}
                          </div>

                          {/* Columna Central: Casco (2 slots), Pecho (2 slots), Botas (2 slots) */}
                          <div className="flex flex-col items-center gap-6">
                            {renderInventoryCell(
                              "CASCO",
                              eq.cabeza || "Casco",
                              2,
                              ["D", "P"]
                            )}
                            {renderInventoryCell(
                              "PECHO",
                              eq.pecho || "Pecho",
                              2,
                              ["R", "P"]
                            )}
                            {renderInventoryCell(
                              "BOTAS",
                              eq.zapatos || "Botas",
                              2,
                              ["F", "P"]
                            )}
                          </div>

                          {/* Columna Derecha: Capa, Arma Secundaria (o X si 2 manos), Comida */}
                          <div className="flex flex-col items-center gap-6">
                            {renderInventoryCell("CAPA", eq.capa || "Capa")}
                            {renderInventoryCell(
                              "ARMA SECUNDARIA",
                              build.armaSecundaria || eq.armaSecundaria,
                              0,
                              [],
                              isTwoHanded
                            )}
                            {renderInventoryCell("COMIDA", eq.comida || "Comida")}
                          </div>
                        </div>

                        {/* Notas Tácticas con Borde Izquierdo Carmesí */}
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
