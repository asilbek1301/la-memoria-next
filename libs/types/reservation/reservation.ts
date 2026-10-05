import { ReservationStatus } from '../../enums/reservation.enum';
import { Package, TotalCounter } from '../package/package';
import { Member } from '../member/member';

export interface Reservation {
	_id: string;
	reservationStatus: ReservationStatus;
	reservationDate: Date;
	reservationPrice: number;
	reservationNote?: string;
	studioId: string;
	memberId: string;
	packageId: string;
	confirmedAt?: Date;
	cancelledAt?: Date;
	completedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	packageData?: Package;
	memberData?: Member;
}

export interface Reservations {
	list: Reservation[];
	metaCounter: TotalCounter[];
}
