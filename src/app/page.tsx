"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GatewayView } from "@/components/views/GatewayView";
import { GremioView } from "@/components/views/GremioView";
import { RosterView } from "@/components/views/RosterView";
import { ContenidosView } from "@/components/views/ContenidosView";

export default function Home() {
  const [currentView, setCurrentView] = useState<"gateway" | "app">("gateway");
  const [isSindicatoAuth, setIsSindicatoAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"builds" | "roster" | "contenidos">("builds");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Modal Sindicato
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  // Flujo Miembro: Fade rápido a negro -> entra directo solo lectura
  const handleEnterMember = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsSindicatoAuth(false);
      setCurrentView("app");
      setActiveTab("builds");
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  // Flujo Sindicato: Abrir modal
  const handleOpenSindicatoModal = () => {
    setPasswordInput("");
    setLoginError(false);
    setShowLoginModal(true);
  };

  // Autorización Sindicato: Fade rápido a negro -> entra con privilegios
  const handleAuthorizeSindicato = () => {
    if (passwordInput === "furiadragones2026") {
      setShowLoginModal(false);
      setLoginError(false);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsSindicatoAuth(true);
        setCurrentView("app");
        setActiveTab("builds");
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
    } else {
      setLoginError(true);
    }
  };

  // Cerrar Sesión: Fundido a negro -> retorno al Gateway inicial
  const handleLogout = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsSindicatoAuth(false);
      setCurrentView("gateway");
      setActiveTab("builds");
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  return (
    <>
      <AppShell
        isInApp={currentView === "app"}
        isSindicatoAuthenticated={isSindicatoAuth}
        onLogout={handleLogout}
      >
        {/* Contenedor con animación de fundido a negro (fade-out / fade-in) */}
        <div
          className={`h-full w-full bg-dragon-bg transition-opacity duration-200 ease-in-out ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentView === "gateway" ? (
            <GatewayView
              onEnterMember={handleEnterMember}
              onEnterSindicato={handleOpenSindicatoModal}
            />
          ) : (
            /* ============================================================ */
            /* INTERFAZ PRINCIPAL CON TABS UNIVERSALES                      */
            /* ============================================================ */
            <div className="flex flex-col h-full w-full overflow-hidden">
              {/* Barra de Tabs Universales (Miembro y Sindicato) */}
              <div className="flex items-center justify-between border-b border-dragon-border bg-dragon-bg px-6 py-2 shrink-0 select-none z-30">
                <nav className="flex items-center gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("builds")}
                    className={`font-mono text-xs sm:text-sm tracking-widest px-4 py-1.5 uppercase transition-all ${
                      activeTab === "builds"
                        ? "border-b-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                        : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    [ BUILDS ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("roster")}
                    className={`font-mono text-xs sm:text-sm tracking-widest px-4 py-1.5 uppercase transition-all ${
                      activeTab === "roster"
                        ? "border-b-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                        : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    [ ROSTER ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("contenidos")}
                    className={`font-mono text-xs sm:text-sm tracking-widest px-4 py-1.5 uppercase transition-all ${
                      activeTab === "contenidos"
                        ? "border-b-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                        : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    [ CONTENIDOS ]
                  </button>
                </nav>

                <div className="font-mono text-xs text-zinc-500 hidden md:flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSindicatoAuth ? "bg-dragon-ember animate-pulse" : "bg-zinc-600"
                    }`}
                  />
                  <span className="tracking-wider">
                    {isSindicatoAuth ? "MODO OPERATIVO: PRIVILEGIADO" : "MODO CONSULTA: SOLO-LECTURA"}
                  </span>
                </div>
              </div>

              {/* Vistas Persistentes según Pestaña (No se desmontan al cambiar de tab) */}
              <div className="relative flex-1 h-full overflow-hidden">
                <div
                  className={`h-full w-full transition-opacity duration-200 ${
                    activeTab === "builds" ? "block opacity-100" : "hidden opacity-0 pointer-events-none"
                  }`}
                >
                  <GremioView
                    onBack={handleLogout}
                    isSindicatoAuthenticated={isSindicatoAuth}
                  />
                </div>

                <div
                  className={`h-full w-full transition-opacity duration-200 ${
                    activeTab === "roster" ? "block opacity-100" : "hidden opacity-0 pointer-events-none"
                  }`}
                >
                  <RosterView
                    onBack={() => setActiveTab("builds")}
                    isSindicatoAuthenticated={isSindicatoAuth}
                  />
                </div>

                <div
                  className={`h-full w-full transition-opacity duration-200 ${
                    activeTab === "contenidos" ? "block opacity-100" : "hidden opacity-0 pointer-events-none"
                  }`}
                >
                  <ContenidosView
                    onBack={() => setActiveTab("builds")}
                    isSindicatoAuthenticated={isSindicatoAuth}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>

      {/* Modal Integrado de Autenticación Sindicato */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-200">
          <div className="bg-dragon-bg border border-dragon-border w-88 max-w-sm p-6 select-none shadow-2xl transition-all duration-200 scale-100">
            <h3 className="font-display text-base font-bold tracking-wider text-zinc-100 uppercase mb-1">
              AUTENTICACIÓN SINDICATO
            </h3>
            <p className="font-mono text-[11px] text-zinc-500 mb-4">
              // INTRODUCE LA CLAVE OPERATIVA DE OFICIAL
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuthorizeSindicato();
              }}
            >
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError(false);
                }}
                placeholder="Clave de acceso de oficial..."
                autoFocus
                className="w-full bg-dragon-panel border border-dragon-border px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-dragon-ember transition-colors"
              />

              {loginError && (
                <div className="mt-2 font-mono text-[11px] text-dragon-crimson tracking-wider">
                  &gt; ERROR: CLAVE INCORRECTA
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-1.5 border border-dragon-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 border border-dragon-ember text-dragon-ember font-bold hover:bg-dragon-ember hover:text-black transition-colors uppercase"
                >
                  AUTORIZAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
