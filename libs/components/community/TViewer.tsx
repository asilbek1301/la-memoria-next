import React, { useEffect, useRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Viewer } from '@toast-ui/react-editor';

/** a photo that can't load (deleted file, bad address) is hidden instead of showing a broken-image icon **/
const hideBroken = (img: HTMLImageElement) => img.classList.add('broken');

/**
 * Shows a post's HTML (written with the Toast UI editor). The viewer cleans it with DOMPurify before it reaches the page:
 * no scripts, styles, forms, iframes or on… attributes. Don't add custom renderers for iframe or embed: Toast UI
 * would then let those tags through the cleaner.
 * The viewer reads its content once, so give it a `key` that changes with the post.
 **/
const TViewer = ({ content }: { content: string }) => {
	const box = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = box.current;
		if (!el) return;
		// a load error doesn't bubble, but a listener in the capture phase still hears it from the photos inside
		const onError = (e: Event) => {
			if (e.target instanceof HTMLImageElement) hideBroken(e.target);
		};
		el.addEventListener('error', onError, true);
		el.querySelectorAll('img').forEach((img) => img.complete && img.naturalWidth === 0 && hideBroken(img));
		return () => el.removeEventListener('error', onError, true);
	}, []);

	return (
		<div ref={box}>
			<Viewer initialValue={content} />
		</div>
	);
};

export default TViewer;
