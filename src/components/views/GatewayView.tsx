"use client";

import React from "react";
import { ArrowUpRight, Flame, ShieldAlert, Users, Swords } from "lucide-react";

interface GatewayViewProps {
  onSelectGremio: () => void;
}

export function GatewayView({ onSelectGremio }: GatewayViewProps) {
  return (
    <div className="grid h-full w-full grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dragon-border">
      {/* 01. NODO GREMIO: FURIA DE DRAGONES (ACTIVO) */}
      <div
        onClick={onSelectGremio}
        className="group relative flex flex-col justify-between p-8 md:p-14 cursor-pointer bg-dragon-bg transition-colors duration-200 hover:bg-dragon-panel"
      >
        {/* Línea de acento interactiva izquierda */}
        <div className="absolute left-0 top-0 h-full w-1 bg-dragon-crimson opacity-0 transition-opacity duration-150 group-hover:opacity-100" />

        {/* Encabezado del Cuadrante */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-mono text-xs tracking-widest text-dragon-crimson">
              // 01_SECTOR
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              STATUS: ACCESO_DISPONIBLE
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center border border-dragon-border text-zinc-500 transition-all duration-150 group-hover:border-dragon-crimson group-hover:text-zinc-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        {/* Título & Manifiesto Central */}
        <div className="my-auto py-10">
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-zinc-100 uppercase transition-colors duration-150 group-hover:text-white">
            FURIA DE DRAGONES
          </h2>
          <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-zinc-400">
            Repositorio de builds tácticas, equipamiento ZvZ estandarizado,
            escaladas y asignación de roles de combate para el gremio.
          </p>

          {/* Estadísticas en Fila Técnica (Sin Cards) */}
          <div className="mt-8 flex items-center gap-8 border-t border-dragon-border pt-6 font-mono text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Swords className="h-4 w-4 text-dragon-crimson" />
              <span>BUILDS_ACTUALIZADAS</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Users className="h-4 w-4 text-zinc-500" />
              <span>ROSTER_OFICIAL</span>
            </div>
          </div>
        </div>

        {/* CTA en Fila Inferior */}
        <div className="flex items-center justify-between font-mono text-xs tracking-widest text-zinc-500 group-hover:text-zinc-200">
          <span>[ PULSAR PARA ENTRAR AL PANEL ]</span>
          <span className="text-dragon-crimson">→</span>
        </div>
      </div>

      {/* 02. NODO ALIANZA: LLAMAS ETERNAS (DESHABILITADO // MANTENIMIENTO) */}
      <div className="relative flex flex-col justify-between p-8 md:p-14 bg-dragon-bg/40 opacity-75 cursor-not-allowed">
        {/* Encabezado del Cuadrante */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-mono text-xs tracking-widest text-zinc-500">
              // 02_SECTOR
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-dragon-ember" />
              OFFLINE // MANTENIMIENTO
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center border border-dragon-border text-zinc-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* Título & Manifiesto Central */}
        <div className="my-auto py-10">
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-zinc-500 uppercase">
            LLAMAS ETERNAS
          </h2>
          <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-zinc-500">
            Infraestructura táctica inter-gremios. Espacio reservado para
            estrategias y composiciones conjuntas de la coalición.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 border border-dragon-border px-3 py-1 font-mono text-[11px] text-dragon-ember">
            <Flame className="h-3.5 w-3.5" />
            <span>MÓDULO EN DESPLIEGUE</span>
          </div>
        </div>

        {/* Estado Inferior */}
        <div className="flex items-center justify-between font-mono text-xs tracking-widest text-zinc-600">
          <span>[ ACCESO TEMPORALMENTE BLOQUEADO ]</span>
          <span>// 403</span>
        </div>
      </div>
    </div>
  );
}
