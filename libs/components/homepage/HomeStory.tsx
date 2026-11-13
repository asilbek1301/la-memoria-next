import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useReveal } from '../common/motion';

const storyPoints = [
	'Studios from Seoul, Busan and Jeju',
	'Every inclusion listed up front',
	'Reserve directly with the studio',
];

/** "Our philosophy": editorial statement across the container, photo and principles below; brand copy, no backend data **/
const HomeStory = () => {
	const { t } = useTranslation('common');
	const reveal = useReveal<HTMLElement>(0);

	return (
		<motion.section className={'home-story'} aria-labelledby="story-title" {...reveal}>
			<div className={'story-head'}>
				<span className={'story-eyebrow'}>{t('Our philosophy')}</span>
			</div>
			<h2 id="story-title" className={'story-quote'}>
				{t('Wedding photos should not feel staged. They should feel')} <em>{t('quiet, honest and true')}</em>{' '}
				{t('to the two of you.')}
			</h2>
			<div className={'story-grid'}>
				<div className={'story-media'}>
					<img
						src="/img/home/story.jpg"
						alt={t('Bride in a soft ivory dress smiling with her eyes closed')}
						loading="lazy"
					/>
				</div>
				<div className={'story-content'}>
					<p className={'story-body'}>
						{t(
							'La Memoria brings together photography studios from Seoul, Busan, Jeju and across Korea. Compare packages side by side, see exactly what each one includes, and reserve your shoot directly with the studio.',
						)}
					</p>
					<ol className={'story-points'}>
						{storyPoints.map((point, index) => (
							<li key={point}>
								<span className={'point-num'}>{String(index + 1).padStart(2, '0')}</span>
								<span className={'point-text'}>{t(point)}</span>
							</li>
						))}
					</ol>
				</div>
			</div>
		</motion.section>
	);
};

export default HomeStory;
