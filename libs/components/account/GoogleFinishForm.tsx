import React, { useRef, useState } from 'react';
import decodeJWT from 'jwt-decode';
import { googleLogIn } from '../../auth';
import AccountField from './AccountField';
import AccountTypeCards from './AccountTypeCards';
import { AccountType, NICK_MAX, NICK_MIN, firstError, nickRules, phoneRules } from './accountRules';

interface GoogleFinishFormProps {
	/** the Google ID token from "Continue with Google" */
	idToken: string;
	onSuccess: (type: AccountType) => void;
	onCancel: () => void;
}

/** a nickname suggestion from the Google name: letters and digits only, within the nickname length **/
const suggestNick = (idToken: string) => {
	try {
		const { name = '' } = decodeJWT<{ name?: string }>(idToken);
		const nick = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, NICK_MAX);
		return nick.length >= NICK_MIN ? nick : '';
	} catch {
		return '';
	}
};

/** first Google sign-in only: account type, nickname and phone finish the new account (no password needed) **/
const GoogleFinishForm = ({ idToken, onSuccess, onCancel }: GoogleFinishFormProps) => {
	const [type, setType] = useState<AccountType>('USER');
	const [nick, setNick] = useState<string>(() => suggestNick(idToken));
	const [phone, setPhone] = useState<string>('');
	const [attempted, setAttempted] = useState<boolean>(false);
	const [serverError, setServerError] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const nickRef = useRef<HTMLInputElement>(null);
	const phoneRef = useRef<HTMLInputElement>(null);

	const errors = {
		nick: firstError(nick, nickRules, 'Choose a nickname.'),
		phone: firstError(phone, phoneRules, 'Enter your phone number.'),
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (sending) return;
		setAttempted(true);
		setServerError('');
		if (errors.nick) return nickRef.current?.focus();
		if (errors.phone) return phoneRef.current?.focus();

		setSending(true);
		try {
			const result = await googleLogIn(idToken, { nick: nick.trim(), phone: phone.trim(), type });
			if (result !== 'done') throw new Error('Something went wrong. Please try again.');
			onSuccess(type); // the button stays disabled while the next page loads
		} catch (err: any) {
			setServerError(err.message);
			setSending(false);
		}
	};

	return (
		<form className={'account-form'} onSubmit={submit} noValidate aria-labelledby="account-title">
			<p className={'form-note'}>Your Google account is confirmed. Choose how you will use La Memoria.</p>
			<AccountTypeCards value={type} onChange={setType} />
			<AccountField
				ref={nickRef}
				id="google-nick"
				label="Nickname"
				autoComplete="username"
				value={nick}
				onChange={setNick}
				rules={nickRules}
				error={attempted ? errors.nick : ''}
			/>
			<AccountField
				ref={phoneRef}
				id="google-phone"
				label="Phone"
				type="tel"
				autoComplete="tel"
				value={phone}
				onChange={setPhone}
				rules={phoneRules}
				error={attempted ? errors.phone : ''}
			/>

			{serverError && (
				<p className={'form-error'} role="alert">
					{serverError}
				</p>
			)}
			<button type="submit" className={'button-primary submit-btn'} disabled={sending}>
				{sending ? 'Creating account…' : type === 'STUDIO' ? 'Create studio account' : 'Create couple account'}
			</button>

			<p className={'switch-line'}>
				<button type="button" className={'switch-btn'} onClick={onCancel}>
					Use another way to sign in
				</button>
			</p>
		</form>
	);
};

export default GoogleFinishForm;
