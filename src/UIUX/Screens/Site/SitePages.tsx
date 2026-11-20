import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {MODULES, MODULE_ORDER, type ModuleKey} from '../../ModuleIdentity';
import {Button, Card, Chip, Field, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {DeviceBrowser, DevicePhone, Grid, Section, Site, SiteNarrowProvider, SiteTitle, useSiteNarrow} from '../../Parts/Web';
import * as Exam from '../Mobile/Exam';
import {HubScreen} from '../Mobile/Hub';
import * as Plan from '../Mobile/Plan';
import * as Lessons from '../Mobile/Lessons';
import * as Tests from '../Mobile/Learn';
import * as WExam from '../Web/ExamWeb';
import * as WStudy from '../Web/StudyWeb';
import {WebHomeScreen} from '../Web/Panel';
import {PRODUCT_CONTENT, type Bi, type ProductContent, type Shot} from './SiteContent';

/**
 * The site before sign-in, second round (owner, 20 Nov 2026: "ürün detay
 * sayfasında özelliklerle alakalı görsel de yok, anlatım da yok … daha iyi ve
 * daha kapsamlı olsun"). Every page is drawn at desktop width (1440) and at
 * phone width (390, `-mobil`); the same component draws both and stacks its
 * rows when `useSiteNarrow()`.
 *
 * The site stays calm (UIUX-Rehberi §0): white and greys, orange only on the
 * main action. A module page carries its module only as an identity mark
 * (tile, chip, link tiles); the colours of the product live inside the real
 * drawings in the phones and browsers.
 */

const useBi = () => {
	const t = useT();
	return (text: Bi) => t(text[0], text[1]);
};

/** Desktop row, phone-width column. */
const Flow: React.FC<{gap?: number; narrowGap?: number; align?: React.CSSProperties['alignItems']; reverse?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({gap = 56, narrowGap = 24, align = 'center', reverse, children, style}) => {
	const narrow = useSiteNarrow();
	return <div style={{display: 'flex', flexDirection: narrow ? 'column' : reverse ? 'row-reverse' : 'row', gap: narrow ? narrowGap : gap, alignItems: narrow ? 'stretch' : align, ...style}}>{children}</div>;
};

/** Columns on desktop, one column at phone width. */
const Cols: React.FC<{n: number; gap?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({n, gap = 20, children, style}) => {
	const narrow = useSiteNarrow();
	return <Grid columns={narrow ? 'minmax(0, 1fr)' : `repeat(${n}, minmax(0, 1fr))`} gap={narrow ? 14 : gap} style={style}>{children}</Grid>;
};

/**
 * A real drawing on a grey panel. Phones sit from the top and run off the
 * bottom edge; `zoom` shows the phone larger, moved up by that many points of
 * the screen (a close-up); browsers fill the panel width.
 */
const ShotPanel: React.FC<{shot: Shot; height: number; width: number; zoom?: number; phoneWidth?: number}> = ({shot, height, width, zoom, phoneWidth = 230}) => {
	const colors = useColors();
	const {C} = shot;
	const pad = 32;
	let body: React.ReactNode;
	if (shot.kind === 'browser') {
		body = (
			<div style={{position: 'absolute', left: pad, right: pad, top: pad}}>
				<DeviceBrowser width={width - pad * 2}>
					<C />
				</DeviceBrowser>
			</div>
		);
	} else if (zoom !== undefined) {
		const zoomWidth = Math.min(width - 48, 380);
		const scale = (zoomWidth * (1 - 2 * 0.04)) / 390;
		body = (
			<div style={{position: 'absolute', left: (width - zoomWidth) / 2, top: 28 - zoom * scale}}>
				<DevicePhone width={zoomWidth}>
					<C />
				</DevicePhone>
			</div>
		);
	} else {
		body = (
			<div style={{position: 'absolute', left: (width - phoneWidth) / 2, top: 30}}>
				<DevicePhone width={phoneWidth}>
					<C />
				</DevicePhone>
			</div>
		);
	}
	return <div style={{position: 'relative', width, height, borderRadius: 28, background: colors.line2, overflow: 'hidden', flexShrink: 0}}>{body}</div>;
};

const Check: React.FC<{children: string}> = ({children}) => {
	const colors = useColors();
	return (
		<Stack row gap={10} align="flex-start">
			<Icon name="checkCircle" size={19} color={colors.ink2} style={{marginTop: 2, flexShrink: 0}} />
			<Text role="body" size={16} color={colors.ink}>
				{children}
			</Text>
		</Stack>
	);
};

const Faq: React.FC<{items: {q: Bi; a: Bi}[]; title?: string}> = ({items, title}) => {
	const colors = useColors();
	const t = useT();
	const bi = useBi();
	const narrow = useSiteNarrow();
	return (
		<Flow align="flex-start" gap={64}>
			<Stack gap={12} style={{width: narrow ? undefined : 360, flexShrink: 0}}>
				<SiteTitle over={t('SSS', 'FAQ')} title={title ?? t('Sık sorulanlar', 'Frequently asked')} size={36} />
				<Text role="body" size={16}>
					{t('Aradığın cevap yoksa bize yaz.', 'Can’t find your answer? Write to us.')}
				</Text>
				<Stack row gap={6}>
					<Text role="headline" size={15} color={colors.ink}>
						{t('İletişim', 'Contact')}
					</Text>
					<Icon name="right" size={16} color={colors.ink} />
				</Stack>
			</Stack>
			<Stack gap={0} style={{flex: 1, minWidth: 0}}>
				{items.map((item, index) => (
					<Stack key={item.q[0]} gap={10} style={{padding: narrow ? '16px 0' : '20px 0', borderBottom: `1px solid ${colors.line}`, borderTop: index ? undefined : `1px solid ${colors.line}`}}>
						<Stack row justify="space-between" gap={12} align="flex-start">
							<Text role="section" size={narrow ? 16 : 17}>
								{bi(item.q)}
							</Text>
							<Icon name={index ? 'plus' : 'minus'} size={20} color={colors.muted} style={{flexShrink: 0, marginTop: 2}} />
						</Stack>
						{index === 0 ? (
							<Text role="body" size={16}>
								{bi(item.a)}
							</Text>
						) : null}
					</Stack>
				))}
			</Stack>
		</Flow>
	);
};

/** Closing call: orange start, the store buttons, the trial note (mobile app, 3 days). */
const SiteCta: React.FC<{title?: string; text?: string}> = ({title, text}) => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	return (
		<Section padding="24px 112px 80px" narrowPadding="8px 20px 48px">
			<Flow gap={32} style={{padding: narrow ? '28px 22px' : '48px 56px', borderRadius: 32, background: colors.bg, border: `1px solid ${colors.line}`, justifyContent: 'space-between'}}>
				<Stack gap={8}>
					<Text role="display" size={narrow ? 28 : 38} style={{lineHeight: narrow ? '34px' : '44px'}}>
						{title ?? t('Bugün ne çalışacağını bil', 'Know what to study today')}
					</Text>
					<Text role="body" size={narrow ? 16 : 17}>
						{text ?? t('Mobil uygulamada 3 gün ücretsiz dene. Web ve mobilde aynı hesap.', 'Try 3 days free in the mobile app. One account on web and mobile.')}
					</Text>
				</Stack>
				<Stack gap={10} style={{flexShrink: 0}}>
					<Button size="lg" block={narrow} iconRight="right">
						{t('Ücretsiz başla', 'Start free')}
					</Button>
					<Stack row gap={8}>
						<Button tone="dark" icon="apple" style={narrow ? {flex: 1} : undefined}>
							App Store
						</Button>
						<Button tone="dark" icon="googlePlay" style={narrow ? {flex: 1} : undefined}>
							Google Play
						</Button>
					</Stack>
				</Stack>
			</Flow>
		</Section>
	);
};

/** "Kimin için" strip: the exams Sınavika prepares for (no YDT, no exams we don't offer). */
const ForExams: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	return (
		<div style={{padding: narrow ? '18px 20px' : '20px 112px', borderTop: `1px solid ${colors.line}`, borderBottom: `1px solid ${colors.line}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8}}>
			<Text role="headline" size={14} color={colors.muted} style={{marginRight: 6}}>
				{t('Kimin için', 'Who it’s for')}
			</Text>
			{['YKS · TYT', 'YKS · AYT', 'KPSS Lisans', 'KPSS Önlisans', 'KPSS Ortaöğretim'].map((exam) => (
				<div key={exam} style={{height: 34, padding: '0 14px', borderRadius: 17, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center'}}>
					<Text role="headline" size={13.5} color={colors.ink2}>
						{exam}
					</Text>
				</div>
			))}
			{narrow ? null : <div style={{flex: 1}} />}
			<Stack row gap={6}>
				<Icon name="tablet" size={16} color={colors.muted} />
				<Text role="small">{t('Web, iOS ve Android', 'Web, iOS and Android')}</Text>
			</Stack>
		</div>
	);
};

/* ───────────────────────── Product detail ───────────────────────── */

const ProductDetail: React.FC<{content: ProductContent}> = ({content}) => {
	const t = useT();
	const bi = useBi();
	const colors = useColors();
	const narrow = useSiteNarrow();
	const {module} = content;
	const name = t(MODULES[module].name);
	const contentWidth = narrow ? 350 : 1216;
	return (
		<Site active={t('Ürünler', 'Products')} narrow={narrow}>
			{/* 1. Hero: what it is, the real app on the web and the phone. */}
			<Section padding="56px 112px 64px" narrowPadding="28px 20px 32px">
				<Flow gap={48} narrowGap={28}>
					<Stack gap={narrow ? 14 : 18} style={{width: narrow ? undefined : 580, flexShrink: 0}}>
						<Text role="small" weight={700}>
							{t('Ürünler', 'Products')} › {name}
						</Text>
						<Stack row gap={10}>
							<Tile module={module} size={narrow ? 40 : 48} />
							<Chip tone="module" module={module}>
								{name}
							</Chip>
						</Stack>
						<Text role="display" size={narrow ? 34 : 52} style={{lineHeight: narrow ? '40px' : '58px', letterSpacing: '-0.03em'}}>
							{bi(content.title)}
						</Text>
						<Text role="body" size={narrow ? 16 : 18} style={{lineHeight: narrow ? '25px' : '29px'}}>
							{bi(content.lead)}
						</Text>
						<Stack row={!narrow} gap={10}>
							<Button size="lg" block={narrow} iconRight="right">
								{t('Ücretsiz başla', 'Start free')}
							</Button>
							<Button tone="ghost" size="lg" block={narrow}>
								{t('Nasıl çalışır?', 'How it works')}
							</Button>
						</Stack>
						<Stack row gap={8}>
							<Icon name="gift" size={16} color={colors.muted} />
							<Text role="small">{t('Mobil uygulamada 3 gün ücretsiz · Web ve mobilde aynı hesap', '3 days free in the mobile app · One account on web and mobile')}</Text>
						</Stack>
					</Stack>
					{narrow ? (
						<ShotPanel shot={content.hero.phone} width={350} height={380} phoneWidth={230} />
					) : (
						<div style={{position: 'relative', flex: 1, height: 500}}>
							<div style={{position: 'absolute', left: 0, top: 18}}>
								<DeviceBrowser width={560}>
									<content.hero.browser.C />
								</DeviceBrowser>
							</div>
							<div style={{position: 'absolute', right: 0, top: 56}}>
								<DevicePhone width={220}>
									<content.hero.phone.C />
								</DevicePhone>
							</div>
						</div>
					)}
				</Flow>
			</Section>
			<ForExams />

			{/* 2. How it works: every step with its own screen. */}
			<Section bg={colors.bg} padding="72px 112px">
				<SiteTitle center over={t('Nasıl çalışır', 'How it works')} title={t(`${content.steps.length} adımda ${name}`, `${name} in ${content.steps.length} steps`)} size={40} />
				<Cols n={content.steps.length} style={{marginTop: narrow ? 24 : 40}}>
					{content.steps.map((step, index) => (
						<div key={step.shot.id + index} style={{borderRadius: 26, background: colors.card, border: `1px solid ${colors.line}`, overflow: 'hidden'}}>
							<ShotPanel shot={step.shot} width={narrow ? 348 : content.steps.length === 4 ? 288 : 392} height={narrow ? 250 : 290} phoneWidth={narrow ? 190 : 200} />
							<Stack gap={6} style={{padding: narrow ? 18 : 22}}>
								<Text role="over" color={colors.muted}>
									{t('Adım', 'Step')} {index + 1}
								</Text>
								<Text role="section" size={19}>
									{bi(step.title)}
								</Text>
								<Text role="body">{bi(step.text)}</Text>
							</Stack>
						</div>
					))}
				</Cols>
			</Section>

			{/* 3. Features: text and screen, alternating. */}
			<Section padding="80px 112px 40px">
				<SiteTitle center over={t('Özellikler', 'Features')} title={t(`${name} neler yapar?`, `What ${name} does`)} size={40} />
			</Section>
			{content.features.map((feature, index) => (
				<Section key={feature.title[0]} padding="32px 112px" narrowPadding="16px 20px 28px">
					<Flow reverse={index % 2 === 1} gap={72} narrowGap={18}>
						<Stack gap={narrow ? 10 : 14} style={{width: narrow ? undefined : 470, flexShrink: 0}}>
							<Text role="num" size={15} color={colors.muted}>
								{String(index + 1).padStart(2, '0')}
							</Text>
							<Text role="title" size={narrow ? 24 : 32} style={{lineHeight: narrow ? '30px' : '38px', letterSpacing: '-0.02em'}}>
								{bi(feature.title)}
							</Text>
							<Text role="body" size={narrow ? 16 : 17} style={{lineHeight: narrow ? '25px' : '27px'}}>
								{bi(feature.text)}
							</Text>
							<Stack gap={8} style={{marginTop: 4}}>
								{feature.points.map((point) => (
									<Check key={point[0]}>{bi(point)}</Check>
								))}
							</Stack>
						</Stack>
						<ShotPanel shot={feature.shot} zoom={feature.zoom} width={narrow ? 350 : contentWidth - 470 - 72} height={narrow ? 320 : 440} phoneWidth={narrow ? 220 : 250} />
					</Flow>
				</Section>
			))}

			{/* 4. A concrete example: what the student gets. */}
			<Section padding="56px 112px 72px" narrowPadding="28px 20px 36px">
				<div style={{borderRadius: 32, background: colors.bg, border: `1px solid ${colors.line}`, padding: narrow ? 20 : 40}}>
					<Flow gap={56} narrowGap={20}>
						<Stack gap={14} style={{flex: 1, minWidth: 0}}>
							<Chip tone="outline" icon="bulb">
								{t('Örnek', 'Example')}
							</Chip>
							<Text role="display" size={narrow ? 26 : 36} style={{lineHeight: narrow ? '32px' : '42px', letterSpacing: '-0.025em'}}>
								{bi(content.example.title)}
							</Text>
							<Text role="body" size={narrow ? 16 : 18} style={{lineHeight: narrow ? '25px' : '29px'}}>
								{bi(content.example.text)}
							</Text>
						</Stack>
						<ShotPanel shot={content.example.shot} zoom={content.example.zoom} width={narrow ? 308 : 480} height={narrow ? 300 : 380} phoneWidth={narrow ? 210 : 240} />
					</Flow>
				</div>
			</Section>

			{/* 5. With the other modules. */}
			<Section bg={colors.bg} padding="72px 112px">
				<SiteTitle center over={t('Birlikte çalışır', 'Works together')} title={t(`${name} ve diğer modüller`, `${name} and the other modules`)} size={36} />
				<Cols n={3} style={{marginTop: narrow ? 22 : 36}}>
					{content.links.map((link) => (
						<div key={link.module} style={{borderRadius: 24, padding: narrow ? 20 : 26, background: colors.card, border: `1px solid ${colors.line}`}}>
							<Stack gap={12}>
								<Stack row gap={12}>
									<Tile module={module} size={40} />
									<Icon name="right" size={18} color={colors.muted} />
									<Tile module={link.module} size={40} />
								</Stack>
								<Text role="section" size={18}>
									{t(MODULES[link.module].name)}
								</Text>
								<Text role="body">{bi(link.text)}</Text>
								<Stack row gap={4}>
									<Text role="headline" size={14} color={colors.ink2}>
										{t('Ürünü incele', 'See the product')}
									</Text>
									<Icon name="right" size={15} color={colors.ink2} />
								</Stack>
							</Stack>
						</div>
					))}
				</Cols>
			</Section>

			{/* 6. FAQ. */}
			<Section padding="80px 112px" narrowPadding="40px 20px">
				<Faq items={content.faq} title={t(`${name} hakkında`, `About ${name}`)} />
			</Section>
			<SiteCta title={t(`${name} ile bugün başla`, `Start with ${name} today`)} />
		</Site>
	);
};

/** A page drawn at desktop or phone width: the page reads `useSiteNarrow()` before `Site` renders, so it is wrapped first. */
const both = (Page: React.FC, narrow: boolean): React.FC => {
	const Drawn: React.FC = () => (
		<SiteNarrowProvider value={narrow}>
			<Page />
		</SiteNarrowProvider>
	);
	return Drawn;
};
const product = (module: ModuleKey, narrow: boolean): React.FC => both(() => <ProductDetail content={PRODUCT_CONTENT[module]} />, narrow);

export const SiteProductStudyPlanScreen = product('studyPlan', false);
export const SiteProductStudyPlanNarrowScreen = product('studyPlan', true);
export const SiteProductLessonsScreen = product('lessons', false);
export const SiteProductLessonsNarrowScreen = product('lessons', true);
export const SiteProductTestsScreen = product('tests', false);
export const SiteProductTestsNarrowScreen = product('tests', true);
export const SiteProductExamScreen = product('exam', false);
export const SiteProductExamNarrowScreen = product('exam', true);
export const SiteProductFlashcardsScreen = product('flashcards', false);
export const SiteProductFlashcardsNarrowScreen = product('flashcards', true);
export const SiteProductSummaryScreen = product('smartSummary', false);
export const SiteProductSummaryNarrowScreen = product('smartSummary', true);
export const SiteProductSinoScreen = product('sinoAi', false);
export const SiteProductSinoNarrowScreen = product('sinoAi', true);

/* ───────────────────────── Shared bits ───────────────────────── */

/** A card with an icon, a title and a sentence (values, approach, channels). */
const InfoCard: React.FC<{icon: UIIconName; title: string; text: string; footer?: React.ReactNode}> = ({icon, title, text, footer}) => {
	const colors = useColors();
	const narrow = useSiteNarrow();
	return (
		<div style={{borderRadius: 24, padding: narrow ? 20 : 26, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', flexDirection: 'column', gap: 10}}>
			<Tile icon={icon} size={44} color={colors.ink2} />
			<Text role="section" size={18}>
				{title}
			</Text>
			<Text role="body">{text}</Text>
			{footer ? <div style={{marginTop: 'auto', paddingTop: 6}}>{footer}</div> : null}
		</div>
	);
};

/** The seven modules in MODULE_ORDER, each with its tagline (two columns at phone width). */
const ModuleGrid: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	return (
		<Grid columns={narrow ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'repeat(7, minmax(0, 1fr))'} gap={12}>
			{MODULE_ORDER.map((key) => (
				<div key={key} style={{borderRadius: 22, padding: 16, background: colors.card, border: `1px solid ${colors.line}`}}>
					<Stack gap={10}>
						<Tile module={key} size={42} />
						<Text role="headline">{t(MODULES[key].name)}</Text>
						<Text role="small" size={12.5}>
							{t(MODULES[key].tagline)}
						</Text>
					</Stack>
				</div>
			))}
		</Grid>
	);
};

/** Legal company details (owner's data; shown on About and Contact). */
const CompanyCard: React.FC<{map?: boolean}> = ({map}) => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	const rows: [string, string][] = [
		[t('Ünvan', 'Company'), 'Coşkunlar Dış Ticaret Ltd. Şti.'],
		['MERSİS', '0211135358300001'],
		[t('Adres', 'Address'), 'Folkart Towers, Bayraklı / İzmir'],
		[t('E-posta', 'E-mail'), 'info@sinavika.com'],
		[t('Telefon', 'Phone'), '0 538 236 26 05'],
	];
	return (
		<Flow gap={24} narrowGap={14} align="stretch">
			<div style={{flex: 1, minWidth: 0, borderRadius: 24, padding: narrow ? 20 : 28, background: colors.card, border: `1px solid ${colors.line}`}}>
				<Text role="section" size={18}>
					{t('Şirket bilgileri', 'Company details')}
				</Text>
				<Stack gap={0} style={{marginTop: 10}}>
					{rows.map(([label, value], index) => (
						<Stack key={label} row={!narrow} gap={narrow ? 2 : 16} align={narrow ? 'flex-start' : 'center'} style={{padding: '12px 0', borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
							<Text role="small" style={{width: narrow ? undefined : 140}}>
								{label}
							</Text>
							<Text role="headline" size={15}>
								{value}
							</Text>
						</Stack>
					))}
				</Stack>
			</div>
			{map ? (
				<div style={{flex: 1, minWidth: 0, minHeight: narrow ? 200 : undefined, borderRadius: 24, background: colors.line2, border: `1px solid ${colors.line}`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					{/* Map area (optional): a static map of the address; drawn as a calm placeholder. */}
					<div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${colors.line} 1px, transparent 1px), linear-gradient(90deg, ${colors.line} 1px, transparent 1px)`, backgroundSize: '44px 44px', opacity: 0.6}} />
					<Stack align="center" gap={8} style={{position: 'relative'}}>
						<div style={{width: 48, height: 48, borderRadius: 24, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="pin" size={22} color={colors.card} />
						</div>
						<Text role="headline" size={14}>
							Folkart Towers
						</Text>
						<Text role="small">{t('Bayraklı / İzmir · Haritada aç', 'Bayraklı / İzmir · Open in maps')}</Text>
					</Stack>
				</div>
			) : null}
		</Flow>
	);
};

/* ───────────────────────── Hakkımızda ───────────────────────── */

const AboutPage: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	return (
		<Site narrow={narrow}>
			{/* Giriş */}
			<Section padding="64px 112px 72px" narrowPadding="32px 20px 32px">
				<Flow gap={48} narrowGap={28}>
					<Stack gap={narrow ? 14 : 18} style={{width: narrow ? undefined : 560, flexShrink: 0}}>
						<Text role="over" color={colors.muted}>
							{t('Hakkımızda', 'About us')}
						</Text>
						<Text role="display" size={narrow ? 34 : 52} style={{lineHeight: narrow ? '40px' : '58px', letterSpacing: '-0.03em'}}>
							{t('Sınava hazırlanan her öğrenci ne çalışacağını bilsin', 'Every student preparing for an exam should know what to study')}
						</Text>
						<Text role="body" size={narrow ? 16 : 18} style={{lineHeight: narrow ? '25px' : '29px'}}>
							{t('Sınavika, YKS ve KPSS’ye hazırlanan öğrencinin her gün sorduğu soruya cevap vermek için kuruldu: bugün ne çalışmalıyım? Denemeden günlük plana kadar hazırlığın tamamını tek yerde topluyoruz.', 'Sınavika was founded to answer the question students ask every day: what should I study today? We bring the whole of exam prep into one place, from exams to a daily plan.')}
						</Text>
					</Stack>
					{narrow ? (
						<ShotPanel shot={{id: 'm-hub-moduller', C: HubScreen, kind: 'phone'}} width={350} height={360} />
					) : (
						<div style={{position: 'relative', flex: 1, height: 460}}>
							<div style={{position: 'absolute', left: 0, top: 10}}>
								<DeviceBrowser width={600} title={t('Sınavika · Ana sayfa', 'Sınavika · Home')}>
									<WebHomeScreen />
								</DeviceBrowser>
							</div>
							<div style={{position: 'absolute', right: 0, top: 50}}>
								<DevicePhone width={210}>
									<HubScreen />
								</DevicePhone>
							</div>
						</div>
					)}
				</Flow>
			</Section>

			{/* Misyon */}
			<Section bg={colors.bg} padding="72px 112px">
				<Flow gap={64} align="flex-start">
					<Stack gap={14} style={{width: narrow ? undefined : 440, flexShrink: 0}}>
						<SiteTitle over={t('Misyonumuz', 'Our mission')} title={t('Tahmin değil, öğrencinin kendi verisi', 'The student’s own data, not guesses')} size={38} />
						<Text role="body" size={narrow ? 16 : 17} style={{lineHeight: '27px'}}>
							{t('Her öğrencinin eksiği farklı. Sınavika denemeni, testlerini ve çalışmanı okur; sana uymayan genel bir program yerine bugün senin için en çok işe yarayacak adımı gösterir.', 'Every student’s gaps are different. Sınavika reads your exams, quizzes and study; instead of a one-size plan it shows the step that helps you most today.')}
						</Text>
					</Stack>
					<Cols n={3} style={{flex: 1}}>
						<InfoCard icon="target" title={t('Ölç', 'Measure')} text={t('Deneme ve testlerle nerede olduğunu konu konu gör.', 'See where you are, topic by topic, from exams and quizzes.')} />
						<InfoCard icon="book" title={t('Öğren', 'Learn')} text={t('Eksik konuyu kısa adımlarla öğren, testle pekiştir.', 'Learn the missing topic in short steps and practise it.')} />
						<InfoCard icon="trend" title={t('Geliş', 'Grow')} text={t('Her gün planındaki net adımı at, gelişimini izle.', 'Take the clear step in your plan every day and watch yourself grow.')} />
					</Cols>
				</Flow>
			</Section>

			{/* Yaklaşım ve içerik kalitesi */}
			<Section padding="80px 112px 72px">
				<SiteTitle center over={t('Yaklaşımımız', 'Our approach')} title={t('İçerik sınavdan başlar', 'Content starts from the exam')} lead={t('Konular, sorular ve anlatımlar hedef sınavın kapsamına göre hazırlanır ve yayından önce kontrol edilir.', 'Topics, questions and lessons follow the exam scope and are checked before they go live.')} size={40} />
				<Cols n={4} style={{marginTop: narrow ? 22 : 40}}>
					<InfoCard icon="list" title={t('Kapsam sınavdan gelir', 'Scope from the exam')} text={t('Konular MEB kazanımlarına ve ÖSYM sınav kapsamına göre sıralanır.', 'Topics follow the national curriculum and the ÖSYM exam scope.')} />
					<InfoCard icon="exam" title={t('Sınav formatında soru', 'Exam-format questions')} text={t('Deneme ve testler sınavın soru tipine, süresine ve net hesabına uyar.', 'Exams and quizzes match the exam’s question types, timing and scoring.')} />
					<InfoCard icon="shield" title={t('Yayından önce kontrol', 'Checked before release')} text={t('Kontrolden geçmeyen içerik öğrenciye gösterilmez.', 'Content that fails the check is never shown to students.')} />
					<InfoCard icon="chart" title={t('Senin verinle öneri', 'Suggestions from your data')} text={t('Öneriler kendi denemenden ve çalışmandan çıkar.', 'Suggestions come from your own exams and study.')} />
				</Cols>
			</Section>

			{/* 7 modül */}
			<Section bg={colors.bg} padding="72px 112px">
				<SiteTitle center over={t('Ürün', 'Product')} title={t('Yedi modül, tek düzen', 'Seven modules, one layout')} lead={t('Uygulamada ve web’de her modül aynı yerde. Bir kere öğren, her yerde kullan.', 'Every module sits in the same place in the app and on the web.')} size={40} />
				<div style={{marginTop: narrow ? 22 : 36}}>
					<ModuleGrid />
				</div>
			</Section>

			{/* Sınavlar */}
			<Section padding="80px 112px 72px">
				<SiteTitle center over={t('Sınavlar', 'Exams')} title={t('YKS ve KPSS için', 'For YKS and KPSS')} size={40} />
				<Cols n={2} style={{marginTop: narrow ? 22 : 36}}>
					{(
						[
							['grad', 'YKS', t('Üniversiteye hazırlanan öğrenciler için.', 'For students preparing for university.'), ['TYT', t('AYT Sayısal', 'AYT Science'), t('AYT Eşit Ağırlık', 'AYT Equal Weight'), t('AYT Sözel', 'AYT Verbal')]],
							['briefcase', 'KPSS', t('Kamuda çalışmak isteyen adaylar için.', 'For candidates aiming for public jobs.'), [t('Lisans', 'Bachelor’s'), t('Önlisans', 'Associate'), t('Ortaöğretim', 'Secondary')]],
						] as [UIIconName, string, string, string[]][]
					).map(([icon, name, text, chips]) => (
						<div key={name} style={{borderRadius: 28, padding: narrow ? 22 : 32, background: colors.card, border: `1px solid ${colors.line}`}}>
							<Stack gap={12}>
								<Stack row gap={12}>
									<Tile icon={icon} size={48} color={colors.ink2} />
									<Text role="title">{name}</Text>
								</Stack>
								<Text role="body">{text}</Text>
								<div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
									{chips.map((chip) => (
										<Chip key={chip} tone="outline">
											{chip}
										</Chip>
									))}
								</div>
							</Stack>
						</div>
					))}
				</Cols>
			</Section>

			{/* Değerler */}
			<Section bg={colors.bg} padding="72px 112px">
				<SiteTitle center over={t('Değerlerimiz', 'Our values')} title={t('Neye önem veriyoruz', 'What we care about')} size={40} />
				<Cols n={4} style={{marginTop: narrow ? 22 : 36}}>
					<InfoCard icon="user" title={t('Önce öğrenci', 'Students first')} text={t('Her karar öğrencinin zamanını korumak için.', 'Every decision protects the student’s time.')} />
					<InfoCard icon="eye" title={t('Açıklık', 'Openness')} text={t('Gizli ücret yok; istediğin an iptal edersin.', 'No hidden fees; cancel any time.')} />
					<InfoCard icon="focus" title={t('Sadelik', 'Simplicity')} text={t('Her ekranda tek ana iş; gereksiz bilgi yok.', 'One main job per screen; nothing extra.')} />
					<InfoCard icon="lock" title={t('Gizlilik', 'Privacy')} text={t('Verin yalnız sana hizmet için işlenir (KVKK).', 'Your data is only used to serve you (KVKK).')} />
				</Cols>
			</Section>

			{/* Şirket bilgileri */}
			<Section padding="80px 112px 40px" narrowPadding="40px 20px 20px">
				<SiteTitle over={t('Kurumsal', 'Company')} title={t('Sınavika’nın arkasında', 'Behind Sınavika')} size={36} />
				<div style={{marginTop: narrow ? 18 : 28}}>
					<Flow gap={24} narrowGap={14} align="stretch">
						<div style={{flex: 1.4, minWidth: 0}}>
							<CompanyCard />
						</div>
						<div style={{flex: 1, minWidth: 0, display: 'flex'}}>
							<InfoCard
								icon="book"
								title={t('Yayınevleriyle iş birliği', 'Working with publishers')}
								text={t('İçeriğini dijitalde öğrenciye ulaştırmak isteyen yayınevleriyle çalışıyoruz.', 'We work with publishers who want to bring their content to students digitally.')}
								footer={
									<Button tone="ghost" iconRight="right">
										{t('Yayınevleri sayfası', 'Publishers page')}
									</Button>
								}
							/>
						</div>
					</Flow>
				</div>
			</Section>

			<Section padding="72px 112px" narrowPadding="40px 20px">
				<Faq
					items={[
						{q: ['Sınavika kimler için?', 'Who is Sınavika for?'], a: ['YKS’ye (TYT, AYT) ve KPSS’ye (Lisans, Önlisans, Ortaöğretim) hazırlanan öğrenciler için.', 'Students preparing for YKS (TYT, AYT) and KPSS (Bachelor’s, Associate, Secondary).']},
						{q: ['İçerikleri kim hazırlıyor?', 'Who makes the content?'], a: ['Sınavika eğitim ekibi; konular MEB kazanımlarına ve ÖSYM kapsamına göre hazırlanır ve yayından önce kontrol edilir.', 'The Sınavika education team; topics follow the curriculum and the ÖSYM scope and are checked before release.']},
						{q: ['Verilerim nasıl korunuyor?', 'How is my data protected?'], a: ['Verin yalnız hizmeti sunmak için işlenir; ayrıntılar Gizlilik ve KVKK sayfalarında.', 'Your data is only used to provide the service; see the Privacy and KVKK pages.']},
						{q: ['Hangi cihazlarda kullanabilirim?', 'Which devices can I use?'], a: ['Web’de, iOS ve Android uygulamasında aynı hesapla.', 'On the web and the iOS and Android apps with one account.']},
						{q: ['Yayınevi olarak nasıl iş birliği yaparız?', 'How can publishers work with us?'], a: ['Yayınevleri sayfasından ya da info@sinavika.com adresinden bize yaz.', 'Write to us from the Publishers page or at info@sinavika.com.']},
					]}
				/>
			</Section>
			<SiteCta />
		</Site>
	);
};

