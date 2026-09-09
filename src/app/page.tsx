"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GatewayView } from "@/components/views/GatewayView";
import { GremioView } from "@/components/views/GremioView";

export default function Home() {
  const [currentView, setCurrentView] = useState<"gateway" | "gremio" | "sindicato">("gateway");
  const [isSindicatoAuth, setIsSindicatoAuth] = useState(false);
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
        {currentView === "gateway" && (
          <GatewayView onSelectGremio={() => setCurrentView("gremio")} />
        )}

        {currentView === "gremio" && (
          <GremioView
            onBack={() => setCurrentView("gateway")}
            isSindicatoAuthenticated={isSindicatoAuth}
          />
        )}

        {currentView === "sindicato" && (
          <div className="flex h-full flex-col items-center justify-center font-mono text-zinc-500 gap-4">
            <div className="text-dragon-ember font-bold text-lg">[ VISTA_SINDICATO: DASHBOARD TÁCTICO ]</div>
            <button
              onClick={() => setCurrentView("gateway")}
              className="border border-dragon-border px-4 py-1.5 text-xs text-zinc-400 hover:border-dragon-crimson hover:text-white"
            >
              ← VOLVER AL GATEWAY
            </button>
          </div>
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
