import React from 'react';
import {Composition, Folder} from 'remotion';
import {VideoFrame} from '../../Components/Layouts/VideoFrame';
import {GoogleAdImage, GoogleAdLayer, GoogleAdLogo} from './GoogleAdImage';
import {formatSize, GOOGLE_AD_IMAGE_ID, GOOGLE_AD_LAYER_ID, GOOGLE_AD_LOGO_ID, GoogleAdImagePropsSchema, GoogleAdLayerPropsSchema, GoogleAdLogoPropsSchema, LAYER_SIZE, type GoogleAdImageProps, type GoogleAdLayerProps, type GoogleAdLogoProps} from './GoogleAdsProps';

/** The Google Ads pictures, HTML5 layers and logo assets (docs/GoogleAds/Icerik-Plani.md). */
const ImagePicture: React.FC<GoogleAdImageProps> = (props) => (
	<VideoFrame themeId="SinavikaLight" lang={props.lang}>
		<GoogleAdImage {...props} />
	</VideoFrame>
);

const LayerPicture: React.FC<GoogleAdLayerProps> = (props) => (
	<VideoFrame themeId="SinavikaLight" lang={props.lang} transparent>
		<GoogleAdLayer {...props} />
	</VideoFrame>
);

const LogoPicture: React.FC<GoogleAdLogoProps> = (props) => (
	<VideoFrame themeId="SinavikaLight" lang="tr">
		<GoogleAdLogo {...props} />
	</VideoFrame>
);

export const GoogleAdsComposition: React.FC = () => (
	<Folder name="GoogleAds">
		<Composition
			id={GOOGLE_AD_IMAGE_ID}
			component={ImagePicture}
			schema={GoogleAdImagePropsSchema}
			defaultProps={GoogleAdImagePropsSchema.parse({})}
			durationInFrames={1}
			fps={30}
			width={1200}
			height={1200}
			calculateMetadata={({props}) => {
				const parsed = GoogleAdImagePropsSchema.parse(props);
				return {props: parsed, ...formatSize(parsed.format)};
			}}
		/>
		<Composition
			id={GOOGLE_AD_LAYER_ID}
			component={LayerPicture}
			schema={GoogleAdLayerPropsSchema}
			defaultProps={GoogleAdLayerPropsSchema.parse({})}
			durationInFrames={1}
			fps={30}
			width={300}
			height={650}
			calculateMetadata={({props}) => {
				const parsed = GoogleAdLayerPropsSchema.parse(props);
				const size = parsed.layer === 'proof' ? LAYER_SIZE.proof : parsed.platform === 'mobile' ? LAYER_SIZE.mobileDevice : LAYER_SIZE.webDevice;
				return {props: parsed, ...size};
			}}
		/>
		<Composition
			id={GOOGLE_AD_LOGO_ID}
			component={LogoPicture}
			schema={GoogleAdLogoPropsSchema}
			defaultProps={GoogleAdLogoPropsSchema.parse({})}
			durationInFrames={1}
			fps={30}
			width={1200}
			height={1200}
			calculateMetadata={({props}) => {
				const parsed = GoogleAdLogoPropsSchema.parse(props);
				return {props: parsed, width: 1200, height: parsed.kind === 'kare' ? 1200 : 300};
			}}
		/>
	</Folder>
);
