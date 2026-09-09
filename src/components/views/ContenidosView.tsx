"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getGuildContents,
  saveGuildContent,
  deleteGuildContent,
  getRosterMembers,
  type GuildContent,
  type RosterMember,
} from "@/lib/firebase-sync";
import { Search, UserCheck, ChevronDown, ChevronUp, Pencil, Trash2, Check, Clock } from "lucide-react";

interface ContenidosViewProps {
  onBack?: () => void;
  isSindicatoAuthenticated?: boolean;
}

export function ContenidosView({
  onBack,
  isSindicatoAuthenticated = true,
}: ContenidosViewProps) {
  const [contents, setContents] = useState<GuildContent[]>([]);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subTab, setSubTab] = useState<"list" | "register">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formOrganizador, setFormOrganizador] = useState("");
  const [formFechaHora, setFormFechaHora] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [formAsistentes, setFormAsistentes] = useState<string[]>([]);
  const [formNotas, setFormNotas] = useState("");
  const [attendeeSearch, setAttendeeSearch] = useState("");

  // Modal de Eliminación
  const [deleteModal, setDeleteModal] = useState<{ id: string; nombre: string } | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [contentsData, rosterData] = await Promise.all([
        getGuildContents(),
        getRosterMembers(),
      ]);
      setContents(contentsData);
      setRoster(rosterData);
      if (rosterData.length > 0 && !formOrganizador) {
        setFormOrganizador(rosterData[0].ign);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormNombre("");
    setFormOrganizador(roster[0]?.ign || "");
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormFechaHora(now.toISOString().slice(0, 16));
    setFormAsistentes([]);
    setFormNotas("");
    setAttendeeSearch("");
  };

  const handleEditContent = (c: GuildContent) => {
    setEditingId(c.id);
    setFormNombre(c.nombre || "");
    setFormOrganizador(c.organizador || "");
    setFormFechaHora(c.fechaHora || "");
    setFormAsistentes(c.asistentes || []);
    setFormNotas(c.notas || "");
    setAttendeeSearch("");
    setSubTab("register");
  };

  const handleSubmitContent = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    const nombreClean = formNombre.trim();
    if (!nombreClean) return;

    const newContent: GuildContent = {
      id: editingId || `c_${Date.now()}`,
      nombre: nombreClean,
      organizador: formOrganizador.trim() || "Sindicato",
      fechaHora: formFechaHora,
      asistentes: formAsistentes,
      notas: formNotas.trim(),
    };

    if (editingId) {
      setContents((prev) => prev.map((c) => (c.id === editingId ? newContent : c)));
    } else {
      setContents((prev) => [newContent, ...prev]);
    }

    await saveGuildContent(newContent);
    resetForm();
    setSubTab("list");
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    const { id } = deleteModal;
    setContents((prev) => prev.filter((c) => c.id !== id));
    await deleteGuildContent(id);
    setDeleteModal(null);
  };

  const toggleAttendee = (ign: string) => {
    if (formAsistentes.includes(ign)) {
      setFormAsistentes(formAsistentes.filter((a) => a !== ign));
    } else {
      setFormAsistentes([...formAsistentes, ign]);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedContentId(expandedContentId === id ? null : id);
  };

  // Filtrado del buscador de asistentes en el formulario
  const filteredRosterForAttendees = useMemo(() => {
    const q = attendeeSearch.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (m) =>
        m.ign.toLowerCase().includes(q) ||
        (m.nombre && m.nombre.toLowerCase().includes(q))
    );
  }, [roster, attendeeSearch]);

  // Filtrado de contenidos en el listado
  const filteredContents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contents;
    return contents.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.organizador.toLowerCase().includes(q) ||
        (c.asistentes || []).some((a) => a.toLowerCase().includes(q))
    );
  }, [contents, searchQuery]);

  const formatDateTime = (dtStr: string) => {
    try {
      const dt = new Date(dtStr);
      if (isNaN(dt.getTime())) return dtStr;
      return dt.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).toUpperCase();
    } catch {
      return dtStr;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-dragon-bg select-none">
      {/* Barra Superior Táctica Alineada (Idéntica a Roster) */}
      <div className="flex items-center justify-between border-b border-dragon-border bg-dragon-bg px-6 py-3 shrink-0">
        <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
          <span className="text-dragon-ember font-bold">&gt;</span>
          <span className="tracking-widest uppercase">
            {subTab === "list" || !isSindicatoAuthenticated
              ? "HISTORIAL // CONTENIDOS Y CTAS"
              : editingId
                ? `EDITANDO CONTENIDO: ${formNombre || "ACTIVIDAD"}`
                : "REGISTRO DE NUEVO CONTENIDO"}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-1 text-zinc-500">
            <span>CONTENIDOS:</span>
            <span className="text-dragon-ember font-semibold">
              [{contents.length}]
            </span>
          </div>

          {/* Botón idéntico al de Roster: Borde fino naranja, texto naranja, px-4 py-1.5, SOLO SINDICATO */}
          {isSindicatoAuthenticated && subTab === "list" && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setSubTab("register");
              }}
              className="px-4 py-1.5 border border-dragon-ember text-dragon-ember hover:bg-dragon-ember hover:text-black font-mono text-xs uppercase tracking-wider font-bold transition-colors shrink-0"
            >
              + REGISTRAR CONTENIDO
            </button>
          )}

          {isSindicatoAuthenticated && subTab === "register" && (
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

      {/* Contenido Principal (Miembros solo ven listado, nunca el registro) */}
      <div className="flex-1 overflow-y-auto">
        {subTab === "list" || !isSindicatoAuthenticated ? (
          /* ============================================================ */
          /* VISTA: VER CONTENIDOS (DATA ROWS HORIZONTALES)               */
          /* ============================================================ */
          <div className="p-6 max-w-6xl mx-auto flex flex-col space-y-4">
            {/* Barra de Búsqueda */}
            <div className="flex items-center gap-2 bg-dragon-panel border border-dragon-border px-3 py-1.5 max-w-md">
              <Search className="h-4 w-4 text-zinc-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre del contenido o asistente registrado..."
                className="w-full bg-transparent font-mono text-xs text-zinc-200 outline-none placeholder-zinc-500"
              />
            </div>

            {/* Listado de Contenidos */}
            {isLoading ? (
              <div className="py-20 text-center font-mono text-xs text-zinc-500 animate-pulse">
                &gt; CARGANDO HISTORIAL DE CONTENIDOS Y CTAS...
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="py-20 text-center font-mono text-xs text-zinc-600">
                &gt; NO SE ENCONTRARON ACTIVIDADES REGISTRADAS
              </div>
            ) : (
              <div className="divide-y divide-dragon-border border border-dragon-border bg-[#08080a]">
                {/* Header de la Tabla: Nombre, Organizador, Fecha/Hora, Asistentes, y Acciones */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-zinc-950 font-mono text-[10px] text-zinc-500 uppercase tracking-widest border-b border-dragon-border">
                  <div className={isSindicatoAuthenticated ? "col-span-4 sm:col-span-3" : "col-span-5 sm:col-span-4"}>
                    NOMBRE
                  </div>
                  <div className={isSindicatoAuthenticated ? "col-span-3 sm:col-span-2" : "col-span-3 sm:col-span-3"}>
                    ORGANIZADOR
                  </div>
                  <div className={isSindicatoAuthenticated ? "col-span-3 sm:col-span-3" : "col-span-4 sm:col-span-3"}>
                    FECHA / HORA
                  </div>
                  <div className={isSindicatoAuthenticated ? "col-span-2 sm:col-span-2" : "col-span-2 sm:col-span-2"}>
                    ASISTENTES
                  </div>
                  {isSindicatoAuthenticated && (
                    <div className="col-span-2 text-right">ACCIONES</div>
                  )}
                </div>

                {filteredContents.map((c) => {
                  const isExpanded = expandedContentId === c.id;
                  const attendeeCount = (c.asistentes || []).length;

                  return (
                    <div key={c.id} className="group flex flex-col transition-colors">
                      {/* Fila Horizontal de la Actividad */}
                      <div
                        onClick={() => toggleExpand(c.id)}
                        className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-dragon-panel/30 cursor-pointer font-mono select-none"
                      >
                        {/* Nombre */}
                        <div className={`${isSindicatoAuthenticated ? "col-span-4 sm:col-span-3" : "col-span-5 sm:col-span-4"} min-w-0`}>
                          <div className="font-display text-sm sm:text-base text-zinc-100 font-bold uppercase truncate">
                            {c.nombre}
                          </div>
                        </div>

                        {/* Organizador */}
                        <div className={`${isSindicatoAuthenticated ? "col-span-3 sm:col-span-2" : "col-span-3 sm:col-span-3"} min-w-0 truncate text-xs text-dragon-ember font-semibold`}>
                          @{c.organizador}
                        </div>

                        {/* Fecha / Hora */}
                        <div className={`${isSindicatoAuthenticated ? "col-span-3 sm:col-span-3" : "col-span-4 sm:col-span-3"} min-w-0 truncate flex items-center gap-1.5 text-xs text-zinc-400`}>
                          <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{formatDateTime(c.fechaHora)}</span>
                        </div>

                        {/* Asistentes */}
                        <div className={`${isSindicatoAuthenticated ? "col-span-2 sm:col-span-2" : "col-span-2 sm:col-span-2"} flex items-center gap-2`}>
                          <span className="px-2 py-0.5 text-[10px] border border-zinc-700 bg-zinc-900 text-zinc-300">
                            {attendeeCount} ASIST.
                          </span>
                          <button type="button" className="p-1 text-zinc-500 hover:text-white">
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-dragon-ember" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Acciones: Ocultas por defecto, reveladas en hover (SOLO SINDICATO) */}
                        {isSindicatoAuthenticated && (
                          <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditContent(c);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-dragon-ember hover:bg-zinc-800 transition-colors"
                              title="Editar actividad"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModal({ id: c.id, nombre: c.nombre });
                              }}
                              className="p-1.5 text-zinc-400 hover:text-dragon-crimson hover:bg-zinc-800 transition-colors"
                              title="Eliminar actividad"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Estado Expandido: Grid Tipográfico Limpio de Asistentes */}
                      {isExpanded && (
                        <div className="border-t border-dragon-border bg-[#050507] p-5">
                          <div className="flex items-center justify-between mb-3 font-mono text-xs text-zinc-500 uppercase tracking-wider">
                            <span>
                              REGISTRO DE ASISTENCIA ({attendeeCount} MIEMBROS):
                            </span>
                          </div>

                          {attendeeCount === 0 ? (
                            <div className="font-mono text-xs text-zinc-600 py-3">
                              &gt; No se registraron asistentes para esta actividad.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 font-mono text-xs">
                              {c.asistentes.map((ign) => (
                                <div
                                  key={ign}
                                  className="flex items-center gap-2 p-2 bg-dragon-panel/60 border border-dragon-border text-zinc-300"
                                >
                                  <UserCheck className="h-3.5 w-3.5 text-dragon-ember shrink-0" />
                                  <span className="truncate uppercase font-medium">
                                    {ign}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {c.notas && (
                            <div className="mt-4 pt-3 border-t border-dragon-border/40 font-mono text-xs">
                              <span className="text-zinc-500 uppercase block mb-1">
                                NOTAS:
                              </span>
                              <p className="text-zinc-300 font-sans leading-relaxed">
                                {c.notas}
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
        ) : (
          /* ============================================================ */
          /* FORMULARIO: REGISTRAR / EDITAR CONTENIDO (ANTI-CARDS MATTE)  */
          /* ============================================================ */
          <div className="p-6 max-w-3xl mx-auto">
            <div className="border border-dragon-border bg-[#08080a] p-6 sm:p-8">
              <div className="border-b border-dragon-border pb-3 mb-6 flex items-center justify-between">
                <span className="font-mono text-xs text-dragon-ember font-bold tracking-widest uppercase">
                  {editingId
                    ? `// EDITAR ACTIVIDAD: ${formNombre || "CONTENIDO"}`
                    : "// REGISTRAR NUEVA ACTIVIDAD / CONTENIDO"}
                </span>
                <button
                  type="button"
                  onClick={() => setSubTab("list")}
                  className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
                >
                  VOLVER AL LISTADO
                </button>
              </div>

              <form onSubmit={handleSubmitContent} className="space-y-5 font-mono text-xs">
                {/* Nombre del Contenido */}
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">
                    NOMBRE DEL CONTENIDO / EVENTO: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Nombre del contenido (ej. CTA ZvZ Martlock, Raid Avaloniano T8)"
                    className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 p-2.5 focus:border-dragon-ember outline-none font-display text-sm uppercase placeholder-zinc-500 transition-colors"
                  />
                </div>

                {/* Organizador y Fecha / Hora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">
                      ORGANIZADOR:
                    </label>
                    <select
                      value={formOrganizador}
                      onChange={(e) => setFormOrganizador(e.target.value)}
                      className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 p-2.5 focus:border-dragon-ember outline-none"
                    >
                      {roster.length === 0 && (
                        <option value="Sindicato">Sindicato</option>
                      )}
                      {roster.map((m) => (
                        <option key={m.id} value={m.ign}>
                          {m.ign} ({m.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">
                      FECHA Y HORA DE OPERACIÓN:
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formFechaHora}
                      onChange={(e) => setFormFechaHora(e.target.value)}
                      className="w-full bg-dragon-panel border border-dragon-border text-zinc-200 p-2 focus:border-dragon-ember outline-none"
                    />
                  </div>
                </div>

                {/* Asistentes (Multiselect Dinámico desde Roster) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-zinc-400 uppercase">
                      ASISTENTES CONFIRMADOS ({formAsistentes.length} SELECCIONADOS):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormAsistentes(roster.map((m) => m.ign))
                        }
                        className="text-[10px] text-zinc-400 hover:text-dragon-ember underline"
                      >
                        SELECCIONAR TODOS
                      </button>
                      <span className="text-zinc-600">|</span>
                      <button
                        type="button"
                        onClick={() => setFormAsistentes([])}
                        className="text-[10px] text-zinc-400 hover:text-white underline"
                      >
                        LIMPIAR
                      </button>
                    </div>
                  </div>

                  {/* Buscador de Asistentes */}
                  <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 border border-dragon-border border-b-0">
                    <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <input
                      type="text"
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                      placeholder="Buscar nombre del miembro en el roster para marcar asistencia..."
                      className="w-full bg-transparent text-zinc-200 text-xs outline-none placeholder-zinc-500"
                    />
                  </div>

                  {/* Checkbox Grid de Miembros del Roster */}
                  <div className="border border-dragon-border bg-zinc-950/60 p-3 max-h-56 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredRosterForAttendees.length === 0 ? (
                      <div className="col-span-full py-4 text-center text-zinc-600">
                        &gt; No hay miembros coincidentes en el Roster.
                      </div>
                    ) : (
                      filteredRosterForAttendees.map((m) => {
                        const isSelected = formAsistentes.includes(m.ign);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleAttendee(m.ign)}
                            className={`flex items-center justify-between p-2 border transition-colors text-left ${isSelected
                              ? "border-dragon-ember text-dragon-ember bg-dragon-panel"
                              : "border-dragon-border text-zinc-400 bg-dragon-bg/40 hover:border-zinc-600"
                              }`}
                          >
                            <div className="min-w-0 mr-1">
                              <div className="truncate font-bold text-xs uppercase">
                                {m.ign}
                              </div>
                              <div className="text-[10px] text-zinc-500 truncate">
                                {m.status}
                              </div>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Notas Tácticas */}
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">
                    NOTAS:
                  </label>
                  <textarea
                    value={formNotas}
                    onChange={(e) => setFormNotas(e.target.value)}
                    placeholder="Notas del contenido: punto de encuentro, requisitos de tier, objetivos tácticos..."
                    className="w-full h-24 bg-dragon-panel border border-dragon-border text-zinc-200 p-2.5 focus:border-dragon-ember outline-none resize-none placeholder-zinc-500 transition-colors"
                  />
                </div>

                {/* Botones */}
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
                    {editingId ? "GUARDAR CAMBIOS // SYNC" : "REGISTRAR CONTENIDO // SYNC"}
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
              Eliminar permanentemente el registro del contenido{" "}
              <strong className="text-white uppercase">[{deleteModal.nombre}]</strong>?
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
                ELIMINAR CONTENIDO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
