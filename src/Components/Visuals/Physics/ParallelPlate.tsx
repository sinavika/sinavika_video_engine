import React from "react";
import { easeFrom } from "../../../Animations/Motion";
import {
  useReveal,
  useSceneSeconds,
  useVisualPalette,
  type VisualBoxProps,
} from "../VisualFrame";
import type {CourseVisual} from '../VisualSchema';
import { Part, useBeatStartFor } from "../VisualTimeline";
import { arrowHead } from "./ArrowHead";
import { forceDirection } from "./PlateForce";

type ParallelPlates = Extract<CourseVisual, { kind: "parallelPlates" }>;

/** The stage (CourseVisual keeps this ratio). */
export const PARALLEL_PLATE_STAGE = { width: 1600, height: 900 };

/**
 * Two parallel plates with the uniform field between them: arrows from the positive plate to the negative one, the
 * charges on the plates, the potential difference and the gap. A charged particle may cross the field sideways and
 * bend towards the plate that attracts it (a parabola, as in a throw), start at rest and speed across to the other
 * plate, or hang still where its weight and the electric force cancel (an oil drop). Beats point at `plates`,
 * `field`, `particle`, `forces` and `run`.
 */
export const ParallelPlateVisual: React.FC<
  VisualBoxProps & { visual: ParallelPlates }
