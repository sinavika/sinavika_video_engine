import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {Chip, List, ListRow, Segmented, Stack, Text} from '../../Parts/Shared';
import {Panel} from '../../Parts/Web';
import {UI_SHADOW} from '../../Tokens';

/**
 * SinoAI on the web panel: a quiet chat surface (like ChatGPT or Gemini).
 * A light history column on the left, a white page with one centred
 * conversation column and a rounded composer; no colour of its own.
 */

const HistoryColumn: React.FC<{active?: 'chat' | 'study' | 'library'}> = ({active = 'chat'}) => {
	const colors = useColors();
	const t = useT();
	const Row: React.FC<{icon?: UIIconName; label: string; on?: boolean; strong?: boolean}> = ({icon, label, on, strong}) => (
		<Stack row gap={10} style={{padding: '9px 10px', borderRadius: 10, background: on ? colors.line2 : undefined}}>
			{icon ? <Icon name={icon} size={17} color={colors.ink2} /> : null}
			<Text role="small" weight={strong || on ? 700 : 500} color={colors.ink}>
				{label}
			</Text>
		</Stack>
	);
	return (
		<div style={{width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 16, borderRight: `1px solid ${colors.line}`}}>
			<Row icon="newChat" label={t('Yeni sohbet', 'New chat')} strong />
			<Row icon="layers" label={t('Çalışma üret', 'Create study work')} on={active === 'study'} />
			<Row icon="bookmark" label={t('Kütüphanen', 'Your library')} on={active === 'library'} />
			<Text role="over" style={{margin: '16px 10px 4px'}}>
				{t('Bugün', 'Today')}
			</Text>
			<Row label={t('Türevde zincir kuralı', 'Chain rule')} on={active === 'chat'} />
			<Row label={t('Mol hesaplama', 'Mole calculation')} />
			<Text role="over" style={{margin: '16px 10px 4px'}}>
				{t('Bu hafta', 'This week')}
			</Text>
			<Row label={t('Paragrafta çeldirici şıklar', 'Distractors')} />
			<Row label={t('Osmanlı duraklama özeti', 'Ottoman notes')} />
			<Row label={t('Kuvvet problemleri', 'Force problems')} />
		</div>
	);
};

const Composer: React.FC<{placeholder?: string}> = ({placeholder}) => {
	const colors = useColors();
	const t = useT();
	return (
		<div style={{borderRadius: 28, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.float, padding: '16px 14px 12px 20px'}}>
			<Text role="body" size={15.5} color={colors.subtle}>
				{placeholder ?? t('SinoAI’ye sor', 'Ask SinoAI')}
			</Text>
			<Stack row gap={8} style={{marginTop: 14}}>
				<Stack row gap={6} style={{height: 34, padding: '0 12px', borderRadius: 17, border: `1px solid ${colors.line}`}}>
					<Icon name="plus" size={16} color={colors.ink2} />
					<Text role="small" weight={600} color={colors.ink2}>
						{t('Dosya ekle', 'Attach')}
					</Text>
				</Stack>
				<Stack row gap={6} style={{height: 34, padding: '0 12px', borderRadius: 17, border: `1px solid ${colors.line}`}}>
					<Icon name="layers" size={16} color={colors.ink2} />
					<Text role="small" weight={600} color={colors.ink2}>
						{t('Çalışma üret', 'Create')}
					</Text>
				</Stack>
				<div style={{flex: 1}} />
				<div style={{width: 38, height: 38, borderRadius: 19, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name="up" size={19} color={colors.card} stroke={2.4} />
				</div>
			</Stack>
		</div>
	);
};

/** The chat page frame inside the panel: history column and the white conversation area. */
const SinoFrame: React.FC<{active?: 'chat' | 'study' | 'library'; children: React.ReactNode}> = ({active, children}) => {
	const colors = useColors();
	return (
		<Panel active="sinoAi">
			<Stack row align="stretch" style={{flex: 1, minHeight: 0, borderRadius: 24, background: colors.card, border: `1px solid ${colors.line}`, padding: 18}}>
				<HistoryColumn active={active} />
				<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{children}</div>
			</Stack>
		</Panel>
	);
};

export const WebSinoChatScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<SinoFrame>
			<Stack row justify="space-between" style={{width: '100%', padding: '0 0 10px 24px'}}>
				<Text role="headline">{t('Türevde zincir kuralı', 'Chain rule')}</Text>
				<Stack row gap={14}>
					<Icon name="cards" size={18} color={colors.muted} />
					<Icon name="more" size={20} color={colors.muted} stroke={3} />
				</Stack>
			</Stack>
			<div style={{width: 720, flex: 1, display: 'flex', flexDirection: 'column', gap: 22, paddingTop: 16}}>
				<Stack align="flex-end">
					<div style={{maxWidth: 520, padding: '12px 18px', borderRadius: 22, background: colors.line2}}>
						<Text role="body" size={15.5} color={colors.ink}>
							{t('f(x) = (3x² − 2)⁴ için f′(1) sorusunda neden 6x ile çarpıyoruz?', 'Why multiply by 6x in f′(1) for f(x) = (3x² − 2)⁴?')}
						</Text>
					</div>
				</Stack>
				<Stack row gap={14} align="flex-start">
					<Icon name="sparkles" size={24} color={colors.ink} stroke={1.6} />
					<Stack gap={12} grow>
						<Text role="body" size={16} color={colors.ink} style={{lineHeight: '26px'}}>
							{t('Fonksiyon iç içe: dışta ( )⁴, içte 3x² − 2 var. Zincir kuralında dıştakinin türevini alır, içtekinin türeviyle çarparız.', 'It is a composite: ( )⁴ outside, 3x² − 2 inside. The chain rule multiplies the outer derivative by the inner one.')}
						</Text>
						<div style={{padding: '14px 18px', borderRadius: 14, background: colors.line2}}>
							<Text role="headline" size={16}>
								f′(x) = 4(3x² − 2)³ · 6x → f′(1) = 24
							</Text>
						</div>
						<Text role="body" size={16} color={colors.ink} style={{lineHeight: '26px'}}>
							{t('Bu konu son denemende 1 net kaybettirdi. İstersen benzer 3 soruyla pekiştirelim.', 'This cost you 1 point last exam. Want 3 similar questions?')}
						</Text>
						<Stack row gap={16}>
							{(['bookmark', 'refresh', 'cards', 'quiz'] as UIIconName[]).map((icon) => (
								<Icon key={icon} name={icon} size={18} color={colors.muted} />
							))}
						</Stack>
					</Stack>
				</Stack>
				<Stack row gap={8} style={{paddingLeft: 38}}>
					{[t('Benzer 3 soru ver', 'Give 3 similar'), t('Daha basit anlat', 'Simpler please'), t('Bunu kart yap', 'Make a card')].map((label) => (
						<Chip key={label} tone="outline" style={{height: 34, fontSize: 13}}>
							{label}
						</Chip>
					))}
				</Stack>
				<div style={{flex: 1}} />
				<Composer placeholder={t('Devam et…', 'Reply…')} />
				<Text role="meta" align="center">
					{t('SinoAI hata yapabilir; önemli bilgileri kontrol et.', 'SinoAI can make mistakes; check important facts.')}
				</Text>
			</div>
		</SinoFrame>
	);
};

