import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import { GET_MY_RESERVATIONS, GET_STUDIO_RESERVATIONS } from '../../../apollo/user/query';
import { Reservation } from '../../types/reservation/reservation';
import { ReservationStatus } from '../../enums/reservation.enum';
import { Direction } from '../../enums/common.enum';
import { REACT_APP_API_URL } from '../../config';
import { formatKRW, prettyEnum } from '../../utils';
import { reservationActions, statusLabel, useReservationUpdate } from './ReservationCard';

const upcomingInput = (status: ReservationStatus, limit: number) => ({
	page: 1,
	limit,
	sort: 'reservationDate',
	direction: Direction.ASC,
	search: { reservationStatus: status },
});

const isUpcoming = (r: Reservation) => moment(r.reservationDate).isSameOrAfter(moment().startOf('day'));

/** couples: the nearest pending or confirmed shoot, with its progress; studios: the next request waiting **/
const NextShoot = ({ isStudio, onChanged }: { isStudio: boolean; onChanged: () => void }) => {
	const update = useReservationUpdate();

	/** APOLLO REQUESTS **/

	const confirmed = useQuery(GET_MY_RESERVATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: upcomingInput(ReservationStatus.CONFIRMED, 5) },
		skip: isStudio,
	});
	const pending = useQuery(isStudio ? GET_STUDIO_RESERVATIONS : GET_MY_RESERVATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: upcomingInput(ReservationStatus.PENDING, 5) },
	});
	const pendingResult = isStudio ? pending.data?.getStudioReservations : pending.data?.getMyReservations;
	const pendingList: Reservation[] = pendingResult?.list ?? [];

	const refresh = async () => {
		await Promise.all([pending.refetch(), isStudio ? null : confirmed.refetch()]);
		onChanged();
	};

	const next: Reservation | undefined = [...(confirmed.data?.getMyReservations?.list ?? []), ...pendingList]
		.filter(isUpcoming)
		.sort((a, b) => moment(a.reservationDate).valueOf() - moment(b.reservationDate).valueOf())[0];

	if (!next) return null;

	const pkg = next.packageData;
	const image = pkg?.packageImages?.[0] ? `${REACT_APP_API_URL}/${pkg.packageImages[0]}` : '';
	const href = { pathname: '/package/detail', query: { id: next.packageId } };
	const waiting = isStudio ? pendingResult?.metaCounter?.[0]?.total ?? 0 : 0;
	const confirmedStep = next.reservationStatus === ReservationStatus.CONFIRMED;
	const steps = [
		{ label: 'Requested', date: next.createdAt, done: true },
		{ label: 'Confirmed', date: next.confirmedAt, done: confirmedStep },
		{ label: 'Shoot day', date: next.reservationDate, done: false },
		{ label: 'Completed', date: next.completedAt, done: false },
	];
	const current = confirmedStep ? 2 : 1;

	const date = moment(next.reservationDate);

	return (
		<section className={'next-shoot'} aria-labelledby="next-shoot-title">
			{/* an invitation card: the date set large, framed by a thin double line */}
			<div className={'invite'}>
				<p className={'shoot-label'}>
					{isStudio ? `${waiting} ${waiting === 1 ? 'request' : 'requests'} waiting` : 'Your next shoot'}
				</p>
				<p className={'invite-date'}>
					<span className={'date-month'}>{date.format('MMMM YYYY')}</span>
					<span className={'date-day'}>{date.format('D')}</span>
					<span className={'date-weekday'}>{date.format('dddd')}</span>
				</p>
				<span className={'invite-rule'} aria-hidden="true" />
				<h2 id="next-shoot-title" className={'shoot-title'}>
					<Link href={href}>{pkg?.packageTitle ?? 'Package'}</Link>
				</h2>
				<p className={'shoot-meta'}>
					{pkg && `${prettyEnum(pkg.packageLocation)} — ${prettyEnum(pkg.packageStyle)} · `}
					{formatKRW(next.reservationPrice)}
				</p>
				{isStudio && next.memberData && <p className={'shoot-meta'}>Requested by {next.memberData.memberNick}</p>}
				<span className={'status-pill'}>{statusLabel(next.reservationStatus, isStudio)}</span>

				{!isStudio && (
					<ol className={'shoot-track'} aria-label="Progress">
						{steps.map((step, index) => (
							<li
								key={step.label}
								className={`${step.done ? 'done' : ''} ${index === current ? 'current' : ''}`}
								aria-current={index === current ? 'step' : undefined}
							>
								<span className={'track-dot'} aria-hidden="true" />
								<span className={'track-label'}>{step.label}</span>
								{step.date && (step.done || index === 2) && (
									<span className={'track-date'}>{moment(step.date).format('D MMM')}</span>
								)}
							</li>
						))}
					</ol>
				)}

				<div className={'shoot-actions'}>
					{isStudio ? (
						reservationActions(next, true).map((action, index) => (
							<button
								type="button"
								key={action.status}
								className={index === 0 ? 'button-primary' : 'button-link'}
								onClick={async () => {
									if (await update(next._id, action.status, action.confirm)) await refresh();
								}}
							>
								{action.label}
							</button>
						))
					) : (
						<>
							<Link href={href} className={'button-primary'}>
								View package
							</Link>
							{reservationActions(next, false).map((action) => (
								<button
									type="button"
									key={action.status}
									className={'button-link'}
									onClick={async () => {
										if (await update(next._id, action.status, action.confirm)) await refresh();
									}}
								>
									{action.label}
								</button>
							))}
						</>
					)}
				</div>
			</div>

			{/* the package photo in an arch window */}
			<Link href={href} className={'invite-photo'} tabIndex={-1} aria-hidden="true">
				{image ? <img src={image} alt="" /> : <span className={'img-placeholder'} />}
			</Link>
		</section>
	);
};

export default NextShoot;
