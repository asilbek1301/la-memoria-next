import React, { useId } from 'react';

interface AnimatedLogoProps {
	width?: number;
	height?: number;
	className?: string;
}

const wordmarkProps = {
	x: '52',
	y: '27.5',
	fontFamily: "'Playfair Display', Didot, 'Bodoni 72', Georgia, serif",
	fontSize: '18.5',
	fontStyle: 'italic',
};

/** Inline La Memoria logo (same artwork as /img/logo/logoWhite.svg) so its parts can animate on hover **/
const AnimatedLogo = (props: AnimatedLogoProps) => {
	const { width = 150, height = 52, className = '' } = props;
	const uid = useId().replace(/:/g, '');
	const clipId = `lm-word-clip-${uid}`;
	const sheenId = `lm-sheen-${uid}`;

	return (
		<span className={`lm-logo ${className}`}>
			<svg width={width} height={height} viewBox="0 0 150 52" fill="none" role="img" aria-label="La Memoria">
				<defs>
					<clipPath id={clipId}>
						<text {...wordmarkProps}>La Memoria</text>
					</clipPath>
					<linearGradient id={sheenId} gradientTransform="rotate(20)">
						<stop offset="0" stopColor="#F3C9BF" stopOpacity="0" />
						<stop offset="0.5" stopColor="#F3C9BF" stopOpacity="0.95" />
						<stop offset="1" stopColor="#F3C9BF" stopOpacity="0" />
					</linearGradient>
				</defs>

				<g transform="translate(0 4) scale(1.1)">
					<circle cx="20" cy="20" r="20" fill="#EB6753" />
					<circle cx="20" cy="20" r="17.6" fill="none" stroke="#FDFDFD" strokeOpacity="0.35" strokeWidth="0.6" />
					<g className="lm-ring-left">
						<circle cx="16.2" cy="23" r="6.6" fill="none" stroke="#FDFDFD" strokeWidth="1.9" />
					</g>
					<g className="lm-ring-right">
						<circle cx="23.8" cy="23" r="6.6" fill="none" stroke="#FDFDFD" strokeWidth="1.9" />
						<path d="M21.54 29.2 A6.6 6.6 0 0 1 18.74 27.24" fill="none" stroke="#EB6753" strokeWidth="3.6" />
						<path
							d="M21.54 29.2 A6.6 6.6 0 0 1 18.74 27.24"
							fill="none"
							stroke="#FDFDFD"
							strokeWidth="1.9"
							strokeLinecap="round"
						/>
					</g>
					<g className="lm-diamond">
						<path d="M23.8 9.6 L26.1 12.1 L23.8 15.2 L21.5 12.1 Z" fill="#FDFDFD" />
						<path d="M21.5 12.1 L26.1 12.1" stroke="#EB6753" strokeWidth="0.5" />
					</g>
					<path
						className="lm-glint"
						d="M27.6 7.4 Q27.9 9.1 29.6 9.4 Q27.9 9.7 27.6 11.4 Q27.3 9.7 25.6 9.4 Q27.3 9.1 27.6 7.4 Z"
						fill="#FDFDFD"
					/>
				</g>

				<text className="lm-word" fill="#FDFDFD" {...wordmarkProps}>
					La Memoria
				</text>
				<g clipPath={`url(#${clipId})`}>
					<rect className="lm-sheen" x="28" y="8" width="24" height="26" fill={`url(#${sheenId})`} />
				</g>
				<path className="lm-underline" d="M52.5 31.6 H144" stroke="#F3C9BF" strokeWidth="0.6" strokeLinecap="round" />
				<text
					className="lm-tagline"
					x="52.5"
					y="40"
					fill="#F8F2F1"
					fontFamily="Poppins, 'Helvetica Neue', Helvetica, Arial, sans-serif"
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
