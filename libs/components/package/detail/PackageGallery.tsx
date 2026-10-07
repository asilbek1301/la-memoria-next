import React from 'react';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { REACT_APP_API_URL } from '../../../config';
import PhotoLightbox, { usePhotoLightbox } from '../../common/PhotoLightbox';

interface PackageGalleryProps {
	images: string[];
	title: string;
	/** shown on the single-photo layout, e.g. the package address */
	caption?: string;
}

/** editorial mosaic: 1 photo full width, 2-4 as one large plus two, 5+ as one large plus four; all open the lightbox **/
const PackageGallery = (props: PackageGalleryProps) => {
	const { images, title, caption } = props;
	const urls = (images ?? []).filter(Boolean).map((image) => `${REACT_APP_API_URL}/${image}`);
	const lightbox = usePhotoLightbox(urls.length);

	if (urls.length === 0) return <div className={'package-gallery single empty'} aria-hidden="true" />;

	const layout = urls.length === 1 ? 'single' : urls.length < 5 ? 'trio' : 'five';
	const tiles = urls.slice(0, layout === 'single' ? 1 : layout === 'trio' ? 3 : 5);
	const alt = (index: number) => (urls.length === 1 ? title : `${title}, photo ${index + 1} of ${urls.length}`);

	return (
		<>
			<div className={`package-gallery ${layout}`}>
				{/* one photo: shown whole, framed like a print, over a blurred copy of itself */}
				{layout === 'single' && (
					<span className={'single-backdrop'} aria-hidden="true" style={{ backgroundImage: `url("${urls[0]}")` }} />
				)}
				{tiles.map((url, index) => (
					<button
						type="button"
						key={url + index}
						className={`gallery-tile ${index === 0 ? 'lead' : ''}`}
						aria-label={`Open photo ${index + 1} of ${urls.length}`}
						onClick={(e) => lightbox.open(index, e)}
					>
						<img
							src={url}
							alt={alt(index)}
							loading={index === 0 ? 'eager' : 'lazy'}
							{...(index === 0 ? ({ fetchpriority: 'high' } as any) : {})}
						/>
					</button>
				))}
				{layout === 'single' && caption && (
					<p className={'single-caption'}>
						<PlaceOutlinedIcon aria-hidden="true" />
						<span>{caption}</span>
					</p>
				)}
				{urls.length > 1 && (
					<button type="button" className={'gallery-all'} onClick={(e) => lightbox.open(0, e)}>
						<GridViewRoundedIcon aria-hidden="true" />
						View all {urls.length} photos
					</button>
				)}
			</div>

			<PhotoLightbox
				urls={urls}
				alts={urls.map((_, index) => alt(index))}
				label={`${title} photos`}
				lightbox={lightbox}
			/>
		</>
	);
};

export default PackageGallery;
