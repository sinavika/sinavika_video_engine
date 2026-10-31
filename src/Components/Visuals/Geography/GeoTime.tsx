import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {Tag, usePartLook, World} from '../VisualWorld';

// ---------------------------------------------------------------- geological time column

type GeoTime = Extract<CourseVisual, {kind: 'geotime'}>;

/**
 * The geological eras as rock layers, the oldest at the bottom (not to scale), with their ages and what happened
 * in each, in the world or in Turkey. Text is the lesson's, from the MEB summary of each era.
 */
const ERAS: {id: string; name: string; number: string; age: string; color: string; top: number; bottom: number; world: string[]; turkey: string[]}[] = [
	{
		id: 'kuvaterner',
		name: 'Kuvaterner',
		number: 'III. Zaman · son dönem',
		age: '~2,6 milyon yıl – bugün',
		color: '#F3E5AB',
		top: 24,
		bottom: 136,
		world: ['Buzul devirleri gelip geçer', 'İnsan ortaya çıkar', 'Bugünkü iklimler oluşur'],
		turkey: ['Ege Denizi ve boğazlar oluşur', 'Karadeniz denize bağlanır; delta ovaları', 'Yüksek dağlarda buzul izleri'],
	},
	{
		id: 'tersiyer',
		name: 'Tersiyer',
		number: 'III. Zaman (Senozoyik)',
		age: '66 – 2,6 milyon yıl',
		color: '#E9C46A',
		top: 136,
		bottom: 248,
		world: ['Alpler, Himalayalar, And ve Kayalık dağları', 'Linyit, petrol, bor ve tuz yatakları', 'Volkanizma; kıtalar bugünkü yerlerine yaklaşır'],
		turkey: ['Alp orojenezi: Toroslar, Kuzey Anadolu Dağları', 'Anadolu kara olur; batıda horst-graben', 'Linyit, bor, petrol; volkanlar (Erciyes, Ağrı)'],
	},
	{
		id: 'mezozoyik',
		name: 'Mezozoyik',
		number: 'II. Zaman',
		age: '252 – 66 milyon yıl',
		color: '#8AB17D',
		top: 248,
		bottom: 360,
		world: ['Dinozorlar, ammonitler; ilk memeliler ve kuşlar', 'Tetis Denizi’nde kalın tortul tabakalar', 'Pangea, Lavrasya ve Gondvana’ya ayrılır'],
		turkey: ['Anadolu’nun büyük kısmı Tetis’in altında', 'Tetis’te kalın tortul ve kalker tabakaları', 'Sonraki dağların malzemesi birikir'],
	},
	{
		id: 'paleozoyik',
		name: 'Paleozoyik',
		number: 'I. Zaman',
		age: '541 – 252 milyon yıl',
		color: '#2A9D8F',
		top: 360,
		bottom: 472,
		world: ['Pangea oluşur', 'Taş kömürü yatakları', 'Balıklar, sürüngenler; Kaledoniyen-Hersiniyen dağları'],
		turkey: ['Zonguldak–Bartın taş kömürü', 'Istranca, Bitlis, Batı Anadolu’da dağ oluşumları', 'Hersiniyen kıvrılmaları'],
	},
	{
		id: 'prekambriyen',
		name: 'Prekambriyen',
		number: 'İlkel zaman',
		age: '4,6 milyar – 541 milyon yıl',
		color: '#6D597A',
		top: 472,
		bottom: 584,
		world: ['Yer kabuğu, sular ve atmosfer oluşmaya başlar', 'İlk canlılar: bakteri ve algler', 'En eski kayaçlar: masifler'],
		turkey: ['Türkiye’nin en eski kayaçları', 'Masiflerin temeli (Menderes, Kırşehir)', 'Başkalaşmış (metamorfik) kayaçlar'],
	},
];

/**
 * The geological time column: eras stacked as rock layers, the oldest at the bottom, each with its age and three
 * events (`turkey` for Turkey's own history); beats point at an era by its name (prekambriyen, paleozoyik,
 * mezozoyik, tersiyer, kuvaterner) or at senozoyik for both of its periods.
 */
