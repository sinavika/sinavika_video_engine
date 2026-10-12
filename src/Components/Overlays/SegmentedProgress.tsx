import React from 'react';
import {useCurrentFrame} from 'remotion';
import {activeSceneIndex, sceneProgressAt, type ScenePlan} from '../../Scenes/ScenePlan';
import {SPACING} from '../../Themes/DesignTokens';
import {withAlpha} from '../../Themes/Theme';
import {useInk} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {Text} from '../Typography/Text';

type SegmentedProgressProps = {
	plan: ScenePlan;
	/** Scenes to show a segment for. Defaults to every scene in the plan. */
	sceneIds?: string[];
	/** Optional caption per segment, in the same order as the segments. */
	labels?: string[];
	/** Bar height in reference pixels. */
	height?: number;
	color?: string;
};

/**
 * One segment per scene, filling as the scene plays. Without labels it reads
 * as a story bar; with labels it becomes a chapter indicator.
 */
export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({plan, sceneIds, labels, height = 8, color}) => {
	const frame = useCurrentFrame();
	const ink = useInk();
	const {u} = useVideoLayout();
	const progress = sceneProgressAt(plan, frame);
	const activeId = plan.scenes[activeSceneIndex(plan, frame)]?.id;
	const segments = plan.scenes
		.map((scene, index) => ({id: scene.id, progress: progress[index]}))
		.filter((segment) => !sceneIds || sceneIds.includes(segment.id));
	const fill = color ?? ink.emphasis;

	return (
		<div style={{display: 'flex', gap: u(SPACING.xs), flex: 1, minWidth: 0}}>
			{segments.map((segment, index) => (
				<div key={segment.id} style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.xs)}}>
					<div
						style={{
							height: u(height),
							borderRadius: u(height),
							backgroundColor: withAlpha(ink.text, 0.18),
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								width: `${(segment.progress * 100).toFixed(3)}%`,
								height: '100%',
								borderRadius: u(height),
								backgroundColor: fill,
							}}
						/>
					</div>
					{labels?.[index] ? (
						<Text
							variant="label"
							size={20}
							tone={segment.id === activeId ? 'default' : 'muted'}
							style={{
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								opacity: segment.id === activeId ? 1 : 0.7,
							}}
						>
							{labels[index]}
						</Text>
					) : null}
				</div>
			))}
		</div>
	);
};
