import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { useQuery } from '@apollo/client';
import { ReservationPanelList } from '../../../libs/components/admin/reservations/ReservationList';
import { ReservationsInquiry } from '../../../libs/types/reservation/reservation.input';
import { Reservation } from '../../../libs/types/reservation/reservation';
import { ReservationStatus } from '../../../libs/enums/reservation.enum';
import { GET_ALL_RESERVATIONS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminReservations: NextPage = ({ initialInquiry, ...props }: any) => {
	const [reservationsInquiry, setReservationsInquiry] = useState<ReservationsInquiry>(initialInquiry);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [reservationsTotal, setReservationsTotal] = useState<number>(0);
	const [value, setValue] = useState<string>(reservationsInquiry?.search?.reservationStatus ?? 'ALL');

	/** APOLLO REQUESTS **/

	useQuery(GET_ALL_RESERVATIONS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: reservationsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setReservations(data?.getAllReservationsByAdmin?.list ?? []);
			setReservationsTotal(data?.getAllReservationsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/

	const changePageHandler = (event: unknown, newPage: number) => {
		setReservationsInquiry({ ...reservationsInquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		setReservationsInquiry({ ...reservationsInquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	const tabChangeHandler = (newValue: string) => {
		setValue(newValue);
		setReservationsInquiry({
			...reservationsInquiry,
			page: 1,
			search: newValue === 'ALL' ? {} : { reservationStatus: newValue as ReservationStatus },
		});
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Reservations
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{['ALL', ...Object.values(ReservationStatus)].map((status: string) => (
									<ListItem
										key={status}
										onClick={() => tabChangeHandler(status)}
										value={status}
										className={value === status ? 'li on' : 'li'}
									>
										{status.charAt(0) + status.slice(1).toLowerCase()}
									</ListItem>
								))}
							</List>
							<Divider />
						</Box>
						<ReservationPanelList reservations={reservations} />

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={reservationsTotal}
							rowsPerPage={reservationsInquiry?.limit}
							page={reservationsInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminReservations.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminReservations);
