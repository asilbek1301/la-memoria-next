import React, { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../../config';

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client';
const BUTTON_MAX_WIDTH = 400; // Google draws its button at most 400px wide

/** loads Google's sign-in script once per page load; resolves when window.google is ready **/
const loadGoogleScript = () =>
	new Promise<void>((resolve, reject) => {
		if ((window as any).google?.accounts?.id) return resolve();
		let script = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT}"]`);
		if (!script) {
			script = document.createElement('script');
			script.src = GOOGLE_SCRIPT;
			script.async = true;
			document.head.appendChild(script);
		}
		script.addEventListener('load', () => resolve());
		script.addEventListener('error', () => reject(new Error('Google sign-in could not load.')));
	});

/** Google's own "Continue with Google" button, then an "or" line. Hidden while no client ID is configured **/
const GoogleButton = ({ onCredential }: { onCredential: (idToken: string) => void }) => {
	const box = useRef<HTMLDivElement>(null);
	// the latest handler, so Google's one-time callback never calls an old one
	const handler = useRef(onCredential);
	handler.current = onCredential;

	useEffect(() => {
		if (!GOOGLE_CLIENT_ID) return;
		loadGoogleScript()
			.then(() => {
				const google = (window as any).google;
				if (!box.current) return;
				google.accounts.id.initialize({
					client_id: GOOGLE_CLIENT_ID,
					callback: (response: { credential: string }) => handler.current(response.credential),
				});
				box.current.replaceChildren(); // React may run this twice in development; draw one button
				google.accounts.id.renderButton(box.current, {
					theme: 'outline',
					size: 'large',
					shape: 'pill',
					text: 'continue_with',
					width: Math.min(box.current.offsetWidth, BUTTON_MAX_WIDTH),
				});
			})
			.catch(() => {
				// without Google the forms below still work, so the button simply stays empty
			});
	}, []);

	if (!GOOGLE_CLIENT_ID) return null;

	return (
		<div className={'google-signin'}>
			<div ref={box} className={'google-button'} />
			<p className={'or-line'}>
				<span>or</span>
			</p>
		</div>
	);
};

export default GoogleButton;
