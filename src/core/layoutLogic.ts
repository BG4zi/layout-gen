// src/core/layoutLogic.ts
import type {
  FrameDef,
  LayoutLimits,
  LayoutState,
  ServiceDef,
  ServiceKey,
} from "./layoutTypes";

export const SERVICE_KEYS: ServiceKey[] = [
  "SEAT",
  "LIGHT",
  "TV",
  "LTABLE",
  "RTABLE",
  "DRAWER",
  "COFFEE",
  "DOOR",
  "FRIDGE",
  "LEDS",
  "AC",
  "SEAT3"
];

export const FRAME_ALLOWED_SET: Set<ServiceKey> = new Set([
  "TV",
  "DRAWER",
  "LTABLE",
  "RTABLE",
  "COFFEE",
  "FRIDGE",
]);

export const DEFAULT_LIMITS: LayoutLimits = {
  MAX_SERVICES: 16,
  MAX_LABELS: 12,
  MAX_FRAMES: 22,
};

export function clamp(v: number, lo: number, hi: number): number {
  const n = v | 0;
  return Math.max(lo, Math.min(hi, n));
}

export function deriveStrictFramesFromServices(state: LayoutState): FrameDef[] {
  const out: FrameDef[] = [];
  for (const s of state.services) {
    if (!FRAME_ALLOWED_SET.has(s.key)) continue;
    const n = s.count | 0;
    for (let i = 1; i <= n; i++) {
      out.push({ key: s.key, idx: i });
    }
  }
  return out;
}

export function reconcileFramesWithServices(state: LayoutState): LayoutState {
  const strict = deriveStrictFramesFromServices(state);
  const enc = (f: FrameDef) => `${f.key}#${f.idx}`;
  const strictSet = new Set(strict.map(enc));

  // eldeki sıradan, artık olmayanları at
  let frames = state.frames.filter((f) => strictSet.has(enc(f)));

  // yeni gelenleri sıranın sonuna ekle
  const seen = new Set(frames.map(enc));
  for (const f of strict) {
    const k = enc(f);
    if (!seen.has(k)) {
      frames.push(f);
      seen.add(k);
    }
  }

  return { ...state, frames };
}

export function validate(state: LayoutState, limits: LayoutLimits): string[] {
  const errs: string[] = [];

  if (state.services.length > limits.MAX_SERVICES) {
    errs.push(`Servis sayısı ${limits.MAX_SERVICES} sınırını aşıyor.`);
  }

  const seen = new Set<ServiceKey>();
  for (const s of state.services) {
    if (seen.has(s.key)) {
      errs.push(`Service key tekil olmalı: ${s.key}`);
    }
    seen.add(s.key);

    if (s.count < 0 || s.count > limits.MAX_LABELS) {
      errs.push(`${s.key}: count 0..${limits.MAX_LABELS}`);
    }
    if (s.labels.length !== s.count) {
      errs.push(`${s.key}: label sayısı count ile eşit olmalı`);
    }
  }

  return errs;
}

export function genCSV(state: LayoutState, limits: LayoutLimits): string {
  const lines: string[] = [];
  const sys = (state.system || "TurkeyVIP").trim();
  lines.push(`SYSTEM=${sys}`);

  if (state.frames.length) {
    const toks = state.frames
      .slice(0, limits.MAX_FRAMES)
      .map((f) => `${f.key}:${f.idx}`);
    if (toks.length) {
      lines.push(`FRAMES= ${toks.join(", ")}`);
    }
  }

  for (const s of state.services) {
    const count = clamp(s.count || 0, 0, limits.MAX_LABELS);
    const labels = (s.labels || [])
      .slice(0, count)
      .map((x) => (x || "").trim());
    lines.push([s.key, count, ...labels].join(","));
  }

  return lines.join("\n") + "\n&&&";
}

export function getServiceByKey(
  state: LayoutState,
  key: ServiceKey
): ServiceDef | undefined {
  return state.services.find((s) => s.key === key);
}

export function labelForServiceItem(
  state: LayoutState,
  key: ServiceKey,
  idx1: number
): string {
  const svc = getServiceByKey(state, key);
  if (
    svc &&
    Array.isArray(svc.labels) &&
    svc.labels[idx1 - 1] &&
    svc.labels[idx1 - 1].trim()
  ) {
    return svc.labels[idx1 - 1].trim();
  }
  return `${key}${idx1}`;
}
