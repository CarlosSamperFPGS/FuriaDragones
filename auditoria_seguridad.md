# 🔐 Auditoría de Seguridad, Rendimiento y Código Muerto — FuriaX Web App

> **Auditado por**: Antigravity (Arquitecto Senior + SecOps)
> **Fecha**: Septiembre 2026 | **Stack**: Next.js 14, TypeScript, Firebase Firestore, Tailwind CSS

---

## Tabla de Hallazgos

| Nivel de Riesgo | Archivo | Problema | Solución Breve |
|---|---|---|---|
| 🔴 **CRÍTICO** | [`firebase.ts`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/lib/firebase.ts) | **Credenciales hardcodeadas como fallback**: `apiKey`, `appId`, `messagingSenderId` y todas las claves de Firebase tienen valores reales como fallback (`\|\| "AIzaSy..."`) en el código fuente. Si `NEXT_PUBLIC_FIREBASE_*` no está definida, el bundle de producción incluye las claves reales. Adicionalmente, `measurementId` nunca usa variable de entorno. | Eliminar TODOS los fallbacks `\|\| "valor_real"`. Si la env var no existe, debe lanzar un error explícito en build-time. Mover `measurementId` a `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`. |
| 🔴 **CRÍTICO** | [`.env.example`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/.env.example) | **Contraseña de producción real en un archivo de ejemplo**: `SINDICATO_PASSWORD=DragonesFuriososX0` y `ALBION_GUILD_ID=UUdmeQLuQ8upNFtQBl0YPQ` son valores reales, no placeholders. Este archivo está destinado a ser commiteado y expone las credenciales reales. | Reemplazar con placeholders: `SINDICATO_PASSWORD=CAMBIA_ESTO_POR_TU_CONTRASEÑA` |
| 🔴 **CRÍTICO** | [`firestore.rules`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/firestore.rules) | **Regla catch-all permite lectura pública total**: `match /{document=**} { allow read: if true; }` concede acceso de lectura a CUALQUIER colección futura o no listada. Cualquier colección de admin, logs, tokens o datos sensibles sería pública de inmediato. | Cambiar a `allow read: if false;`. Solo deben existir las reglas explícitas de las colecciones conocidas. |
| 🟠 **ALTO** | [`server-auth.ts`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/lib/server-auth.ts) | **Fallback de secretos hardcodeados**: `SINDICATO_PASSWORD \|\| "DragonesFuriososX0"` y `SESSION_SECRET \|\| "furia_dragones_super_secret..."` como fallback en el servidor. Si las env vars no están definidas en Vercel, el sistema funciona con credenciales predecibles y conocidas por cualquiera que lea el repositorio. | Lanzar `Error` si las variables no están presentes en runtime: `if (!process.env.SINDICATO_PASSWORD) throw new Error(...)` |
| 🟠 **ALTO** | [`RosterView.tsx`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/components/views/RosterView.tsx) L161-191 | **CORS proxy de terceros sin sanitización**: En los fallbacks de `handleSyncAlbion`, los datos de `api.allorigins.win` y `corsproxy.io` se parsean y guardan directamente en Firestore sin ninguna validación. Un proxy comprometido podría inyectar datos maliciosos al Roster de producción. | Eliminar los proxies de terceros. Consolidar todo en la API Route interna `/api/albion/sync` que ya existe y es segura. Si falla la API Route, mostrar error; no hacer fallback a proxies externos. |
| 🟠 **ALTO** | [`RosterView.tsx`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/components/views/RosterView.tsx) L78 | **Prop con default inseguro**: `isSindicatoAuthenticated = true` como valor por defecto del prop. Si el componente se usa sin pasar la prop (error de refactor, copy-paste), todos los controles de escritura quedan habilitados para cualquier usuario. | Cambiar a `isSindicatoAuthenticated = false` (principio de mínimo privilegio). |
| 🟠 **ALTO** | [`route.ts` (login)](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/app/api/auth/login/route.ts) L44 | **`catch (error: any)` suprime el tipo**: Usar `error: any` desactiva la protección de TypeScript. Además, el mensaje de error genérico podría enmascarar excepciones críticas sin logging. | Usar `catch (error: unknown)` + `console.error` para registrar el error real en el servidor. |
| 🟡 **MEDIO** | [`firebase.ts`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/lib/firebase.ts) L14 | **`measurementId` expuesto sin variable de entorno**: La clave de Analytics `G-NF18P320W9` está hardcodeada sin ningún fallback de env var. Aunque no es crítica, viola el principio de no commitear credenciales. | Mover a `process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`. |
| 🟡 **MEDIO** | [`RosterView.tsx`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/components/views/RosterView.tsx) L273 | **Falta sanitización de inputs en `handleSubmitMember`**: El campo `formNotas` (y `formIgn`, `formNombre`) se guarda directamente en Firestore sin sanitización. Aunque Firestore no ejecuta scripts, si estos datos se renderizan en un contexto `dangerouslySetInnerHTML` (ahora o en el futuro) existe riesgo XSS stored. | Aplicar `DOMPurify.sanitize()` o `.trim().slice(0, MAX_LEN)` antes de persistir. Los textos libres deben tener longitud máxima. |
| 🟡 **MEDIO** | [`firebase-sync.ts`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/lib/firebase-sync.ts) L63-98 | **Lógica de normalización frágil y excesiva**: El mapeo de campos (`data.nombre \|\| data.name`, `eq.mainhand?.id \|\| eq.mainhand \|\| eq.armaPrincipal...`) con múltiples cadenas de fallback indica que el schema de Firestore es inconsistente. Esto es deuda técnica que puede producir datos silenciosamente incorrectos. | Definir un schema canónico en Firestore con `converter` tipado de Firebase. Eliminar los fallbacks múltiples una vez migrados los documentos. |
| 🟡 **MEDIO** | [`server-auth.ts`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/lib/server-auth.ts) L43 | **Comparación de longitud de firma antes de `timingSafeEqual` es insuficiente**: La verificación `signature.length !== expectedSig.length` compara strings de base64url; longitudes iguales no garantizan que los buffers tengan el mismo byteLength. Aunque `timingSafeEqual` ya lanza si difieren en tamaño, el check previo es confuso y puede dar falsa confianza. | Eliminar la pre-verificación de longitud y confiar exclusivamente en `timingSafeEqual` dentro de un try-catch. |
| 🔵 **REFACTOR** | [`RosterView.tsx`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/components/views/RosterView.tsx) | **Componente monolítico de 1125 líneas**: El componente mezcla: lógica de estado del formulario, lógica de sincronización Albion, renderizado de la lista, renderizado del formulario, modales. Es imposible de testear de forma unitaria. | Dividir en: `useRoster` (hook), `RosterList`, `RosterForm`, `RosterSyncButton`, `DeleteMemberModal`. |
| 🔵 **REFACTOR** | [`RosterView.tsx`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/components/views/RosterView.tsx) L888-1015 | **Código duplicado en los 3 bloques de Strikes**: Los bloques Strike 1, 2 y 3 son idénticos en estructura, solo difieren en los números de aviso (1-3, 4-6, 7-9) y colores. Son ~300 líneas que podrían ser 20. | Crear componente `<StrikeBlock strikeNum={1} avisos={[1,2,3]} formAvisos={...} />` |
| 🔵 **REFACTOR** | [`page.tsx`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/app/page.tsx) | **Modal de autenticación inline en el page root**: El JSX del modal de login está embebido directamente en `page.tsx` (~50 líneas). La lógica de login (`handleAuthorizeSindicato`, estados `passwordInput`, `loginError`, `isLoggingIn`) mezcla responsabilidades con el enrutamiento de vistas. | Extraer a `<SindicatoLoginModal onSuccess={...} onClose={...} />` con sus propios estados encapsulados. |
| 🔵 **REFACTOR** | [`firebase-sync.ts`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/lib/firebase-sync.ts) L172-234 | **`saveActivity` hace 2 escrituras donde debería hacer 1**: Guarda en `config/activities` (lista centralizada) Y también en la colección `activities/{id}` "para redundancia". Esto duplica datos innecesariamente y crea inconsistencias potenciales si una escritura falla y la otra no. | Elegir una única fuente de verdad: `config/activities.list`. Eliminar escritura redundante en colección `activities`. |
| 🔵 **REFACTOR** | [`GremioView.tsx`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/components/views/GremioView.tsx) | **Import de `ALBION_SPELLS` de 342 KB**: `spells.js` pesa 342 KB y se importa estáticamente en `GremioView`. Esto bloquea la hidratación inicial del cliente con 342 KB de datos que solo se usan en el `BuildEditor`. | Mover el import a `BuildEditor.tsx` y hacerlo dinámico con `dynamic(() => import(...))` o cargar solo al abrir el editor. |
| 🔵 **REFACTOR** | [`RosterView.tsx`](file:///c:/Users/Administrator/Documents/FuriaDragonesWeb/src/components/views/RosterView.tsx) L216 | **IDs con `Math.random()` para miembros importados**: `id: \`m_albion_${Date.now()}_${Math.random()...}\`` no garantiza unicidad en inserciones paralelas y no es reproducible (si el mismo miembro se importa dos veces, se crea duplicado). | Usar el propio `playerName` sanitizado como ID: `id: \`albion_${playerName.toLowerCase().replace(/\s+/g, '_')}\`` — reproducible y deduplicable. |

---

## Código Refactorizado — Vulnerabilidades CRÍTICAS y ALTAS

### 1. `firebase.ts` — Eliminar credenciales hardcodeadas

```typescript
// src/lib/firebase.ts
// ✅ PRODUCCIÓN: Ninguna credencial real en el código fuente

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Firebase] Variable de entorno requerida no definida: ${key}. ` +
      `Revisa tu .env.local o las variables de entorno en Vercel.`
    );
  }
  return value;
}

