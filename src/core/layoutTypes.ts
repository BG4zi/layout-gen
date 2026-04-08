// src/core/layoutTypes.ts
export type ServiceKey =
  | "SEAT"
  | "LIGHT"
  | "TV"
  | "LTABLE"
  | "RTABLE"
  | "DRAWER"
  | "COFFEE"
  | "DOOR"
  | "FRIDGE"
  | "LEDS"
  | "AC"
  | "SEAT3";

export interface ServiceDef {
  key: ServiceKey;
  count: number;
  labels: string[];
}

export interface FrameDef {
  key: ServiceKey;
  idx: number; // 1-based
}

export interface LayoutState {
  system: string;
  services: ServiceDef[];
  frames: FrameDef[]; // sadece sıralama
}

export interface LayoutLimits {
  MAX_SERVICES: number;
  MAX_LABELS: number;
  MAX_FRAMES: number;
}
