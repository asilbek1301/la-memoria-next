import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { logIn } from '../../auth';
import AccountField from './AccountField';
import { firstError, nickRules, passwordRules } from './accountRules';

interface LoginFormProps {
	/** called once the token is saved; the page decides where to go */
	onSuccess: () => void;
	onSwitch: () => void;
}

/** nickname + password; errors appear after the first submit and update as the user types **/
const LoginForm = ({ onSuccess, onSwitch }: LoginFormProps) => {
	const { t } = useTranslation('common');
	const [nick, setNick] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [attempted, setAttempted] = useState<boolean>(false);
	const [serverError, setServerError] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const nickRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	const errors = {
		nick: firstError(nick, nickRules, 'Enter your nickname.'),
		password: firstError(password, passwordRules, 'Enter your password.'),
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (sending) return;
		setAttempted(true);
		setServerError('');
		if (errors.nick) return nickRef.current?.focus();
		if (errors.password) return passwordRef.current?.focus();

		setSending(true);
		try {
			await logIn(nick.trim(), password);
			onSuccess(); // the button stays disabled while the next page loads
		} catch (err: any) {
			setServerError(err.message);
			setSending(false);
		}
	};

	return (
		<form className={'account-form'} onSubmit={submit} noValidate aria-labelledby="account-title">
			<AccountField
				ref={nickRef}
				id="login-nick"
				label="Nickname"
				autoComplete="username"
				value={nick}
				onChange={setNick}
				error={attempted ? errors.nick : ''}
			/>
			<AccountField
				ref={passwordRef}
				id="login-password"
				label="Password"
				type="password"
				autoComplete="current-password"
				value={password}
				onChange={setPassword}
				error={attempted ? errors.password : ''}
			/>

			{serverError && (
				<p className={'form-error'} role="alert">
					{t(serverError)}
				</p>
			)}
			<button type="submit" className={'button-primary submit-btn'} disabled={sending}>
				{sending ? t('Logging in…') : t('Log in')}
			</button>

			<p className={'switch-line'}>
				{t('New to La Memoria?')}{' '}
				<button type="button" className={'switch-btn'} onClick={onSwitch}>
					{t('Sign up')}
				</button>
			</p>
		</form>
	);
};

export default LoginForm;
