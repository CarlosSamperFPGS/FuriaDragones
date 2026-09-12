"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GatewayView } from "@/components/views/GatewayView";
import { GremioView } from "@/components/views/GremioView";
import { RosterView } from "@/components/views/RosterView";
import { ContenidosView } from "@/components/views/ContenidosView";
import { SindicatoLoginModal } from "@/components/modals/SindicatoLoginModal";

export default function Home() {
  const [currentView, setCurrentView] = useState<"gateway" | "app">("gateway");
  const [isSindicatoAuth, setIsSindicatoAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"builds" | "roster" | "contenidos">("builds");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Comprobación de sesión segura persistente al cargar
  useEffect(() => {
    const verifyExistingSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.role === "sindicato") {
            setIsSindicatoAuth(true);
          }
        }
      } catch {
        // Silencioso si no hay conexión
      }
    };
    verifyExistingSession();
  }, []);

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
    setShowLoginModal(true);
  };

  // Autorización Sindicato: Callback exitoso del modal encapsulado
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setIsSindicatoAuth(true);
      setCurrentView("app");
      setActiveTab("builds");
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  // Cerrar Sesión: Limpiar cookie HttpOnly en servidor -> retorno al Gateway inicial
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignorar fallo de red
    }
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
                    BUILDS
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
                    ROSTER
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
                    CONTENIDOS
                  </button>
                </nav>
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

      {/* Modal Encapsulado de Autenticación Sindicato */}
      <SindicatoLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
