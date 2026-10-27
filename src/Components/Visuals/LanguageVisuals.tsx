import React, { useLayoutEffect, useRef, useState } from "react";
import { Easing, interpolate } from "remotion";
import { mixColors } from "../../Themes/ColorPalette";
import { withAlpha } from "../../Themes/Theme";
import { useTheme } from "../../Themes/ThemeContext";
import { useVideoLayout } from "../Layouts/VideoLayout";
import { RichInline } from "../Typography/RichText";
import { Text } from "../Typography/Text";
import { partLook } from "./StructureVisuals";
import {
  strikeStyle,
  useReveal,
  useSceneSeconds,
  useVisualPalette,
  type VisualBoxProps,
} from "./VisualFrame";
import {
  useBeatStartFor,
  useElementState,
  useHasBeats,
} from "./VisualTimeline";
import type { CourseVisual } from "./VisualSchemas";

type Sentence = Extract<CourseVisual, { kind: "sentence" }>;
type Paragraph = Extract<CourseVisual, { kind: "paragraph" }>;

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

const ease = (seconds: number, from: number, duration: number) =>
  interpolate(seconds, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

/** Seconds between word tiles coming in, left to right. */
const TILE_STEP = 0.22;

/** Where a tile sits in its row (layout pixels, transforms left out). */
type TileBox = { x: number; y: number; width: number; height: number };

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
  // Arrows run over the tiles: room above each row of tiles for them.
  const linkRoom = visual.links.length ? u(118) : 0;
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
  const struck = swap && swapAt !== undefined ? ease(seconds, swapAt, 0.35) : 0;
  const turned =
    swap && swapAt !== undefined ? ease(seconds, swapAt + 0.3, 0.5) : 0;
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
  fallback: number;
}> = ({ id, from, to, label, fallback }) => {
  const palette = useVisualPalette();
  const { u } = useVideoLayout();
  const seconds = useSceneSeconds();
  const state = useElementState(id);
  const start = useBeatStartFor(id, "show") ?? fallback;
  const drawn = ease(seconds, start, 0.9);
  const spark = ease(seconds, start + 0.9, 0.8);
  const look = partLook({ ...state, appear: 1 });
  // Clear of the tile when it rises into focus.
  const lift = u(16);
  const head: [number, number] = [from.x + from.width / 2, from.y - lift];
  const tail: [number, number] = [to.x + to.width / 2, to.y - lift];
  const rise = u(70) + Math.min(u(30), Math.abs(tail[0] - head[0]) * 0.08);
  const path = `M ${head[0]} ${head[1]} C ${head[0]} ${head[1] - rise}, ${tail[0]} ${tail[1] - rise}, ${tail[0]} ${tail[1]}`;
  const [labelX, labelY] = curvePoint(0.5, head, tail, rise);
  const [sparkX, sparkY] = curvePoint(spark, head, tail, rise);
  const stroke = u(5) * (1 + 0.5 * look.emphasis);
  const arrow = u(16);
  const arrowIn = ease(seconds, start + 0.75, 0.2);
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
            opacity: ease(seconds, start + 0.45, 0.35) * look.opacity,
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
          }}
        >
          {label}
        </div>
      ) : null}
    </>
  );
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
/** Seconds between the paragraph's sentences coming in, top to bottom. */
const SENTENCE_STEP = 0.45;
/** How long a stretch of rail between two sentences takes to draw. */
const RAIL_SECONDS = 0.3;
const ROW_GAP = 18;

/** A drawn piece of rail inside a row: its top or bottom half, drawn from `start` towards `towards`. */
type RailPiece = { start: number; towards: "down" | "up" };
type RowRail = {
  stubAt?: number;
  top?: RailPiece;
  bottom?: RailPiece;
  arrowAt?: number;
};

/**
 * When each piece of the rail is drawn. Each supporting sentence sends a stub
 * to the rail once it is shown; from there the rail runs, stretch by stretch,
 * to the main sentence, where the arrow points in and the main sentence
 * lights up. A stretch is drawn once, by the first sentence whose arrow
 * reaches it, and never before both sentences it joins are on screen.
 */
