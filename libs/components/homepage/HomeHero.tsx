import React from 'react';
import Link from 'next/link';
import { motion, MotionConfig } from 'framer-motion';
import HeaderFilter from './HeaderFilter';
import { heroMedia, heroPhoto, heroStage, heroTimeline, softFadeUp } from '../common/motion';

const HERO_IMAGE = '/img/home/hero.png';

/** every item below starts at the same moment as the navbar (heroTimeline in common/motion, all delays 0) **/
const HomeHero = () => {
	return (
		<MotionConfig reducedMotion="user">
			<motion.section
				className={'home-hero'}
				aria-labelledby="hero-title"
				variants={heroStage}
				initial="hidden"
				animate="visible"
			>
				<motion.div className={'hero-media'} variants={heroMedia}>
					<motion.img
						src={HERO_IMAGE}
						alt="Bride and groom facing each other under sunlit trees, her long veil trailing across the grass"
						variants={heroPhoto}
					/>
				</motion.div>
				<div className={'hero-content'}>
					<motion.h1 id="hero-title" className={'hero-title'} variants={softFadeUp} custom={heroTimeline.title}>
						Your love story, beautifully told.
					</motion.h1>
					<motion.p className={'hero-subtitle'} variants={softFadeUp} custom={heroTimeline.subtitle}>
						Compare pre-wedding photoshoot packages from studios in Seoul, Busan and Jeju, see exactly what each one
						includes, and reserve your date.
					</motion.p>
					<motion.div className={'hero-actions'} variants={softFadeUp} custom={heroTimeline.cta}>
						<Link href={'/package'} className={'button-primary on-dark'}>
							Explore packages
						</Link>
					</motion.div>
				</div>
				<div className={'hero-search'}>
					<HeaderFilter />
				</div>
			</motion.section>
		</MotionConfig>
	);
};

export default HomeHero;
