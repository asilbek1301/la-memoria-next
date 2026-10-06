import { Transition, Variants } from 'framer-motion';

/** shared Framer Motion presets for liquid-glass surfaces **/

export const spring: Transition = { type: 'spring', stiffness: 300, damping: 24 };
export const springSnappy: Transition = { type: 'spring', stiffness: 500, damping: 30 };

export const glassPress = {
	whileHover: { scale: 1.04 },
	whileTap: { scale: 0.96 },
	transition: springSnappy,
};

export const navbarVariants: Variants = {
	hidden: { y: -24, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { ...spring, staggerChildren: 0.05, delayChildren: 0.1 },
	},
};

export const itemFadeUp: Variants = {
	hidden: { opacity: 0, y: 8 },
	visible: { opacity: 1, y: 0, transition: spring },
};

export const searchShellVariants: Variants = {
	hidden: { opacity: 0, y: 24, scale: 0.98 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { ...spring, delay: 0.15, staggerChildren: 0.06, delayChildren: 0.25 },
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