export const paragraphRails = (
  sentences: readonly { main: boolean; off: boolean }[],
  shownAt: readonly number[],
): RowRail[] => {
  const rails: RowRail[] = sentences.map(() => ({}));
  const main = sentences.findIndex((sentence) => sentence.main);
  if (main < 0) return rails;
  const supports = sentences.map(
    (sentence, index) => index !== main && !sentence.off,
  );
  supports.forEach(
    (support, index) => support && (rails[index].stubAt = shownAt[index] + 0.4),
  );
  const half = RAIL_SECONDS / 2;
  const arrivals: number[] = [];
  // Stretch k joins rows k and k + 1. Above the main sentence the rail runs down, below it up.
  let flow = Infinity;
  for (let row = 0; row < main; row++) {
    const own = rails[row].stubAt;
    flow = Math.min(flow, own === undefined ? Infinity : own + 0.25);
    if (!Number.isFinite(flow)) continue;
    const start = Math.max(flow, shownAt[row + 1] + 0.3);
    rails[row].bottom = { start, towards: "down" };
    rails[row + 1].top = { start: start + half, towards: "down" };
    flow = start + RAIL_SECONDS;
  }
  if (Number.isFinite(flow)) arrivals.push(flow);
  flow = Infinity;
  for (let row = sentences.length - 1; row > main; row--) {
    const own = rails[row].stubAt;
    flow = Math.min(flow, own === undefined ? Infinity : own + 0.25);
    if (!Number.isFinite(flow)) continue;
    const start = Math.max(flow, shownAt[row - 1] + 0.3);
    rails[row].top = { start, towards: "up" };
    rails[row - 1].bottom = { start: start + half, towards: "up" };
    flow = start + RAIL_SECONDS;
  }
  if (Number.isFinite(flow)) arrivals.push(flow);
  rails[main].arrowAt = arrivals.length
    ? Math.min(...arrivals)
    : shownAt[main] + 0.4;
  return rails;
};

/** Hooks are called a fixed number of times, whatever the paragraph's length, so their order never changes. */
const useSentenceStarts = (count: number, delaySeconds: number): number[] => {
  const starts: number[] = [];
  for (let index = 0; index < ROMAN.length; index++) {
    const shown = useBeatStartFor(`s${index + 1}`, "show");
    if (index < count)
      starts.push(shown ?? delaySeconds + 0.5 + index * SENTENCE_STEP);
  }
  return starts;
};

/**
 * A paragraph mapped: its topic over it, its sentences one under another with
 * their exam numbers and roles, and a rail on the right on which every
 * supporting sentence's arrow runs into the main idea, which then lights up.
 */
export const ParagraphVisual: React.FC<
  VisualBoxProps & { visual: Paragraph }
> = ({ visual, delaySeconds = 0 }) => {
  const palette = useVisualPalette();
  const { u } = useVideoLayout();
  const seconds = useSceneSeconds();
  const shownAt = useSentenceStarts(visual.sentences.length, delaySeconds);
  const rails = paragraphRails(visual.sentences, shownAt);
  const hasMain = visual.sentences.some((sentence) => sentence.main);
  const builtAt = Math.max(...shownAt) + 0.8;
  const topicState = useElementState("topic");
  const topicShow = ease(seconds, delaySeconds, 0.45) * topicState.appear;
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: u(22),
      }}
    >
      {visual.topic ? (
        <div
          style={{
            alignSelf: "center",
            display: "flex",
            alignItems: "center",
            gap: u(14),
            opacity: topicShow,
            transform: `translateY(${(1 - topicShow) * u(-16)}px) scale(${1 + 0.06 * topicState.emphasis})`,
          }}
        >
          <span
            style={{
              padding: `${u(6)}px ${u(16)}px`,
              borderRadius: u(999),
              backgroundColor: palette.lesson,
              color: palette.onLesson,
              fontFamily: palette.fontBody,
              fontWeight: 800,
              fontSize: u(22),
              letterSpacing: "0.06em",
            }}
          >
            KONU
          </span>
          <span
            style={{
              fontFamily: palette.fontDisplay,
              fontWeight: 800,
              fontSize: u(38),
              color: palette.ink,
            }}
          >
            {visual.topic}
          </span>
        </div>
      ) : null}
      <div
        style={{ display: "flex", flexDirection: "column", gap: u(ROW_GAP) }}
      >
        {visual.sentences.map((sentence, index) => (
          <ParagraphRow
            key={index}
            index={index}
            sentence={sentence}
            shownAt={shownAt[index]}
            rail={rails[index]}
            railColumn={hasMain}
            strikeFallback={builtAt + 0.6}
          />
        ))}
      </div>
    </div>
  );
};

