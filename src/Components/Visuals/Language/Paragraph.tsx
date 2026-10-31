import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {RichInline} from '../../Typography/RichText';
import {Text} from '../../Typography/Text';
import {partLook} from '../Structure/StructureLook';
import {strikeStyle, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useBeatStartFor, useElementState, useHasBeats} from '../VisualTimeline';

type Paragraph = Extract<CourseVisual, { kind: "paragraph" }>;

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
  const topicShow = easeFrom(seconds, delaySeconds, 0.45) * topicState.appear;
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
  const show = easeFrom(seconds, shownAt, 0.45);
  // The main idea lights up when the arrows reach it; the sentence that breaks the flow is struck when it is pointed at.
  const lit = sentence.main ? easeFrom(seconds, rail.arrowAt ?? shownAt, 0.45) : 0;
  const pointedAt = useBeatStartFor(id, "focus");
  const strikeAt = sentence.off
    ? (pointedAt ?? (hasBeats ? undefined : strikeFallback))
    : undefined;
  const struck = strikeAt === undefined ? 0 : easeFrom(seconds, strikeAt, 0.5);
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
    const grown = easeFrom(seconds, part.start, half);
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
  const stub = rail.stubAt === undefined ? 0 : easeFrom(seconds, rail.stubAt, 0.25);
  const arrow =
    rail.arrowAt === undefined ? 0 : easeFrom(seconds, rail.arrowAt, 0.35);
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
