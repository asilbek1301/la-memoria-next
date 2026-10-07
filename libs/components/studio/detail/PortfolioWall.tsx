import React from 'react';
import Link from 'next/link';
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
	const photos = packages.flatMap((pkg) =>
		(pkg.packageImages ?? []).filter(Boolean).map((image, index) => ({
			url: `${REACT_APP_API_URL}/${image}`,
			alt: `${pkg.packageTitle}, photo ${index + 1}`,
			pkg,
		})),
	);
	const lightbox = usePhotoLightbox(photos.length);

	if (photos.length < MIN_PHOTOS) return null;

	return (
		<section className={'detail-section portfolio'} aria-labelledby="portfolio-title">
			<div className={'section-row'}>
				<h2 id="portfolio-title" className={'detail-title'}>
					Portfolio
				</h2>
				<button type="button" className={'button-link'} onClick={(e) => lightbox.open(0, e)}>
					<GridViewRoundedIcon aria-hidden="true" />
					View all {photos.length} photos
				</button>
			</div>
			<ul className={'portfolio-wall'}>
				{photos.slice(0, WALL_SIZE).map((photo, index) => (
					<li key={photo.url + index}>
						<Link href={packageDetailHref(photo.pkg)} className={'wall-tile'} aria-label={photo.pkg.packageTitle}>
							<img src={photo.url} alt={photo.alt} loading="lazy" />
							<span className={'wall-caption'} aria-hidden="true">
								{photo.pkg.packageTitle}
							</span>
						</Link>
					</li>
				))}
			</ul>
			<PhotoLightbox
				urls={photos.map((photo) => photo.url)}
				alts={photos.map((photo) => photo.alt)}
				label={`${studioName} portfolio`}
				lightbox={lightbox}
			/>
		</section>
	);
};

export default PortfolioWall;
