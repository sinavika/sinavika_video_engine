import React, {useLayoutEffect, useRef, useState} from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {partLook} from '../Structure/StructureLook';
import {strikeStyle, useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useBeatStartFor, useElementState} from '../VisualTimeline';

type Sentence = Extract<CourseVisual, { kind: "sentence" }>;

/**
 * The Turkish visuals that show how language works, not just what it says
 * (owner, 27 Oct 2026: "animasyonlarımız çok iyi olmalı"):
 *
 *   sentence    word tiles with their roles; arrows from part to part (a cause
 *               to its result over "için"); a word turning into another (its
 *               synonym) while the meaning stays, or changes
 *   paragraph   a paragraph's sentences mapped: each with its role, and the
 *               supporting ones leading by arrows into the main idea
 *
 * Parts follow the card's beats (show, focus, swap; see VisualTimeline).
 * Without beats the visual builds itself, then plays its arrows and swaps.
 */

/** Seconds between word tiles coming in, left to right. */
const TILE_STEP = 0.22;

/** Where a tile sits in its row (layout pixels, transforms left out). */
type TileBox = { x: number; y: number; width: number; height: number };

/**
 * How many arcs a link has to clear: the other links whose span lies inside its
 * own. Each one lifts its arc a level, so nested arcs ("evin kapısı" over
 * "giriş kapısı") keep their labels apart instead of stacking them.
 */
export const linkLevels = (
  links: readonly { from: number; to: number }[],
): number[] =>
  links.map((link, index) => {
    const [start, end] = [
      Math.min(link.from, link.to),
      Math.max(link.from, link.to),
    ];
    return links.filter((other, otherIndex) => {
      const [otherStart, otherEnd] = [
        Math.min(other.from, other.to),
        Math.max(other.from, other.to),
      ];
      return (
        otherIndex !== index &&
        otherStart >= start &&
        otherEnd <= end &&
        otherEnd - otherStart < end - start
      );
    }).length;
  });

/** How far one level lifts an arc and its label. */
const LINK_LEVEL_RISE = 70;

/**
 * A sentence taken apart: each part on its own tile, the parts that matter in
 * the lesson colour, the role of each part under it, arrows over the tiles
 * between related parts, and swap words.
 */
export const SentenceVisual: React.FC<
  VisualBoxProps & { visual: Sentence }
> = ({ visual, delaySeconds = 0 }) => {
  const palette = useVisualPalette();
  const { u } = useVideoLayout();
  const built = delaySeconds + 0.3 + visual.parts.length * TILE_STEP;
  const translation = useReveal(built, 0.4);
  const tiles = useTileBoxes(visual.links.length > 0);
  // Arrows run over the tiles: room above each row of tiles for them, more for nested arcs.
  const levels = linkLevels(visual.links);
  const linkRoom = visual.links.length
    ? u(118) + Math.max(0, ...levels) * u(LINK_LEVEL_RISE * 0.8)
    : 0;
  let swapOrder = 0;
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: u(30),
      }}
    >
      <div
        ref={tiles.rowRef}
        style={{
          position: "relative",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: u(14),
          rowGap: Math.max(u(14), linkRoom),
          paddingTop: linkRoom,
        }}
      >
        {visual.parts.map((part, index) => (
          <SentencePart
            key={index}
            {...part}
            id={`w${index + 1}`}
            delaySeconds={delaySeconds + index * TILE_STEP}
            swapFallback={
              part.swap ? built + 1.6 + 1.4 * swapOrder++ : undefined
            }
            measure={tiles.measure(index)}
          />
        ))}
        {tiles.boxes
          ? visual.links.map((link, index) => {
              const from = tiles.boxes?.[link.from - 1];
              const to = tiles.boxes?.[link.to - 1];
              return from && to ? (
                <SentenceLink
                  key={index}
                  id={`l${index + 1}`}
                  from={from}
                  to={to}
                  label={link.label}
                  level={levels[index]}
                  fallback={built + 0.5 + index * 0.8}
                />
              ) : null;
            })
          : null}
      </div>
      {visual.translation ? (
        <div
          style={{
            fontFamily: palette.fontBody,
            fontStyle: "italic",
            fontSize: u(32),
            color: palette.muted,
            opacity: translation,
            textAlign: "center",
          }}
        >
          {visual.translation}
        </div>
      ) : null}
    </div>
  );
};

