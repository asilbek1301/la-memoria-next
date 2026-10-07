import React, { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { Package } from '../../../types/package/package';
import { MemberType } from '../../../enums/member.enum';
import { PackageStatus } from '../../../enums/package.enum';
import { formatKRW, prettyEnum } from '../../../utils';

export const NOTE_MAX = 500;

interface BookingPanelProps {
	pkg: Package;
	user: any;
	/** sends the reservation; resolves true when the request was created */
	onRequest: (date: string, note: string) => Promise<boolean>;
}

/** price, date, optional note and "Request reservation"; used in the sticky side panel and the phone sheet **/
const BookingPanel = (props: BookingPanelProps) => {
	const { pkg, user, onRequest } = props;
	const router = useRouter();
	const fieldId = useId();
	const [date, setDate] = useState<string>('');
	const [note, setNote] = useState<string>('');
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

	const loggedIn = Boolean(user?._id);
	const isCouple = user?.memberType === MemberType.USER;
	const isActive = pkg?.packageStatus === PackageStatus.ACTIVE;
	const minDate = moment().add(1, 'day').format('YYYY-MM-DD');
	const loginHref = `/account/join?referrer=${encodeURIComponent(router.asPath)}`;

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!date || status === 'sending') return;
		setStatus('sending');
		const ok = await onRequest(date, note.trim());
		setStatus(ok ? 'sent' : 'idle');
		if (ok) {
			setDate('');
			setNote('');
		}
	};

	return (
		<div className={'booking-panel'}>
			<div className={'booking-price'}>
				<span className={'price large'}>{formatKRW(pkg?.packagePrice)}</span>
				<span className={'booking-tier'}>{prettyEnum(pkg?.packageType)} tier</span>
			</div>

			{status === 'sent' ? (
				<div className={'booking-sent'} role="status">
					<CheckCircleOutlineRoundedIcon aria-hidden="true" />
					<p className={'sent-title'}>Request sent</p>
					<p className={'sent-desc'}>The studio will confirm your date. You can follow it in My Page.</p>
					<Link href={{ pathname: '/mypage', query: { category: 'myReservations' } }} className={'button-link'}>
						View my reservations
					</Link>
					<button type="button" className={'button-link'} onClick={() => setStatus('idle')}>
						Request another date
					</button>
				</div>
			) : (
				<form className={'booking-form'} onSubmit={submit}>
					<label className={'field'} htmlFor={`${fieldId}-date`}>
						<span className={'field-label'}>Date</span>
						<input
							id={`${fieldId}-date`}
							type="date"
							required
							min={minDate}
							value={date}
							disabled={!isActive}
							onChange={(e) => setDate(e.target.value)}
						/>
					</label>
					<label className={'field'} htmlFor={`${fieldId}-note`}>
						<span className={'field-label'}>
							Note <span className={'field-optional'}>(optional)</span>
						</span>
						<textarea
							id={`${fieldId}-note`}
							rows={3}
							maxLength={NOTE_MAX}
							value={note}
							disabled={!isActive}
							placeholder="Anything the studio should know"
							onChange={(e) => setNote(e.target.value)}
						/>
						<span className={'field-count'} aria-hidden="true">
							{note.length} / {NOTE_MAX}
						</span>
					</label>

					{!loggedIn ? (
						<Link href={loginHref} className={'button-primary booking-btn'}>
							Log in to reserve
						</Link>
					) : (
						<button
							type="submit"
							className={'button-primary booking-btn'}
							disabled={!isCouple || !isActive || !date || status === 'sending'}
						>
							{status === 'sending' ? 'Sending…' : 'Request reservation'}
						</button>
					)}

					<p className={'booking-hint'}>
						{!isActive
							? 'This package is not taking reservations right now.'
							: loggedIn && !isCouple
							? 'Only couple accounts can request a reservation.'
							: 'The studio confirms your request. You will not be charged now.'}
					</p>
				</form>
			)}
		</div>
	);
};

export default BookingPanel;
