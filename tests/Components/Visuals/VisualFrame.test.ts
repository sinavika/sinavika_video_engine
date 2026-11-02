import {describe, expect, it} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DrawingScale, StillFigure, stillFontFloor, useFigureFont} from '../../../src/Components/Visuals/VisualFrame';
import {Tag, World} from '../../../src/Components/Visuals/VisualWorld';

/** Prints the size a figure draws a text of `size` at, in its own units. */
const Probe: React.FC<{size: number; scale?: number}> = ({size, scale}) => React.createElement('i', null, String(Math.round(useFigureFont(scale)(size) * 100) / 100));
const probe = (size: number, wrap: (child: React.ReactElement) => React.ReactElement = (child) => child, scale?: number) => renderToStaticMarkup(wrap(React.createElement(Probe, {size, scale})));
const still = (child: React.ReactElement) => React.createElement(StillFigure, {textFloor: 20, children: child});

describe('figure text in an app still', () => {
	it('is never under the floor, in the units of the drawing it is written in', () => {
		expect(stillFontFloor(undefined, 0.5)).toBe(0);
		expect(stillFontFloor(20, 1)).toBe(20);
		// A unit of a battle's world takes 0.5375 layout units in the still: 37.2 of them make 20.
		expect(stillFontFloor(20, 0.5375)).toBeCloseTo(37.21, 2);
	});

	it('keeps a video’s sizes and raises a still’s small text by the scale of its drawing', () => {
		expect(probe(13)).toBe('<i>13</i>');
		expect(probe(13, still)).toBe('<i>20</i>');
		expect(probe(30, still)).toBe('<i>30</i>');
		expect(probe(13, (child) => still(React.createElement(DrawingScale, {scale: 0.5, children: child})))).toBe('<i>40</i>');
		// A drawing that knows its own scale passes it.
		expect(probe(13, still, 2)).toBe('<i>13</i>');
	});

	it('raises a World’s labels and their halos alike, and leaves them as they are in a video', () => {
		const tag = React.createElement(Tag, {x: 0, y: 0, text: 'Ekvator', size: 21});
		const world = (child: React.ReactElement) => React.createElement(World, {width: 860, height: 516, children: child});
		expect(renderToStaticMarkup(world(tag))).toMatch(/font-size="21"/);
		const raised = renderToStaticMarkup(still(world(tag)));
		const size = Number(/font-size="([\d.]+)"/.exec(raised)?.[1]);
		expect(size * 0.86).toBeCloseTo(20, 6);
		expect(Number(/stroke-width="([\d.]+)"/.exec(raised)?.[1])).toBeCloseTo(size * 0.32, 6);
	});
});
