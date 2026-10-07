import { useEffect, useRef, useState } from 'react';
import { Transition, Variants, useReducedMotion } from 'framer-motion';

/** shared Framer Motion presets for liquid-glass surfaces **/

export const spring: Transition = { type: 'spring', stiffness: 300, damping: 24 };
export const springSnappy: Transition = { type: 'spring', stiffness: 500, damping: 30 };

export const navbarVariants: Variants = {
	hidden: { y: -24, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { ...spring, staggerChildren: 0, delayChildren: 0 }, // navbar items start with everything else
	},
};

export const itemFadeUp: Variants = {
	hidden: { opacity: 0, y: 8 },
	visible: { opacity: 1, y: 0, transition: spring },
};

export const searchShellVariants: Variants = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.9,
			ease: [0.22, 1, 0.36, 1],
			delay: 0, // heroTimeline.search
			staggerChildren: 0, // heroTimeline.fieldStep
			delayChildren: 0,
		},
	},
};

export const dropdownVariants: Variants = {
	hidden: { opacity: 0, y: -8, scale: 0.97 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { ...springSnappy, staggerChildren: 0.03 },
	},
	exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } },
};

/** HOMEPAGE HERO: every item starts at the same moment, together with the navbar (all delays 0).
 *  Each keeps its own duration.
 *  Transform + opacity only; MotionConfig reducedMotion="user" removes the movement. **/
const easeOutQuint = [0.22, 1, 0.36, 1];

export const heroTimeline = {
	photo: 0,
	title: 0,
	titleStep: 0,
	rule: 0,
	subtitle: 0,
	cta: 0,
	search: 0,
	fieldStep: 0,
};

/** root of the hero: no motion of its own, it only hands "hidden" / "visible" down to every item **/
export const heroStage: Variants = {
	hidden: {},
	visible: {},
};

/** photo + its shade fade in together (on .hero-media), while the photo itself slowly settles (on the img) **/
export const heroMedia: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 1, ease: 'easeOut', delay: heroTimeline.photo } },
};

export const heroPhoto: Variants = {
	hidden: { scale: 1.08 },
	visible: { scale: 1, transition: { duration: 2.6, ease: easeOutQuint, delay: heroTimeline.photo } },
};

/** custom = delay in seconds (heroTimeline.subtitle / heroTimeline.cta) **/
export const softFadeUp: Variants = {
	hidden: { opacity: 0, y: 18 },
	visible: (delay: number = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.9, ease: easeOutQuint, delay },
	}),
};

/**
 * scroll reveal that never hides content by default: on the server, without IntersectionObserver,
 * under reduced motion, or when already on screen, the element stays visible. Only an element still
 * below the fold is hidden after mount, then fades in once it scrolls into view.
 * Spread the result on a motion element: <motion.section {...reveal}>
 */
export const useReveal = <T extends Element>(offsetY = 16) => {
	const ref = useRef<T>(null);
	const reduceMotion = useReducedMotion();
	const [waiting, setWaiting] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || reduceMotion || typeof IntersectionObserver === 'undefined') return;
		if (el.getBoundingClientRect().top < window.innerHeight) return;
		setWaiting(true);
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setWaiting(false);
					observer.disconnect();
				}
			},
			{ rootMargin: '0px 0px -80px 0px' },
		);
		observer.observe(el);
		return () => {
			observer.disconnect();
			setWaiting(false);
		};
	}, [reduceMotion]);

	return {
		ref,
		initial: false as const,
		animate: waiting ? { opacity: 0, y: offsetY } : { opacity: 1, y: 0 },
		transition: waiting ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
	};
};
