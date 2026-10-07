import React, { useId } from 'react';

interface AnimatedLogoProps {
	width?: number;
	height?: number;
	className?: string;
	/** light: white mark for dark backgrounds, dark: mocha/espresso mark for ivory backgrounds **/
	tone?: 'light' | 'dark';
}

const palettes = {
	light: { word: '#FDFDFD', accent: '#F3C9BF', tagline: '#F8F2F1' },
	dark: { word: '#3E2C23', accent: '#C9A87C', tagline: '#6E5A4D' },
};

const wordmarkProps = {
	x: '52',
	y: '27.5',
	// fonts come from next/font CSS variables (libs/fonts.ts); SVG attributes can't read var(), so use style
	style: { fontFamily: 'var(--font-logo), Georgia, serif', fontWeight: 500 },
	fontSize: '18.5',
	fontStyle: 'italic',
};

/**
 * La Memoria logo: the "LM" monogram (/img/logo/monogram.svg, drawn through a CSS mask so it takes the tone colour)
 * next to the inline wordmark, so both can animate on hover. Same 150 x 52 proportions as before.
 */
const AnimatedLogo = (props: AnimatedLogoProps) => {
	const { width = 150, height = 52, className = '', tone = 'light' } = props;
	const c = palettes[tone];
	const uid = useId().replace(/:/g, '');
	const clipId = `word-clip-${uid}`;
	const sheenId = `sheen-${uid}`;
	const unit = width / 150;

	return (
		<span className={`animated-logo ${tone} ${className}`} role="img" aria-label="La Memoria">
			<span
				className={'monogram'}
				aria-hidden="true"
				style={{ width: 44 * unit, height: 44 * unit, marginRight: 6 * unit }}
			/>
			<svg width={100 * unit} height={height} viewBox="50 0 100 52" fill="none" aria-hidden="true">
				<defs>
					<clipPath id={clipId}>
						<text {...wordmarkProps}>La Memoria</text>
					</clipPath>
					<linearGradient id={sheenId} gradientTransform="rotate(20)">
						<stop offset="0" stopColor={c.accent} stopOpacity="0" />
						<stop offset="0.5" stopColor={c.accent} stopOpacity="0.95" />
						<stop offset="1" stopColor={c.accent} stopOpacity="0" />
					</linearGradient>
				</defs>

				<text className="word" fill={c.word} {...wordmarkProps}>
					La Memoria
				</text>
				<g clipPath={`url(#${clipId})`}>
					<rect className="sheen" x="28" y="8" width="24" height="26" fill={`url(#${sheenId})`} />
				</g>
				<path className="underline" d="M52.5 31.6 H144" stroke={c.accent} strokeWidth="0.6" strokeLinecap="round" />
				<text
					className="tagline"
					x="52.5"
					y="40"
					fill={c.tagline}
					style={{ fontFamily: 'var(--font-body), Arial, sans-serif' }}
					fontSize="6.2"
					fontWeight="500"
				>
					WEDDING STUDIOS
				</text>
			</svg>
		</span>
	);
};

export default AnimatedLogo;
