import React, { useRef, useState } from 'react';
import { Dialog } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

/** state for the photo viewer: which photo is open, and the button to refocus when it closes **/
export const usePhotoLightbox = (count: number) => {
	const [index, setIndex] = useState<number | null>(null);
	const opener = useRef<HTMLElement | null>(null);
	const show = (next: number) => setIndex(((next % count) + count) % count);
	const open = (next: number, e: React.MouseEvent<HTMLElement>) => {
		opener.current = e.currentTarget;
		show(next);
	};
	const close = () => setIndex(null);
	return { index, show, open, close, opener };
};

interface PhotoLightboxProps {
	urls: string[];
	alts: string[];
	label: string;
	lightbox: ReturnType<typeof usePhotoLightbox>;
}

/** full-screen photo viewer: arrow keys, swipe, Esc; focus is trapped while open and returns to the opener **/
const PhotoLightbox = (props: PhotoLightboxProps) => {
	const { urls, alts, label, lightbox } = props;
	const { index, show, close, opener } = lightbox;
	const touchX = useRef<number | null>(null);

	return (
		<Dialog
			open={index !== null}
			onClose={close}
			fullScreen
			classes={{ paper: 'lightbox' }}
			disableRestoreFocus
			TransitionProps={{ onExited: () => opener.current?.focus() }}
			aria-label={label}
			onKeyDown={(e) => {
				if (index === null) return;
				if (e.key === 'ArrowRight') show(index + 1);
				if (e.key === 'ArrowLeft') show(index - 1);
			}}
		>
			{index !== null && (
				<div
					className={'lightbox-stage'}
					onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
					onTouchEnd={(e) => {
						if (touchX.current === null) return;
						const delta = e.changedTouches[0].clientX - touchX.current;
						if (Math.abs(delta) > 50) show(index + (delta < 0 ? 1 : -1));
						touchX.current = null;
					}}
				>
					<div className={'lightbox-top'}>
						<p className={'lightbox-count'} aria-live="polite">
							{index + 1} / {urls.length}
						</p>
						<button type="button" className={'lightbox-btn'} aria-label="Close photos" onClick={close}>
							<CloseRoundedIcon />
						</button>
					</div>
					<img className={'lightbox-image'} src={urls[index]} alt={alts[index]} />
					{urls.length > 1 && (
						<>
							<button
								type="button"
								className={'lightbox-btn prev'}
								aria-label="Previous photo"
								onClick={() => show(index - 1)}
							>
								<ChevronLeftRoundedIcon />
							</button>
							<button type="button" className={'lightbox-btn next'} aria-label="Next photo" onClick={() => show(index + 1)}>
								<ChevronRightRoundedIcon />
							</button>
						</>
					)}
				</div>
			)}
		</Dialog>
	);
};

export default PhotoLightbox;
