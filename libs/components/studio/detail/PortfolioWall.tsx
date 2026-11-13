import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import { Package } from '../../../types/package/package';
import { REACT_APP_API_URL } from '../../../config';
import { packageDetailHref } from '../../homepage/TrendPackageCard';
import PhotoLightbox, { usePhotoLightbox } from '../../common/PhotoLightbox';

const MIN_PHOTOS = 3;
const WALL_SIZE = 9;

interface PortfolioWallProps {
	packages: Package[];
	studioName: string;
}

/** masonry of the photos from the studio's packages; each links to its package; hidden under three photos **/
const PortfolioWall = (props: PortfolioWallProps) => {
	const { packages, studioName } = props;
	const { t } = useTranslation('common');
	const photos = packages.flatMap((pkg) =>
		(pkg.packageImages ?? []).filter(Boolean).map((image, index) => ({
			url: `${REACT_APP_API_URL}/${image}`,
			alt: t('{{title}}, photo {{index}}', { title: t(pkg.packageTitle), index: index + 1 }),
			pkg,
		})),
	);
	const lightbox = usePhotoLightbox(photos.length);

	if (photos.length < MIN_PHOTOS) return null;

	return (
		<section className={'detail-section portfolio'} aria-labelledby="portfolio-title">
			<div className={'section-row'}>
				<h2 id="portfolio-title" className={'detail-title'}>
					{t('Portfolio')}
				</h2>
				<button type="button" className={'button-link'} onClick={(e) => lightbox.open(0, e)}>
					<GridViewRoundedIcon aria-hidden="true" />
					{t('View all {{count}} photos', { count: photos.length })}
				</button>
			</div>
			<ul className={'portfolio-wall'}>
				{photos.slice(0, WALL_SIZE).map((photo, index) => (
					<li key={photo.url + index}>
						<Link href={packageDetailHref(photo.pkg)} className={'wall-tile'} aria-label={t(photo.pkg.packageTitle)}>
							<img src={photo.url} alt={photo.alt} loading="lazy" />
							<span className={'wall-caption'} aria-hidden="true">
								{t(photo.pkg.packageTitle)}
							</span>
						</Link>
					</li>
				))}
			</ul>
			<PhotoLightbox
				urls={photos.map((photo) => photo.url)}
				alts={photos.map((photo) => photo.alt)}
				label={t('{{name}} portfolio', { name: studioName })}
				lightbox={lightbox}
			/>
		</section>
	);
};

export default PortfolioWall;
