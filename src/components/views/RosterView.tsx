"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getRosterMembers,
  saveRosterMember,
  deleteRosterMember,
  bulkSaveRosterMembers,
  type RosterMember,
} from "@/lib/firebase-sync";
import { Search, ShieldAlert, Check, Pencil, Trash2 } from "lucide-react";

// Variable de configuración: introduce aquí el ID de hermandad de Furia de Dragones en Albion Online
export const ALBION_GUILD_ID: string = "UUdmeQLuQ8upNFtQBl0YPQ";

interface RosterViewProps {
  onBack?: () => void;
  isSindicatoAuthenticated?: boolean;
}

const ROSTER_STATUSES = [
  "Lider",
  "Sindicato",
  "Veterano",
  "Miembro Oficial",
  "Miembro",
  "Nuevo",
] as const;

const ROLES_DISPONIBLES = [
  "Clapper",
  "Healer",
  "Stoper",
  "DPS",
  "Pierce",
  "Support",
];

// Jerarquía estricta de importancia de roles tácticos
const ROLE_IMPORTANCE: Record<string, number> = {
  CLAPPER: 1,
  HEALER: 2,
  STOPER: 3,
  TANK: 3,
  DPS: 4,
  PIERCE: 5,
  SUPPORT: 6,
};

// Jerarquía de rango para desempate
const STATUS_IMPORTANCE: Record<string, number> = {
  Lider: 1,
  Sindicato: 2,
  Veterano: 3,
  "Miembro Oficial": 4,
  Miembro: 5,
  Nuevo: 6,
};

const getMemberRoleImportance = (roles?: string[]): number => {
  if (!roles || roles.length === 0) return 999;
  let minRank = 999;
  for (const r of roles) {
    const rUpper = r.trim().toUpperCase();
    for (const [key, rank] of Object.entries(ROLE_IMPORTANCE)) {
      if (rUpper.includes(key) && rank < minRank) {
        minRank = rank;
      }
    }
  }
  return minRank;
};

const ESTADOS_ACTIVIDAD = ["Activo", "Inactivo", "Ausente"] as const;

