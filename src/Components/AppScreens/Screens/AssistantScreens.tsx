import React from 'react';
import {AppButton, AppCard, AppChip, AppIcon, AppListRow, AppOverline, AppPromoCard, AppScreenFrame, AppText, useAppColors} from '../AppScreenParts';

/** Akıllı Özet › Lens: the module's home. */
export const SmartSummaryHomeScreen: React.FC = () => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="SmartSummary" title="Akıllı Özet" activeTab={0}>
			<AppPromoCard label="Ana aksiyon" title="Soru analizi" description="Soru fotoğrafını yükle; çözüm ve kazanım özetini al." action="Soru yükle" />
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 8}}>
				<AppOverline>Video</AppOverline>
				<AppText size="headline" weight={700}>
					Video analizi
				</AppText>
				<AppText size="label" color={colors.muted}>
					YouTube bağlantısı gönder; özet ve kazanım oluşsun.
				</AppText>
				<AppButton tone="neutral">Video analizi</AppButton>
			</AppCard>
			<AppOverline>Geçmiş analizler</AppOverline>
			<AppListRow icon="scan" title="Birinci dereceden denklemler" subtitle="Soru analizi · 1 soru" />
			<AppListRow icon="play" title="Türev: temel kurallar" subtitle="Video analizi" />
		</AppScreenFrame>
	);
};

export type SmartSummaryAnalysis = {question: string; steps: string[]; outcome: string; mistake: string};

const SAMPLE_ANALYSIS: SmartSummaryAnalysis = {
	question: '3(x − 2) + 4 = 2x + 7 denklemini sağlayan x değeri kaçtır?',
	steps: ['Parantezi aç: 3x − 6 + 4 = 2x + 7', 'Sabitleri birleştir: 3x − 2 = 2x + 7', 'Bilinmeyeni yalnız bırak: x = 9'],
	outcome: 'Birinci dereceden denklemler',
	mistake: 'Taraf değiştiren terimin işareti değişir; en sık hata burada yapılır.',
};

/** Akıllı Özet › an analysis: solution, learning outcome and mistake analysis from a photo of a question. */
export const SmartSummaryScreen: React.FC<{analysis?: SmartSummaryAnalysis}> = ({analysis = SAMPLE_ANALYSIS}) => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="SmartSummary" title="Soru analizi" activeTab={0}>
			<div style={{boxSizing: 'border-box', padding: 16, borderRadius: 16, backgroundColor: colors.card, border: `1.5px dashed ${colors.primary}`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10}}>
					<AppIcon name="camera" size={18} color={colors.primary} />
					<AppText size={12.5} weight={700} color={colors.primary}>
						Soru görseli
					</AppText>
				</div>
				<AppText size={15} weight={600} style={{lineHeight: 1.45}}>
					{analysis.question}
				</AppText>
			</div>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 10}}>
				<AppOverline>Çözüm</AppOverline>
				{analysis.steps.map((step, index) => (
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
				<AppOverline>Kazanım</AppOverline>
				<div style={{display: 'flex'}}>
					<AppChip>{analysis.outcome}</AppChip>
				</div>
			</AppCard>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 8}}>
				<AppOverline>Hata analizi</AppOverline>
				<AppText size={13.5} weight={600}>
					{analysis.mistake}
				</AppText>
			</AppCard>
		</AppScreenFrame>
	);
};

export type SinoAiChat = {question: string; answer: string[]};

const SAMPLE_CHAT: SinoAiChat = {
	question: 'Türevi kısaca anlat',
	answer: ['Türev, bir fonksiyonun bir noktadaki anlık değişim hızıdır.', 'Grafikte o noktadaki teğetin eğimine eşittir. Örnek: f(x) = x² ise f′(x) = 2x.'],
};

const SINOAI_TOOLS = ['Çalışma oluştur', 'Quiz oluştur', 'Tekrar kartları oluştur'];

/** SinoAI: the chat with the exam coach. Pass `chat` to show another conversation. */
export const SinoAiScreen: React.FC<{chat?: SinoAiChat}> = ({chat = SAMPLE_CHAT}) => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="SinoAi" title="SinoAI" trailing={<AppChip tone="neutral">Sohbet</AppChip>}>
			<div style={{alignSelf: 'flex-end', maxWidth: '78%', padding: '11px 15px', borderRadius: '18px 18px 6px 18px', backgroundColor: colors.primary}}>
				<AppText weight={600} color={colors.onPrimary}>
					{chat.question}
				</AppText>
			</div>
			<div style={{alignSelf: 'flex-start', maxWidth: '86%', padding: '13px 15px', borderRadius: '18px 18px 18px 6px', backgroundColor: colors.card, border: `1px solid ${colors.outline}`, display: 'flex', flexDirection: 'column', gap: 8}}>
				{chat.answer.map((paragraph, index) => (
					<AppText key={paragraph} weight={index === 0 ? 600 : 500} style={{lineHeight: 1.45}}>
						{paragraph}
					</AppText>
				))}
			</div>
			<div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
				{SINOAI_TOOLS.map((tool) => (
					<AppChip key={tool}>{tool}</AppChip>
				))}
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', padding: '10px 10px 10px 16px', borderRadius: 999, backgroundColor: colors.card, border: `1px solid ${colors.outline}`}}>
				<AppText size={14} color={colors.muted} style={{flex: 1}}>
					SinoAI’ye sor
				</AppText>
				<div style={{width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<AppIcon name="send" size={17} color={colors.onPrimary} />
				</div>
			</div>
		</AppScreenFrame>
	);
};