> = ({ visual, width, height, delaySeconds = 0 }) => {
  const palette = useVisualPalette();
  const seconds = useSceneSeconds();
  const k = Math.min(
    width / PARALLEL_PLATE_STAGE.width,
    height / PARALLEL_PLATE_STAGE.height,
  );
  const ox = (width - PARALLEL_PLATE_STAGE.width * k) / 2;
  const oy = (height - PARALLEL_PLATE_STAGE.height * k) / 2;
  const appear = useReveal(delaySeconds, 0.5);
  const fieldIn = easeFrom(
    seconds,
    useBeatStartFor("field", "show") ?? delaySeconds + 0.5,
    0.6,
  );
  const runStart = useBeatStartFor("run", "show") ?? delaySeconds + 1.4;
  const run = visual.motion
    ? Math.max(0, Math.min(1, (seconds - runStart) / visual.duration))
    : 1;
  const fontSize = 52;
  const left = 260;
  const right = 1340;
  const topY = 170;
  const bottomY = 700;
  const middle = (topY + bottomY) / 2;
  const plate = 26;
  const signOf = (positive: boolean) => (positive ? "+" : "−");
  const topPositive = visual.top === "+";
  const direction = visual.particle
    ? forceDirection(visual.top, visual.particle.charge)
    : 1;

  // The particle's place now.
  const particle = (() => {
    if (!visual.particle) return null;
    const mode = visual.particle.mode;
    if (mode === "balance")
      return {
        x: (left + right) / 2,
        y: middle,
        path: [] as [number, number][],
      };
    if (mode === "accelerate") {
      const from = direction > 0 ? topY + plate + 40 : bottomY - plate - 40;
      const to = direction > 0 ? bottomY - plate - 40 : topY + plate + 40;
      const share = run * run;
      return {
        x: (left + right) / 2,
        y: from + (to - from) * share,
        path: [
          [(left + right) / 2, from],
          [(left + right) / 2, from + (to - from) * share],
        ] as [number, number][],
      };
    }
    // Sideways: it enters at mid-gap and bends towards the attracting plate, reaching it at 80% of the length.
    const reach = 0.8 * (right - left);
    const drop = (bottomY - topY) / 2 - plate - 30;
    const at = (share: number): [number, number] => [
      left + reach * share,
      middle + direction * drop * share * share,
    ];
    const path = Array.from({ length: 41 }, (_, index) =>
      at((run * index) / 40),
    );
    const [x, y] = at(run);
    return { x, y, path };
  })();

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: "visible", fontFamily: palette.fontDisplay }}
    >
      <g transform={`translate(${ox} ${oy}) scale(${k})`}>
        <Part id="plates">
          {(look) => (
            <g opacity={appear * look.opacity}>
              {[topY, bottomY].map((y, index) => {
                const positive = index === 0 ? topPositive : !topPositive;
                return (
                  <g key={y}>
                    <rect
                      x={left}
                      y={index === 0 ? y - plate : y}
                      width={right - left}
                      height={plate}
                      rx={6}
                      fill={positive ? palette.brand : palette.lessonDeep}
                      stroke={palette.ink}
                      strokeWidth={4}
                    />
                    {Array.from({ length: visual.charges }, (_, sign) => (
                      <text
                        key={sign}
                        x={
                          left +
                          ((sign + 0.5) * (right - left)) / visual.charges
                        }
                        y={
                          index === 0
                            ? y - plate - 16
                            : y + plate + fontSize * 0.85
                        }
                        fill={palette.ink}
                        fontSize={fontSize}
                        fontWeight={800}
                        textAnchor="middle"
                      >
                        {signOf(positive)}
                      </text>
                    ))}
                  </g>
                );
              })}
              {visual.voltage ? (
                <text
                  x={right + 60}
                  y={middle + fontSize * 0.35}
                  fill={palette.ink}
                  fontSize={fontSize}
                  fontWeight={800}
                >
                  {visual.voltage}
                </text>
              ) : null}
              {visual.gap ? (
                <g>
                  <line
                    x1={left - 60}
                    y1={topY}
                    x2={left - 60}
                    y2={bottomY}
                    stroke={palette.muted}
                    strokeWidth={4}
                  />
                  <path
                    d={arrowHead(left - 60, topY, -Math.PI / 2, 22)}
                    fill={palette.muted}
                  />
                  <path
                    d={arrowHead(left - 60, bottomY, Math.PI / 2, 22)}
                    fill={palette.muted}
                  />
                  <text
                    x={left - 80}
                    y={middle + fontSize * 0.35}
                    fill={palette.ink}
                    fontSize={fontSize}
                    fontWeight={800}
                    textAnchor="end"
                  >
                    {visual.gap}
                  </text>
                </g>
              ) : null}
            </g>
          )}
        </Part>
        {visual.field ? (
          <Part id="field">
            {(look) => (
              <g opacity={fieldIn * look.opacity * 0.85}>
                {Array.from({ length: 7 }, (_, index) => {
                  const x = left + ((index + 0.5) * (right - left)) / 7;
                  const [from, to] = topPositive
                    ? [topY + 20, bottomY - 20]
                    : [bottomY - 20, topY + 20];
                  const reach = from + (to - from) * fieldIn;
                  return (
                    <g key={index}>
                      <line
                        x1={x}
                        y1={from}
                        x2={x}
                        y2={reach - Math.sign(to - from) * 20}
                        stroke={palette.lesson}
                        strokeWidth={6}
                      />
                      <path
                        d={arrowHead(
                          x,
                          reach,
                          to > from ? Math.PI / 2 : -Math.PI / 2,
                          26,
                        )}
                        fill={palette.lesson}
                      />
                    </g>
                  );
                })}
                <text
                  x={right - 10}
                  y={topPositive ? bottomY - 50 : topY + 80}
                  fill={palette.lesson}
                  fontSize={fontSize}
                  fontWeight={800}
                  textAnchor="end"
                >
                  E
                </text>
              </g>
            )}
          </Part>
        ) : null}
        {particle && visual.particle ? (
          <Part id="particle">
            {(look) => (
              <g opacity={appear * look.opacity}>
                {particle.path.length > 1 ? (
                  <polyline
                    points={particle.path
                      .map((point) => point.join(","))
                      .join(" ")}
                    fill="none"
                    stroke={palette.ink}
                    strokeWidth={5}
                    strokeDasharray="6 12"
                    strokeLinecap="round"
                  />
                ) : null}
                <circle
                  cx={particle.x}
                  cy={particle.y}
                  r={30 * look.scale}
                  fill={
                    visual.particle!.charge === "+"
                      ? palette.brand
                      : palette.lessonDeep
                  }
                  stroke={palette.ink}
                  strokeWidth={5}
                />
                <text
                  x={particle.x}
                  y={particle.y + fontSize * 0.36}
                  fill={palette.surface}
                  fontSize={fontSize}
                  fontWeight={800}
                  textAnchor="middle"
                >
                  {signOf(visual.particle!.charge === "+")}
                </text>
                {visual.particle!.label ? (
                  <text
                    x={particle.x + 46}
                    y={particle.y - 34}
                    fill={palette.ink}
                    fontSize={fontSize * 0.8}
                    fontWeight={800}
                  >
                    {visual.particle!.label}
                  </text>
                ) : null}
              </g>
            )}
          </Part>
        ) : null}
        {particle && visual.particle ? (
          <Part id="forces">
            {(look) => {
              const balance = visual.particle!.mode === "balance";
              // An arrow towards a plate stops short of it: near the plate it shrinks and then goes.
              const room = (dy: number) =>
                (dy > 0 ? bottomY - particle.y : particle.y - topY) - 40;
              const arrow = (dy: number, colour: string, label: string) => {
                const length = Math.sign(dy) * Math.min(Math.abs(dy), room(dy));
                if (Math.abs(length) < 60) return null;
                dy = length;
                return (
                  <g>
                    <line
                      x1={particle.x}
                      y1={particle.y + Math.sign(dy) * 34}
                      x2={particle.x}
                      y2={particle.y + dy - Math.sign(dy) * 22}
                      stroke={colour}
                      strokeWidth={10}
                      strokeLinecap="round"
                    />
                    <path
                      d={arrowHead(
                        particle.x,
                        particle.y + dy,
                        dy > 0 ? Math.PI / 2 : -Math.PI / 2,
                        30,
                      )}
                      fill={colour}
                    />
                    <text
                      x={particle.x + 30}
                      y={particle.y + dy + (dy > 0 ? 10 : 30)}
                      fill={palette.ink}
                      fontSize={fontSize * 0.8}
                      fontWeight={800}
                    >
                      {label}
                    </text>
                  </g>
                );
              };
              return (
                <g opacity={appear * look.opacity}>
                  {arrow(direction * 150, palette.lesson, "qE")}
                  {balance ? arrow(150, palette.ink, "mg") : null}
                </g>
              );
            }}
          </Part>
        ) : null}
      </g>
    </svg>
  );
};
