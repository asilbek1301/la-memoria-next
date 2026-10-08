import React, { useRef, useState } from 'react';
import { signUp } from '../../auth';
import AccountField from './AccountField';
import AccountTypeCards from './AccountTypeCards';
import { AccountType, firstError, nickRules, passwordRules, phoneRules } from './accountRules';

interface SignupFormProps {
	/** pre-selected card, e.g. from ?type=studio */
	initialType: AccountType;
	/** called once the new account is logged in, with its type (studios go to My Page) */
	onSuccess: (type: AccountType) => void;
	onSwitch: () => void;
}

/** account type, then nickname, phone and password; the rules tick as the user types **/
const SignupForm = ({ initialType, onSuccess, onSwitch }: SignupFormProps) => {
	const [type, setType] = useState<AccountType>(initialType);
	const [nick, setNick] = useState<string>('');
	const [phone, setPhone] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [confirm, setConfirm] = useState<string>('');
	const [attempted, setAttempted] = useState<boolean>(false);
	const [serverError, setServerError] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const refs = {
		nick: useRef<HTMLInputElement>(null),
		phone: useRef<HTMLInputElement>(null),
		password: useRef<HTMLInputElement>(null),
		confirm: useRef<HTMLInputElement>(null),
	};

	const errors = {
		nick: firstError(nick, nickRules, 'Choose a nickname.'),
		phone: firstError(phone, phoneRules, 'Enter your phone number.'),
		password: firstError(password, passwordRules, 'Choose a password.'),
		confirm: !confirm ? 'Repeat your password.' : confirm !== password ? 'The passwords do not match.' : '',
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (sending) return;
		setAttempted(true);
		setServerError('');
		const firstInvalid = (['nick', 'phone', 'password', 'confirm'] as const).find((field) => errors[field]);
		if (firstInvalid) return refs[firstInvalid].current?.focus();

		setSending(true);
		try {
			await signUp(nick.trim(), password, phone.trim(), type);
			onSuccess(type); // the button stays disabled while the next page loads
		} catch (err: any) {
			setServerError(err.message);
			setSending(false);
		}
	};

	return (
		<form className={'account-form'} onSubmit={submit} noValidate aria-labelledby="account-title">
			<AccountTypeCards value={type} onChange={setType} />

			<AccountField
				ref={refs.nick}
				id="signup-nick"
				label="Nickname"
				autoComplete="username"
				value={nick}
				onChange={setNick}
				rules={nickRules}
				error={attempted ? errors.nick : ''}
			/>
			<AccountField
				ref={refs.phone}
				id="signup-phone"
				label="Phone"
				type="tel"
				autoComplete="tel"
				value={phone}
				onChange={setPhone}
				rules={phoneRules}
				error={attempted ? errors.phone : ''}
			/>
			<AccountField
				ref={refs.password}
				id="signup-password"
				label="Password"
				type="password"
				autoComplete="new-password"
				value={password}
				onChange={setPassword}
				rules={passwordRules}
				error={attempted ? errors.password : ''}
			/>
			<AccountField
				ref={refs.confirm}
				id="signup-confirm"
				label="Confirm password"
				type="password"
				autoComplete="new-password"
				value={confirm}
				onChange={setConfirm}
				error={attempted ? errors.confirm : ''}
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
				Already have an account?{' '}
				<button type="button" className={'switch-btn'} onClick={onSwitch}>
					Log in
				</button>
			</p>
		</form>
	);
};

export default SignupForm;