const ParagraphRow: React.FC<{
  index: number;
  sentence: Paragraph["sentences"][number];
  shownAt: number;
  rail: RowRail;
  railColumn: boolean;
  strikeFallback: number;
}> = ({ index, sentence, shownAt, rail, railColumn, strikeFallback }) => {
  const palette = useVisualPalette();
  const { colors } = useTheme();
  const { u } = useVideoLayout();
  const seconds = useSceneSeconds();
  const id = `s${index + 1}`;
  const state = useElementState(id);
  const look = partLook({ ...state, appear: 1 });
  const hasBeats = useHasBeats();
  const show = ease(seconds, shownAt, 0.45);
  // The main idea lights up when the arrows reach it; the sentence that breaks the flow is struck when it is pointed at.
  const lit = sentence.main ? ease(seconds, rail.arrowAt ?? shownAt, 0.45) : 0;
  const pointedAt = useBeatStartFor(id, "focus");
  const strikeAt = sentence.off
    ? (pointedAt ?? (hasBeats ? undefined : strikeFallback))
    : undefined;
  const struck = strikeAt === undefined ? 0 : ease(seconds, strikeAt, 0.5);
  const role = sentence.role ?? (sentence.main ? "Ana düşünce" : undefined);
  const accent =
    lit > 0.5 || look.emphasis > 0.5 ? palette.lesson : palette.border;
  return (
    // The rail is not faded with its row: it runs past dimmed and struck sentences unbroken.
    <div style={{ display: "flex", alignItems: "stretch", gap: u(16) }}>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: u(16),
          flex: 1,
          minWidth: 0,
          opacity: show * look.opacity * (1 - 0.4 * struck),
          transform: `translateX(${(1 - show) * u(-36)}px)`,
        }}
      >
        <div
          style={{
            alignSelf: "center",
            flexShrink: 0,
            width: u(64),
            height: u(64),
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: mixColors(palette.surface, palette.lesson, lit),
            border: `${u(3)}px solid ${lit > 0.5 ? palette.lesson : palette.axis}`,
            color: lit > 0.5 ? palette.onLesson : palette.ink,
            fontFamily: palette.fontDisplay,
            fontWeight: 800,
            fontSize: u(28),
          }}
        >
          {ROMAN[index]}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: `${u(14)}px ${u(24)}px`,
            borderRadius: u(20),
            backgroundColor: mixColors(
              palette.surface,
              palette.lesson,
              0.12 * lit,
            ),
            border: `${u(3)}px solid ${accent}`,
            boxShadow:
              lit > 0
                ? `0 ${u(10)}px ${u(28)}px ${withAlpha(palette.lesson, 0.22 * lit)}`
                : "none",
          }}
        >
          {role ? (
            <div
              style={{
                fontFamily: palette.fontBody,
                fontWeight: 800,
                fontSize: u(22),
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color:
                  lit > 0.5 || look.emphasis > 0.5
                    ? palette.lesson
                    : palette.muted,
                marginBottom: u(4),
              }}
            >
              {role}
            </div>
          ) : null}
          <Text size={32}>
            <span
              style={strikeStyle(struck, withAlpha(colors.danger, 0.8), u(5))}
            >
              <RichInline text={sentence.text} />
            </span>
          </Text>
        </div>
      </div>
      {railColumn ? <RailCell rail={rail} /> : null}
    </div>
  );
};

/** The row's piece of the rail: the stub from its sentence, the rail through it, and at the main sentence the arrow in. */
const RailCell: React.FC<{ rail: RowRail }> = ({ rail }) => {
  const palette = useVisualPalette();
  const { u } = useVideoLayout();
  const seconds = useSceneSeconds();
  const width = u(66);
  const railX = u(44);
  const thick = u(5);
  const reach = u(ROW_GAP / 2) + 1;
  const half = RAIL_SECONDS / 2;
  const piece = (part: RailPiece | undefined, side: "top" | "bottom") => {
    if (!part) return null;
    const grown = ease(seconds, part.start, half);
    // A piece grows from where the rail comes in: from above when it runs down, from below when it runs up.
    const origin = part.towards === "down" ? "top" : "bottom";
    return (
      <div
        style={{
          position: "absolute",
          left: railX - thick / 2,
          width: thick,
          borderRadius: thick,
          backgroundColor: palette.lesson,
          ...(side === "top"
            ? { top: -reach, bottom: "50%" }
            : { top: "50%", bottom: -reach }),
          transformOrigin: origin,
          transform: `scaleY(${grown})`,
        }}
      />
    );
  };
  const stub = rail.stubAt === undefined ? 0 : ease(seconds, rail.stubAt, 0.25);
  const arrow =
    rail.arrowAt === undefined ? 0 : ease(seconds, rail.arrowAt, 0.35);
  const head = u(18);
  return (
    <div style={{ position: "relative", width, flexShrink: 0 }}>
      {piece(rail.top, "top")}
      {piece(rail.bottom, "bottom")}
      {rail.stubAt !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: railX,
            top: "50%",
            height: thick,
            marginTop: -thick / 2,
            borderRadius: thick,
            backgroundColor: palette.lesson,
            transformOrigin: "left",
            transform: `scaleX(${stub})`,
          }}
        />
      ) : null}
      {rail.arrowAt !== undefined ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              width: railX,
              top: "50%",
              height: thick,
              marginTop: -thick / 2,
              borderRadius: thick,
              backgroundColor: palette.lesson,
              transformOrigin: "right",
              transform: `scaleX(${arrow})`,
            }}
          />
          <svg
            style={{
              position: "absolute",
              left: -u(4),
              top: "50%",
              marginTop: -head,
              width: head * 1.2,
              height: head * 2,
              overflow: "visible",
              opacity: arrow,
            }}
          >
            <path
              d={`M ${head} ${head * 0.25} L ${u(4)} ${head} L ${head} ${head * 1.75}`}
              fill="none"
              stroke={palette.lesson}
              strokeWidth={thick}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      ) : null}
    </div>
  );
};
