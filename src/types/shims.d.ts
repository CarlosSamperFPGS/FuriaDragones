// Type declarations for offline IDE support when node_modules are built in cloud (Vercel)

declare namespace React {
  type ReactNode = any;
  type ReactElement = any;
  type FC<P = {}> = (props: P) => ReactElement | null;
  function useState<T>(initial: T | (() => T)): [T, (val: T | ((prev: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useRef<T>(initial?: T): { current: T };
  function useMemo<T>(factory: () => T, deps?: any[]): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T;
}

declare module "react" {
  export = React;
  export as namespace React;
}

declare module "react-dom" {
  const ReactDOM: any;
  export default ReactDOM;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module "lucide-react" {
  export const Shield: any;
  export const Lock: any;
  export const Terminal: any;
  export const Activity: any;
  export const ArrowUpRight: any;
  export const Flame: any;
  export const ShieldAlert: any;
  export const Users: any;
  export const Swords: any;
  export const ChevronDown: any;
  export const ChevronUp: any;
  export const Filter: any;
  export const Search: any;
  export const Check: any;
  export const X: any;
  export const Plus: any;
  export const Edit: any;
  export const Trash2: any;
  export const Copy: any;
  export const Share2: any;
  export const ExternalLink: any;
  export const ArrowLeft: any;
  export const Zap: any;
  export const Heart: any;
  export const HeartPulse: any;
  export const Crosshair: any;
  export const Sparkles: any;
  export const Pencil: any;
  const LucideIcons: Record<string, any>;
  export default LucideIcons;
}

declare module "tailwindcss" {
  export interface Config {
    [key: string]: any;
  }
  const config: Config;
  export default config;
}

declare module "next" {
  export interface Metadata {
    [key: string]: any;
  }
}

declare module "next/font/google" {
  export function Rajdhani(options: any): any;
  export function JetBrains_Mono(options: any): any;
  export function Inter(options: any): any;
  export function VT323(options: any): any;
}

declare module "@/lib/spells" {
  export const ALBION_SPELLS: Record<string, any>;
  export const ITEM_SPELLS_MAP: Record<string, any>;
  export function getItemSpells(itemId: string, slotType?: string): any[];
}

declare module "@/lib/spells.js" {
  export const ALBION_SPELLS: Record<string, any>;
  export const ITEM_SPELLS_MAP: Record<string, any>;
  export function getItemSpells(itemId: string, slotType?: string): any[];
}

declare module "./items-data.js" {
  export const ALBION_ITEMS: any[];
  export const QUALITIES: any[];
  export function getItemImageUrl(itemOrId: any, tier?: string, enchant?: number, quality?: number): string;
}


