// src/components/layout/FramesPreview.tsx
import { useMemo, useState } from "react";
import type { LayoutLimits, LayoutState } from "../../core/layoutTypes";
import { deriveStrictFramesFromServices } from "../../core/layoutLogic";

interface Props {
  state: LayoutState;
  limits: LayoutLimits;
  onChange: (updater: (prev: LayoutState) => LayoutState) => void;
}

export function FramesPreview({ state, limits, onChange }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const frames = state.frames;
  const totalStrict = useMemo(
    () => deriveStrictFramesFromServices(state).length,
    [state]
  );

  const over = Math.max(0, totalStrict - limits.MAX_FRAMES);

  const hint =
    totalStrict === 0
      ? "Frames, eklediğin izinli servislerin (TV, DRAWER, LTABLE, RTABLE, COFFEE, DOOR, FRIDGE) her instance’ından otomatik üretilir. Sadece sıralamayı değiştirebilirsin."
      : over
      ? `Toplam ${totalStrict} blok var; ilk ${limits.MAX_FRAMES} CSV'ye yazılır. Gri bloklar serileştirilmeyecek.`
      : `Toplam ${totalStrict} blok var; hepsi CSV'ye yazılacak.`;

  const moveFrame = (from: number, to: number) => {
    if (from === to) return;
    onChange((prev) => {
      const arr = [...prev.frames];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return { ...prev, frames: arr };
    });
  };

  const moveToEnd = (from: number) => {
    onChange((prev) => {
      const arr = [...prev.frames];
      const [m] = arr.splice(from, 1);
      arr.push(m);
      return { ...prev, frames: arr };
    });
  };

  return (
    <>
      <div id="frames" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {frames.map((f, i) => {
          const isOverflow = i >= limits.MAX_FRAMES;
          return (
            <div
              key={`${f.key}:${f.idx}:${i}`}
              className={"framecard" + (isOverflow ? " overflow" : "")}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                (e.target as HTMLElement).classList.add("dragging");
              }}
              onDragEnd={(e) => {
                setDragIndex(null);
                (e.target as HTMLElement).classList.remove("dragging");
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex != null) {
                  moveFrame(dragIndex, i);
                }
              }}
            >
              <div className="drag-handle">≡</div>
              <div className="title">
                {f.key}:{f.idx}
              </div>
              <span className="pill">
                {isOverflow ? "CSV dışı" : "CSV’de yazılır"}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{ marginTop: 6 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (dragIndex != null) moveToEnd(dragIndex);
        }}
      >
        <span id="framesHint" className="hint">
          {hint}
        </span>
      </div>
    </>
  );
}

