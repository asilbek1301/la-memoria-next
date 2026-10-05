import { ReservationStatus } from '../../enums/reservation.enum';
import { Direction } from '../../enums/common.enum';

export interface ReservationInput {
	packageId: string;
	reservationDate: Date;
	reservationNote?: string;
}

interface RISearch {
	reservationStatus?: ReservationStatus;
}

export interface ReservationsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: RISearch;
}
