import React, {useMemo} from 'react';
import {parseRichText} from '../../Schemas/RichText';
import {useInk, useTheme} from '../../Themes/ThemeContext';
import {MathExpression} from './MathExpression';
import {Text, type TextProps} from './Text';

type RichTextProps = Omit<TextProps, 'children'> & {text: string};

/** Text with inline `$math$`, `$$display math$$` and `**emphasis**`. See Schemas/RichText.ts. */
export const RichText: React.FC<RichTextProps> = ({text, ...textProps}) => {
	const {typography} = useTheme();
	const ink = useInk();
	const segments = useMemo(() => parseRichText(text), [text]);

	return (
		<Text {...textProps}>
			{segments.map((segment, index) => {
				switch (segment.kind) {
					case 'text':
						return <React.Fragment key={index}>{segment.value}</React.Fragment>;
					case 'strong':
						return (
							<strong key={index} style={{fontWeight: typography.strongWeight, color: ink.emphasis}}>
								{segment.value}
							</strong>
						);
					case 'math':
						return <MathExpression key={index} latex={segment.value} />;
					case 'displayMath':
						return <MathExpression key={index} latex={segment.value} display />;
				}
			})}
		</Text>
	);
};
