import React from 'react';
import {UIProvider, useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {AppHeader, Content, Phone} from '../../Parts/Mobile';
import {Button, Card, Chip, List, ListRow, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {UI_SHADOW} from '../../Tokens';

/**
 * SinoAI on mobile: a quiet chat surface (like ChatGPT or Gemini). White
 * page, no colour of its own, the student's message in a light grey bubble,
 * SinoAI's answer as plain text, one rounded composer at the bottom.
 */

const IconButton: React.FC<{icon: UIIconName}> = ({icon}) => {
	const colors = useColors();
	return (
		<div style={{width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Icon name={icon} size={22} color={colors.ink} />
		</div>
	);
};

/** Top bar: menu, the mode switch (Sohbet · Çalışma) as plain text tabs, new chat. */
const SinoTop: React.FC<{active?: number}> = ({active = 0}) => {
	const colors = useColors();
	const t = useT();
	return (
		<Stack row gap={6} style={{padding: '4px 10px 8px'}}>
			<IconButton icon="menu" />
			<Stack row gap={18} justify="center" style={{flex: 1}}>
				{[t('Sohbet', 'Chat'), t('Çalışma', 'Study')].map((label, index) => (
					<Stack key={label} gap={4} align="center">
						<Text role="headline" size={15} color={index === active ? colors.ink : colors.muted}>
							{label}
						</Text>
						<div style={{width: 18, height: 2.5, borderRadius: 2, background: index === active ? colors.ink : 'transparent'}} />
					</Stack>
				))}
			</Stack>
			<IconButton icon="newChat" />
		</Stack>
	);
};

const Composer: React.FC<{placeholder?: string}> = ({placeholder}) => {
	const colors = useColors();
	const t = useT();
	return (
		<div style={{padding: '8px 14px 30px'}}>
			<div style={{borderRadius: 26, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, padding: '12px 10px 10px 16px'}}>
				<Text role="body" color={colors.subtle}>
					{placeholder ?? t('SinoAI’ye sor', 'Ask SinoAI')}
				</Text>
				<Stack row gap={8} style={{marginTop: 10}}>
					<div style={{width: 32, height: 32, borderRadius: 16, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="plus" size={18} color={colors.ink2} />
					</div>
					<div style={{width: 32, height: 32, borderRadius: 16, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="camera" size={17} color={colors.ink2} />
					</div>
					<div style={{flex: 1}} />
					<div style={{width: 34, height: 34, borderRadius: 17, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="up" size={18} color={colors.card} stroke={2.4} />
					</div>
				</Stack>
			</div>
		</div>
	);
};

const SinoPhone: React.FC<{children: React.ReactNode; overlay?: React.ReactNode}> = ({children, overlay}) => {
	const colors = useColors();
	return (
		<UIProvider module="sinoAi">
			<Phone bg={colors.card} overlay={overlay}>
				{children}
			</Phone>
		</UIProvider>
	);
};

const Mark: React.FC<{size?: number}> = ({size = 28}) => {
	const colors = useColors();
	return <Icon name="sparkles" size={size} color={colors.ink} stroke={1.6} />;
};

export const SinoHomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const prompts: [UIIconName, string][] = [
		['camera', t('Sorunun fotoğrafını çek, adım adım çöz', 'Snap a question, solve it step by step')],
		['book', t('Türevde zincir kuralını anlat', 'Explain the chain rule')],
		['quiz', t('Eksiklerimden 10 soruluk test hazırla', 'Make a 10-question quiz from my gaps')],
		['note', t('Notlarımı tek sayfada özetle', 'Summarise my notes on one page')],
	];
	return (
		<SinoPhone>
			<SinoTop />
			<Content tabBar={false} gap={18} padding="70px 20px 10px">
				<Stack gap={12}>
					<Mark size={34} />
					<Text role="display" size={28} style={{lineHeight: '34px'}}>
						{t('Merhaba Ayşe.', 'Hi Ayşe.')}
						<br />
						<span style={{color: colors.muted}}>{t('Bugün neye takıldın?', 'Where are you stuck today?')}</span>
					</Text>
				</Stack>
				<Stack gap={8}>
					{prompts.map(([icon, text]) => (
						<Stack key={text} row gap={12} style={{padding: '13px 14px', borderRadius: 16, border: `1px solid ${colors.line}`}}>
							<Icon name={icon} size={19} color={colors.ink2} />
							<Text role="body" color={colors.ink}>
								{text}
							</Text>
						</Stack>
					))}
				</Stack>
				<Text role="meta">{t('SinoAI hedefini (YKS · 78 net) ve son denemeni bilerek yanıtlar.', 'SinoAI answers with your goal (YKS · 78) and last exam in mind.')}</Text>
			</Content>
			<Composer />
		</SinoPhone>
	);
};

export const SinoChatScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<SinoPhone>
			<SinoTop />
			<Content tabBar={false} gap={16} padding="10px 20px 10px">
				<Stack align="flex-end" gap={8}>
					{/* The photographed question: a slightly tilted piece of paper with the printed problem. */}
					<div style={{width: 176, padding: '10px 12px', borderRadius: 12, background: '#FBF8F1', border: `1px solid ${colors.line}`, boxShadow: '0 6px 14px -8px rgba(15,23,42,0.35)', transform: 'rotate(-2deg)', boxSizing: 'border-box'}}>
						<Text role="meta" size={10} color={colors.muted}>
							{t('12. soru', 'Question 12')}
						</Text>
						<Text role="body" size={13} color={colors.ink} style={{lineHeight: '18px', marginTop: 3}}>
							f(x) = (3x² − 2)⁴
						</Text>
						<Text role="body" size={13} color={colors.ink} style={{lineHeight: '18px'}}>
							{t("ise f'(1) kaçtır?", "find f'(1).")}
						</Text>
						<div style={{display: 'flex', gap: 6, marginTop: 6}}>
							{['A) 12', 'B) 24', 'C) 48'].map((choice) => (
								<Text key={choice} role="meta" size={10} color={colors.muted}>
									{choice}
								</Text>
							))}
						</div>
					</div>
					<div style={{maxWidth: 270, padding: '10px 14px', borderRadius: 20, background: colors.line2}}>
						<Text role="body" color={colors.ink}>
							{t('Bu soruda neden 6x ile çarpıyoruz?', 'Why do we multiply by 6x here?')}
						</Text>
					</div>
				</Stack>
				<Stack gap={12}>
					<Mark size={22} />
					<Text role="body" size={15.5} color={colors.ink} style={{lineHeight: '24px'}}>
						{t('Fonksiyon iç içe: dışta ( )⁴, içte 3x² − 2 var. Zincir kuralında dıştakinin türevini alıp içtekinin türeviyle çarparız.', 'It is a composite: ( )⁴ outside, 3x² − 2 inside. The chain rule multiplies the outer derivative by the inner one.')}
					</Text>
					<div style={{padding: '12px 14px', borderRadius: 14, background: colors.line2}}>
						<Text role="headline" size={15}>
							f'(x) = 4(3x² − 2)³ · 6x
						</Text>
					</div>
					<Text role="body" size={15.5} color={colors.ink} style={{lineHeight: '24px'}}>
						{t('x = 1 için içerisi 1 olur, sonuç 24. Bu konu son denemende 1 net kaybettirdi.', 'At x = 1 the inside is 1, so the answer is 24. This cost you 1 point last exam.')}
					</Text>
					<Stack row gap={14}>
						{(['bookmark', 'refresh', 'cards'] as UIIconName[]).map((icon) => (
							<Icon key={icon} name={icon} size={18} color={colors.muted} />
						))}
					</Stack>
				</Stack>
				<Stack row wrap gap={8}>
					{[t('Benzer bir soru ver', 'Give a similar one'), t('Daha basit anlat', 'Simpler please'), t('Kart yap', 'Make a card')].map((label) => (
						<Chip key={label} tone="outline">
							{label}
						</Chip>
					))}
				</Stack>
			</Content>
			<Composer placeholder={t('Devam et…', 'Reply…')} />
		</SinoPhone>
	);
};

export const SinoStudyScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const tools: [UIIconName, string, string, string, string][] = [
		['exam', 'Deneme oluştur', 'Create an exam', 'Eksiklerine göre kişisel deneme', 'A personal exam on your gaps'],
		['cards', 'Tekrar kartları oluştur', 'Create review cards', 'Notlarından Bilgi Kartları destesi', 'A deck from your notes'],
		['quiz', 'Test oluştur', 'Create a quiz', '10 soru, anında açıklamalı', '10 questions, instant feedback'],
		['calendar', 'Çalışma planı oluştur', 'Create a study plan', 'Bir haftalık konu planı', 'A one-week topic plan'],
		['book', 'Çalışma oluştur', 'Create a study set', 'Konu anlatımı ve sorular', 'Explanation and questions'],
	];
	return (
		<SinoPhone>
			<SinoTop active={1} />
			<Content tabBar={false} gap={8} padding="16px 20px 10px">
				<Text role="title" size={22}>
					{t('Ne üretelim?', 'What shall we make?')}
				</Text>
				<Text role="small">{t('Kaynak olarak notunu, PDF’ini ya da bir konuyu seç. Bu ay 4 / 20.', 'Use your notes, a PDF or a topic. 4 / 20 this month.')}</Text>
				<div style={{height: 6}} />
				{tools.map(([icon, tr, en, subTr, subEn], index) => (
					<Stack key={tr} row gap={14} style={{padding: '14px 4px', borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
						<Icon name={icon} size={21} color={colors.ink} />
						<Stack grow gap={1}>
							<Text role="headline">{t(tr, en)}</Text>
							<Text role="small">{t(subTr, subEn)}</Text>
						</Stack>
						<Icon name="right" size={18} color={colors.subtle} />
					</Stack>
				))}
			</Content>
			<Composer placeholder={t('Ya da ne istediğini yaz…', 'Or describe what you need…')} />
		</SinoPhone>
	);
};

/**
 * A finished production in Çalışma: the result card carries its actions as
 * real buttons, "Testi aç" filled and "Değiştir" outlined. Before, "Değişiklik
 * iste" and a copy icon sat under the card as loose text and the next options
 * hung alone at the bottom (UI/UX review, 25 Oct 2026). What to make next
 * follows right under the card.
 */
export const SinoStudyResultScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<SinoPhone>
			<SinoTop active={1} />
			<Content tabBar={false} gap={14} padding="12px 20px 10px">
				<Stack align="flex-end">
					<div style={{maxWidth: 280, padding: '10px 14px', borderRadius: 20, background: colors.line2}}>
						<Text role="body" color={colors.ink}>
							{t('Türevde zincir kuralından 20 soruluk test hazırla', 'Make a 20-question test on the chain rule')}
						</Text>
					</div>
				</Stack>
				<Stack row gap={8}>
					<Mark size={20} />
					<Text role="small" color={colors.ink2}>
						{t('Testin hazır. Kolaydan zora sıraladım.', 'Your test is ready, easy to hard.')}
					</Text>
				</Stack>
				<Card padding={16}>
					<Stack row gap={12}>
						<Tile module="tests" size={44} />
						<Stack grow gap={2}>
							<Text role="headline">{t('Zincir kuralı testi', 'Chain rule test')}</Text>
							<Text role="small">{t('20 soru · Orta · Matematik', '20 questions · Medium · Maths')}</Text>
						</Stack>
					</Stack>
					<Stack row gap={10} style={{marginTop: 14}}>
						<Button size="md" icon="play">
							{t('Testi aç', 'Open test')}
						</Button>
						<Button size="md" tone="ghost" icon="edit">
							{t('Değiştir', 'Change')}
						</Button>
					</Stack>
				</Card>
				<Text role="over" style={{marginTop: 6}}>
					{t('Sırada ne var?', 'What next?')}
				</Text>
				<Stack row wrap gap={8}>
					{[t('Aynı konudan kart üret', 'Make cards on it'), t('Konuyu kısaca anlat', 'Explain it briefly'), t('Kişisel deneme', 'Personal exam')].map((label) => (
						<Chip key={label} tone="outline">
							{label}
						</Chip>
					))}
				</Stack>
			</Content>
			<Composer placeholder={t('Ya da ne istediğini yaz…', 'Or describe what you need…')} />
		</SinoPhone>
	);
};

export const SinoLibraryScreen: React.FC = () => {
	const t = useT();
	return (
		<SinoPhone>
			<AppHeader left="back" title={t('Kütüphanen', 'Your library')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<Segmented items={[t('Tümü', 'All'), t('Test · 4', 'Quizzes · 4'), t('Deste · 2', 'Decks · 2'), t('Özet · 6', 'Notes · 6')]} />
				<List>
					<ListRow module="tests" title={t('Mol kavramı testi', 'Mole quiz')} subtitle={t('10 soru · bugün', '10 questions · today')} />
					<ListRow module="flashcards" title={t('Osmanlı kartları', 'Ottoman cards')} subtitle={t('24 kart · Bilgi Kartları’nda', '24 cards · in Flashcards')} />
					<ListRow module="studyPlan" title={t('Türev haftalık planı', 'Derivatives weekly plan')} subtitle={t('5 gün · Ders Planı’na eklendi', '5 days · added to plan')} />
					<ListRow icon="note" plainIcon title={t('Hücre bölünmesi özeti', 'Cell division notes')} subtitle={t('PDF · 2 sayfa', 'PDF · 2 pages')} />
					<ListRow module="exam" title={t('Kişisel deneme · Matematik', 'Personal exam · Maths')} subtitle={t('30 soru', '30 questions')} />
				</List>
			</Content>
		</SinoPhone>
	);
};

export const SinoMenuScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const Row: React.FC<{icon: UIIconName; label: string; strong?: boolean}> = ({icon, label, strong}) => (
		<Stack row gap={12} style={{padding: '10px 8px', borderRadius: 12, background: strong ? colors.line2 : undefined}}>
			<Icon name={icon} size={19} color={colors.ink2} />
			<Text role="headline" size={14.5} weight={strong ? 700 : 600} color={colors.ink}>
				{label}
			</Text>
		</Stack>
	);
	return (
		<SinoPhone
			overlay={
				<div style={{position: 'absolute', inset: 0, background: 'rgba(11, 28, 48, 0.28)', zIndex: 20}}>
					<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, background: colors.bg, padding: '64px 14px 30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 4}}>
						<Stack row gap={10} style={{height: 44, padding: '0 12px', borderRadius: 22, background: colors.card, border: `1px solid ${colors.line}`, marginBottom: 10}}>
							<Icon name="search" size={17} color={colors.muted} />
							<Text role="small">{t('Sohbetlerde ara', 'Search chats')}</Text>
						</Stack>
						<Row icon="newChat" label={t('Yeni sohbet', 'New chat')} strong />
						<Row icon="layers" label={t('Kütüphanen', 'Your library')} />
						<Text role="over" style={{margin: '14px 8px 4px'}}>
							{t('Bugün', 'Today')}
						</Text>
						{[t('Türevde zincir kuralı', 'Chain rule'), t('Mol hesaplama', 'Mole calculation')].map((title) => (
							<Text key={title} role="small" weight={600} color={colors.ink} style={{padding: '9px 8px'}}>
								{title}
							</Text>
						))}
						<Text role="over" style={{margin: '14px 8px 4px'}}>
							{t('Bu hafta', 'This week')}
						</Text>
						{[t('Paragrafta çeldirici şıklar', 'Distractors'), t('Osmanlı duraklama özeti', 'Ottoman notes'), t('Kuvvet problemleri', 'Force problems')].map((title) => (
							<Text key={title} role="small" weight={600} color={colors.ink2} style={{padding: '9px 8px'}}>
								{title}
							</Text>
						))}
						<div style={{flex: 1}} />
						<Row icon="settings" label={t('SinoAI ayarları', 'SinoAI settings')} />
					</div>
				</div>
			}
		>
			<SinoTop />
		</SinoPhone>
	);
};