/**
 * The tiles' places in their row, measured after layout (wrapping decides
 * them). Offsets ignore transforms, so a tile mid-animation is measured where
 * it settles; measuring runs after every render and stores only a change, so
 * the arrows follow when FitBox rescales the row.
 */
const useTileBoxes = (enabled: boolean) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const elements = useRef<(HTMLDivElement | null)[]>([]);
  const [boxes, setBoxes] = useState<(TileBox | null)[] | null>(null);
  useLayoutEffect(() => {
    if (!enabled || !rowRef.current) return;
    const next = elements.current.map((element) =>
      element
        ? {
            x: element.offsetLeft,
            y: element.offsetTop,
            width: element.offsetWidth,
            height: element.offsetHeight,
          }
        : null,
    );
    if (JSON.stringify(next) !== JSON.stringify(boxes)) setBoxes(next);
  });
  return {
    rowRef,
    boxes,
    measure: (index: number) => (element: HTMLDivElement | null) =>
      void (elements.current[index] = element),
  };
};

const SentencePart: React.FC<
  Sentence["parts"][number] & {
    id: string;
    delaySeconds: number;
    swapFallback?: number;
    measure: (element: HTMLDivElement | null) => void;
  }
> = ({
  id,
  text,
  role,
  highlight,
  swap,
  delaySeconds,
  swapFallback,
  measure,
}) => {
  const palette = useVisualPalette();
  const { u } = useVideoLayout();
  const seconds = useSceneSeconds();
  const show = useReveal(delaySeconds, 0.35, "overshoot");
  const look = partLook(useElementState(id));
  const swapAt = useBeatStartFor(id, "swap") ?? swapFallback;
  // The swap: the word is struck, slides up and out, and the new one rises in; the tile flashes as it turns.
  const struck = swap && swapAt !== undefined ? easeFrom(seconds, swapAt, 0.35) : 0;
  const turned =
    swap && swapAt !== undefined ? easeFrom(seconds, swapAt + 0.3, 0.5) : 0;
  const flash = Math.sin(Math.PI * turned);
  // A focused tile takes the lesson colour, as a highlighted one does, and so does a swapped one; the role under it follows.
  const lit = Math.max(highlight ? 1 : 0, look.emphasis, turned);
  const fill = mixColors(palette.surface, palette.lesson, lit);
  const ink = lit > 0.5 ? palette.onLesson : palette.onSurface;
  const rise = Math.min(1, show);
  const slide = u(40);
  const roleColour = lit > 0.5 ? palette.lesson : palette.muted;
  return (
    <div
      ref={measure}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: u(10),
        opacity: rise * look.opacity,
        transform: `translateY(${(1 - show) * u(24) - look.emphasis * u(10)}px) scale(${1 + 0.1 * look.emphasis + 0.08 * flash})`,
      }}
    >
      <div
        style={{
          display: "grid",
          overflow: "hidden",
          padding: `${u(14)}px ${u(22)}px`,
          borderRadius: u(16),
          backgroundColor: fill,
          color: ink,
          border: `${u(3)}px solid ${lit > 0.5 ? palette.lesson : palette.border}`,
          fontFamily: palette.fontDisplay,
          fontWeight: 800,
          fontSize: u(46),
          lineHeight: 1.1,
          textAlign: "center",
          boxShadow:
            look.emphasis + flash > 0
              ? `0 ${u(10)}px ${u(26)}px ${withAlpha(palette.lesson, 0.3 * Math.max(look.emphasis, flash))}`
              : "none",
        }}
      >
        <span
          style={{
            gridArea: "1 / 1",
            opacity: 1 - turned,
            transform: `translateY(${-turned * slide}px)`,
          }}
        >
          <span style={strikeStyle(struck * (1 - turned), ink, u(5))}>
            {text}
          </span>
        </span>
        {swap ? (
          <span
            style={{
              gridArea: "1 / 1",
              opacity: turned,
              transform: `translateY(${(1 - turned) * slide}px)`,
            }}
          >
            {swap.text}
          </span>
        ) : null}
      </div>
      {role || swap?.role ? (
        <div
          style={{
            display: "grid",
            justifyItems: "center",
            borderTop: `${u(4)}px solid ${lit > 0.5 ? palette.lesson : palette.axis}`,
            paddingTop: u(6),
            fontFamily: palette.fontBody,
            fontWeight: 700,
            fontSize: u(24),
            color: roleColour,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <span
            style={{ gridArea: "1 / 1", opacity: swap?.role ? 1 - turned : 1 }}
          >
            {role ?? ""}
          </span>
          {swap?.role ? (
            <span style={{ gridArea: "1 / 1", opacity: turned }}>
              {swap.role}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/** A point of the arrow's curve (a cubic from one tile's top to another's, rising between them). */
const curvePoint = (
  t: number,
  [x1, y1]: [number, number],
  [x2, y2]: [number, number],
  rise: number,
): [number, number] => {
  const a = (1 - t) ** 3;
  const b = 3 * (1 - t) ** 2 * t;
  const c = 3 * (1 - t) * t ** 2;
  const d = t ** 3;
  return [
    a * x1 + b * x1 + c * x2 + d * x2,
    a * y1 + b * (y1 - rise) + c * (y2 - rise) + d * y2,
  ];
};

/**
 * An arrow over the tiles from one part to another: drawn from the first to
 * the second as it is said (with the beat that shows it, or after the sentence
 * is built), then a spark runs along it once, and its label settles on top.
 * Pointed at by a beat, it thickens and its label fills with the lesson colour.
 */
const SentenceLink: React.FC<{
  id: string;
  from: TileBox;
  to: TileBox;
  label?: string;
  level: number;
  fallback: number;
}> = ({ id, from, to, label, level, fallback }) => {
  const palette = useVisualPalette();
  const { u } = useVideoLayout();
  const seconds = useSceneSeconds();
  const state = useElementState(id);
  const start = useBeatStartFor(id, "show") ?? fallback;
  const drawn = easeFrom(seconds, start, 0.9);
  const spark = easeFrom(seconds, start + 0.9, 0.8);
  const look = partLook({ ...state, appear: 1 });
  // Clear of the tile when it rises into focus.
  const lift = u(16);
  const head: [number, number] = [from.x + from.width / 2, from.y - lift];
  const tail: [number, number] = [to.x + to.width / 2, to.y - lift];
  const rise =
    u(70) +
    Math.min(u(30), Math.abs(tail[0] - head[0]) * 0.08) +
    level * u(LINK_LEVEL_RISE);
  const path = `M ${head[0]} ${head[1]} C ${head[0]} ${head[1] - rise}, ${tail[0]} ${tail[1] - rise}, ${tail[0]} ${tail[1]}`;
  const [labelX, labelY] = curvePoint(0.5, head, tail, rise);
  const [sparkX, sparkY] = curvePoint(spark, head, tail, rise);
  const stroke = u(5) * (1 + 0.5 * look.emphasis);
  const arrow = u(16);
  const arrowIn = easeFrom(seconds, start + 0.75, 0.2);
  return (
    <>
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
          opacity: look.opacity,
        }}
      >
        <path
          d={path}
          fill="none"
          stroke={palette.lesson}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - drawn}
        />
        <path
          d={`M ${tail[0] - arrow * 0.7} ${tail[1] - arrow} L ${tail[0]} ${tail[1]} L ${tail[0] + arrow * 0.7} ${tail[1] - arrow}`}
          fill="none"
          stroke={palette.lesson}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={arrowIn}
          transform={`translate(0 ${(arrowIn - 1) * u(8)})`}
        />
        {spark > 0 && spark < 1 ? (
          <circle
            cx={sparkX}
            cy={sparkY}
            r={u(9)}
            fill={palette.lesson}
            opacity={Math.sin(Math.PI * spark)}
          />
        ) : null}
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: labelX,
            top: labelY,
            transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * drawn + 0.08 * look.emphasis})`,
            opacity: easeFrom(seconds, start + 0.45, 0.35) * look.opacity,
            whiteSpace: "nowrap",
            padding: `${u(6)}px ${u(16)}px`,
            borderRadius: u(999),
            border: `${u(3)}px solid ${palette.lesson}`,
            backgroundColor: mixColors(
              palette.surface,
              palette.lesson,
              look.emphasis,
            ),
            color: look.emphasis > 0.5 ? palette.onLesson : palette.lesson,
            fontFamily: palette.fontBody,
            fontWeight: 800,
            fontSize: u(24),
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            pointerEvents: "none",
            // Above every arc, not only its own: a higher (nested) arc comes down across the lower label.
            zIndex: 1,
          }}
        >
          {label}
        </div>
      ) : null}
    </>
  );
};
