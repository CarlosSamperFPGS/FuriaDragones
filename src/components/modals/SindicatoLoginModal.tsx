"use client";

import React, { useState } from "react";

interface SindicatoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SindicatoLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: SindicatoLoginModalProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleAuthorizeSindicato = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passwordInput.trim() || isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordInput("");
        setLoginError(false);
        onSuccess();
      } else {
        setLoginError(true);
      }
    } catch {
      setLoginError(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-200">
      <div className="bg-dragon-bg border border-dragon-border w-88 max-w-sm p-6 select-none shadow-2xl transition-all duration-200 scale-100">
        <h3 className="font-display text-base font-bold tracking-wider text-zinc-100 uppercase mb-1">
          AUTENTICACIÓN SINDICATO
        </h3>
        <p className="font-mono text-[11px] text-zinc-500 mb-4">
          INTRODUCE LA CLAVE OPERATIVA DE OFICIAL
        </p>

        <form onSubmit={handleAuthorizeSindicato}>
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
              onClick={onClose}
              className="px-3 py-1.5 border border-dragon-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`px-3 py-1.5 border border-dragon-ember text-dragon-ember font-bold hover:bg-dragon-ember hover:text-black transition-colors uppercase ${
                isLoggingIn ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoggingIn ? "VERIFICANDO..." : "AUTORIZAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
