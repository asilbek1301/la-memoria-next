import { Chivo, DM_Sans, EB_Garamond, Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';

/** headings (Stitch "Editorial Archive": display, headline and title styles, weight 400; 500 for small titles) **/
export const headingFont = Chivo({
	subsets: ['latin', 'latin-ext'],
	weight: ['400', '500'],
	display: 'swap',
});

/** body, UI, labels and buttons; one variable file covers the 300–700 weights the SCSS uses **/
export const bodyFont = DM_Sans({
	subsets: ['latin', 'latin-ext'],
	display: 'swap',
});

/** the italic serif wordmark of the logo only (AnimatedLogo.tsx) **/
export const logoFont = EB_Garamond({
	subsets: ['latin'],
	weight: ['500'],
	style: ['italic'],
	display: 'swap',
});

/** HOMEPAGE headings (Stitch design system "Editorial Archive" v4: Headline = Public Sans; Body and Label = DM Sans) **/
export const homeHeadingFont = Public_Sans({
	subsets: ['latin', 'latin-ext'],
	weight: ['400', '500'],
	display: 'swap',
});

/** Korean headings and body: self-hosted Pretendard (SIL Open Font License, public/fonts/pretendard/LICENSE.txt).
 *  It sits after the Latin fonts in every stack, so the browser only downloads it when a page shows Hangul. **/
export const koreanFont = localFont({
	src: '../public/fonts/pretendard/PretendardVariable.woff2',
	weight: '45 920',
	display: 'swap',
	preload: false,
});
