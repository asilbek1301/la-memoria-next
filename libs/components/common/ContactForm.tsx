import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { userVar } from '../../../apollo/store';
import { CREATE_INQUIRY } from '../../../apollo/user/mutation';

// the backend's limits (InquiryInput)
const NAME_MIN = 2;
const NAME_MAX = 50;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = 'name' | 'email' | 'message';

const validate = (values: Record<Field, string>) => {
	const errors: Partial<Record<Field, string>> = {};
	const name = values.name.trim();
	if (name.length < NAME_MIN) errors.name = 'Please enter your name.';
	if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter an email address we can reply to.';
	if (values.message.trim().length < MESSAGE_MIN) errors.message = `Please write at least ${MESSAGE_MIN} characters.`;
	return errors;
};

/** the contact form (Help page and homepage). Messages go to the admin inbox (1:1 Inquiry); we reply by email **/
const ContactForm = ({ idPrefix }: { idPrefix: string }) => {
	const user = useReactiveVar(userVar);
	const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', message: '' });
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
	const [serverError, setServerError] = useState<string>('');
	const [sentTo, setSentTo] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const [trap, setTrap] = useState<string>(''); // hidden field; people never fill it, simple bots do
	const fieldRefs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), message: useRef<HTMLTextAreaElement>(null) };
	const doneRef = useRef<HTMLDivElement>(null);

	/** APOLLO REQUESTS **/
	const [createInquiry] = useMutation(CREATE_INQUIRY);

	// a logged-in member's name is filled in (members have no email on file, so that stays empty)
	useEffect(() => {
		const name = user?.memberFullName || (user?.memberNick ? user.memberNick.charAt(0).toUpperCase() + user.memberNick.slice(1) : '');
		if (user?._id && name && !values.name) setValues((current) => ({ ...current, name }));
		// only when the member changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?._id]);

	useEffect(() => {
		if (sentTo) doneRef.current?.focus();
	}, [sentTo]);

	/** HANDLERS **/

	const change = (field: Field, value: string) => {
		setValues((current) => ({ ...current, [field]: value }));
		if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
		setServerError('');
	};

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		const found = validate(values);
		setErrors(found);
		const first = (['name', 'email', 'message'] as Field[]).find((field) => found[field]);
		if (first) {
			fieldRefs[first].current?.focus();
			return;
		}
		if (trap) {
			setSentTo(values.email.trim());
			return;
		}
		try {
			setSending(true);
			setServerError('');
			await createInquiry({
				variables: {
					input: { inquiryName: values.name.trim(), inquiryEmail: values.email.trim(), inquiryMessage: values.message.trim() },
				},
			});
			setSentTo(values.email.trim());
		} catch (err: any) {
			const message: string = err?.graphQLErrors?.[0]?.message ?? err?.message ?? '';
			setServerError(
				/several messages/i.test(message)
					? message
					: 'Your message could not be sent. Please try again, or call us.',
			);
		} finally {
			setSending(false);
		}
	};

	const reset = () => {
		setValues((current) => ({ name: current.name, email: current.email, message: '' }));
		setSentTo('');
		setErrors({});
	};

	if (sentTo) {
		return (
			<div className={'contact-form sent'} ref={doneRef} tabIndex={-1} role="status">
				<span className={'sent-icon'} aria-hidden="true">
					<CheckRoundedIcon />
				</span>
				<p className={'sent-title'}>Thank you, your message is with us.</p>
				<p className={'sent-text'}>We will reply to {sentTo}.</p>
				<button type="button" className={'button-link'} onClick={reset}>
					Send another message
				</button>
			</div>
		);
	}

	const describe = (field: Field, extra?: string) =>
		[errors[field] ? `${idPrefix}-${field}-error` : '', extra ?? ''].filter(Boolean).join(' ') || undefined;

	return (
		<form className={'contact-form'} onSubmit={submitHandler} noValidate aria-label="Send us a message">
			<div className={'form-row'}>
				<div className={'form-field'}>
					<label htmlFor={`${idPrefix}-name`} className={'field-label'}>
						Name
					</label>
					<input
						ref={fieldRefs.name}
						id={`${idPrefix}-name`}
						type="text"
						autoComplete="name"
						maxLength={NAME_MAX}
						value={values.name}
						aria-invalid={Boolean(errors.name)}
						aria-describedby={describe('name')}
						onChange={(e) => change('name', e.target.value)}
					/>
					{errors.name && (
						<p id={`${idPrefix}-name-error`} className={'field-error'}>
							{errors.name}
						</p>
					)}
				</div>
				<div className={'form-field'}>
					<label htmlFor={`${idPrefix}-email`} className={'field-label'}>
						Email
					</label>
					<input
						ref={fieldRefs.email}
						id={`${idPrefix}-email`}
						type="email"
						autoComplete="email"
						maxLength={100}
						value={values.email}
						aria-invalid={Boolean(errors.email)}
						aria-describedby={describe('email')}
						onChange={(e) => change('email', e.target.value)}
					/>
					{errors.email && (
						<p id={`${idPrefix}-email-error`} className={'field-error'}>
							{errors.email}
						</p>
					)}
				</div>
			</div>
			<div className={'form-field'}>
				<label htmlFor={`${idPrefix}-message`} className={'field-label'}>
					Message
				</label>
				<textarea
					ref={fieldRefs.message}
					id={`${idPrefix}-message`}
					rows={5}
					maxLength={MESSAGE_MAX}
					value={values.message}
					placeholder="Your question about a package, a studio or a reservation"
					aria-invalid={Boolean(errors.message)}
					aria-describedby={describe('message', `${idPrefix}-message-count`)}
					onChange={(e) => change('message', e.target.value)}
				/>
				<div className={'field-foot'}>
					{errors.message ? (
						<p id={`${idPrefix}-message-error`} className={'field-error'}>
							{errors.message}
						</p>
					) : (
						<span />
					)}
					<span id={`${idPrefix}-message-count`} className={'field-count'}>
						{values.message.length} / {MESSAGE_MAX}
					</span>
				</div>
			</div>
			{/* hidden from people; a filled value marks a bot */}
			<input
				className={'form-trap'}
				type="text"
				name="website"
				tabIndex={-1}
				autoComplete="off"
				aria-hidden="true"
				value={trap}
				onChange={(e) => setTrap(e.target.value)}
			/>
			<div className={'form-foot'}>
				<button type="submit" className={'button-primary'} disabled={sending}>
					{sending ? 'Sending…' : 'Send message'}
				</button>
			</div>
			{serverError && (
				<p className={'form-error'} role="alert">
					{serverError}
				</p>
			)}
		</form>
	);
};

export default ContactForm;
