import React from 'react';
import {useColors, useModuleColors} from '../../Context';
import {Icon} from '../../Icons';
import {Button, Stack, Text} from '../../Parts/Shared';
import {UI_SHADOW} from '../../Tokens';
import {Feedback, Ghost, Kind, Main, PlainCard, Rich, Screen, StepBar, Title} from './Lessons';

/**
 * Dersler step types that are live in the app (live test, 3 Nov 2026) but had
 * no drawing: Grupla, Eşleştir, Çevir, Seç, Çoklu seçim, yazmalı Boşluk,
 * formula and table steps, and the section start. Each drawing also fixes
 * what the live test found: full text in group boxes, bold target words,
 * "Kontrol et" always visible, the inline blank is the input itself, real
 * fractions and roots, readable table cells, a way back to the previous
 * section.
 */

/* ------------------------------------------------------------------ parts */

const Card: React.FC<{children: React.ReactNode; tone?: 'idle' | 'on' | 'ok' | 'no' | 'ghost'; style?: React.CSSProperties}> = ({children, tone = 'idle', style}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const look = {
		idle: {bg: colors.card, line: colors.line},
		on: {bg: mod.wash, line: mod.color},
		ok: {bg: colors.successSoft, line: colors.success},
		no: {bg: colors.errorSoft, line: colors.error},
		ghost: {bg: 'transparent', line: colors.line},
	}[tone];
	return <div style={{padding: '11px 14px', borderRadius: 16, background: look.bg, border: `1.5px ${tone === 'ghost' ? 'dashed' : 'solid'} ${look.line}`, boxShadow: tone === 'idle' ? UI_SHADOW.card : undefined, ...style}}>{children}</div>;
};

/** A sentence with its target word in bold (the step's `**…**`), never cut. */
const Sentence: React.FC<{text: string; size?: number}> = ({text, size = 15}) => {
	const colors = useColors();
	return (
		<Text role="body" size={size} color={colors.ink} weight={600} style={{lineHeight: `${size * 1.4}px`}}>
			<Rich text={text} />
		</Text>
	);
};

