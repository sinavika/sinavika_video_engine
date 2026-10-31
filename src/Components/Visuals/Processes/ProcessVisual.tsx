import React from 'react';
import type {VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {AvalancheProcess} from './Geography/Avalanche';
import {CoastProcess} from './Geography/Coast';
import {CycloneProcess} from './Geography/Cyclone';
import {DesertProcess} from './Geography/Desert';
import {ErosionProcess} from './Geography/Erosion';
import {FloodProcess} from './Geography/Flood';
import {GlacierProcess} from './Geography/Glacier';
import {GreenhouseProcess} from './Geography/Greenhouse';
import {KarstProcess} from './Geography/Karst';
import {LandslideProcess} from './Geography/Landslide';
import {OceanProcess} from './Geography/Ocean';
import {RockCycleProcess} from './Geography/RockCycle';
import {SpringProcess} from './Geography/Spring';
import {VolcanoProcess} from './Geography/Volcano';
import {WaterCycleProcess} from './Geography/WaterCycle';
import {WeatheringProcess} from './Geography/Weathering';
import {AreaModelProcess} from './Mathematics/AreaModel';
import {NumberLineProcess} from './Mathematics/NumberLine';
import {CarbonCycleProcess} from './Biology/CarbonCycle';
import {MitosisProcess} from './Biology/Mitosis';
import {NitrogenCycleProcess} from './Biology/NitrogenCycle';
import {HeatTransferProcess} from './Physics/HeatTransfer';
import {PhaseChangeProcess} from './Physics/PhaseChange';
import {PressureProcess} from './Physics/Pressure';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/** A natural process told stage by stage (ProcessCatalog): one scene per process. */
export const ProcessVisual: React.FC<VisualBoxProps & {visual: ProcessSpec}> = (props) => {
	switch (props.visual.process) {
		case 'landslide':
			return <LandslideProcess {...props} />;
		case 'erosion':
			return <ErosionProcess {...props} />;
		case 'karst':
			return <KarstProcess {...props} />;
		case 'spring':
			return <SpringProcess {...props} />;
		case 'rockcycle':
			return <RockCycleProcess {...props} />;
		case 'volcano':
			return <VolcanoProcess {...props} />;
		case 'glacier':
			return <GlacierProcess {...props} />;
		case 'coast':
			return <CoastProcess {...props} />;
		case 'desert':
			return <DesertProcess {...props} />;
		case 'weathering':
			return <WeatheringProcess {...props} />;
		case 'greenhouse':
			return <GreenhouseProcess {...props} />;
		case 'ocean':
			return <OceanProcess {...props} />;
		case 'watercycle':
			return <WaterCycleProcess {...props} />;
		case 'cyclone':
			return <CycloneProcess {...props} />;
		case 'flood':
			return <FloodProcess {...props} />;
		case 'avalanche':
			return <AvalancheProcess {...props} />;
		case 'phasechange':
			return <PhaseChangeProcess {...props} />;
		case 'heattransfer':
			return <HeatTransferProcess {...props} />;
		case 'pressure':
			return <PressureProcess {...props} />;
		case 'mitosis':
			return <MitosisProcess {...props} />;
		case 'nitrogencycle':
			return <NitrogenCycleProcess {...props} />;
		case 'carboncycle':
			return <CarbonCycleProcess {...props} />;
		case 'areamodel':
			return <AreaModelProcess {...props} />;
		case 'numberline':
			return <NumberLineProcess {...props} />;
	}
};
