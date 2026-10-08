import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Moment from 'react-moment';
import { Reservation } from '../../../types/reservation/reservation';
import { formatKRW } from '../../../utils';
import { statusBadge, statusLabel } from '../adminLabels';

const headCells = ['Reservation ID', 'Package', 'Couple', 'Shoot date', 'Price', 'Requested', 'Status'];

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
							<TableCell key={cell} align={cell === 'Reservation ID' ? 'left' : 'center'}>
								{cell}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{reservations.length === 0 && (
						<TableRow>
							<TableCell align="center" colSpan={headCells.length}>
								<span className={'no-data'}>No reservations here.</span>
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
							<TableCell align="center">{formatKRW(reservation.reservationPrice)}</TableCell>
							<TableCell align="center">
								<Moment format="YYYY.MM.DD">{reservation.createdAt}</Moment>
							</TableCell>
							<TableCell align="center">
								<span className={statusBadge(reservation.reservationStatus)}>{statusLabel(reservation.reservationStatus)}</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