export const firebaseConfig = {
  apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requireEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

> [!CAUTION]
> Después de aplicar este cambio, asegúrate de que **todas** las variables `NEXT_PUBLIC_FIREBASE_*` están definidas en tu `.env.local` Y en el Dashboard de Vercel antes de hacer deploy.

---

### 2. `server-auth.ts` — Eliminar fallbacks hardcodeados, endurecer verificación

```typescript
// src/lib/server-auth.ts
import crypto from "crypto";

// ✅ Sin fallback: si la env var no existe, el servidor falla en startup,
// no en runtime con credenciales predecibles.
function requireServerEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Auth] Variable de entorno de servidor requerida no definida: ${key}`
    );
  }
  return value;
}

// Se evalúan una sola vez al importar el módulo (startup del servidor)
const SINDICATO_PASSWORD = requireServerEnv("SINDICATO_PASSWORD");
const SESSION_SECRET = requireServerEnv("SESSION_SECRET");
export const SESSION_COOKIE_NAME = "furia_sindicato_session";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function validatePassword(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const target = SINDICATO_PASSWORD;
  // timingSafeEqual requiere buffers del mismo tamaño para no lanzar
  const inputBuf = Buffer.from(input);
  const targetBuf = Buffer.from(target);
  if (inputBuf.byteLength !== targetBuf.byteLength) return false;
  return crypto.timingSafeEqual(inputBuf, targetBuf);
}

