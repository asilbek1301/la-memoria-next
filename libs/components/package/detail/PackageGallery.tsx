import React, { useRef, useState } from 'react';
import { Dialog } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { REACT_APP_API_URL } from '../../../config';

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
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const touchX = useRef<number | null>(null);
	// the button that opened the viewer gets focus back when it closes
	const opener = useRef<HTMLElement | null>(null);

	if (urls.length === 0) return <div className={'package-gallery single empty'} aria-hidden="true" />;

	const layout = urls.length === 1 ? 'single' : urls.length < 5 ? 'trio' : 'five';
	const tiles = urls.slice(0, layout === 'single' ? 1 : layout === 'trio' ? 3 : 5);
	const alt = (index: number) => (urls.length === 1 ? title : `${title}, photo ${index + 1} of ${urls.length}`);

	const show = (index: number) => setOpenIndex((index + urls.length) % urls.length);
	const open = (index: number, e: React.MouseEvent<HTMLElement>) => {
		opener.current = e.currentTarget;
		show(index);
	};
	const close = () => setOpenIndex(null);

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
						onClick={(e) => open(index, e)}
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
					<button type="button" className={'gallery-all'} onClick={(e) => open(0, e)}>
						<GridViewRoundedIcon aria-hidden="true" />
						View all {urls.length} photos
					</button>
				)}
			</div>

			<Dialog
				open={openIndex !== null}
				onClose={close}
				fullScreen
				classes={{ paper: 'lightbox' }}
				disableRestoreFocus
				TransitionProps={{ onExited: () => opener.current?.focus() }}
				aria-label={`${title} photos`}
				onKeyDown={(e) => {
					if (openIndex === null) return;
					if (e.key === 'ArrowRight') show(openIndex + 1);
					if (e.key === 'ArrowLeft') show(openIndex - 1);
				}}
			>
				{openIndex !== null && (
					<div
						className={'lightbox-stage'}
						onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
						onTouchEnd={(e) => {
							if (touchX.current === null) return;
							const delta = e.changedTouches[0].clientX - touchX.current;
							if (Math.abs(delta) > 50) show(openIndex + (delta < 0 ? 1 : -1));
							touchX.current = null;
						}}
					>
						<div className={'lightbox-top'}>
							<p className={'lightbox-count'} aria-live="polite">
								{openIndex + 1} / {urls.length}
							</p>
							<button type="button" className={'lightbox-btn'} aria-label="Close photos" onClick={close}>
								<CloseRoundedIcon />
							</button>
						</div>
						<img className={'lightbox-image'} src={urls[openIndex]} alt={alt(openIndex)} />
						{urls.length > 1 && (
							<>
								<button
									type="button"
									className={'lightbox-btn prev'}
									aria-label="Previous photo"
									onClick={() => show(openIndex - 1)}
								>
									<ChevronLeftRoundedIcon />
								</button>
								<button
									type="button"
									className={'lightbox-btn next'}
									aria-label="Next photo"
									onClick={() => show(openIndex + 1)}
								>
									<ChevronRightRoundedIcon />
								</button>
							</>
						)}
					</div>
				)}
			</Dialog>
		</>
	);
};

export default PackageGallery;