export const WebSinoStudyScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const tools: [UIIconName, string, string, string, string][] = [
		['exam', 'Deneme oluştur', 'Create an exam', 'Eksiklerine göre kişisel deneme', 'A personal exam on your gaps'],
		['cards', 'Tekrar kartları', 'Review cards', 'Notlarından Bilgi Kartları destesi', 'A deck from your notes'],
		['quiz', 'Quiz oluştur', 'Create a quiz', '10 soru, anında açıklamalı', '10 questions, instant feedback'],
		['calendar', 'Çalışma planı', 'Study plan', 'Bir haftalık konu planı', 'A one-week topic plan'],
		['book', 'Çalışma oluştur', 'Study set', 'Konu anlatımı ve sorular', 'Explanation and questions'],
		['note', 'Özet çıkar', 'Summarise', 'PDF ya da metinden tek sayfa', 'One page from a PDF or text'],
	];
	return (
		<SinoFrame active="study">
			<div style={{width: 720, flex: 1, display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 70}}>
				<Stack gap={8} align="center">
					<Icon name="sparkles" size={32} color={colors.ink} stroke={1.6} />
					<Text role="display" size={30} align="center">
						{t('Bugün ne üretelim?', 'What shall we make today?')}
					</Text>
					<Text role="small" size={14} align="center">
						{t('Kaynağını seç: notun, PDF’in ya da bir konu. Bu ay 4 / 20 üretim.', 'Pick a source: notes, a PDF or a topic. 4 / 20 this month.')}
					</Text>
				</Stack>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10}}>
					{tools.map(([icon, tr, en, subTr, subEn]) => (
						<Stack key={tr} gap={8} style={{padding: 16, borderRadius: 18, border: `1px solid ${colors.line}`}}>
							<Icon name={icon} size={20} color={colors.ink} />
							<Text role="headline">{t(tr, en)}</Text>
							<Text role="small">{t(subTr, subEn)}</Text>
						</Stack>
					))}
				</div>
				<div style={{flex: 1}} />
				<Composer placeholder={t('Örnek: Mol kavramı.pdf’ten 10 soruluk quiz', 'e.g. a 10-question quiz from Mole.pdf')} />
			</div>
		</SinoFrame>
	);
};

export const WebSinoLibraryScreen: React.FC = () => {
	const t = useT();
	return (
		<SinoFrame active="library">
			<div style={{width: 760, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10}}>
				<Stack row justify="space-between">
					<Text role="title" size={26}>
						{t('Kütüphanen', 'Your library')}
					</Text>
					<div style={{width: 400}}>
						<Segmented items={[t('Tümü', 'All'), t('Quiz · 4', 'Quizzes · 4'), t('Deste · 2', 'Decks · 2'), t('Özet · 6', 'Notes · 6')]} />
					</div>
				</Stack>
				<List>
					<ListRow module="tests" title={t('Mol kavramı quizi', 'Mole quiz')} subtitle={t('10 soru · bugün · Testler’de çöz', '10 questions · today')} />
					<ListRow module="flashcards" title={t('Osmanlı kartları', 'Ottoman cards')} subtitle={t('24 kart · Bilgi Kartları’na eklendi', '24 cards · in Flashcards')} />
					<ListRow module="studyPlan" title={t('Türev haftalık planı', 'Derivatives weekly plan')} subtitle={t('5 gün · Ders Planı’na eklendi', '5 days · added to plan')} />
					<ListRow icon="note" plainIcon title={t('Hücre bölünmesi özeti', 'Cell division notes')} subtitle={t('PDF · 2 sayfa', 'PDF · 2 pages')} />
					<ListRow module="exam" title={t('Kişisel deneme · Matematik', 'Personal exam · Maths')} subtitle={t('30 soru · Denemeler’de çöz', '30 questions')} />
				</List>
			</div>
		</SinoFrame>
	);
};