export function createSessionToken(): string {
  const payload = {
    role: "sindicato",
    exp: Date.now() + SESSION_MAX_AGE_MS,
    nonce: crypto.randomBytes(16).toString("hex"), // 16 bytes = 128 bits de entropía
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return false;

  const data = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");

  // ✅ Comparación de buffers de tamaño garantizado (base64url → mismo input → mismo length)
  try {
    const sigBuf = Buffer.from(signature, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.byteLength !== expBuf.byteLength) return false;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  } catch {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.role !== "sindicato") return false;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}
```

---

### 3. `firestore.rules` — Eliminar regla catch-all permisiva

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Builds: Lectura pública, escritura solo desde servidor (Admin SDK)
    match /builds/{buildId} {
      allow read: if true;
      allow write: if false;
    }

    // Roster: Lectura pública, escritura solo desde servidor
    match /roster/{memberId} {
      allow read: if true;
      allow write: if false;
    }

    // Actividades: Lectura pública
    match /activities/{activityId} {
      allow read: if true;
      allow write: if false;
    }

    // Contenidos: Lectura pública
    match /contents/{contentId} {
      allow read: if true;
      allow write: if false;
    }

    // Configuración: Lectura pública (lista de actividades, etc.)
    match /config/{configDoc} {
      allow read: if true;
      allow write: if false;
    }

    // ✅ CRÍTICO: Denegar TODO lo demás explícitamente (lectura Y escritura)
    // Antes era `allow read: if true` — un agujero de seguridad.
    match /{document=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

---

### 4. `RosterView.tsx` — Corregir prop inseguro + eliminar proxies CORS de terceros

```typescript
// Línea 78: Cambiar default inseguro
export function RosterView({
  onBack,
  isSindicatoAuthenticated = false, // ✅ MÍNIMO PRIVILEGIO: false por defecto
}: RosterViewProps) {
```

```typescript
// Reemplazar handleSyncAlbion completo — eliminar proxies de terceros

const handleSyncAlbion = async () => {
  if (isSyncingAlbion) return;

  setIsSyncingAlbion(true);
  setSyncNotification(null);

  try {
    // ✅ Una única fuente segura: la API Route interna (verifica sesión + no expone GUILD_ID)
    const res = await fetch("/api/albion/sync");

    if (res.status === 401) {
      setSyncNotification(
        "// ERROR DE SEGURIDAD: Se requiere sesión activa de Oficial del Sindicato."
      );
      return;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${res.status} al contactar la API de Albion.`);
    }

    const albionMembers: unknown = await res.json();

    if (!Array.isArray(albionMembers)) {
      throw new Error("Respuesta inesperada de la API de Albion (formato no válido)");
    }

    // Fusión: solo insertar miembros nuevos por IGN
    const existingIgns = new Set(members.map((m) => m.ign.trim().toLowerCase()));
    const newMembersToInsert: RosterMember[] = [];

    for (const item of albionMembers) {
      if (!item || typeof item !== "object") continue;
      const raw = item as Record<string, unknown>;
      const playerName = String(
        raw.Name ?? raw.name ?? raw.PlayerName ?? raw.ign ?? ""
      ).trim();

      if (!playerName || existingIgns.has(playerName.toLowerCase())) continue;
      existingIgns.add(playerName.toLowerCase());

      // ✅ ID reproducible basado en IGN (evita duplicados en re-sync)
      const safeId = `albion_${playerName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      newMembersToInsert.push({
        id: safeId,
        ign: playerName,
        nombre: playerName,
        status: "Nuevo",
        roles: [],
        estadoActividad: "Activo",
        avisos: 0,
        notas: "Importado vía API",
      });
    }

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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("[AlbionSync] Error durante la sincronización:", error);
    setSyncNotification(`// ERROR EN SYNC: ${msg}`);
  } finally {
    setIsSyncingAlbion(false);
  }
};
```

---

### 5. `.env.example` — Solo placeholders, nunca valores reales

```bash
# .env.example
# ⚠️ Este archivo es un TEMPLATE. Sustituye cada valor por el tuyo real.
# Nunca commitear credenciales reales aquí.

# Contraseña de acceso al panel del Sindicato
SINDICATO_PASSWORD=CAMBIA_ESTO_POR_TU_CONTRASEÑA_SEGURA

# Clave secreta para firmar las cookies de sesión (mínimo 32 caracteres aleatorios)
# Genera una en: https://generate-secret.vercel.app/64
SESSION_SECRET=GENERA_UNA_CLAVE_ALEATORIA_DE_64_CARACTERES

# ID de la hermandad en Albion Online (se obtiene en albiononline.com)
ALBION_GUILD_ID=ID_DE_TU_GUILD_EN_ALBION

# Firebase - Obtén estos valores en la Consola de Firebase > Configuración del proyecto
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Resumen Ejecutivo de Prioridades

```
🔴 ACCIÓN INMEDIATA (antes del siguiente deploy)
  1. Eliminar fallbacks hardcodeados en firebase.ts
  2. Reemplazar .env.example con solo placeholders
  3. Cambiar regla catch-all en firestore.rules a `allow read: if false`
  4. Eliminar fallbacks en server-auth.ts

🟠 ESTA SEMANA
  5. Eliminar proxies CORS de terceros en RosterView (allorigins, corsproxy.io)
  6. Cambiar default de isSindicatoAuthenticated a false
  7. Añadir validación de longitud/tipo a campos de formulario antes de persistir

🔵 BACKLOG TÉCNICO (próximo sprint)
  8. Dividir RosterView.tsx en hooks + subcomponentes
  9. Cargar spells.js dinámicamente (ahorra ~342 KB en carga inicial)
  10. Definir schema canónico en Firestore + converter tipado
  11. Usar ID reproducible basado en IGN para miembros importados de Albion
  12. Eliminar doble escritura en saveActivity (colección vs config doc)
```
