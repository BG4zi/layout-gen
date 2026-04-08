// src/components/layout/LayoutBuilderPage.tsx
import { useMemo, useState } from "react";
import type {
  LayoutLimits,
  LayoutState,
} from "../../core/layoutTypes";
import {
  DEFAULT_LIMITS,
  genCSV,
  reconcileFramesWithServices,
  validate,
} from "../../core/layoutLogic";
import { ServicesEditor } from "./ServicesEditor";
import { FramesPreview } from "./FramesPreview";
import { CanFramesPreview } from "./CanFramesPreview";

export function LayoutBuilderPage() {
  const [state, setState] = useState<LayoutState>({
    system: "TurkeyVIP",
    services: [],
    frames: [],
  });

  const [limits, setLimits] = useState<LayoutLimits>(DEFAULT_LIMITS);

  const errors = useMemo(() => validate(state, limits), [state, limits]);
  const csv = useMemo(() => genCSV(state, limits), [state, limits]);

  function updateState(mutator: (prev: LayoutState) => LayoutState) {
    setState((prev) => reconcileFramesWithServices(mutator(prev)));
  }

  function updateLimits(mutator: (prev: LayoutLimits) => LayoutLimits) {
    setLimits((prev) => mutator(prev));
  }

  const svcCount = state.services.length;

  function handleDownload() {
    if (errors.length) {
      alert("Hataları düzelt:\n\n" + errors.join("\n"));
      return;
    }
    const blob = new Blob([csv], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "layout.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleReset() {
    if (!confirm("Hepsini temizle?")) return;
    setState({
      system: "TurkeyVIP",
      services: [],
      frames: [],
    });
    setLimits(DEFAULT_LIMITS);
  }

  return (
    <div className="wrap">
      {/* Genel */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            <div>
              <label>SYSTEM adı</label>
              <input
                placeholder="TurkeyVIP"
                value={state.system}
                onChange={(e) =>
                  updateState((prev) => ({ ...prev, system: e.target.value }))
                }
              />
            </div>
            <div>
              <label>MAX_SERVICES</label>
              <input
                type="number"
                min={1}
                value={limits.MAX_SERVICES}
                onChange={(e) =>
                  updateLimits((prev) => ({
                    ...prev,
                    MAX_SERVICES: Math.max(1, e.target.valueAsNumber || 1),
                  }))
                }
              />
            </div>
            <div>
              <label>UI_MAX_LABELS_PER_SERVICE</label>
              <input
                type="number"
                min={1}
                value={limits.MAX_LABELS}
                onChange={(e) =>
                  updateLimits((prev) => ({
                    ...prev,
                    MAX_LABELS: Math.max(1, e.target.valueAsNumber || 1),
                  }))
                }
              />
            </div>
            <div>
              <label>UI_MAX_FRAMES_LAYOUT</label>
              <input
                type="number"
                min={0}
                value={limits.MAX_FRAMES}
                onChange={(e) =>
                  updateLimits((prev) => ({
                    ...prev,
                    MAX_FRAMES: Math.max(0, e.target.valueAsNumber || 0),
                  }))
                }
              />
            </div>
          </div>
          <div className="row">
            <button onClick={handleDownload}>CSV indir</button>
            <button className="ghost" onClick={handleReset}>
              Sıfırla
            </button>
          </div>
        </div>
        <div className="hint">
          CSV: <span className="mono">SYSTEM=...</span>,{" "}
          <span className="mono">FRAMES= KEY:idx, ...</span>, sonra{" "}
          <span className="mono">KEY,count,label1,...</span>
        </div>
      </div>

      {/* Servisler */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <b>Servisler</b>
          </div>
          <button
            onClick={() =>
              updateState((prev) => {
                const next = { ...prev };
                if (next.services.length >= limits.MAX_SERVICES) {
                  alert("MAX_SERVICES dolu.");
                  return prev;
                }
                // ServicesEditor içinde handleAdd de var ama buradan da ekleyelim
                return next;
              })
            }
            style={{ display: "none" }} // gerçek ekleme ServicesEditor içinde
          >
            + Servis ekle
          </button>
        </div>
        <ServicesEditor
          state={state}
          limits={limits}
          onChange={updateState}
        />
        <div className="row">
          <span id="svcCount" className="hint">
            {svcCount} service
          </span>
          <span id="errors" className="err">
            {errors.join("  ")}
          </span>
        </div>
      </div>

      {/* Frames */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <b>Frames (servislere göre otomatik)</b>
          </div>
          <span className="hint">
            Bloklar yalnızca sürükle-bırak ile sıralanır; içerik servislere göre
            türetilir.
          </span>
        </div>
        <FramesPreview
          state={state}
          limits={limits}
          onChange={updateState}
        />
      </div>

      {/* Önizleme */}
      <div className="card">
        <div>
          <b>Önizleme</b>
        </div>
        <pre
          className="mono"
          style={{ whiteSpace: "pre-wrap", userSelect: "text" }}
        >
          {csv}
        </pre>
      </div>

      {/* CAN Frame dağılımı */}
      <div className="card">
        <div>
          <b>CAN Frame Dağılımı</b>
        </div>
        <CanFramesPreview state={state} limits={limits} />
      </div>
    </div>
  );
}
