import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import LoginForm from '../../libs/components/account/LoginForm';
import SignupForm from '../../libs/components/account/SignupForm';
import GoogleButton from '../../libs/components/account/GoogleButton';
import GoogleFinishForm from '../../libs/components/account/GoogleFinishForm';
import { AccountType, safeReferrer } from '../../libs/components/account/accountRules';
import { userVar } from '../../apollo/store';
import { googleLogIn } from '../../libs/auth';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

type Mode = 'login' | 'signup';

/** Log in and sign up, one page. The URL picks the form (?mode=signup, ?type=studio) and where to return (?referrer=) **/
const Join: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const mode: Mode = router.query.mode === 'signup' ? 'signup' : 'login';
	const initialType: AccountType = router.query.type === 'studio' ? 'STUDIO' : 'USER';
	const referrer = safeReferrer(router.query.referrer);
	const leaving = useRef<boolean>(false);
	// a new Google user's token, kept while they finish their account
	const [googleToken, setGoogleToken] = useState<string>('');
	const [googleError, setGoogleError] = useState<string>('');

	// someone already logged in has nothing to do here. Saving a new login token updates the user straight away,
	// so wait one tick: a fresh login's goNext runs first and marks leaving, and only real visitors are sent home
	useEffect(() => {
		if (!user?._id) return;
		const timer = setTimeout(() => {
			if (!leaving.current) router.replace('/');
		}, 0);
		return () => clearTimeout(timer);
	}, [user?._id, router]);

	const switchMode = (next: Mode) =>
		router.replace({ pathname: '/account/join', query: { ...router.query, mode: next } }, undefined, {
			shallow: true,
			scroll: false,
		});

	// back to the page that sent them here; otherwise home, or My Page for a new studio
	const goNext = (type?: AccountType) => {
		leaving.current = true;
		router.push(referrer ?? (type === 'STUDIO' ? '/mypage' : '/'));
	};

	// "Continue with Google": a linked account logs straight in; a new one finishes its account first
	const googleHandler = async (idToken: string) => {
		setGoogleError('');
		try {
			const result = await googleLogIn(idToken);
			if (result === 'needs-details') setGoogleToken(idToken);
			else goNext();
		} catch (err: any) {
			setGoogleError(err.message);
		}
	};

	if (googleToken) {
		return (
			<div id="account-page" className={'account-page'}>
				<div className={'account-box'}>
					<h1 id="account-title" className={'account-title'}>
						Finish your account
					</h1>
					<GoogleFinishForm idToken={googleToken} onSuccess={goNext} onCancel={() => setGoogleToken('')} />
				</div>
			</div>
		);
	}

	return (
		<div id="account-page" className={'account-page'}>
			<div className={'account-box'}>
				<h1 id="account-title" className={'account-title'}>
					{mode === 'login' ? 'Welcome back' : 'Create your account'}
				</h1>

				<div className={'mode-toggle'} role="group" aria-label="Log in or sign up">
					{(['login', 'signup'] as Mode[]).map((value) => (
						<button
							key={value}
							type="button"
							className={mode === value ? 'active' : ''}
							aria-pressed={mode === value}
							onClick={() => switchMode(value)}
						>
							{value === 'login' ? 'Log in' : 'Sign up'}
						</button>
					))}
				</div>

				{/* <GoogleButton onCredential={googleHandler} />
				{googleError && (
					<p className={'form-error'} role="alert">
						{googleError}
					</p>
				)} */}

				{mode === 'login' ? (
					<LoginForm onSuccess={() => goNext()} onSwitch={() => switchMode('signup')} />
				) : (
					<SignupForm
						key={initialType}
						initialType={initialType}
						onSuccess={goNext}
						onSwitch={() => switchMode('login')}
					/>
				)}
			</div>
		</div>
	);
};

// no footer: the page is just the form
export default withLayoutFull(Join, { footer: false });