export function RosterView({
  onBack,
  isSindicatoAuthenticated = true,
}: RosterViewProps) {
  const [members, setMembers] = useState<RosterMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subTab, setSubTab] = useState<"list" | "register">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [roleFilter, setRoleFilter] = useState<string>("TODOS");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formIgn, setFormIgn] = useState("");
  const [formStatus, setFormStatus] = useState<RosterMember["status"]>("Nuevo");
  const [formRoles, setFormRoles] = useState<string[]>(["DPS"]);
  const [formEstadoActividad, setFormEstadoActividad] =
    useState<RosterMember["estadoActividad"]>("Activo");
  const [formAvisos, setFormAvisos] = useState<number>(0);
  const [formNotas, setFormNotas] = useState("");

  // Estado para la sincronización con Albion Online API
  const [isSyncingAlbion, setIsSyncingAlbion] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Auto-desvanecer la notificación tras 6 segundos
  useEffect(() => {
    if (!syncNotification) return;
    const timer = setTimeout(() => {
      setSyncNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [syncNotification]);

  // Modal de Confirmar Eliminación
  const [deleteModal, setDeleteModal] = useState<{ id: string; ign: string } | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getRosterMembers();
      setMembers(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Función asíncrona de sincronización con la API de Albion Online
  const handleSyncAlbion = async () => {
    if (isSyncingAlbion) return;

    if (!ALBION_GUILD_ID || ALBION_GUILD_ID === "TU_GUILD_ID") {
      setSyncNotification(
        "// AVISO: Introduce tu GUILD_ID de Albion en RosterView.tsx (línea 16) para sincronizar con Furia de Dragones."
      );
      return;
    }

    setIsSyncingAlbion(true);
    setSyncNotification(null);

    try {
      let albionMembers: any[] = [];

      // 1. Intentar mediante la Next.js API Route interna para evitar CORS
      try {
        const res = await fetch(
          `/api/albion/sync?guildId=${encodeURIComponent(ALBION_GUILD_ID)}`
        );
        if (res.ok) {
          albionMembers = await res.json();
        } else {
          throw new Error("API Route respondió con error, intentando fuentes directas...");
        }
      } catch (innerErr) {
        // Fallback 1: Servidor oficial de Albion en Europa (Amsterdam)
        const europeUrl = `https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/${ALBION_GUILD_ID}/members`;
        try {
          const directRes = await fetch(europeUrl);
          if (directRes.ok) {
            albionMembers = await directRes.json();
          } else {
            throw new Error("Error en fetch directo");
          }
        } catch {
          // Fallback 2: Proxy anti-CORS allorigins
          try {
            const proxyRes = await fetch(
              `https://api.allorigins.win/raw?url=${encodeURIComponent(europeUrl)}`
            );
            if (proxyRes.ok) {
              albionMembers = await proxyRes.json();
            } else {
              throw new Error("Error en proxy 1");
            }
          } catch {
            // Fallback 3: Proxy anti-CORS corsproxy.io
            const proxyRes2 = await fetch(
              `https://corsproxy.io/?url=${encodeURIComponent(europeUrl)}`
            );
            if (proxyRes2.ok) {
              albionMembers = await proxyRes2.json();
            } else {
              throw new Error("No se pudo contactar con la API de Albion Online en Europa.");
            }
          }
        }
      }

      if (!Array.isArray(albionMembers)) {
        throw new Error("Respuesta inesperada de la API de Albion (formato no válido)");
      }

      // 2. Fusión de datos con Firebase (solo miembros nuevos por IGN)
      const existingIgns = new Set(
        members.map((m) => m.ign.trim().toLowerCase())
      );
      const newMembersToInsert: RosterMember[] = [];

      for (const item of albionMembers) {
        const playerName = (
          item.Name ||
          item.name ||
          item.PlayerName ||
          item.ign ||
          ""
        ).trim();

        if (playerName && !existingIgns.has(playerName.toLowerCase())) {
          existingIgns.add(playerName.toLowerCase());
          newMembersToInsert.push({
            id: `m_albion_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            ign: playerName,
            nombre: playerName,
            status: "Nuevo",
            roles: [],
            estadoActividad: "Activo",
            avisos: 0,
            notas: "Importado vía API",
          });
        }
      }

      // 3. Subir a Firestore y actualizar estado
      if (newMembersToInsert.length > 0) {
        await bulkSaveRosterMembers(newMembersToInsert);
        setMembers((prev) => [...newMembersToInsert, ...prev]);
        setSyncNotification(
          `// SYNC COMPLETADA: ${newMembersToInsert.length} miembros nuevos añadidos.`
        );
      } else {
        setSyncNotification(
          "// SYNC COMPLETADA: El Roster ya está al día. 0 miembros nuevos añadidos."
        );
      }
    } catch (error: any) {
      console.warn("[AlbionSync] Error durante la sincronización:", error);
      setSyncNotification(
        `// ERROR EN SYNC: ${error?.message || "No se pudo conectar con la API de Albion Online."}`
      );
    } finally {
      setIsSyncingAlbion(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormNombre("");
    setFormIgn("");
    setFormStatus("Nuevo");
    setFormRoles(["DPS"]);
    setFormEstadoActividad("Activo");
    setFormAvisos(0);
    setFormNotas("");
  };

  const handleEditMember = (m: RosterMember) => {
    setEditingId(m.id);
    setFormNombre(m.nombre || "");
    setFormIgn(m.ign || "");
    setFormStatus(m.status || "Nuevo");
    setFormRoles(m.roles || ["DPS"]);
    setFormEstadoActividad(m.estadoActividad || "Activo");
    setFormAvisos(typeof m.avisos === "number" ? m.avisos : 0);
    setFormNotas(m.notas || "");
    setSubTab("register");
  };

  const handleSubmitMember = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    const ignClean = formIgn.trim();
    if (!ignClean) return;

    const newMember: RosterMember = {
      id: editingId || `m_${Date.now()}`,
      nombre: formNombre.trim() || ignClean,
      ign: ignClean,
      status: formStatus,
      roles: formRoles.length > 0 ? formRoles : ["DPS"],
      estadoActividad: formEstadoActividad,
      avisos: Number(formAvisos) || 0,
      notas: formNotas.trim(),
    };

    if (editingId) {
      setMembers((prev) => prev.map((m) => (m.id === editingId ? newMember : m)));
    } else {
      setMembers((prev) => [newMember, ...prev]);
    }

    await saveRosterMember(newMember);
    resetForm();
    setSubTab("list");
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    const { id } = deleteModal;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    await deleteRosterMember(id);
    setDeleteModal(null);
  };

  const toggleRole = (r: string) => {
    if (formRoles.includes(r)) {
      setFormRoles(formRoles.filter((item) => item !== r));
    } else {
      setFormRoles([...formRoles, r]);
    }
  };

  // Ajuste rápido de avisos mediante click directo con persistencia
  const handleQuickAvisos = async (
    member: RosterMember,
    delta: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const newAvisos = Math.max(0, (member.avisos || 0) + delta);
    const updatedMember: RosterMember = { ...member, avisos: newAvisos };

    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? updatedMember : m))
    );

    await saveRosterMember(updatedMember);
  };

  // Cálculo de strikes para el formulario
  const formStrikes = Math.floor(formAvisos / 3);
  const formAvisosRestantes = formAvisos % 3;
  const formIsExpulsion = formStrikes >= 3;

  // Filtrado y Ordenación Automática de Miembros por Importancia de Rol
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const matchSearch =
          m.ign.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.nombre && m.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchSearch) return false;

        if (statusFilter !== "TODOS" && m.status !== statusFilter) return false;
        if (roleFilter !== "TODOS" && !(m.roles || []).includes(roleFilter))
          return false;

        return true;
      })
      .sort((a, b) => {
        // 1. Prioridad principal: Rango / Status (Líder > Sindicato > Veterano > Miembro Oficial > Miembro > Nuevo)
        const statusRankA = STATUS_IMPORTANCE[a.status] || 99;
        const statusRankB = STATUS_IMPORTANCE[b.status] || 99;
        if (statusRankA !== statusRankB) {
          return statusRankA - statusRankB;
        }

        // 2. Desempate secundario: Importancia de rol táctico
        const roleRankA = getMemberRoleImportance(a.roles);
        const roleRankB = getMemberRoleImportance(b.roles);
        if (roleRankA !== roleRankB) {
          return roleRankA - roleRankB;
        }

        // 3. Desempate alfabético por IGN
        return a.ign.localeCompare(b.ign, undefined, { sensitivity: "base" });
      });
  }, [members, searchQuery, statusFilter, roleFilter]);

  const getStatusColor = (st: string) => {
    switch (st) {
      case "Lider":
        return "text-amber-400 border-amber-500/40 bg-amber-500/10";
      case "Sindicato":
        return "text-dragon-ember border-dragon-ember/50 bg-dragon-ember/10";
      case "Veterano":
        return "text-purple-400 border-purple-500/40 bg-purple-500/10";
      case "Miembro Oficial":
        return "text-sky-400 border-sky-500/40 bg-sky-500/10";
      case "Nuevo":
        return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
      default:
        return "text-zinc-300 border-zinc-700 bg-zinc-800/30";
    }
  };

  const getActivityColor = (act: string) => {
    switch (act) {
      case "Activo":
        return "bg-emerald-500";
      case "Ausente":
        return "bg-amber-500";
      default:
        return "bg-zinc-600";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-dragon-bg select-none">
      {/* Barra Superior Táctica Alineada */}
      <div className="flex items-center justify-between border-b border-dragon-border bg-dragon-bg px-6 py-3 shrink-0">
        <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
          <span className="text-dragon-ember font-bold">&gt;</span>
          <span className="tracking-widest">
            {subTab === "list" ? (
              <span className="uppercase">EXPEDIENTES // ROSTER OFICIAL</span>
            ) : editingId ? (
              <>
                <span className="uppercase">EDITANDO EXPEDIENTE: </span>
                <span className="text-zinc-200 font-bold">{formIgn || "MIEMBRO"}</span>
              </>
            ) : (
              <span className="uppercase">REGISTRO DE NUEVO MIEMBRO</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-1 text-zinc-500">
            <span>ROSTER:</span>
            <span className="text-dragon-ember font-semibold">
              [{members.length}]
            </span>
          </div>

          {isSindicatoAuthenticated && subTab === "list" && (
            <div className="flex items-center gap-2">
              {/* Botón de Sincronización con Albion Online API */}
              <button
                type="button"
                onClick={handleSyncAlbion}
                disabled={isSyncingAlbion}
                className="px-3.5 py-1.5 border border-cyan-700 text-cyan-500 hover:bg-cyan-950/30 hover:border-cyan-500 font-mono text-xs uppercase tracking-wider font-bold transition-colors shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                title="Sincronizar miembros desde Albion Online (Servidor Europa)"
              >
                {isSyncingAlbion ? "SINCRONIZANDO..." : "SYNC MIEMBROS"}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSubTab("register");
                }}
                className="px-4 py-1.5 border border-dragon-ember text-dragon-ember hover:bg-dragon-ember hover:text-black font-mono text-xs uppercase tracking-wider font-bold transition-colors shrink-0"
              >
                + REGISTRAR MIEMBRO
              </button>
            </div>
          )}

          {subTab === "register" && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setSubTab("list");
              }}
              className="px-3 py-1 border border-zinc-700 text-zinc-400 hover:text-white transition-colors uppercase"
            >
              ← VOLVER
            </button>
          )}
        </div>
      </div>

      {/* Feedback de Sincronización Integrado en el Layout (Sin alert()) */}
      {syncNotification && (
        <div className="flex items-center justify-between px-6 py-2.5 bg-cyan-950/50 border-b border-cyan-800/70 font-mono text-xs text-cyan-400 shrink-0 shadow-lg">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="truncate">{syncNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncNotification(null)}
            className="text-cyan-600 hover:text-cyan-300 ml-4 font-bold text-sm px-1.5 transition-colors"
            title="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto">
        {subTab === "list" ? (
          /* ============================================================ */
          /* VISTA: VER MIEMBROS (DATA ROWS HORIZONTALES ANTI-CARDS)     */
          /* ============================================================ */
          <div className="p-6 max-w-6xl mx-auto flex flex-col space-y-4">
            {/* Barra de Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-dragon-border pb-4">
              <div className="flex items-center gap-2 bg-dragon-panel border border-dragon-border px-3 py-1.5 flex-1 max-w-md">
                <Search className="h-4 w-4 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por IGN o nombre del miembro en el roster..."
                  className="w-full bg-transparent font-mono text-xs text-zinc-200 outline-none placeholder-zinc-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-dragon-panel border border-dragon-border text-zinc-300 font-mono text-xs px-2.5 py-1.5 focus:border-dragon-ember outline-none"
                >
                  <option value="TODOS">TODOS LOS STATUS</option>
                  {ROSTER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-dragon-panel border border-dragon-border text-zinc-300 font-mono text-xs px-2.5 py-1.5 focus:border-dragon-ember outline-none"
                >
                  <option value="TODOS">TODOS LOS ROLES</option>
                  {ROLES_DISPONIBLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listado de Miembros */}
            {isLoading ? (
              <div className="py-20 text-center font-mono text-xs text-zinc-500 animate-pulse">
                &gt; CARGANDO EXPEDIENTES DEL ROSTER...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-20 text-center font-mono text-xs text-zinc-600">
                &gt; NO SE ENCONTRARON MIEMBROS PARA EL CRITERIO SELECCIONADO
              </div>
            ) : (
              <div className="divide-y divide-dragon-border border border-dragon-border bg-[#08080a]">
                {/* Header de la Tabla: Nombre, Rango, Roles, Avisos, y Acciones */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-zinc-950 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  <div className={isSindicatoAuthenticated ? "col-span-4 sm:col-span-3" : "col-span-5 sm:col-span-4"}>
                    NOMBRE
                  </div>
                  <div className={isSindicatoAuthenticated ? "col-span-3 sm:col-span-2" : "col-span-3 sm:col-span-3"}>
                    RANGO
                  </div>
                  <div className="hidden sm:block col-span-3">
                    ROLES
                  </div>
                  <div className={isSindicatoAuthenticated ? "col-span-3 sm:col-span-2" : "col-span-4 sm:col-span-2"}>
                    AVISOS
                  </div>
                  {isSindicatoAuthenticated && (
                    <div className="col-span-2 text-right">ACCIONES</div>
                  )}
                </div>

                {/* Filas */}
                {filteredMembers.map((m) => {
                  const strikes = Math.floor((m.avisos || 0) / 3);
                  const isExpulsion = strikes >= 3;

                  return (
                    <div
                      key={m.id}
                      className="group grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-dragon-panel/30 transition-colors font-mono"
                    >
                      {/* Nombre: IGN & Nombre */}
                      <div className={`${isSindicatoAuthenticated ? "col-span-4 sm:col-span-3" : "col-span-5 sm:col-span-4"} flex items-center gap-2.5 min-w-0`}>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${getActivityColor(
                            m.estadoActividad
                          )}`}
                          title={`Estado: ${m.estadoActividad}`}
                        />
                        <div className="min-w-0">
                          <div className="font-display text-sm sm:text-base text-zinc-100 font-bold truncate">
                            {m.ign}
                          </div>
                          {m.nombre && m.nombre !== m.ign && (
                            <div className="text-[11px] text-zinc-500 truncate">
                              ({m.nombre})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rango */}
                      <div className={isSindicatoAuthenticated ? "col-span-3 sm:col-span-2" : "col-span-3 sm:col-span-3"}>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider border rounded-none ${getStatusColor(
                            m.status
                          )}`}
                        >
                          {m.status}
                        </span>
                      </div>

                      {/* Roles */}
                      <div className="hidden sm:flex col-span-3 items-center gap-1.5 flex-wrap">
                        {(m.roles || []).map((r) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.5 text-[10px] text-zinc-300 bg-zinc-900 border border-zinc-800"
                          >
                            {r}
                          </span>
                        ))}
                      </div>

                      {/* Avisos / Strikes (Interactivos mediante Click para Sindicato) */}
                      <div className={`${isSindicatoAuthenticated ? "col-span-3 sm:col-span-2" : "col-span-4 sm:col-span-2"} flex flex-col justify-center`}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div
                            onClick={(e) => {
                              if (isSindicatoAuthenticated) {
                                handleQuickAvisos(m, 1, e);
                              }
                            }}
                            className={`flex items-center gap-1.5 py-0.5 px-1.5 -ml-1.5 rounded transition-all ${
                              isSindicatoAuthenticated
                                ? "cursor-pointer hover:bg-zinc-800/80 hover:ring-1 hover:ring-dragon-ember/50 active:scale-95"
                                : ""
                            }`}
                            title={
                              isSindicatoAuthenticated
                                ? "Click para sumar +1 aviso directo a este miembro"
                                : undefined
                            }
                          >
                            {[1, 2, 3].map((st) => (
                              <span
                                key={st}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                  strikes >= st
                                    ? "bg-dragon-crimson shadow-[0_0_6px_rgba(220,38,38,0.8)]"
                                    : "border border-zinc-700 bg-zinc-900"
                                }`}
                                title={`Strike ${st}`}
                              />
                            ))}
                            <span className="text-[11px] text-zinc-300 font-semibold ml-0.5">
                              {m.avisos || 0} Av.
                            </span>
                          </div>

                          {/* Controles rápidos de +/- con hover en la fila (Solo Sindicato) */}
                          {isSindicatoAuthenticated && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                              <button
                                type="button"
                                onClick={(e) => handleQuickAvisos(m, -1, e)}
                                disabled={!m.avisos}
                                className="w-5 h-5 flex items-center justify-center text-[11px] border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                title="Restar 1 aviso"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleQuickAvisos(m, 1, e)}
                                className="w-5 h-5 flex items-center justify-center text-[11px] border border-dragon-ember/50 bg-dragon-ember/10 text-dragon-ember hover:bg-dragon-ember hover:text-black font-bold transition-colors"
                                title="Sumar 1 aviso"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                        {isExpulsion && (
                          <span className="text-[9px] text-dragon-crimson font-bold tracking-wider uppercase mt-0.5 animate-pulse">
                            [ EXPULSIÓN ]
                          </span>
                        )}
                      </div>

                      {/* Acciones: Ocultas por defecto, visibles al hacer hover (SOLO SINDICATO) */}
                      {isSindicatoAuthenticated && (
                        <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEditMember(m)}
                            className="p-1.5 text-zinc-400 hover:text-dragon-ember hover:bg-zinc-800 transition-colors"
                            title="Editar expediente"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ id: m.id, ign: m.ign })}
                            className="p-1.5 text-zinc-400 hover:text-dragon-crimson hover:bg-zinc-800 transition-colors"
                            title="Eliminar del roster"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* FORMULARIO: REGISTRAR / EDITAR MIEMBRO (ANTI-CARDS MATTE)    */
          /* ============================================================ */
          <div className="p-6 max-w-3xl mx-auto">
            <div className="border border-dragon-border bg-[#08080a] p-6 sm:p-8">
              <div className="border-b border-dragon-border pb-3 mb-6 flex items-center justify-between">
                <span className="font-mono text-xs text-dragon-ember font-bold tracking-widest uppercase">
                  {editingId
                    ? `// EDITAR EXPEDIENTE: ${formIgn || "MIEMBRO"}`
                    : "// REGISTRAR NUEVO MIEMBRO EN EL ROSTER"}
                </span>
                <button
                  type="button"
                  onClick={() => setSubTab("list")}
                  className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
                >
                  VOLVER AL LISTADO
                </button>
              </div>

              <form onSubmit={handleSubmitMember} className="space-y-5 font-mono text-xs">
                {/* Nombre y IGN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">
                      IGN: *
                    </label>
                    <input
                      type="text"
                      required
                      value={formIgn}
                      onChange={(e) => setFormIgn(e.target.value)}
                      placeholder="Nombre del miembro en Albion (IGN, ej. ViperDragon)"
                      className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 p-2.5 focus:border-dragon-ember outline-none placeholder-zinc-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">
                      NOMBRE / APODO:
                    </label>
                    <input
                      type="text"
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      placeholder="Nombre real o apodo de Discord del miembro (ej. Carlos / Alex)"
                      className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 p-2.5 focus:border-dragon-ember outline-none placeholder-zinc-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Status y Estado Actividad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">
                      RANGO:
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) =>
                        setFormStatus(e.target.value as RosterMember["status"])
                      }
                      className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 p-2.5 focus:border-dragon-ember outline-none"
                    >
                      {ROSTER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">
                      ESTADO DE ACTIVIDAD:
                    </label>
                    <select
                      value={formEstadoActividad}
                      onChange={(e) =>
                        setFormEstadoActividad(
                          e.target.value as RosterMember["estadoActividad"]
                        )
                      }
                      className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 p-2.5 focus:border-dragon-ember outline-none"
                    >
                      {ESTADOS_ACTIVIDAD.map((ea) => (
                        <option key={ea} value={ea}>
                          {ea}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Roles Tácticos (Checkboxes Estilizados) */}
                <div>
                  <label className="block text-zinc-400 uppercase mb-2">
                    ROLES ASIGNADOS:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ROLES_DISPONIBLES.map((r) => {
                      const isChecked = formRoles.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleRole(r)}
                          className={`flex items-center justify-between px-3 py-2 border transition-all text-left ${isChecked
                            ? "border-dragon-ember text-dragon-ember bg-dragon-panel"
                            : "border-dragon-border text-zinc-400 bg-zinc-950/60 hover:border-zinc-600"
                            }`}
                        >
                          <span className="uppercase tracking-wider text-xs">
                            {r}
                          </span>
                          {isChecked && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Avisos y Strikes Interactivos (Click Directo en los Avisos) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-zinc-400 uppercase font-mono text-xs">
                      AVISOS DISCIPLINARIOS (CLICK DIRECTO):
                    </label>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setFormAvisos((prev) => Math.max(0, prev - 1))}
                        disabled={formAvisos === 0}
                        className="px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Restar 1 aviso"
                      >
                        -1 AVISO
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormAvisos((prev) => prev + 1)}
                        className="px-2 py-0.5 border border-dragon-ember/60 bg-dragon-ember/10 text-dragon-ember hover:bg-dragon-ember hover:text-black font-bold transition-colors"
                        title="Sumar 1 aviso"
                      >
                        +1 AVISO
                      </button>
                      {formAvisos > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormAvisos(0)}
                          className="px-2 py-0.5 border border-zinc-800 text-zinc-500 hover:text-dragon-crimson hover:border-dragon-crimson/50 transition-colors"
                          title="Limpiar todos los avisos"
                        >
                          RESET
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Panel de 3 Strikes con Avisos Clicables */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* STRIKE 1: Avisos 1, 2, 3 */}
                    <div
                      className={`p-3 border transition-all ${
                        formStrikes >= 1
                          ? "border-amber-500/60 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                          : "border-dragon-border bg-dragon-panel/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 font-mono text-[11px]">
                        <span className={formStrikes >= 1 ? "text-amber-400 font-bold" : "text-zinc-400"}>
                          STRIKE 1
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {Math.min(3, formAvisos)} / 3
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[1, 2, 3].map((avisoNum) => {
                          const isActive = formAvisos >= avisoNum;
                          return (
                            <button
                              key={avisoNum}
                              type="button"
                              onClick={() => {
                                if (formAvisos === avisoNum) {
                                  setFormAvisos(avisoNum - 1);
                                } else {
                                  setFormAvisos(avisoNum);
                                }
                              }}
                              className={`h-10 flex flex-col items-center justify-center border font-mono text-xs transition-all cursor-pointer select-none ${
                                isActive
                                  ? "border-amber-500 bg-amber-500/30 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)] scale-[1.03]"
                                  : "border-zinc-800 bg-zinc-950/80 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300 active:scale-95"
                              }`}
                              title={`Aviso ${avisoNum} (Click para alternar)`}
                            >
                              <span className="text-[10px] opacity-70">AVISO</span>
                              <span className="text-sm font-bold">{avisoNum}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* STRIKE 2: Avisos 4, 5, 6 */}
                    <div
                      className={`p-3 border transition-all ${
                        formStrikes >= 2
                          ? "border-orange-500/60 bg-orange-500/10 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                          : "border-dragon-border bg-dragon-panel/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 font-mono text-[11px]">
                        <span className={formStrikes >= 2 ? "text-orange-400 font-bold" : "text-zinc-400"}>
                          STRIKE 2
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {Math.max(0, Math.min(3, formAvisos - 3))} / 3
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[4, 5, 6].map((avisoNum) => {
                          const isActive = formAvisos >= avisoNum;
                          return (
                            <button
                              key={avisoNum}
                              type="button"
                              onClick={() => {
                                if (formAvisos === avisoNum) {
                                  setFormAvisos(avisoNum - 1);
                                } else {
                                  setFormAvisos(avisoNum);
                                }
                              }}
                              className={`h-10 flex flex-col items-center justify-center border font-mono text-xs transition-all cursor-pointer select-none ${
                                isActive
                                  ? "border-orange-500 bg-orange-500/30 text-orange-300 font-bold shadow-[0_0_10px_rgba(249,115,22,0.4)] scale-[1.03]"
                                  : "border-zinc-800 bg-zinc-950/80 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300 active:scale-95"
                              }`}
                              title={`Aviso ${avisoNum} (Click para alternar)`}
                            >
                              <span className="text-[10px] opacity-70">AVISO</span>
                              <span className="text-sm font-bold">{avisoNum}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* STRIKE 3: Avisos 7, 8, 9 (EXPULSIÓN) */}
                    <div
                      className={`p-3 border transition-all ${
                        formStrikes >= 3
                          ? "border-dragon-crimson bg-dragon-crimson/20 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                          : "border-dragon-border bg-dragon-panel/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 font-mono text-[11px]">
                        <span
                          className={
                            formStrikes >= 3
                              ? "text-dragon-crimson font-bold animate-pulse"
                              : "text-zinc-400"
                          }
                        >
                          STRIKE 3 {formStrikes >= 3 ? "// EXPULSIÓN" : ""}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {Math.max(0, Math.min(3, formAvisos - 6))} / 3
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[7, 8, 9].map((avisoNum) => {
                          const isActive = formAvisos >= avisoNum;
                          return (
                            <button
                              key={avisoNum}
                              type="button"
                              onClick={() => {
                                if (formAvisos === avisoNum) {
                                  setFormAvisos(avisoNum - 1);
                                } else {
                                  setFormAvisos(avisoNum);
                                }
                              }}
                              className={`h-10 flex flex-col items-center justify-center border font-mono text-xs transition-all cursor-pointer select-none ${
                                isActive
                                  ? "border-dragon-crimson bg-dragon-crimson/40 text-red-200 font-bold shadow-[0_0_12px_rgba(220,38,38,0.6)] scale-[1.03]"
                                  : "border-zinc-800 bg-zinc-950/80 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300 active:scale-95"
                              }`}
                              title={`Aviso ${avisoNum} (Click para alternar)`}
                            >
                              <span className="text-[10px] opacity-70">AVISO</span>
                              <span className="text-sm font-bold">{avisoNum}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Telemetría y estado en vivo */}
                  <div
                    className={`mt-3 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border ${
                      formIsExpulsion
                        ? "border-dragon-crimson bg-dragon-crimson/15 text-dragon-crimson font-bold"
                        : formStrikes > 0
                        ? "border-amber-500/40 bg-amber-500/5 text-amber-400"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>
                        {formStrikes} / 3 STRIKES ({formAvisos} aviso{formAvisos !== 1 ? "s" : ""})
                        {formIsExpulsion
                          ? " — LÍMITE ALCANZADO: EXPULSIÓN INMEDIATA"
                          : formAvisos > 0
                          ? ` — Faltan ${3 - formAvisosRestantes} aviso(s) para el siguiente Strike`
                          : " — Sin sanciones disciplinarias"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <span className="text-[10px] text-zinc-500 uppercase">AJUSTE MANUAL:</span>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={formAvisos}
                        onChange={(e) =>
                          setFormAvisos(Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="w-16 bg-zinc-900 border border-zinc-700 text-center text-zinc-200 py-1 px-1.5 text-xs focus:border-dragon-ember outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">
                    NOTAS / HISTORIAL:
                  </label>
                  <textarea
                    value={formNotas}
                    onChange={(e) => setFormNotas(e.target.value)}
                    placeholder="Notas del miembro: historial de asistencia, roles secundarios, avisos..."
                    className="w-full h-24 bg-dragon-panel border border-dragon-border text-zinc-200 p-2.5 focus:border-dragon-ember outline-none resize-none placeholder-zinc-500 transition-colors"
                  />
                </div>

                {/* Botones de Envío */}
                <div className="pt-4 border-t border-dragon-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setSubTab("list");
                    }}
                    className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase tracking-wider"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-dragon-ember hover:bg-orange-500 text-black font-bold uppercase tracking-wider transition-colors"
                  >
                    {editingId ? "GUARDAR CAMBIOS // SYNC" : "REGISTRAR MIEMBRO // SYNC"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Eliminación */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dragon-bg border border-dragon-border p-6 w-96 select-none">
            <h3 className="font-display text-base font-bold text-dragon-crimson uppercase mb-2">
              CONFIRMAR ELIMINACIÓN
            </h3>
            <p className="font-mono text-xs text-zinc-400 mb-6 leading-relaxed">
              ¿Eliminar permanentemente del roster al miembro{" "}
              <strong className="text-white">[{deleteModal.ign}]</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white uppercase"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 bg-dragon-crimson hover:bg-red-700 text-white font-bold uppercase"
              >
                ELIMINAR MIEMBRO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
