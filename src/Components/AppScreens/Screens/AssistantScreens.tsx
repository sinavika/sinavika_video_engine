import React from 'react';
import {AppChip, AppIcon, AppScreenFrame, AppText, useAppColors, useAppLanguage, useAppText, type AppLanguage} from '../AppScreenParts';

/** The SinoAI chat of the store pictures: one question and its answer, per store language. */
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