export const SiteAboutScreen = both(AboutPage, false);
export const SiteAboutNarrowScreen = both(AboutPage, true);

/* ───────────────────────── İletişim ───────────────────────── */

const Checkbox: React.FC<{on?: boolean; children: string}> = ({on, children}) => {
	const colors = useColors();
	return (
		<Stack row gap={10} align="flex-start">
			<div style={{width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${on ? colors.ink : colors.line}`, background: on ? colors.ink : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1}}>{on ? <Icon name="check" size={14} color={colors.card} stroke={2.6} /> : null}</div>
			<Text role="small" color={colors.ink2}>
				{children}
			</Text>
		</Stack>
	);
};

const ContactPage: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	const channels: [UIIconName, string, string, string, string][] = [
		['mail', t('E-posta', 'E-mail'), 'info@sinavika.com', t('Ayrıntılı sorular ve ekler için.', 'For detailed questions and attachments.'), t('E-posta yaz', 'Write an e-mail')],
		['phone', t('Telefon', 'Phone'), '0 538 236 26 05', t('Hesap ve ödeme sorularında.', 'For account and payment questions.'), t('Ara', 'Call')],
		['chat', 'WhatsApp Business', '0 538 236 26 05', t('Kısa sorular için mesaj at.', 'Send a message for quick questions.'), t('WhatsApp’tan yaz', 'Message on WhatsApp')],
	];
	return (
		<Site narrow={narrow}>
			<Section padding="64px 112px 40px" narrowPadding="32px 20px 20px">
				<SiteTitle center={!narrow} over={t('İletişim', 'Contact')} title={t('Sana nasıl yardımcı olabiliriz?', 'How can we help?')} lead={t('Soru, öneri ya da ödeme sorunu: bize yaz, ara ya da WhatsApp’tan ulaş.', 'A question, an idea or a payment issue: write, call or message us on WhatsApp.')} size={48} />
			</Section>

			{/* Kanallar */}
			<Section padding="16px 112px 48px" narrowPadding="8px 20px 28px">
				<Cols n={3}>
					{channels.map(([icon, label, value, text, action]) => (
						<InfoCard
							key={label}
							icon={icon}
							title={label}
							text={text}
							footer={
								<Stack gap={12}>
									<Text role="title" size={narrow ? 20 : 22}>
										{value}
									</Text>
									<Button tone="ghost" block iconRight="right">
										{action}
									</Button>
								</Stack>
							}
						/>
					))}
				</Cols>
				<Stack row gap={8} justify={narrow ? 'flex-start' : 'center'} style={{marginTop: 16}}>
					<Icon name="info" size={16} color={colors.muted} />
					<Text role="small">{t('Mesajlarını sırayla yanıtlıyoruz; yanıtımız e-postana gelir.', 'We answer messages in order; our reply comes to your e-mail.')}</Text>
				</Stack>
			</Section>

			{/* Form ve kısayollar */}
			<Section bg={colors.bg} padding="72px 112px" narrowPadding="36px 20px">
				<Flow gap={32} narrowGap={16} align="flex-start">
					<div style={{flex: 1.25, minWidth: 0, borderRadius: 28, padding: narrow ? 20 : 32, background: colors.card, border: `1px solid ${colors.line}`}}>
						<Stack gap={14}>
							<Stack gap={4}>
								<Text role="title">{t('Destek talebi oluştur', 'Open a support request')}</Text>
								<Text role="small">{t('Yıldızlı alanlar zorunlu.', 'Starred fields are required.')}</Text>
							</Stack>
							<Cols n={2} gap={14}>
								<Field label={t('E-posta *', 'E-mail *')} placeholder="ornek@eposta.com" icon="mail" />
								<Field label={t('Adın (isteğe bağlı)', 'Name (optional)')} placeholder={t('Adın ve soyadın', 'Your name')} icon="user" />
							</Cols>
							<Cols n={2} gap={14}>
								<Field label={t('Konu *', 'Topic *')} placeholder={t('Konu seç', 'Choose a topic')} trailing={<Icon name="down" size={16} color={colors.muted} />} />
								<Field label={t('Telefon (isteğe bağlı)', 'Phone (optional)')} placeholder="05xx xxx xx xx" icon="phone" />
							</Cols>
							<Field label={t('Mesajın *', 'Message *')} placeholder={t('Ne oldu? Hangi ekranda? Ne bekliyordun?', 'What happened? On which screen? What did you expect?')} height={140} />
							<Checkbox>{t('Aydınlatma metnini okudum; bu talep için bana dönülmesini kabul ediyorum.', 'I have read the privacy notice and agree to be contacted about this request.')}</Checkbox>
							<Button size="lg" block={narrow} style={narrow ? undefined : {alignSelf: 'flex-start'}}>
								{t('Talebi gönder', 'Send request')}
							</Button>
						</Stack>
					</div>
					<Stack gap={16} style={{flex: 1, minWidth: 0}}>
						<div style={{borderRadius: 24, padding: narrow ? 20 : 26, background: colors.card, border: `1px solid ${colors.line}`}}>
							<Stack gap={10}>
								<Stack row gap={10}>
									<Tile icon="headset" size={40} color={colors.ink2} />
									<Text role="section" size={18}>
										{t('Hesabın var mı?', 'Have an account?')}
									</Text>
								</Stack>
								<Text role="body">{t('Giriş yaptıysan talebini Destek Merkezi’nden aç; önceki taleplerini ve yanıtlarını orada görürsün.', 'Signed in? Open your request in the Help Centre to see your past requests and replies.')}</Text>
								<Button tone="dark" block iconRight="right">
									{t('Destek Merkezi’ne git', 'Go to the Help Centre')}
								</Button>
							</Stack>
						</div>
						<div style={{borderRadius: 24, padding: narrow ? 20 : 26, background: colors.card, border: `1px solid ${colors.line}`}}>
							<Stack gap={4}>
								<Text role="section" size={18}>
									{t('Belki cevabı burada', 'Maybe the answer is here')}
								</Text>
								{[t('Aboneliğimi nasıl iptal ederim?', 'How do I cancel?'), t('Ücretsiz deneme bitince ne olur?', 'What happens after the trial?'), t('Web ve mobilde aynı hesabı kullanabilir miyim?', 'Same account on web and mobile?')].map((q) => (
									<Stack key={q} row justify="space-between" gap={10} style={{padding: '12px 0', borderBottom: `1px solid ${colors.line2}`}}>
										<Text role="headline" size={14.5}>
											{q}
										</Text>
										<Icon name="right" size={16} color={colors.muted} />
									</Stack>
								))}
								<Text role="headline" size={14.5} color={colors.ink2} style={{marginTop: 10}}>
									{t('Tüm sık sorulanlar', 'All FAQs')} →
								</Text>
							</Stack>
						</div>
						<div style={{borderRadius: 24, padding: narrow ? 20 : 26, background: colors.card, border: `1px solid ${colors.line}`}}>
							<Stack gap={12}>
								<Text role="section" size={18}>
									{t('Bizi takip et', 'Follow us')}
								</Text>
								<div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
									{['Instagram', 'YouTube', 'TikTok', 'LinkedIn'].map((name) => (
										<Chip key={name} tone="outline">
											{name}
										</Chip>
									))}
								</div>
							</Stack>
						</div>
					</Stack>
				</Flow>
			</Section>

			<Section padding="72px 112px 80px" narrowPadding="36px 20px 48px">
				<CompanyCard map />
			</Section>
		</Site>
	);
};

export const SiteContactScreen = both(ContactPage, false);
export const SiteContactNarrowScreen = both(ContactPage, true);

/* ───────────────────────── Sınav sayfası şablonu (YKS örneği) ───────────────────────── */

/** One template for /yks-hazirlik, /tyt-hazirlik, /ayt-hazirlik, /kpss-lisans, /kpss-onlisans, /kpss-ortaogretim (Kodlama 14 §5 lists each page's values). */
const ExamLandingPage: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	const sessions: [string, string, [string, string][]][] = [
		['TYT', t('120 soru · 165 dakika', '120 questions · 165 minutes'), [[t('Türkçe', 'Turkish'), '40'], [t('Sosyal Bilimler', 'Social Sciences'), '20'], [t('Temel Matematik', 'Basic Maths'), '40'], [t('Fen Bilimleri', 'Science'), '20']]],
		['AYT', t('160 soru · 180 dakika', '160 questions · 180 minutes'), [[t('Matematik', 'Maths'), '40'], [t('Fen Bilimleri', 'Science'), '40'], [t('Türk Dili ve Edebiyatı-Sosyal 1', 'Literature-Social 1'), '40'], [t('Sosyal Bilimler 2', 'Social Sciences 2'), '40']]],
	];
	const prep: [ModuleKey, string, Shot][] = [
		['studyPlan', t('Sınav tarihine göre her gün görev.', 'Tasks every day up to the exam.'), {id: 'm-plan-bugun', C: Plan.PlanTodayScreen, kind: 'phone'}],
		['lessons', t('TYT ve AYT konuları adım adım.', 'TYT and AYT topics step by step.'), {id: 'm-ders-vitrin', C: Lessons.LessonsHomeScreen, kind: 'phone'}],
		['tests', t('Konu konu, seviye seviye testler.', 'Quizzes by topic and level.'), {id: 'm-test-vitrin', C: Tests.TestsHomeScreen, kind: 'phone'}],
		['exam', t('Türkiye geneli TYT ve AYT denemeleri.', 'Nationwide TYT and AYT exams.'), {id: 'm-deneme-sonuc', C: Exam.ExamResultScreen, kind: 'phone'}],
	];
	return (
		<Site active={t('Sınavlar', 'Exams')} narrow={narrow}>
			<Section padding="56px 112px 64px" narrowPadding="28px 20px 32px">
				<Flow gap={48} narrowGap={24}>
					<Stack gap={narrow ? 14 : 18} style={{width: narrow ? undefined : 620, flexShrink: 0}}>
						<Text role="small" weight={700}>
							{t('Sınavlar › YKS', 'Exams › YKS')}
						</Text>
						<Text role="display" size={narrow ? 34 : 52} style={{lineHeight: narrow ? '40px' : '58px', letterSpacing: '-0.03em'}}>
							{t('YKS’ye hazırlık: TYT ve AYT', 'YKS prep: TYT and AYT')}
						</Text>
						<Text role="body" size={narrow ? 16 : 18} style={{lineHeight: narrow ? '25px' : '29px'}}>
							{t('Sınava kadar her gün ne çalışacağını bil. Türkiye geneli denemeler, konu konu net analizi ve sınav tarihine göre hazırlanan plan.', 'Know what to study every day until the exam. Nationwide exams, points lost by topic and a plan built on your exam date.')}
						</Text>
						<Stack row={!narrow} gap={10}>
							<Button size="lg" block={narrow} iconRight="right">
								{t('YKS planımı hazırla', 'Build my YKS plan')}
							</Button>
							<Button tone="ghost" size="lg" block={narrow}>
								{t('Net hesapla', 'Score calculator')}
							</Button>
						</Stack>
					</Stack>
					<Card padding={narrow ? 20 : 28} radius={28} style={{flex: 1}}>
						<Stack row justify="space-between">
							<Text role="section">{t('YKS 2027’ye kalan', 'Until YKS 2027')}</Text>
							<Chip tone="outline">{t('ÖSYM takvimi', 'ÖSYM calendar')}</Chip>
						</Stack>
						<Grid columns="repeat(3, minmax(0, 1fr))" gap={10} style={{marginTop: 16}}>
							{[
								['203', t('gün', 'days')],
								['29', t('hafta', 'weeks')],
								['5', t('Türkiye geneli', 'nationwide')],
							].map(([value, label]) => (
								<Card key={label} tone="flat" padding={14}>
									<Text role="num" size={narrow ? 26 : 32} align="center">
										{value}
									</Text>
									<Text role="meta" align="center">
										{label}
									</Text>
								</Card>
							))}
						</Grid>
						<Text role="small" style={{marginTop: 12}}>
							{t('Gün ve hafta ÖSYM’nin açıkladığı sınav tarihinden; Türkiye geneli sayısı bu ayın deneme takviminden.', 'Days and weeks from the ÖSYM exam date; the nationwide count from this month’s exam calendar.')}
						</Text>
					</Card>
				</Flow>
			</Section>

			<Section bg={colors.bg} padding="72px 112px">
				<SiteTitle over={t('Sınav yapısı', 'Exam structure')} title={t('İki oturum, dört puan türü', 'Two sessions, four score types')} lead={t('TYT herkes içindir; AYT’de alanına göre testleri çözersin. Puan türleri: SAY, EA, SÖZ.', 'TYT is for everyone; in AYT you take the tests for your field. Score types: Science, Equal Weight, Verbal.')} size={38} />
				<Cols n={2} style={{marginTop: narrow ? 20 : 32}}>
					{sessions.map(([name, meta, rows]) => (
						<div key={name} style={{borderRadius: 26, padding: narrow ? 20 : 28, background: colors.card, border: `1px solid ${colors.line}`}}>
							<Stack row justify="space-between">
								<Text role="title">{name}</Text>
								<Text role="headline" color={colors.ink2}>
									{meta}
								</Text>
							</Stack>
							<Stack gap={0} style={{marginTop: 12}}>
								{rows.map(([label, count], index) => (
									<Stack key={label} row justify="space-between" style={{padding: '11px 0', borderTop: index ? `1px solid ${colors.line2}` : `1px solid ${colors.line}`}}>
										<Text role="body" color={colors.ink}>
											{label}
										</Text>
										<Text role="headline">{t(`${count} soru`, `${count} q`)}</Text>
									</Stack>
								))}
							</Stack>
							<Stack row gap={4} style={{marginTop: 14}}>
								<Text role="headline" size={14} color={colors.ink2}>
									{t(`${name} konuları`, `${name} topics`)}
								</Text>
								<Icon name="right" size={15} color={colors.ink2} />
							</Stack>
						</div>
					))}
				</Cols>
			</Section>

			<Section padding="80px 112px 72px">
				<SiteTitle center over={t('Sınavika ile', 'With Sınavika')} title={t('YKS hazırlığın dört adımda', 'Your YKS prep in four steps')} size={40} />
				<Cols n={4} style={{marginTop: narrow ? 22 : 40}}>
					{prep.map(([key, text, shot]) => (
						<div key={key} style={{borderRadius: 26, background: colors.card, border: `1px solid ${colors.line}`, overflow: 'hidden'}}>
							<ShotPanel shot={shot} width={narrow ? 348 : 288} height={narrow ? 240 : 270} phoneWidth={190} />
							<Stack gap={8} style={{padding: narrow ? 18 : 22}}>
								<Stack row gap={10}>
									<Tile module={key} size={34} />
									<Text role="section" size={18}>
										{t(MODULES[key].name)}
									</Text>
								</Stack>
								<Text role="body">{text}</Text>
							</Stack>
						</div>
					))}
				</Cols>
			</Section>

			<Section bg={colors.bg} padding="72px 112px">
				<Flow gap={56}>
					<Stack gap={14} style={{width: narrow ? undefined : 440, flexShrink: 0}}>
						<SiteTitle over={t('Denemeler', 'Exams')} title={t('YKS denemeleri', 'YKS practice exams')} lead={t('Türkiye geneli TYT ve AYT denemeleri. Teslim edince netin, sıralaman ve hangi konudan kaç net kaybettiğin.', 'Nationwide TYT and AYT exams. Submit and see your score, rank and where you lost points.')} size={36} />
						<Button tone="ghost" size="lg" iconRight="right" style={{alignSelf: narrow ? 'stretch' : 'flex-start'}}>
							{t('YKS deneme sınavları', 'YKS practice exams')}
						</Button>
					</Stack>
					{narrow ? (
						<ShotPanel shot={{id: 'w-deneme-sonuc', C: WExam.WebResultScreen, kind: 'browser'}} width={350} height={240} />
					) : (
						<div style={{flex: 1}}>
							<DeviceBrowser width={700} title={t('Sınavika · Sonuç', 'Sınavika · Result')}>
								<WExam.WebResultScreen />
							</DeviceBrowser>
						</div>
					)}
				</Flow>
			</Section>

			<Section padding="72px 112px" narrowPadding="40px 20px">
				<Faq
					title={t('YKS hakkında', 'About YKS')}
					items={[
						{q: ['YKS 2027 ne zaman?', 'When is YKS 2027?'], a: ['Kesin tarihi ÖSYM açıklar; açıklandığında bu sayfadaki sayaç güncellenir.', 'ÖSYM announces the date; the countdown updates when it does.']},
						{q: ['TYT ve AYT puanı nasıl hesaplanır?', 'How are TYT and AYT scores calculated?'], a: ['Her testte 4 yanlış 1 doğruyu götürür; netler puan türünün katsayılarıyla puana çevrilir. Net hesaplama sayfasında deneyebilirsin.', 'Four wrong cancel one right; nets become a score with the score type’s weights. Try the score calculator.']},
						{q: ['Hangi puan türüne göre çalışmalıyım?', 'Which score type should I study for?'], a: ['Hedef bölümüne göre: SAY, EA ya da SÖZ. Kayıtta seçtiğin alana göre planın hazırlanır.', 'Your target programme decides: Science, Equal Weight or Verbal. Your plan follows the field you choose.']},
						{q: ['Sınavika denemeleri ÖSYM formatında mı?', 'Do exams follow the ÖSYM format?'], a: ['Evet. Soru sayısı, süre ve net hesabı sınavın kurallarıyla.', 'Yes. Question count, time and scoring follow the exam rules.']},
						{q: ['Hangi paket YKS için?', 'Which plan is for YKS?'], a: ['YKS paketi TYT ve AYT’nin bütün alanlarını kapsar.', 'The YKS plan covers TYT and every AYT field.']},
					]}
				/>
			</Section>
			<SiteCta title={t('YKS planın 2 dakikada hazır', 'Your YKS plan in 2 minutes')} />
		</Site>
	);
};

export const SiteExamLandingScreen = both(ExamLandingPage, false);
export const SiteExamLandingNarrowScreen = both(ExamLandingPage, true);

/* ───────────────────────── Deneme sayfası şablonu ───────────────────────── */

/** One template for /online-deneme-sinavi, /yks-deneme-sinavi, /kpss-deneme-sinavi, /turkiye-geneli-deneme-sinavi. */
const ExamTrialPage: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	const exams: [string, string, string, boolean][] = [
		[t('TYT Türkiye Geneli Deneme', 'TYT Nationwide Exam'), 'YKS · TYT', t('Açık · 22 Kasım’a kadar', 'Open · until 22 Nov'), true],
		[t('AYT Sayısal Türkiye Geneli Deneme', 'AYT Science Nationwide Exam'), 'YKS · AYT', t('29 Kasım’da açılıyor', 'Opens 29 Nov'), false],
		[t('KPSS GY-GK Türkiye Geneli Deneme', 'KPSS GA-GC Nationwide Exam'), 'KPSS', t('6 Aralık’ta açılıyor', 'Opens 6 Dec'), false],
	];
	const steps: [string, string, Shot][] = [
		[t('Denemeni seç', 'Pick an exam'), t('Açık denemeye gir ya da yaklaşan denemeye hatırlatma kur.', 'Start an open exam or set a reminder.'), {id: 'm-deneme-detay', C: Exam.ExamDetailScreen, kind: 'phone'}],
		[t('Süreli çöz', 'Solve on the clock'), t('Sınavdaki gibi; ara verirsen kaldığın sorudan devam.', 'Like the real exam; pause and continue where you stopped.'), {id: 'm-deneme-coz', C: Exam.ExamSolveScreen, kind: 'phone'}],
		[t('Eksiğini gör', 'See your gaps'), t('Netin, sıralaman ve kaybettiğin konular.', 'Your score, rank and the topics you lost on.'), {id: 'm-deneme-analiz', C: Exam.ExamAnalysisScreen, kind: 'phone'}],
	];
	return (
		<Site active={t('Kaynaklar', 'Resources')} narrow={narrow}>
			<Section padding="56px 112px 64px" narrowPadding="28px 20px 32px">
				<Flow gap={48} narrowGap={24}>
					<Stack gap={narrow ? 14 : 18} style={{width: narrow ? undefined : 560, flexShrink: 0}}>
						<Text role="small" weight={700}>
							{t('Kaynaklar › Denemeler', 'Resources › Exams')}
						</Text>
						<Text role="display" size={narrow ? 34 : 52} style={{lineHeight: narrow ? '40px' : '58px', letterSpacing: '-0.03em'}}>
							{t('Online deneme sınavı', 'Online practice exams')}
						</Text>
						<Text role="body" size={narrow ? 16 : 18} style={{lineHeight: narrow ? '25px' : '29px'}}>
							{t('YKS ve KPSS denemelerini telefonda ya da bilgisayarda süreli çöz. Teslim edince netini, Türkiye sıralamanı ve hangi konudan kaç net kaybettiğini gör.', 'Take YKS and KPSS exams on your phone or computer. Submit and see your score, national rank and where you lost points.')}
						</Text>
						<Stack row={!narrow} gap={10}>
							<Button size="lg" block={narrow} iconRight="right">
								{t('Denemeye başla', 'Start an exam')}
							</Button>
							<Button tone="ghost" size="lg" block={narrow}>
								{t('Sınav takvimi', 'Exam calendar')}
							</Button>
						</Stack>
					</Stack>
					{narrow ? (
						<ShotPanel shot={{id: 'm-deneme-coz', C: Exam.ExamSolveScreen, kind: 'phone'}} width={350} height={360} />
					) : (
						<div style={{position: 'relative', flex: 1, height: 480}}>
							<div style={{position: 'absolute', left: 0, top: 18}}>
								<DeviceBrowser width={600} title={t('Sınavika · Sonuçlar', 'Sınavika · Results')}>
									<WStudy.WebResultsScreen />
								</DeviceBrowser>
							</div>
							<div style={{position: 'absolute', right: 0, top: 50}}>
								<DevicePhone width={210}>
									<Exam.ExamSolveScreen />
								</DevicePhone>
							</div>
						</div>
					)}
				</Flow>
			</Section>
			<ForExams />

			<Section padding="72px 112px" narrowPadding="40px 20px">
				<Flow gap={56} align="flex-start">
					<Stack gap={12} style={{width: narrow ? undefined : 380, flexShrink: 0}}>
						<SiteTitle over={t('Bu ay', 'This month')} title={t('Denemeler takvimi', 'Exam calendar')} lead={t('Türkiye geneli denemeler belli bir zaman aralığında açıktır; yaklaşan denemeye hatırlatma kur.', 'Nationwide exams are open for a set window; set a reminder for the next one.')} size={34} />
					</Stack>
					<Stack gap={12} style={{flex: 1, minWidth: 0}}>
						{exams.map(([name, exam, when, open]) => (
							<Stack key={name} row gap={14} style={{padding: narrow ? 16 : '18px 22px', borderRadius: 22, background: colors.card, border: `1px solid ${colors.line}`}}>
								<Tile icon="exam" size={narrow ? 40 : 46} color={colors.ink2} />
								<Stack gap={3} style={{flex: 1, minWidth: 0}}>
									<Text role="section" size={narrow ? 15.5 : 17}>
										{name}
									</Text>
									<Text role="small">
										{exam} · {when}
									</Text>
								</Stack>
								{narrow ? (
									<Icon name="right" size={18} color={colors.muted} />
								) : (
									<Button tone={open ? 'dark' : 'ghost'} icon={open ? undefined : 'bell'}>
										{open ? t('Başla', 'Start') : t('Hatırlat', 'Remind me')}
									</Button>
								)}
							</Stack>
						))}
						<Text role="small">{t('Liste ve tarihler örnektir; sayfada bu ayın deneme takvimi gösterilir.', 'Names and dates are examples; the page shows this month’s calendar.')}</Text>
					</Stack>
				</Flow>
			</Section>

			<Section bg={colors.bg} padding="72px 112px">
				<SiteTitle center over={t('Nasıl işler', 'How it works')} title={t('Seç, çöz, eksiğini gör', 'Pick, solve, see your gaps')} size={40} />
				<Cols n={3} style={{marginTop: narrow ? 22 : 40}}>
					{steps.map(([title, text, shot], index) => (
						<div key={title} style={{borderRadius: 26, background: colors.card, border: `1px solid ${colors.line}`, overflow: 'hidden'}}>
							<ShotPanel shot={shot} width={narrow ? 348 : 392} height={narrow ? 250 : 300} phoneWidth={narrow ? 190 : 210} />
							<Stack gap={6} style={{padding: narrow ? 18 : 22}}>
								<Text role="over" color={colors.muted}>
									{t('Adım', 'Step')} {index + 1}
								</Text>
								<Text role="section" size={19}>
									{title}
								</Text>
								<Text role="body">{text}</Text>
							</Stack>
						</div>
					))}
				</Cols>
			</Section>

			<Section padding="72px 112px" narrowPadding="40px 20px">
				<Faq
					title={t('Denemeler hakkında', 'About exams')}
					items={[
						{q: ['Online deneme ÖSYM formatında mı?', 'Do online exams follow the ÖSYM format?'], a: ['Evet. Soru sayısı, süre ve net hesabı sınavın kurallarıyla.', 'Yes. Question count, time and scoring follow the exam rules.']},
						{q: ['Türkiye sıralaması nasıl hesaplanır?', 'How is the national rank calculated?'], a: ['Aynı denemeye giren bütün öğrencilerin netlerine göre.', 'From the scores of everyone who took the same exam.']},
						{q: ['Telefonda çözebilir miyim?', 'Can I solve on my phone?'], a: ['Evet. iOS ve Android uygulamasında ya da web’de çözersin; kaldığın yer iki yerde aynı.', 'Yes. In the iOS and Android apps or on the web; your place matches on both.']},
						{q: ['Kaç denemeye girebilirim?', 'How many exams can I take?'], a: ['Paketine göre: aylık pakette 20, yıllık pakette 240 deneme hakkı.', 'Depends on your plan: 20 monthly, 240 yearly.']},
						{q: ['Dışarıda çözdüğüm denemeyi ekleyebilir miyim?', 'Can I add exams from elsewhere?'], a: ['Evet. Netlerini gir; gelişim grafiğinde birlikte görünür.', 'Yes. Enter your scores; they show in your progress chart.']},
					]}
				/>
			</Section>
			<SiteCta title={t('İlk denemeni bugün çöz', 'Take your first exam today')} />
		</Site>
	);
};

export const SiteExamTrialScreen = both(ExamTrialPage, false);
export const SiteExamTrialNarrowScreen = both(ExamTrialPage, true);

/* ───────────────────────── Paketler ───────────────────────── */

/**
 * Paketler (owner, 20 Nov 2026: "YKS diyor; TYT mi AYT mi belli değil. KPSS
 * için 3 paket gözüküyor"). Order: pick the exam (YKS | KPSS) → for KPSS pick
 * which KPSS → Aylık | Yıllık → one plan card. Never three cards side by side.
 * Prices, days and exam rights are today's API values
 * (GET api/Subscription/markets/TR/packages); no YDT anywhere.
 */
const PlansPage: React.FC<{exam: 'yks' | 'kpss'}> = ({exam}) => {
	const t = useT();
	const colors = useColors();
	const narrow = useSiteNarrow();
	const yks = exam === 'yks';
	const included: [ModuleKey, string][] = [
		['studyPlan', t('Sınav tarihine göre günlük plan', 'A daily plan up to your exam')],
		['lessons', t('Bütün konular adım adım', 'Every topic step by step')],
		['tests', t('Konu konu, üç seviyeli testler', 'Quizzes by topic, three levels')],
		['exam', t('Yıllık 240 deneme hakkı, konu analizi', '240 exams a year, topic analysis')],
		['flashcards', t('Aralıklı tekrar kartları', 'Spaced-repetition cards')],
		['smartSummary', t('Fotoğraftan adım adım çözüm', 'Step-by-step solutions from a photo')],
		['sinoAi', t('Seni tanıyan asistan', 'An assistant that knows you')],
	];
	const kpss: [string, string, boolean][] = [
		[t('KPSS Lisans', 'KPSS Bachelor’s'), t('4 yıllık mezun ya da son sınıf', '4-year graduates or final year'), true],
		[t('KPSS Önlisans', 'KPSS Associate'), t('2 yıllık mezun', '2-year graduates'), false],
		[t('KPSS Ortaöğretim', 'KPSS Secondary'), t('Lise mezunu', 'High-school graduates'), false],
	];
	const scope = yks ? ['TYT', t('AYT Sayısal', 'AYT Science'), t('AYT Eşit Ağırlık', 'AYT Equal Weight'), t('AYT Sözel', 'AYT Verbal')] : [t('Genel Yetenek', 'General Ability'), t('Genel Kültür', 'General Culture')];
	const examTab = (key: 'yks' | 'kpss', name: string, sub: string) => {
		const on = key === exam;
		return (
			<div key={key} style={{flex: 1, minWidth: 0, borderRadius: 22, padding: narrow ? '14px 16px' : '18px 22px', background: colors.card, border: `${on ? 2 : 1}px solid ${on ? colors.ink : colors.line}`, display: 'flex', alignItems: 'center', gap: 12}}>
				<Stack gap={2} style={{flex: 1, minWidth: 0}}>
					<Text role="title" size={narrow ? 20 : 24}>
						{name}
					</Text>
					<Text role="small">{sub}</Text>
				</Stack>
				{on ? (
					<div style={{width: 24, height: 24, borderRadius: 12, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="check" size={15} color={colors.card} stroke={2.6} />
					</div>
				) : null}
			</div>
		);
	};
	return (
		<Site active={t('Paketler', 'Plans')} narrow={narrow}>
			<Section padding="56px 112px 28px" narrowPadding="28px 20px 16px">
				<SiteTitle center={!narrow} title={t('Hedefine uygun paketi seç', 'Pick the plan for your goal')} lead={t('Her pakette yedi modülün hepsi açık. Mobil uygulamada 3 gün ücretsiz dene; web’de paketi seçip kartla ödersin.', 'Every plan opens all seven modules. Try 3 days free in the mobile app; on the web, pick a plan and pay by card.')} size={44} />
			</Section>

			<Section padding="12px 112px 72px" narrowPadding="8px 20px 36px">
				<div style={{maxWidth: 1000, margin: '0 auto'}}>
					{/* 1. Sınavını seç */}
					<Text role="over" color={colors.muted}>
						{t('1 · Sınavını seç', '1 · Pick your exam')}
					</Text>
					<Stack row gap={narrow ? 10 : 16} style={{marginTop: 10}}>
						{examTab('yks', 'YKS', 'TYT + AYT')}
						{examTab('kpss', 'KPSS', narrow ? t('3 tür', '3 kinds') : t('Lisans · Önlisans · Ortaöğretim', 'Bachelor’s · Associate · Secondary'))}
					</Stack>

					{/* 2. KPSS: hangi KPSS */}
					{yks ? null : (
						<>
							<Text role="over" color={colors.muted} style={{marginTop: 26}}>
								{t('2 · Hangi KPSS’ye gireceksin?', '2 · Which KPSS will you take?')}
							</Text>
							<Cols n={3} gap={12} style={{marginTop: 10}}>
								{kpss.map(([name, sub, on]) => (
									<Stack key={name} row gap={12} style={{padding: '14px 16px', borderRadius: 18, background: colors.card, border: `${on ? 2 : 1}px solid ${on ? colors.ink : colors.line}`}}>
										<div style={{width: 20, height: 20, borderRadius: 10, border: `${on ? 6 : 1.5}px solid ${on ? colors.ink : colors.line}`, boxSizing: 'border-box', flexShrink: 0}} />
										<Stack gap={2} style={{minWidth: 0}}>
											<Text role="headline" size={15}>
												{name}
											</Text>
											<Text role="small">{sub}</Text>
										</Stack>
									</Stack>
								))}
							</Cols>
						</>
					)}

					{/* Süre */}
					<Stack row={!narrow} justify="space-between" gap={12} align={narrow ? 'stretch' : 'center'} style={{marginTop: 26}}>
						<Text role="over" color={colors.muted}>
							{yks ? t('2 · Süreni seç', '2 · Pick a period') : t('3 · Süreni seç', '3 · Pick a period')}
						</Text>
						<Stack row gap={10}>
							<div style={{width: narrow ? undefined : 240, flex: narrow ? 1 : undefined}}>
								<Segmented items={[t('Aylık', 'Monthly'), t('Yıllık', 'Yearly')]} active={1} />
							</div>
							<Chip tone="success">{t('Yıllıkta %45 tasarruf', 'Save 45% yearly')}</Chip>
						</Stack>
					</Stack>

					{/* Paket kartı */}
					<div style={{marginTop: 14, borderRadius: 30, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: '0 30px 60px -40px rgba(11,28,48,0.35)', overflow: 'hidden'}}>
						<Flow gap={0} narrowGap={0} align="stretch">
							<Stack gap={14} style={{flex: 1, minWidth: 0, padding: narrow ? 22 : 34}}>
								<Text role="title" size={narrow ? 24 : 28}>
									{yks ? 'YKS · TYT + AYT' : t('KPSS Lisans', 'KPSS Bachelor’s')}
								</Text>
								<div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
									{scope.map((item) => (
										<Chip key={item} tone="outline">
											{item}
										</Chip>
									))}
								</div>
								<Text role="small">{yks ? t('Tek pakette TYT ve AYT’nin bütün alanları.', 'Every TYT and AYT field in one plan.') : t('Genel Yetenek ve Genel Kültür’ün bütün konuları.', 'Every General Ability and General Culture topic.')}</Text>
								<Stack row gap={10} align="baseline" style={{marginTop: 6}}>
									<Text role="num" size={narrow ? 40 : 48}>
										₺1.990
									</Text>
									<Text role="body">{t('/ yıl', '/ year')}</Text>
								</Stack>
								<Text role="headline" color={colors.ink2}>
									{t('Ayda ~₺166 · aylık pakete göre %45 tasarruf', '~₺166 a month · 45% less than monthly')}
								</Text>
								<Button size="lg" block iconRight="right">
									{t('Paketi seç', 'Choose plan')}
								</Button>
								<Stack gap={8} style={{marginTop: 4}}>
									{(
										[
											['refresh', t('İstediğin an iptal; dönem sonuna kadar açık kalır', 'Cancel any time; open until the period ends')],
											['shield', t('Güvenli ödeme: VISA, Mastercard, troy', 'Secure payment: VISA, Mastercard, troy')],
											['gift', t('Mobil uygulamada 3 gün ücretsiz dene', 'Try 3 days free in the mobile app')],
										] as [UIIconName, string][]
									).map(([icon, line]) => (
										<Stack key={line} row gap={10}>
											<Icon name={icon} size={17} color={colors.muted} />
											<Text role="small" color={colors.ink2}>
												{line}
											</Text>
										</Stack>
									))}
								</Stack>
							</Stack>
							<Stack gap={12} style={{flex: 1, minWidth: 0, padding: narrow ? 22 : 34, background: colors.bg, borderLeft: narrow ? undefined : `1px solid ${colors.line}`, borderTop: narrow ? `1px solid ${colors.line}` : undefined}}>
								<Text role="section" size={18}>
									{t('Neler dahil', 'What’s included')}
								</Text>
								{included.map(([key, line]) => (
									<Stack key={key} row gap={12}>
										<Tile module={key} size={32} />
										<Stack gap={0} style={{minWidth: 0}}>
											<Text role="headline" size={14.5}>
												{t(MODULES[key].name)}
											</Text>
											<Text role="small">{line}</Text>
										</Stack>
									</Stack>
								))}
								<Grid columns="repeat(3, minmax(0, 1fr))" gap={8} style={{marginTop: 6}}>
									{[
										['365', t('gün erişim', 'days of access')],
										['240', t('deneme hakkı', 'exams')],
										['7', t('modül', 'modules')],
									].map(([value, label]) => (
										<div key={label} style={{borderRadius: 16, padding: '12px 8px', background: colors.card, border: `1px solid ${colors.line}`, textAlign: 'center'}}>
											<Text role="num" size={22} align="center">
												{value}
											</Text>
											<Text role="meta" align="center">
												{label}
											</Text>
										</div>
									))}
								</Grid>
								<Text role="small">{t('Gelişmiş istatistik de dahil.', 'Advanced statistics included.')}</Text>
							</Stack>
						</Flow>
					</div>
					<Text role="small" align="center" style={{marginTop: 14}}>
						{t('Fiyat, süre ve deneme hakkı API’den gelir; KPSS türlerinin üçü de aynı fiyattadır.', 'Price, period and exam rights come from the API; all three KPSS kinds cost the same.')}
					</Text>
				</div>
			</Section>

			{/* Karşılaştırma */}
			<Section bg={colors.bg} padding="72px 112px" narrowPadding="36px 20px">
				<div style={{maxWidth: 1000, margin: '0 auto'}}>
					<SiteTitle center={!narrow} over={t('Karşılaştır', 'Compare')} title={t('Aylık mı, yıllık mı?', 'Monthly or yearly?')} size={36} />
					<div style={{marginTop: narrow ? 18 : 28, borderRadius: 24, background: colors.card, border: `1px solid ${colors.line}`, overflow: 'hidden'}}>
						{[
							['', t('Aylık', 'Monthly'), t('Yıllık', 'Yearly')],
							[t('Fiyat', 'Price'), '₺299', '₺1.990'],
							[t('Süre', 'Period'), t('30 gün', '30 days'), t('365 gün', '365 days')],
							[t('Aylık karşılığı', 'Per month'), '₺299', '~₺166'],
							[t('Deneme hakkı', 'Exam rights'), '20', '240'],
							[t('Yedi modül', 'Seven modules'), '✓', '✓'],
							[t('Gelişmiş istatistik', 'Advanced statistics'), '✓', '✓'],
						].map((row, index) => (
							<div key={row[0] || 'head'} style={{display: 'grid', gridTemplateColumns: narrow ? 'minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'center', padding: narrow ? '12px 16px' : '15px 28px', borderTop: index ? `1px solid ${colors.line2}` : undefined, background: index ? undefined : colors.line2}}>
								{row.map((cell, column) => (
									<Text key={column} role={index === 0 || column === 0 ? 'headline' : 'body'} size={narrow ? 14 : 15.5} color={colors.ink} align={column ? 'center' : 'left'}>
										{cell}
									</Text>
								))}
							</div>
						))}
					</div>
				</div>
			</Section>

			<Section padding="72px 112px" narrowPadding="40px 20px">
				<Faq
					title={t('Paketler hakkında', 'About plans')}
					items={[
						{q: ['Aboneliğimi nasıl iptal ederim?', 'How do I cancel?'], a: ['Web’de Profil › Abonelik’ten, mobilde mağaza aboneliklerinden. Paket dönem sonuna kadar açık kalır.', 'On the web in Profile › Subscription, on mobile in your store subscriptions. The plan stays open until the period ends.']},
						{q: ['Paket kendiliğinden yenilenir mi?', 'Does the plan renew?'], a: ['Evet, dönem sonunda aynı süreyle yenilenir; iptal edersen yenilenmez.', 'Yes, it renews for the same period unless you cancel.']},
						{q: ['Hangi KPSS paketini seçmeliyim?', 'Which KPSS plan should I pick?'], a: ['Mezuniyetine göre: 4 yıllık ya da son sınıfsan Lisans, 2 yıllıksan Önlisans, lise mezunuysan Ortaöğretim.', 'By your degree: Bachelor’s for 4-year or final year, Associate for 2-year, Secondary for high school.']},
						{q: ['Web ve mobilde aynı hesap mı?', 'Same account on web and mobile?'], a: ['Evet. Bir kez abone ol, iki yerde de kullan.', 'Yes. Subscribe once and use it on both.']},
						{q: ['Ücretsiz deneme nasıl çalışır?', 'How does the free trial work?'], a: ['Mobil uygulamada 3 gün ücretsiz. Bitmeden iptal edersen ücret alınmaz.', '3 days free in the mobile app. Cancel before it ends and pay nothing.']},
					]}
				/>
			</Section>

			<Section padding="0 112px 80px" narrowPadding="0 20px 48px">
				<Flow gap={16} style={{padding: narrow ? 20 : '26px 32px', borderRadius: 24, border: `1px solid ${colors.line}`, justifyContent: 'space-between'}}>
					<Stack row gap={14}>
						<Tile icon="briefcase" size={44} color={colors.ink2} />
						<Stack gap={2}>
							<Text role="section" size={18}>
								{t('Okul, dershane ya da yayınevi misin?', 'A school, course or publisher?')}
							</Text>
							<Text role="small">{t('Toplu kullanım ve iş birliği için bize yaz.', 'Write to us for group use and partnerships.')}</Text>
						</Stack>
					</Stack>
					<Button tone="ghost" iconRight="right" block={narrow}>
						{t('İletişime geç', 'Contact us')}
					</Button>
				</Flow>
			</Section>
		</Site>
	);
};

export const SitePlansScreen = both(() => <PlansPage exam="yks" />, false);
export const SitePlansNarrowScreen = both(() => <PlansPage exam="yks" />, true);
export const SitePlansKpssScreen = both(() => <PlansPage exam="kpss" />, false);
export const SitePlansKpssNarrowScreen = both(() => <PlansPage exam="kpss" />, true);
