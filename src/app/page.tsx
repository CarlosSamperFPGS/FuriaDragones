"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GatewayView } from "@/components/views/GatewayView";
import { GremioView } from "@/components/views/GremioView";
import { RosterView } from "@/components/views/RosterView";
import { ContenidosView } from "@/components/views/ContenidosView";

export default function Home() {
  const [currentView, setCurrentView] = useState<"gateway" | "gremio">("gateway");
  const [isSindicatoAuth, setIsSindicatoAuth] = useState(false);
  const [sindicatoTab, setSindicatoTab] = useState<"builds" | "roster" | "contenidos">("builds");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const handleOpenLogin = () => {
    setPasswordInput("");
    setLoginError(false);
    setShowLoginModal(true);
  };

  const handleAuthorize = () => {
    if (passwordInput === "furiadragones2026") {
      setIsSindicatoAuth(true);
      setCurrentView("gremio");
      setSindicatoTab("builds");
      setShowLoginModal(false);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  return (
    <>
      <AppShell
        onOpenSindicatoLogin={handleOpenLogin}
        onLogout={() => {
          setIsSindicatoAuth(false);
          setCurrentView("gateway");
        }}
        isSindicatoAuthenticated={isSindicatoAuth}
      >
        {isSindicatoAuth ? (
          /* ============================================================ */
          /* DASHBOARD DEL SINDICATO: PESTAÑAS TÁCTICAS SUPERIORES       */
          /* ============================================================ */
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Menú de Pestañas Superior estilo Terminal */}
            <div className="flex items-center justify-between border-b border-dragon-border bg-dragon-bg px-6 py-2.5 shrink-0 select-none z-30">
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="font-mono text-xs text-dragon-ember font-bold uppercase tracking-widest hidden md:inline">
                  // SINDICATO // DASHBOARD:
                </span>
                <nav className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSindicatoTab("builds")}
                    className={`font-mono text-sm tracking-widest px-3 py-1.5 uppercase transition-all ${
                      sindicatoTab === "builds"
                        ? "border-b-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                        : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    [ BUILDS ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setSindicatoTab("roster")}
                    className={`font-mono text-sm tracking-widest px-3 py-1.5 uppercase transition-all ${
                      sindicatoTab === "roster"
                        ? "border-b-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                        : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    [ ROSTER ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setSindicatoTab("contenidos")}
                    className={`font-mono text-sm tracking-widest px-3 py-1.5 uppercase transition-all ${
                      sindicatoTab === "contenidos"
                        ? "border-b-2 border-dragon-ember text-dragon-ember font-bold bg-dragon-panel/40"
                        : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    [ CONTENIDOS ]
                  </button>
                </nav>
              </div>

              <div className="font-mono text-xs text-zinc-500 hidden sm:flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-dragon-ember animate-pulse" />
                <span className="tracking-wider">ACCESO_SINDICATO: ACTIVO</span>
              </div>
            </div>

            {/* Vista según Pestaña Activa */}
            <div className="flex-1 h-full overflow-hidden">
              {sindicatoTab === "builds" && (
                <GremioView
                  onBack={() => {
                    setIsSindicatoAuth(false);
                    setCurrentView("gateway");
                  }}
                  isSindicatoAuthenticated={true}
                />
              )}

              {sindicatoTab === "roster" && (
                <RosterView
                  onBack={() => setSindicatoTab("builds")}
                  isSindicatoAuthenticated={true}
                />
              )}

              {sindicatoTab === "contenidos" && (
                <ContenidosView
                  onBack={() => setSindicatoTab("builds")}
                  isSindicatoAuthenticated={true}
                />
              )}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* MODO PÚBLICO / MIEMBRO (GATEWAY O CONSULTA DE BUILDS)        */
          /* ============================================================ */
          <>
            {currentView === "gateway" && (
              <GatewayView onSelectGremio={() => setCurrentView("gremio")} />
            )}

            {currentView === "gremio" && (
              <GremioView
                onBack={() => setCurrentView("gateway")}
                isSindicatoAuthenticated={false}
              />
            )}
          </>
        )}
      </AppShell>

      {/* Modal Integrado de Login Sindicato (Anti-Cards, Matte) */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dragon-bg border border-dragon-border w-80 p-6 select-none shadow-none">
            <h3 className="font-display text-base font-bold tracking-wider text-zinc-100 uppercase mb-2">
              AUTENTICACIÓN SINDICATO
            </h3>
            <p className="font-mono text-[11px] text-zinc-500 mb-4">
              // INTRODUCE LA CLAVE OPERATIVA ROOT
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuthorize();
              }}
            >
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError(false);
                }}
                placeholder="CLAVE_DE_ACCESO"
                autoFocus
                className="w-full bg-dragon-panel border border-dragon-border px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-dragon-ember transition-colors"
              />

              {loginError && (
                <div className="mt-2 font-mono text-[11px] text-dragon-crimson tracking-wider">
                  &gt; ERROR: CLAVE NO AUTORIZADA
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-1.5 border border-dragon-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 border border-dragon-ember text-dragon-ember font-bold hover:bg-dragon-ember hover:text-black transition-colors"
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
