"use client";

import React from "react";
import { Users, Shield, ArrowRight } from "lucide-react";

interface GatewayViewProps {
  onEnterMember: () => void;
  onEnterSindicato: () => void;
}

export function GatewayView({ onEnterMember, onEnterSindicato }: GatewayViewProps) {
  return (
    <div className="relative flex h-full w-full flex-col justify-center items-center bg-dragon-bg px-4 sm:px-8 py-10 select-none overflow-y-auto">
      {/* Background Subtle Tech Grid Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2315_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2315_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header Central */}
      <div className="relative z-10 text-center max-w-2xl mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 border border-dragon-border px-3 py-1 font-mono text-xs text-zinc-400 bg-dragon-panel/40 mb-4 tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-dragon-ember animate-pulse" />
          <span>Portal de Acceso</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 uppercase">
          FURIA DE DRAGONES
        </h1>

        <p className="mt-3 font-sans text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Selecciona tu login para acceder al contenido.
        </p>
      </div>

      {/* Opciones de Acceso: 2 Grandes y Estilizadas */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* 01. ENTRAR COMO MIEMBRO */}
        <button
          type="button"
          onClick={onEnterMember}
          className="group relative flex flex-col justify-between p-8 sm:p-10 text-left bg-[#09090c] border border-dragon-border hover:border-zinc-400 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer overflow-hidden"
        >
          {/* Acento lateral en hover */}
          <div className="absolute top-0 left-0 h-full w-1 bg-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase group-hover:text-zinc-400 transition-colors">
                01_Acceso_Miembro
              </span>
              <div className="h-10 w-10 border border-dragon-border flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 group-hover:border-zinc-400 group-hover:scale-105 transition-all duration-300">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-100 uppercase tracking-wider group-hover:text-white transition-colors duration-200">
              ENTRAR COMO MIEMBRO
            </h2>

            <p className="mt-3 font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-200">
              Acceso al catálogo de builds, visualización del roster y calendario de actividades.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-dragon-border/60 flex items-center justify-between font-mono text-xs tracking-wider text-zinc-400 group-hover:text-zinc-200 transition-colors duration-200">
            <span className="flex items-center gap-1 text-zinc-300 group-hover:translate-x-1.5 transition-transform duration-200">
              CONTINUAR <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </button>

        {/* 02. ENTRAR COMO SINDICATO */}
        <button
          type="button"
          onClick={onEnterSindicato}
          className="group relative flex flex-col justify-between p-8 sm:p-10 text-left bg-[#09090c] border border-dragon-border hover:border-dragon-ember hover:shadow-[0_0_30px_rgba(255,102,0,0.18)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer overflow-hidden"
        >
          {/* Acento lateral en hover */}
          <div className="absolute top-0 left-0 h-full w-1 bg-dragon-ember opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-dragon-ember tracking-widest uppercase">
                02_Acceso_Sindicato
              </span>
              <div className="h-10 w-10 border border-dragon-ember/40 bg-dragon-ember/5 flex items-center justify-center text-dragon-ember group-hover:border-dragon-ember group-hover:scale-105 transition-all duration-300">
                <Shield className="h-5 w-5" />
              </div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-100 uppercase tracking-wider group-hover:text-dragon-ember transition-colors duration-200">
              ENTRAR COMO SINDICATO
            </h2>

            <p className="mt-3 font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-200">
              Acceso al creador y editor de builds, gestión del roster y calendario de actividades.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-dragon-border/60 flex items-center justify-between font-mono text-xs tracking-wider text-dragon-ember group-hover:text-dragon-ember transition-colors duration-200">
            <span className="flex items-center gap-1 text-dragon-ember group-hover:translate-x-1.5 transition-transform duration-200 font-bold">
              ACCEDER <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </button>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-10 font-mono text-[11px] text-zinc-600 tracking-wider">
        <span>SECURITY: Protegido por Firebase auth</span>
      </div>
    </div>
  );
}
