import React from 'react';
import {AppButton, AppCard, AppChip, AppIcon, AppListRow, AppOverline, AppPromoCard, AppScreenFrame, AppText, useAppColors, useAppLanguage, useAppText, type AppLanguage} from '../AppScreenParts';

/** Akıllı Özet › Lens: the module's home. */
export const SmartSummaryHomeScreen: React.FC = () => {
	const colors = useAppColors();
	const t = useAppText();
	return (
		<AppScreenFrame module="SmartSummary" title={t('Akıllı Özet', 'Smart Summary')} activeTab={0}>
			<AppPromoCard
				label={t('Ana aksiyon', 'Main action')}
				title={t('Soru analizi', 'Question analysis')}
				description={t('Soru fotoğrafını yükle; çözüm ve kazanım özetini al.', 'Upload a photo of a question; get the solution and the skill it tests.')}
				action={t('Soru yükle', 'Upload a question')}
			/>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 8}}>
				<AppOverline>Video</AppOverline>
				<AppText size="headline" weight={700}>
					{t('Video analizi', 'Video analysis')}
				</AppText>
				<AppText size="label" color={colors.muted}>
					{t('YouTube bağlantısı gönder; özet ve kazanım oluşsun.', 'Send a YouTube link; get a summary and the skills it covers.')}
				</AppText>
				<AppButton tone="neutral">{t('Video analizi', 'Video analysis')}</AppButton>
			</AppCard>
			<AppOverline>{t('Geçmiş analizler', 'Past analyses')}</AppOverline>
			<AppListRow icon="scan" title={t('Birinci dereceden denklemler', 'Linear equations')} subtitle={t('Soru analizi · 1 soru', 'Question analysis · 1 question')} />
			<AppListRow icon="play" title={t('Türev: temel kurallar', 'Derivatives: basic rules')} subtitle={t('Video analizi', 'Video analysis')} />
		</AppScreenFrame>
	);
};

export type SmartSummaryAnalysis = {question: string; steps: string[]; outcome: string; mistake: string};

const SAMPLE_ANALYSIS: Record<AppLanguage, SmartSummaryAnalysis> = {
	tr: {
		question: '3(x − 2) + 4 = 2x + 7 denklemini sağlayan x değeri kaçtır?',
		steps: ['Parantezi aç: 3x − 6 + 4 = 2x + 7', 'Sabitleri birleştir: 3x − 2 = 2x + 7', 'Bilinmeyeni yalnız bırak: x = 9'],
		outcome: 'Birinci dereceden denklemler',
		mistake: 'Taraf değiştiren terimin işareti değişir; en sık hata burada yapılır.',
	},
	en: {
		question: 'Which value of x satisfies 3(x − 2) + 4 = 2x + 7?',
		steps: ['Expand the brackets: 3x − 6 + 4 = 2x + 7', 'Combine the constants: 3x − 2 = 2x + 7', 'Isolate the unknown: x = 9'],
		outcome: 'Linear equations',
		mistake: 'A term that changes sides changes its sign; this is where most mistakes happen.',
	},
};

/** Akıllı Özet › an analysis: solution, learning outcome and mistake analysis from a photo of a question. */
export const SmartSummaryScreen: React.FC<{analysis?: SmartSummaryAnalysis}> = ({analysis}) => {
	const colors = useAppColors();
	const t = useAppText();
	const lang = useAppLanguage();
	const shown = analysis ?? SAMPLE_ANALYSIS[lang];
	return (
		<AppScreenFrame module="SmartSummary" title={t('Soru analizi', 'Question analysis')} activeTab={0}>
			<div style={{boxSizing: 'border-box', padding: 16, borderRadius: 16, backgroundColor: colors.card, border: `1.5px dashed ${colors.primary}`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10}}>
					<AppIcon name="camera" size={18} color={colors.primary} />
					<AppText size={12.5} weight={700} color={colors.primary}>
						{t('Soru görseli', 'Question photo')}
					</AppText>
				</div>
				<AppText size={15} weight={600} style={{lineHeight: 1.45}}>
					{shown.question}
				</AppText>
			</div>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 10}}>
				<AppOverline>{t('Çözüm', 'Solution')}</AppOverline>
				{shown.steps.map((step, index) => (
					<div key={step} style={{display: 'flex', alignItems: 'flex-start', gap: 10}}>
						<div style={{width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<AppText size={12} weight={800} color={colors.onPrimary}>
								{index + 1}
							</AppText>
						</div>
						<AppText size={13.5} weight={600} style={{flex: 1}}>
							{step}
						</AppText>
					</div>
				))}
			</AppCard>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 8}}>
				<AppOverline>{t('Kazanım', 'Skill tested')}</AppOverline>
				<div style={{display: 'flex'}}>
					<AppChip>{shown.outcome}</AppChip>
				</div>
			</AppCard>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 8}}>
				<AppOverline>{t('Hata analizi', 'Mistake analysis')}</AppOverline>
				<AppText size={13.5} weight={600}>
					{shown.mistake}
				</AppText>
			</AppCard>
		</AppScreenFrame>
	);
};

