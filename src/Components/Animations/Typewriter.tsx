import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {typewriterLength} from '../../Animations/Motion';

type TypewriterProps = {
	text: string;
	delaySeconds?: number;
	charactersPerSecond?: number;
};

/**
 * Reveals plain text character by character. The unrevealed part stays in the
 * layout (transparent), so lines never re-wrap while typing.
 */
export const Typewriter: React.FC<TypewriterProps> = ({text, delaySeconds = 0, charactersPerSecond = 32}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	// Array.from splits by code point, keeping characters such as "İ" intact.
	const characters = Array.from(text);
	const visible = typewriterLength(characters.length, frame, fps, delaySeconds, charactersPerSecond);

	return (
		<span>
			{characters.slice(0, visible).join('')}
			<span style={{opacity: 0}}>{characters.slice(visible).join('')}</span>
		</span>
	);
};
