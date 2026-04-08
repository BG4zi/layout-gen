// src/components/layout/CanFramesPreview.tsx
import type { JSX } from "react";
import React from "react";
import type { LayoutState, LayoutLimits } from "../../core/layoutTypes";
import {
  deriveStrictFramesFromServices,
  getServiceByKey,
  labelForServiceItem,
} from "../../core/layoutLogic";

const SEAT_ELEMS_PER_FRAME = 6;
const LIGHT_PER_FRAME = 3;
const OTHERS_CAPACITIES = [6, 4, 4, 4];

export interface CanFramesPreviewProps {
  state: LayoutState;
  limits: LayoutLimits;
}

export const CanFramesPreview: React.FC<CanFramesPreviewProps> = ({
  state,
  limits,
}) => {
  const seat = getServiceByKey(state, "SEAT");
  const light = getServiceByKey(state, "LIGHT");
  const leds = getServiceByKey(state, "LEDS");

  // OTHERS için strict frame listesi
  const strictFrames = deriveStrictFramesFromServices(state);
  const effective = strictFrames.slice(0, limits.MAX_FRAMES);

  let othersCur = 0;
  const othersGroups: JSX.Element[] = [];

  for (
    let fi = 0;
    fi < OTHERS_CAPACITIES.length && othersCur < effective.length;
    fi++
  ) {
    const cap = OTHERS_CAPACITIES[fi];
    const slice = effective.slice(othersCur, othersCur + cap);
    if (!slice.length) break;

    othersGroups.push(
      <div className="cf-frame" key={`others-frame-${fi}`}>
        <div className="cf-frame-title">
          OTHERS F{fi} (kapasite {cap})
        </div>
        <div className="cf-chips">
          {slice.map((it, idx) => {
            const lbl = labelForServiceItem(state, it.key, it.idx);
            return (
              <span
                key={`${it.key}-${it.idx}-${idx}`}
                className="cf-chip"
              >
                {it.key}
                {it.idx} · {lbl}
              </span>
            );
          })}
        </div>
      </div>,
    );

    othersCur += slice.length;
  }

  const othersOverflow = effective.slice(othersCur);

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <b>CAN Frame Önizleme</b>
        </div>
        <span className="hint">
          SEAT / LIGHT / LEDS ve OTHERS dağılımını gösterir.
        </span>
      </div>

      {/* SEAT */}
      {seat && seat.count > 0 && (
        <div className="cf-section">
          <div className="cf-section-title">SEAT frame&apos;leri</div>
          <div className="hint">
            Her seat için {SEAT_ELEMS_PER_FRAME} byte/element gösteriliyor.
          </div>

          {Array.from({ length: seat.count }).map((_, iSeat) => {
            const baseLabels =
              seat.labels && seat.labels.length >= SEAT_ELEMS_PER_FRAME
                ? seat.labels.slice(0, SEAT_ELEMS_PER_FRAME)
                : Array.from(
                    { length: SEAT_ELEMS_PER_FRAME },
                    (_x, j) => seat.labels?.[j] || `Byte${j + 1}`,
                  );

            return (
              <div className="cf-frame" key={`seat-${iSeat}`}>
                <div className="cf-frame-title">SEAT{iSeat + 1}</div>
                <div className="cf-chips">
                  {baseLabels.map((lbl, j) => (
                    <span className="cf-chip" key={j}>
                      {lbl || ""}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHT */}
      {light && light.count > 0 && (
        <div className="cf-section">
          <div className="cf-section-title">LIGHT frame&apos;leri (3&apos;erli)</div>

          {(() => {
            const total = light.count;
            const frames: JSX.Element[] = [];
            let idx = 0;
            let frameNo = 1;

            while (idx < total) {
              const chips: JSX.Element[] = [];

              for (
                let k = 0;
                k < LIGHT_PER_FRAME && idx < total;
                k++, idx++
              ) {
                const lbl =
                  light.labels && light.labels[idx]
                    ? light.labels[idx].trim()
                    : `LIGHT${idx + 1}`;
                chips.push(
                  <span className="cf-chip" key={idx}>
                    {lbl}
                  </span>,
                );
              }

              frames.push(
                <div
                  className="cf-frame"
                  key={`light-frame-${frameNo}`}
                >
                  <div className="cf-frame-title">
                    LIGHTFRAME{frameNo}
                  </div>
                  <div className="cf-chips">{chips}</div>
                </div>,
              );
              frameNo++;
            }

            return frames;
          })()}
        </div>
      )}

      {/* LEDS */}
      {leds && leds.count > 0 && (
        <div className="cf-section">
          <div className="cf-section-title">
            LEDS frame&apos;leri (her kartta 1 subservis)
          </div>
          {Array.from({ length: leds.count }).map((_, i) => {
            const lbl =
              leds.labels && leds.labels[i]
                ? leds.labels[i].trim()
                : `LED${i + 1}`;
            return (
              <div className="cf-frame" key={`led-${i}`}>
                <div className="cf-frame-title">LEDS{i + 1}</div>
                <div className="cf-chips">
                  <span className="cf-chip">{lbl}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OTHERS */}
      <div className="cf-section">
        <div className="cf-section-title">OTHERS frame&apos;leri</div>
        <div className="hint">
          Kullanılan servisler: TV, DRAWER, LTABLE, RTABLE, COFFEE,
          DOOR, FRIDGE. Kapasiteler: 6 / 4 / 4 / 4.
        </div>

        {effective.length === 0 && (
          <div className="cf-section-empty">
            OTHERS için frame yok (TV/DRAWER/LTABLE/RTABLE/COFFEE/DOOR/FRIDGE tanımlı
            değil).
          </div>
        )}

        {othersGroups}

        {othersOverflow.length > 0 && (
          <div className="cf-frame">
            <div className="cf-frame-title">
              Overflow (CAN kapasitesi dışı)
            </div>
            <div className="cf-chips">
              {othersOverflow.map((it, idx) => {
                const lbl = labelForServiceItem(state, it.key, it.idx);
                return (
                  <span
                    key={`ov-${it.key}-${it.idx}-${idx}`}
                    className="cf-chip"
                  >
                    {it.key}
                    {it.idx} · {lbl}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
