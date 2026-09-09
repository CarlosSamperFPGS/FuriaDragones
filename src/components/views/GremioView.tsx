"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Shield,
  Swords,
  HeartPulse,
  Zap,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Terminal,
} from "lucide-react";

// Interfaz estricta para las Builds Tácticas de Albion Online
export interface TacticalBuild {
  id: string;
  nombre: string;
  rol: "tank" | "dps" | "healer" | "support" | string;
  actividad: "zvz" | "roaming" | "pve" | string;
  armaPrincipal: string;
  equipamiento: {
    cabeza?: string;
    pecho?: string;
    zapatos?: string;
    capa?: string;
    consumibles?: string;
    [key: string]: any;
  };
  notas?: string;
}

interface GremioViewProps {
  onBack?: () => void;
}

export function GremioView({ onBack }: GremioViewProps) {
  const [builds, setBuilds] = useState<TacticalBuild[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtros de navegación táctica
  const [filtroActividad, setFiltroActividad] = useState<string>("TODAS");
  const [filtroRol, setFiltroRol] = useState<string>("TODOS");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuilds() {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Fetch directo a la colección "builds" en Firestore
        const querySnapshot = await getDocs(collection(db, "builds"));
        const fetchedBuilds: TacticalBuild[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedBuilds.push({
            id: doc.id,
            nombre: data.nombre || "BUILD_SIN_NOMBRE",
            rol: data.rol || "dps",
            actividad: data.actividad || "zvz",
            armaPrincipal: data.armaPrincipal || "ARMA NO ASIGNADA",
            equipamiento: data.equipamiento || {},
            notas: data.notas || "",
          });
        });

        setBuilds(fetchedBuilds);
      } catch (err: any) {
        console.warn("Firestore connection warning:", err?.message || err);
        setLoadError(err?.message || "ERROR AL OBTENER LA COLECCIÓN 'builds'");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBuilds();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filtrado reactivo en memoria
  const filteredBuilds = builds.filter((build) => {
    const matchActividad =
      filtroActividad === "TODAS" ||
      build.actividad.toLowerCase() === filtroActividad.toLowerCase();
    const matchRol =
      filtroRol === "TODOS" ||
      build.rol.toLowerCase() === filtroRol.toLowerCase();
    return matchActividad && matchRol;
  });

  // Selector tipográfico de icono de rol
  const renderRoleIcon = (rol: string) => {
    const r = rol.toLowerCase();
    if (r === "tank") return <Shield className="h-4 w-4" />;
    if (r === "healer") return <HeartPulse className="h-4 w-4" />;
    if (r === "support") return <Zap className="h-4 w-4" />;
    if (r === "dps") return <Swords className="h-4 w-4" />;
    return <Terminal className="h-4 w-4" />;
  };

  return (
    <div className="flex h-full w-full flex-col bg-dragon-bg overflow-hidden select-none">
      {/* Header Sticky con Filtros Tácticos (Anti-Cards: Borde fino mate) */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-dragon-border bg-dragon-bg px-6 py-3 shrink-0">
        {/* Lado Izquierdo: Retorno a Gateway y Título Técnico */}
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 font-mono text-xs text-zinc-400 transition-colors duration-150 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-dragon-crimson" />
              <span>[ GATEWAY ]</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-zinc-500">
            <span>//</span>
            <span className="text-zinc-300 font-semibold tracking-wider">
              REGISTRO_DE_BUILDS
            </span>
            <span className="text-zinc-600">[{filteredBuilds.length}]</span>
          </div>
        </div>

        {/* Lado Derecho: Filtros Tipográficos (Actividad y Rol) */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Filtro: Actividad */}
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-[10px] text-zinc-600 uppercase mr-1">
              ACT:
            </span>
            {["TODAS", "ZVZ", "ROAMING", "PVE"].map((act) => {
              const isActive = filtroActividad === act;
              return (
                <button
                  key={act}
                  onClick={() => setFiltroActividad(act)}
                  className={`px-2 py-1 transition-colors duration-150 ${
                    isActive
                      ? "border-b-2 border-dragon-ember text-dragon-ember font-bold"
                      : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {act}
                </button>
              );
            })}
          </div>

          <div className="h-3 w-px bg-dragon-border hidden sm:block" />

          {/* Filtro: Rol */}
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-[10px] text-zinc-600 uppercase mr-1">
              ROL:
            </span>
            {["TODOS", "TANK", "DPS", "HEALER", "SUPPORT"].map((r) => {
              const isActive = filtroRol === r;
              return (
                <button
                  key={r}
                  onClick={() => setFiltroRol(r)}
                  className={`px-2 py-1 transition-colors duration-150 ${
                    isActive
                      ? "border-b-2 border-dragon-ember text-dragon-ember font-bold"
                      : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido Principal: Estado de Carga o Lista de Data Rows */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          /* Estado de Carga Terminal */
          <div className="flex h-full min-h-[300px] items-center justify-center font-mono">
            <div className="flex items-center gap-2 text-xs tracking-widest text-zinc-500 animate-pulse">
              <span className="text-dragon-crimson font-bold">&gt;</span>
              <span>SINCRONIZANDO TELEMETRÍA DE BUILDS...</span>
            </div>
          </div>
        ) : filteredBuilds.length === 0 ? (
          /* Estado Vacío Técnico */
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center font-mono text-zinc-600 gap-2">
            <div className="text-xs tracking-widest">
              &gt; // NO SE DETECTARON BUILDS PARA EL FILTRO SELECCIONADO
            </div>
            {loadError && (
              <div className="text-[11px] text-dragon-crimson tracking-wider mt-1">
                AVISO: {loadError}
              </div>
            )}
          </div>
        ) : (
          /* Data Rows Tácticos a Ancho Completo (Anti-Cards: Borde inferior y hover panel) */
          <div className="w-full">
            {filteredBuilds.map((build) => {
              const isExpanded = expandedId === build.id;

              return (
                <div
                  key={build.id}
                  className="w-full border-b border-dragon-border"
                >
                  {/* Fila Colapsada (Clickable Data Row) */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(build.id)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-150 hover:bg-dragon-panel focus:outline-none"
                  >
                    {/* Sección Izquierda: Icono Rol + Nombre + Arma */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-dragon-border bg-dragon-bg text-dragon-crimson">
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

                    {/* Sección Derecha: Telemetría y Chevron */}
                    <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                      <span className="hidden sm:inline-block px-2 py-0.5 border border-dragon-border text-zinc-400 uppercase tracking-widest text-[10px]">
                        {build.actividad}
                      </span>
                      <span className="hidden md:inline-block text-zinc-500 uppercase tracking-wider text-[10px]">
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

                  {/* Estado Expandido (Acordeón): Inventario Técnico sin Tarjetas */}
                  {isExpanded && (
                    <div className="border-t border-dragon-border bg-dragon-panel/60 px-6 py-5">
                      {/* Grid Tipográfico de Equipamiento Táctico */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div>
                          <div className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                            // CABEZA
                          </div>
                          <div className="mt-1 font-sans text-sm font-medium text-zinc-200">
                            {build.equipamiento?.cabeza || "---"}
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                            // PECHO
                          </div>
                          <div className="mt-1 font-sans text-sm font-medium text-zinc-200">
                            {build.equipamiento?.pecho || "---"}
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                            // ZAPATOS
                          </div>
                          <div className="mt-1 font-sans text-sm font-medium text-zinc-200">
                            {build.equipamiento?.zapatos || "---"}
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                            // CAPA
                          </div>
                          <div className="mt-1 font-sans text-sm font-medium text-zinc-200">
                            {build.equipamiento?.capa || "---"}
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                            // CONSUMIBLES
                          </div>
                          <div className="mt-1 font-sans text-sm font-medium text-zinc-200">
                            {build.equipamiento?.consumibles || "---"}
                          </div>
                        </div>
                      </div>

                      {/* Notas Tácticas con Borde Izquierdo Rojo Carmesí */}
                      {build.notas && (
                        <div className="mt-5 border-l-2 border-dragon-crimson pl-4 py-1">
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
    </div>
  );
}
