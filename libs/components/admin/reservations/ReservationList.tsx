import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Moment from 'react-moment';
import { Reservation } from '../../../types/reservation/reservation';
import { ReservationStatus } from '../../../enums/reservation.enum';
import { formatterStr } from '../../../utils';

const headCells = ['RESERVATION ID', 'PACKAGE', 'COUPLE', 'SHOOT DATE', 'PRICE', 'CREATED', 'STATUS'];

const statusClass: Record<ReservationStatus, string> = {
	[ReservationStatus.PENDING]: 'badge warning',
	[ReservationStatus.CONFIRMED]: 'badge success',
	[ReservationStatus.COMPLETED]: 'badge success',
	[ReservationStatus.CANCELLED]: 'badge error',
};

interface ReservationPanelListType {
	reservations: Reservation[];
}

export const ReservationPanelList = (props: ReservationPanelListType) => {
	const { reservations } = props;

	return (
		<TableContainer>
			<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
				<TableHead>
					<TableRow>
						{headCells.map((cell) => (
							<TableCell key={cell} align={cell === 'RESERVATION ID' ? 'left' : 'center'}>
								{cell}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{reservations.length === 0 && (
						<TableRow>
							<TableCell align="center" colSpan={headCells.length}>
								<span className={'no-data'}>data not found!</span>
							</TableCell>
						</TableRow>
					)}
					{reservations.map((reservation: Reservation) => (
						<TableRow hover key={reservation._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
							<TableCell align="left">{reservation._id}</TableCell>
							<TableCell align="center">
								{reservation.packageData ? (
									<Link href={`/package/detail?id=${reservation.packageData._id}`}>
										{reservation.packageData.packageTitle}
									</Link>
								) : (
									'-'
								)}
							</TableCell>
							<TableCell align="center">{reservation.memberData?.memberNick ?? '-'}</TableCell>
							<TableCell align="center">
								<Moment format="YYYY.MM.DD">{reservation.reservationDate}</Moment>
							</TableCell>
							<TableCell align="center">${formatterStr(reservation.reservationPrice)}</TableCell>
							<TableCell align="center">
								<Moment format="YYYY.MM.DD">{reservation.createdAt}</Moment>
							</TableCell>
							<TableCell align="center">
								<span className={statusClass[reservation.reservationStatus]}>{reservation.reservationStatus}</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
