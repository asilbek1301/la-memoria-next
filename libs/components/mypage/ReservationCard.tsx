import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useMutation } from '@apollo/client';
import { Reservation } from '../../types/reservation/reservation';
import { ReservationStatus } from '../../enums/reservation.enum';
import { UPDATE_RESERVATION } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../config';
import { formatKRW, prettyEnum } from '../../utils';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

/** what each side may do next; the backend allows the same (checkReservationUpdate) **/
export const reservationActions = (reservation: Reservation, isStudio: boolean) => {
	const status = reservation?.reservationStatus;
	if (isStudio) {
		if (status === ReservationStatus.PENDING)
			return [
				{ status: ReservationStatus.CONFIRMED, label: 'Confirm', confirm: 'Confirm this reservation?' },
				{ status: ReservationStatus.CANCELLED, label: 'Decline', confirm: 'Decline this request?' },
			];
		if (status === ReservationStatus.CONFIRMED)
			return [
				{ status: ReservationStatus.COMPLETED, label: 'Mark completed', confirm: 'Mark this shoot as completed?' },
				{ status: ReservationStatus.CANCELLED, label: 'Cancel', confirm: 'Cancel this reservation?' },
			];
		return [];
	}
	if (status === ReservationStatus.PENDING || status === ReservationStatus.CONFIRMED)
		return [{ status: ReservationStatus.CANCELLED, label: 'Cancel request', confirm: 'Cancel this reservation request?' }];
	return [];
};

export const statusLabel = (status: ReservationStatus, isStudio: boolean) =>
	status === ReservationStatus.PENDING && !isStudio ? 'Waiting for the studio' : prettyEnum(status);

/** UPDATE_RESERVATION with a confirm step; returns true when the status changed **/
export const useReservationUpdate = () => {
	const [updateReservation] = useMutation(UPDATE_RESERVATION);
	return async (id: string, status: ReservationStatus, question: string) => {
		try {
			if (!(await sweetConfirmAlert(question))) return false;
			await updateReservation({ variables: { input: { _id: id, reservationStatus: status } } });
			return true;
		} catch (err: any) {
			await sweetErrorHandling(err);
			return false;
		}
	};
};

interface ReservationCardProps {
	reservation: Reservation;
	isStudio: boolean;
	onUpdated: () => void;
}

const ReservationCard = (props: ReservationCardProps) => {
	const { reservation, isStudio, onUpdated } = props;
	const update = useReservationUpdate();
	const pkg = reservation?.packageData;
	const image = pkg?.packageImages?.[0] ? `${REACT_APP_API_URL}/${pkg.packageImages[0]}` : '';
	const href = { pathname: '/package/detail', query: { id: reservation?.packageId } };
	const couple = reservation?.memberData;
	const status = reservation?.reservationStatus;
	const actions = reservationActions(reservation, isStudio);

	return (
		<article className={`reservation-card status-${String(status).toLowerCase()}`}>
			<Link href={href} className={'res-thumb'} tabIndex={-1} aria-hidden="true">
				{image ? <img src={image} alt="" loading="lazy" /> : <span className={'img-placeholder'} />}
			</Link>
			<div className={'res-body'}>
				<div className={'res-top'}>
					<span className={'status-pill'}>{statusLabel(status, isStudio)}</span>
					<span className={'price'}>{formatKRW(reservation?.reservationPrice)}</span>
				</div>
				<h3 className={'res-title'}>
					<Link href={href}>{pkg?.packageTitle ?? 'Package'}</Link>
				</h3>
				{pkg && (
					<p className={'res-meta'}>
						{prettyEnum(pkg.packageLocation)} — {prettyEnum(pkg.packageStyle)} · {prettyEnum(pkg.packageType)} tier
					</p>
				)}
				<p className={'res-date'}>
					<time dateTime={String(reservation?.reservationDate)}>
						{moment(reservation?.reservationDate).format('dddd, D MMMM YYYY')}
					</time>
				</p>
				{isStudio && couple && (
					<p className={'res-couple'}>
						Requested by {couple.memberNick}
						{couple.memberPhone && (
							<>
								{' · '}
								<a href={`tel:${couple.memberPhone}`}>{couple.memberPhone}</a>
							</>
						)}
					</p>
				)}
				{reservation?.reservationNote && <p className={'res-note'}>“{reservation.reservationNote}”</p>}
				{actions.length > 0 && (
					<div className={'res-actions'}>
						{actions.map((action, index) => (
							<button
								type="button"
								key={action.status}
								className={index === 0 && action.status !== ReservationStatus.CANCELLED ? 'button-secondary' : 'button-link'}
								onClick={async () => {
									if (await update(reservation._id, action.status, action.confirm)) onUpdated();
								}}
							>
								{action.label}
							</button>
						))}
					</div>
				)}
			</div>
		</article>
	);
};

export default ReservationCard;