const Check: React.FC<{on?: boolean; round?: boolean}> = ({on, round}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<div style={{width: 24, height: 24, borderRadius: round ? 12 : 7, flexShrink: 0, background: on ? mod.action : colors.card, border: on ? undefined : `2px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			{on ? <Icon name="check" size={15} color="#FFFFFF" /> : null}
		</div>
	);
};

/** The guess toggle that sits left of Devam (live since 4 Nov): a round question-mark button. */
const Foot: React.FC<{action: string; disabled?: boolean; note?: string}> = ({action, disabled, note}) => {
	const colors = useColors();
	return (
		<>
			{note ? (
				<Text role="meta" align="center">
					{note}
				</Text>
			) : null}
			<Stack row gap={10}>
				<Button tone="ghost" size="lg" icon="left" />
				<div style={{width: 54, height: 54, borderRadius: 27, border: `1.5px solid ${colors.line}`, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Text role="headline" size={20} color={colors.ink2}>
						?
					</Text>
				</div>
				<Button size="lg" tone={disabled ? 'disabled' : 'primary'} style={{flex: 1}}>
					{action}
				</Button>
			</Stack>
		</>
	);
};

/* ------------------------------------------------------------------ Grupla */

export const LessonGroupScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const Group: React.FC<{title: string; items: string[]}> = ({title, items}) => (
		<div style={{borderRadius: 18, border: `1.5px dashed ${mod.line}`, background: mod.wash, padding: 10, display: 'flex', flexDirection: 'column', gap: 8}}>
			<Stack row justify="space-between">
				<Text role="over" color={mod.ink}>
					{title}
				</Text>
				<Text role="meta">{items.length}</Text>
			</Stack>
			{items.map((item) => (
				<Card key={item}>
					<Sentence text={item} size={14.5} />
				</Card>
			))}
		</div>
	);
	return (
		<Screen bar={<StepBar done={2} count={6} />} foot={<Foot action="Kontrol et" disabled note="2 kart kaldı" />} gap={11}>
			<Kind>Grupla · 3 / 6</Kind>
			<Title size={22}>Koyu sözcük gerçek mi, mecaz mı?</Title>
			<Text role="small" color={colors.ink2}>
				Karta dokun, sonra grubuna dokun. Yanlış yere koyduğunu geri alabilirsin.
			</Text>
			<Group title="Gerçek anlam" items={['Bahçedeki **ağaç** kurudu.']} />
			<Group title="Mecaz anlam" items={['Bu haber onun **cesaretini kırdı**.', 'Yaşlılar veremden söz ederken **ince hastalık** derdi.']} />
			<Text role="meta">Yerleşmeyenler</Text>
			<Stack gap={8}>
				<Card tone="on">
					<Sentence text="Kardeşi **tatlı** bir çocuktur." size={14.5} />
				</Card>
				<Card>
					<Sentence text="Annem **tatlı** bir kek yaptı." size={14.5} />
				</Card>
			</Stack>
		</Screen>
	);
};

/* ------------------------------------------------------------------ Eşleştir */

export const LessonMatchScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	// Pairs stay in the Dersler colour (no other module's colour); the number tells them apart.
	const tint = [mod.color, mod.action, mod.ink];
	const Pair: React.FC<{text: string; n?: number; on?: boolean}> = ({text, n, on}) => (
		<div style={{position: 'relative', padding: '12px 12px', borderRadius: 16, minHeight: 50, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 8, background: n !== undefined ? `${tint[n]}14` : colors.card, border: `1.5px solid ${n !== undefined ? tint[n] : on ? colors.ink : colors.line}`}}>
			{n !== undefined ? (
				<div style={{width: 22, height: 22, borderRadius: 11, background: tint[n], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Text role="meta" size={12} weight={800} color="#FFFFFF">
						{n + 1}
					</Text>
				</div>
			) : null}
			<Text role="body" size={14.5} weight={600} color={colors.ink} style={{lineHeight: '19px'}}>
				{text}
			</Text>
		</div>
	);
	return (
		<Screen bar={<StepBar done={3} count={6} />} foot={<Foot action="Kontrol et" disabled note="1 eşleşme kaldı" />} gap={11}>
			<Kind>Eşleştir · 4 / 6</Kind>
			<Title size={22}>Anlam türünü örneğiyle eşleştir</Title>
			<Text role="small" color={colors.ink2}>
				Soldan birine, sonra sağdan eşine dokun. Eşleşen ikili aynı renk ve numarayı alır.
			</Text>
			<div style={{display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 10}}>
				<Stack gap={10}>
					<Pair text="Gerçek" n={0} />
					<Pair text="Mecaz" n={1} />
					<Pair text="Terim" n={2} />
					<Pair text="Yan anlam" on />
				</Stack>
				<Stack gap={10}>
					<Pair text="Masanın ayağı" />
					<Pair text="Yüzü kızardı" n={0} />
					<Pair text="Üçgenin açısı" n={2} />
					<Pair text="Sözleri ağır geldi" n={1} />
				</Stack>
			</div>
		</Screen>
	);
};

/* ------------------------------------------------------------------ Çevir */

export const LessonFlipScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const Face: React.FC<{text: string; tone?: 'known' | 'unknown'}> = ({text, tone}) => (
		<div style={{height: 104, borderRadius: 18, background: colors.card, border: `1.5px solid ${tone === 'known' ? colors.success : tone === 'unknown' ? colors.warning : colors.line}`, boxShadow: UI_SHADOW.card, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 10, boxSizing: 'border-box'}}>
			<Text role="section" size={18} align="center">
				{text}
			</Text>
			{tone ? (
				<div style={{position: 'absolute', top: 8, right: 8}}>
					<Icon name={tone === 'known' ? 'checkCircle' : 'refresh'} size={17} color={tone === 'known' ? colors.successInk : colors.warningInk} />
				</div>
			) : null}
		</div>
	);
	return (
		<Screen bar={<StepBar done={3} count={6} />} foot={<Foot action="Devam" note="1 kart tekrar listene eklendi" />} gap={11}>
			<Kind>Çevir · 4 / 6</Kind>
			<Title size={22}>Önce hatırla, sonra çevir</Title>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
				<Face text="Eş sesli" tone="known" />
				<Face text="Çok anlamlı" tone="unknown" />
			</div>
			<div style={{borderRadius: 20, border: `1.5px solid ${mod.color}`, background: mod.wash, padding: 16, display: 'flex', flexDirection: 'column', gap: 8}}>
				<Text role="over" color={mod.ink}>
					Terim anlam · arka yüz
				</Text>
				<Text role="body" color={colors.ink}>
					<Rich text="Bir bilim, sanat ya da meslek alanına özgü anlam: **açı**, **hücre**, **perde** (tiyatroda)." />
				</Text>
				<Text role="small" color={colors.ink2}>
					Günlük dilde de kullanılır; terim olması için alanın kavramını karşılamalı.
				</Text>
				<Stack row gap={8} style={{marginTop: 4}}>
					<Button tone="ghost" size="sm" style={{flex: 1}}>
						Bilmiyordum
					</Button>
					<Button tone="module" module="lessons" size="sm" style={{flex: 1}}>
						Biliyordum
					</Button>
				</Stack>
			</div>
			<Face text="Yan anlam" />
		</Screen>
	);
};

/* ------------------------------------------------------------------ Seç (tap the words) */

export const LessonPickWordsScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const words: [string, boolean][] = [
		['Gece', false],
		['boyunca', false],
		['çatıda', false],
		['yağmur', false],
		['şıpır', true],
		['şıpır', true],
		['damladı.', false],
	];
	return (
		<Screen bar={<StepBar done={2} count={6} />} foot={<Foot action="Kontrol et" />} gap={12}>
			<Kind>Yansıma sözcükler · 3 / 6</Kind>
			<Title size={22}>Yansımayı bul</Title>
			<Text role="small" color={colors.ink2}>
				Cümledeki yansıma sözcüklere dokun. Birden çok seçebilirsin.
			</Text>
			<PlainCard>
				<Stack row wrap gap={8}>
					{words.map(([word, on], index) => (
						<div key={index} style={{padding: '9px 13px', borderRadius: 12, background: on ? mod.soft : colors.line2, border: `1.5px solid ${on ? mod.color : 'transparent'}`}}>
							<Text role="headline" size={17} color={on ? mod.ink : colors.ink}>
								{word}
							</Text>
						</div>
					))}
				</Stack>
			</PlainCard>
			<Stack row gap={8}>
				<Icon name="info" size={16} color={colors.muted} />
				<Text role="small">2 sözcük seçtin</Text>
			</Stack>
		</Screen>
	);
};

/* ------------------------------------------------------------------ Çoklu seçim */

export const LessonMultiScreen: React.FC = () => {
	const colors = useColors();
	const items: [string, boolean, 'ok' | 'no' | 'miss' | 'idle'][] = [
		['rüzgâr', true, 'ok'],
		['sevgi', false, 'idle'],
		['koku', true, 'ok'],
		['özlem', true, 'no'],
		['ses', false, 'miss'],
	];
	return (
		<Screen bar={<StepBar done={4} count={6} />} foot={<Foot action="Devam" />} gap={10}>
			<Kind>Çoklu seçim · 5 / 6</Kind>
			<Title size={22}>Hangileri somut anlamlıdır?</Title>
			<Text role="small" color={colors.ink2}>
				Birden çok doğru var.
			</Text>
			<Stack gap={8}>
				{items.map(([word, picked, result]) => (
					<Card key={word} tone={result === 'ok' ? 'ok' : result === 'no' ? 'no' : result === 'miss' ? 'ghost' : 'idle'} style={{display: 'flex', alignItems: 'center', gap: 12}}>
						<Check on={picked} />
						<Text role="headline" size={16} style={{flex: 1}}>
							{word}
						</Text>
						{result === 'miss' ? (
							<Text role="meta" color={colors.successInk}>
								bunu da seçmeliydin
							</Text>
						) : result === 'no' ? (
							<Text role="meta" color={colors.errorInk}>
								soyut
							</Text>
						) : null}
					</Card>
				))}
			</Stack>
			<Feedback tone="no" title="4 / 5 doğru" size={14}>
				<Rich text="**Özlem** duyularla algılanmaz, soyuttur. **Ses** kulakla duyulur, somuttur." />
			</Feedback>
		</Screen>
	);
};

/* ------------------------------------------------------------------ Yazmalı boşluk */

const Keyboard: React.FC = () => {
	const colors = useColors();
	const rows = ['ertyuıopğü', 'asdfghjklşi', 'zcvbnmöç'];
	return (
		<div style={{background: colors.line2, padding: '8px 4px 30px', display: 'flex', flexDirection: 'column', gap: 8}}>
			{rows.map((row) => (
				<Stack key={row} row gap={5} justify="center">
					{Array.from(row).map((key, index) => (
						<div key={index} style={{width: 31, height: 40, borderRadius: 7, background: colors.card, boxShadow: '0 1px 0 rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Text role="headline" size={16}>
								{key}
							</Text>
						</div>
					))}
				</Stack>
			))}
		</div>
	);
};

export const LessonTypedBlankScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Screen
			bar={<StepBar done={4} count={6} />}
			foot={
				<div style={{margin: '0 -20px -30px'}}>
					<div style={{padding: '0 20px 10px'}}>
						<Button size="lg" block>
							Kontrol et
						</Button>
					</div>
					<Keyboard />
				</div>
			}
			gap={12}
		>
			<Kind>Boşluk doldur · 5 / 6</Kind>
			<Title size={22}>Boşluğa terimi yaz</Title>
			<PlainCard>
				<Text role="headline" size={18} weight={700} style={{lineHeight: '34px'}}>
					Bir bilim ya da meslek alanına özgü anlama{' '}
					<span style={{display: 'inline-flex', alignItems: 'center', minWidth: 110, padding: '0 10px', height: 34, verticalAlign: 'middle', borderRadius: 10, border: `2px solid ${mod.color}`, background: mod.wash, color: mod.ink}}>
						terim<span style={{width: 2, height: 20, background: mod.color, marginLeft: 2}} />
					</span>{' '}
					anlam denir.
				</Text>
			</PlainCard>
			<Text role="small" color={colors.ink2}>
				Boşluğa dokunup yaz; büyük-küçük harf önemli değil.
			</Text>
		</Screen>
	);
};

/* ------------------------------------------------------------------ Formula and table */

const Frac: React.FC<{n: string; d: string; sign?: string; size?: number}> = ({n, d, sign, size = 20}) => (
	<span style={{display: 'inline-flex', alignItems: 'center', gap: 3, verticalAlign: 'middle', whiteSpace: 'nowrap'}}>
		{sign ? <span>{sign}</span> : null}
		<span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', fontSize: size * 0.85, lineHeight: 1.1}}>
			<span style={{padding: '0 3px'}}>{n}</span>
			<span style={{alignSelf: 'stretch', height: 1.6, background: 'currentColor'}} />
			<span style={{padding: '0 3px'}}>{d}</span>
		</span>
	</span>
);

const Root: React.FC<{children: React.ReactNode}> = ({children}) => (
	<span style={{display: 'inline-flex', alignItems: 'stretch', verticalAlign: 'middle', whiteSpace: 'nowrap'}}>
		<svg width={14} height={26} viewBox="0 0 14 26" style={{flexShrink: 0}}>
			<path d="M1 15l3-2 4 10L13 1.2h1" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
		</svg>
		<span style={{borderTop: '1.8px solid currentColor', padding: '1px 3px 0', marginTop: 1}}>{children}</span>
	</span>
);

export const LessonFormulaScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const cell: React.CSSProperties = {padding: '9px 10px', borderBottom: `1px solid ${colors.line2}`, fontSize: 15, color: colors.ink, fontWeight: 600};
	return (
		<Screen bar={<StepBar done={1} count={5} />} foot={<Foot action="Devam" />} gap={12}>
			<Kind>Temel Kavramlar · 2 / 5</Kind>
			<Title size={22}>Sayı kümeleri</Title>
			<PlainCard gap={8}>
				<Text role="headline" size={20} weight={700} color={colors.ink} style={{lineHeight: '34px'}}>
					<Frac sign="−" n="3" d="8" /> rasyoneldir, <Root>49</Root> = 7 doğaldır, <Root>2</Root> irrasyoneldir.
				</Text>
				<Text role="body" size={16} color={colors.ink2}>
					a<sup style={{fontSize: '0.7em', marginLeft: 1, verticalAlign: '0.55em', lineHeight: 0}}>2</sup> her a gerçel sayısı için 0 ya da pozitiftir.
				</Text>
			</PlainCard>
			<div style={{borderRadius: 18, border: `1px solid ${colors.line}`, background: colors.card, overflow: 'hidden'}}>
				<table style={{width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit'}}>
					<thead>
						<tr style={{background: mod.wash}}>
							{['Küme', 'Örnek', 'Değil'].map((head) => (
								<th key={head} style={{...cell, textAlign: 'left', fontSize: 13, color: mod.ink, fontWeight: 800}}>
									{head}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{[
							['Doğal (N)', '0, 1, 7', '−4'],
							['Tam (Z)', '−4, 0, 9', '3/2'],
							['Rasyonel (Q)', '−3/8, 0,25', '√2'],
						].map((row) => (
							<tr key={row[0]}>
								{row.map((value, index) => (
									<td key={index} style={{...cell, fontWeight: index === 0 ? 800 : 600}}>
										{value}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Text role="meta">Tablo yana kayar; hücre yazısı en az 15 pt.</Text>
		</Screen>
	);
};

/* ------------------------------------------------------------------ Section start */

export const LessonSectionScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const sections: [string, 'done' | 'now' | 'next'][] = [
		['Gerçek ve mecaz', 'done'],
		['Anlam aktarmaları', 'now'],
		['Ses ve yansıma', 'next'],
		['Bağlamda anlam', 'next'],
	];
	return (
		<Screen
			bar={<StepBar done={0} count={8} />}
			foot={
				<Stack row gap={10}>
					<div style={{flex: 1}}>
						<Ghost icon="left">Önceki bölüm</Ghost>
					</div>
					<div style={{flex: 1}}>
						<Main>Başla</Main>
					</div>
				</Stack>
			}
			gap={14}
		>
			<Kind>Bölüm 2 / 4 · Sözcükte Anlam</Kind>
			<Title size={26}>Anlam aktarmaları</Title>
			<Text role="body" color={colors.ink2}>
				Bir sözcüğün yerine, onunla ilgisi olan başka bir sözcüğü kullanmak. 8 adım · yaklaşık 6 dk.
			</Text>
			<PlainCard gap={10}>
				<Text role="over">Bu bölümde</Text>
				{['Ad aktarması (mecaz-ı mürsel)', 'Dolaylama ve güzel adlandırma', 'Kişileştirme ve somutlama'].map((line) => (
					<Stack key={line} row gap={10}>
						<Icon name="check" size={16} color={mod.color} />
						<Text role="body" size={15} color={colors.ink}>
							{line}
						</Text>
					</Stack>
				))}
			</PlainCard>
			<Stack gap={8}>
				{sections.map(([name, state], index) => (
					<Stack key={name} row gap={12} style={{padding: '10px 12px', borderRadius: 16, background: state === 'now' ? mod.wash : 'transparent', border: `1px solid ${state === 'now' ? mod.line : colors.line}`}}>
						<div style={{width: 28, height: 28, borderRadius: 14, background: state === 'done' ? mod.color : state === 'now' ? colors.card : colors.line2, border: state === 'now' ? `2px solid ${mod.color}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
							{state === 'done' ? <Icon name="check" size={14} color="#FFFFFF" /> : <Text role="meta" weight={800}>{index + 1}</Text>}
						</div>
						<Text role="headline" style={{flex: 1}} color={state === 'next' ? colors.muted : colors.ink}>
							{name}
						</Text>
						{state === 'done' ? <Text role="meta">Tekrar bak</Text> : null}
					</Stack>
				))}
			</Stack>
		</Screen>
	);
};
