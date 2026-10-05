import { ReservationStatus } from '../../enums/reservation.enum';

export interface ReservationUpdate {
	_id: string;
	reservationStatus: ReservationStatus;
	reservationNote?: string;
}