/** A conversation: the student's message (optionally with a file they attached) and SinoAI's answer. */
export type SinoAiChat = {question: string; answer: string[]; attachment?: string};

const SAMPLE_CHAT: Record<AppLanguage, SinoAiChat> = {
	tr: {
		question: 'Türevi kısaca anlat',
		answer: ['Türev, bir fonksiyonun bir noktadaki anlık değişim hızıdır.', 'Grafikte o noktadaki teğetin eğimine eşittir. Örnek: f(x) = x² ise f′(x) = 2x.'],
	},
	en: {
		question: 'Explain derivatives briefly',
		answer: ['A derivative is the instantaneous rate of change of a function at a point.', 'On a graph it equals the slope of the tangent there. Example: if f(x) = x², then f′(x) = 2x.'],
	},
};

/** SinoAI: the chat with the exam coach. Pass `chat` to show another conversation. */
export const SinoAiScreen: React.FC<{chat?: SinoAiChat}> = ({chat}) => {
	const colors = useAppColors();
	const t = useAppText();
	const lang = useAppLanguage();
	const shown = chat ?? SAMPLE_CHAT[lang];
	const tools = [t('Çalışma oluştur', 'Create a study set'), t('Test oluştur', 'Create a quiz'), t('Tekrar kartları oluştur', 'Create review cards')];
	return (
		<AppScreenFrame module="SinoAi" title="SinoAI" trailing={<AppChip tone="neutral">{t('Sohbet', 'Chat')}</AppChip>}>
			<div style={{alignSelf: 'flex-end', maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6}}>
				{shown.attachment ? (
					<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, backgroundColor: colors.card, border: `1px solid ${colors.outline}`}}>
						<div style={{width: 34, height: 40, borderRadius: 6, backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<AppIcon name="document" size={18} color={colors.text} />
						</div>
						<div style={{minWidth: 0}}>
							<AppText size={13} weight={700}>
								{shown.attachment}
							</AppText>
							<AppText size={11} color={colors.muted}>
								PDF · 14 {t('sayfa', 'pages')}
							</AppText>
						</div>
					</div>
				) : null}
				<div style={{padding: '11px 15px', borderRadius: '18px 18px 6px 18px', backgroundColor: colors.surface}}>
					<AppText weight={600} color={colors.text}>
						{shown.question}
					</AppText>
				</div>
			</div>
			<div style={{alignSelf: 'flex-start', maxWidth: '86%', padding: '13px 15px', borderRadius: '18px 18px 18px 6px', backgroundColor: colors.card, border: `1px solid ${colors.outline}`, display: 'flex', flexDirection: 'column', gap: 8}}>
				{shown.answer.map((paragraph, index) => (
					<AppText key={paragraph} weight={index === 0 ? 600 : 500} style={{lineHeight: 1.45}}>
						{paragraph}
					</AppText>
				))}
			</div>
			<div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
				{tools.map((tool) => (
					<AppChip key={tool} tone="neutral">
						{tool}
					</AppChip>
				))}
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', padding: '10px 10px 10px 16px', borderRadius: 999, backgroundColor: colors.card, border: `1px solid ${colors.outline}`}}>
				<AppText size={14} color={colors.muted} style={{flex: 1}}>
					{t('SinoAI’ye sor', 'Ask SinoAI')}
				</AppText>
				<div style={{width: 36, height: 36, borderRadius: 18, backgroundColor: colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<AppIcon name="send" size={17} color={colors.card} />
				</div>
			</div>
		</AppScreenFrame>
	);
};
