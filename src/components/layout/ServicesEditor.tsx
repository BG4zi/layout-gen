// src/components/layout/ServicesEditor.tsx
import type { LayoutLimits, LayoutState, ServiceDef } from "../../core/layoutTypes";
import { SERVICE_KEYS } from "../../core/layoutLogic";

interface Props {
  state: LayoutState;
  limits: LayoutLimits;
  onChange: (updater: (prev: LayoutState) => LayoutState) => void;
}

export function ServicesEditor({ state, limits, onChange }: Props) {
  const addService = () => {
    onChange((prev) => {
      if (prev.services.length >= limits.MAX_SERVICES) {
        alert("MAX_SERVICES dolu.");
        return prev;
      }
      const used = new Set(prev.services.map((s) => s.key));
      const avail = SERVICE_KEYS.filter((k) => !used.has(k));
      if (!avail.length) {
        alert("Kullanılabilir service key kalmadı.");
        return prev;
      }
      const nextServices: ServiceDef[] = [
        ...prev.services,
        { key: avail[0], count: 0, labels: [] },
      ];
      return { ...prev, services: nextServices };
    });
  };

  const updateService = (index: number, svc: ServiceDef | null) => {
    onChange((prev) => {
      const services = [...prev.services];
      if (svc === null) {
        services.splice(index, 1);
      } else {
        services[index] = svc;
      }
      return { ...prev, services };
    });
  };

  return (
    <>
      <div id="services">
        {state.services.map((s, i) => (
          <ServiceRow
            key={s.key + "-" + i}
            svc={s}
            index={i}
            allServices={state.services}
            limits={limits}
            onChange={(svc) => updateService(i, svc)}
          />
        ))}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <button id="addService" onClick={addService}>
          + Servis ekle
        </button>
      </div>
    </>
  );
}

interface RowProps {
  svc: ServiceDef;
  index: number;
  allServices: ServiceDef[];
  limits: LayoutLimits;
  onChange: (svc: ServiceDef | null) => void; // null → sil
}

function ServiceRow({ svc, index, allServices, limits, onChange }: RowProps) {
  const used = new Set(allServices.map((s, i) => (i === index ? null : s.key)));
  const keys = SERVICE_KEYS.filter((k) => !used.has(k));
  if (!keys.includes(svc.key)) {
    keys.unshift(svc.key);
  }

  const handleKeyChange = (newKey: string) => {
    if (used.has(newKey as any)) {
      alert(`'${newKey}' zaten kullanılıyor.`);
      return;
    }
    onChange({ ...svc, key: newKey as any });
  };

  const handleCountChange = (val: number) => {
    const n = Math.max(0, Math.min(limits.MAX_LABELS, val | 0));
    const labels = [...svc.labels];
    labels.length = n;
    onChange({ ...svc, count: n, labels });
  };

  const handleLabelChange = (idx: number, value: string) => {
    const labels = [...svc.labels];
    labels[idx] = value;
    onChange({ ...svc, labels });
  };

  const handleDelete = () => {
    onChange(null);
  };

  const labelCount = svc.count;
  const labels = Array.from({ length: labelCount }, (_, i) => svc.labels[i] || "");

  return (
    <div className="svcrow">
      <div className="row">
        <div>
          <label>Service</label>
          <select
            className="svcKey"
            value={svc.key}
            onChange={(e) => handleKeyChange(e.target.value)}
          >
            {keys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Count</label>
          <input
            type="number"
            className="svcCount"
            min={0}
            value={svc.count}
            onChange={(e) => handleCountChange(e.target.valueAsNumber)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Labels</label>
          <div className="labels">
            {labels.map((v, i) => (
              <input
                key={i}
                placeholder={`label ${i + 1}`}
                value={v}
                onChange={(e) => handleLabelChange(i, e.target.value)}
              />
            ))}
          </div>
        </div>
        <div className="row">
          <button className="ghost del" onClick={handleDelete}>
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