export const GeoTimeVisual: React.FC<VisualBoxProps & {visual: GeoTime}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const looks = {
		prekambriyen: usePartLook('prekambriyen', easeFrom(seconds, delaySeconds, 0.6)),
		paleozoyik: usePartLook('paleozoyik', easeFrom(seconds, delaySeconds + 0.4, 0.6)),
		mezozoyik: usePartLook('mezozoyik', easeFrom(seconds, delaySeconds + 0.8, 0.6)),
		tersiyer: usePartLook('tersiyer', easeFrom(seconds, delaySeconds + 1.2, 0.6)),
		kuvaterner: usePartLook('kuvaterner', easeFrom(seconds, delaySeconds + 1.6, 0.6)),
	};
	const cenozoic = usePartLook('senozoyik', easeFrom(seconds, delaySeconds + 1.2, 0.6));
	const left = 40;
	const columnRight = 320;
	return (
		<World width={width} height={height}>
			{ERAS.map((era) => {
				const own = looks[era.id as keyof typeof looks];
				const inCenozoic = era.id === 'tersiyer' || era.id === 'kuvaterner';
				// A beat on "senozoyik" lights both of its periods.
				const focused = Math.max(own.focused, inCenozoic ? cenozoic.focused : 0);
				const opacity = inCenozoic && cenozoic.focused > own.focused ? Math.max(own.opacity, cenozoic.opacity) : own.opacity;
				const events = visual.turkey ? era.turkey : era.world;
				const middle = (era.top + era.bottom) / 2;
				return (
					<g key={era.id} opacity={opacity}>
						{/* The layer: wavy top edge like bedding, darker when pointed at. */}
						<path d={`M${left} ${era.bottom} L${left} ${era.top} Q${left + 65} ${era.top - 6} ${left + 130} ${era.top} T${columnRight} ${era.top} L${columnRight} ${era.bottom} Z`} fill={era.color} stroke={focused > 0.5 ? palette.lesson : withAlpha('#3D2B1A', 0.35)} strokeWidth={focused > 0.5 ? 5 : 2} />
						<text x={left + 14} y={middle - 8} fontSize={27} fontWeight={800} fill={era.id === 'paleozoyik' || era.id === 'prekambriyen' ? '#FFFFFF' : palette.ink} fontFamily={palette.fontDisplay}>
							{era.name}
						</text>
						<text x={left + 14} y={middle + 20} fontSize={17} fontWeight={600} fill={era.id === 'paleozoyik' || era.id === 'prekambriyen' ? '#F1F1F1' : palette.ink} fontFamily={palette.fontBody}>
							{era.number}
						</text>
						<Tag x={columnRight + 18} y={era.top + 18} text={era.age} size={19} weight={800} fill={focused > 0.5 ? palette.lesson : palette.muted} />
						{events.map((event, index) => (
							<Tag key={index} x={columnRight + 30} y={era.top + 46 + index * 25} text={`• ${event}`} size={19} weight={focused > 0.5 ? 700 : 600} fill={focused > 0.5 ? palette.ink : palette.muted} />
						))}
					</g>
				);
			})}
			{/* Senozoyik spans its two periods. */}
			<g opacity={Math.max(looks.tersiyer.opacity, looks.kuvaterner.opacity)}>
				<path d={`M${left - 14} 26 L${left - 22} 26 L${left - 22} 246 L${left - 14} 246`} fill="none" stroke={cenozoic.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={cenozoic.focused > 0.5 ? 5 : 3} />
				<text x={left - 30} y={136} fontSize={17} fontWeight={800} fill={cenozoic.focused > 0.5 ? palette.lesson : palette.ink} fontFamily={palette.fontDisplay} transform={`rotate(-90 ${left - 30} 136)`} textAnchor="middle">
					Senozoyik
				</text>
			</g>
			<Tag x={columnRight} y={596} text="Katmanlar ölçeksizdir; en eski en altta" anchor="end" size={14} fill={palette.muted} />
		</World>
	);
};
