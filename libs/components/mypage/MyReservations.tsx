import React, { useState } from 'react';
import { NextPage } from 'next';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import Moment from 'react-moment';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { userVar } from '../../../apollo/store';
import { GET_MY_RESERVATIONS, GET_STUDIO_RESERVATIONS } from '../../../apollo/user/query';
import { UPDATE_RESERVATION } from '../../../apollo/user/mutation';
import { Reservation } from '../../types/reservation/reservation';
import { ReservationsInquiry } from '../../types/reservation/reservation.input';
import { ReservationStatus } from '../../enums/reservation.enum';
import { MemberType } from '../../enums/member.enum';
import { T } from '../../types/common';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const statusTabs: { label: string; value?: ReservationStatus }[] = [
	{ label: 'All' },
	{ label: 'Pending', value: ReservationStatus.PENDING },
	{ label: 'Confirmed', value: ReservationStatus.CONFIRMED },
	{ label: 'Completed', value: ReservationStatus.COMPLETED },
	{ label: 'Cancelled', value: ReservationStatus.CANCELLED },
];

const MyReservations: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isStudio = user?.memberType === MemberType.STUDIO;
	const [searchFilter, setSearchFilter] = useState<ReservationsInquiry>(initialInput);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/

	const [updateReservation] = useMutation(UPDATE_RESERVATION);

	const { refetch: getReservationsRefetch } = useQuery(isStudio ? GET_STUDIO_RESERVATIONS : GET_MY_RESERVATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const result = isStudio ? data?.getStudioReservations : data?.getMyReservations;
			setReservations(result?.list ?? []);
			setTotal(result?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value?: ReservationStatus) => {
		setSearchFilter({ ...searchFilter, page: 1, search: value ? { reservationStatus: value } : {} });
	};

	const updateReservationHandler = async (id: string, status: ReservationStatus) => {
		try {
			if (await sweetConfirmAlert(`Are you sure to change this reservation to ${status}?`)) {
				await updateReservation({
					variables: {
						input: {
							_id: id,
							reservationStatus: status,
						},
					},
				});
				await getReservationsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const pushPackageDetail = async (id: string) => {
		await router.push({ pathname: '/package/detail', query: { id: id } });
	};

	const getActions = (reservation: Reservation): ReservationStatus[] => {
		const { reservationStatus } = reservation;
		if (isStudio) {
			if (reservationStatus === ReservationStatus.PENDING)
				return [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED];
			if (reservationStatus === ReservationStatus.CONFIRMED)
				return [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED];
			return [];
		}
		if (reservationStatus === ReservationStatus.PENDING || reservationStatus === ReservationStatus.CONFIRMED)
			return [ReservationStatus.CANCELLED];
		return [];
	};

	if (device === 'mobile') {
		return <div>LA MEMORIA RESERVATIONS MOBILE</div>;
	} else {
		return (
			<div id="my-reservation-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{isStudio ? 'Reservations' : 'My Reservations'}</Typography>
						<Typography className="sub-title">
							{isStudio ? 'Manage reservation requests from couples' : 'Track your photoshoot reservations'}
						</Typography>
					</Stack>
				</Stack>
				<Stack className="reservation-list-box">
					<Stack className="tab-name-box">
						{statusTabs.map((tab) => (
							<Typography
								key={tab.label}
								onClick={() => changeStatusHandler(tab.value)}
								className={searchFilter.search.reservationStatus === tab.value ? 'active-tab-name' : 'tab-name'}
							>
								{tab.label}
							</Typography>
						))}
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Package</Typography>
							<Typography className="title-text">{isStudio ? 'Couple' : 'Shoot Date'}</Typography>
							<Typography className="title-text">{isStudio ? 'Shoot Date' : 'Price'}</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">Action</Typography>
						</Stack>

						{reservations.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Reservation found!</p>
							</div>
						) : (
							reservations.map((reservation: Reservation) => {
								const pkg = reservation.packageData;
								const image = pkg?.packageImages?.[0]
									? `${REACT_APP_API_URL}/${pkg.packageImages[0]}`
									: '/img/banner/header1.svg';
								return (
									<Stack className="reservation-card-box" key={reservation._id}>
										<Stack className="package-box" onClick={() => pkg && pushPackageDetail(pkg._id)}>
											<img src={image} alt="" />
											<Stack>
												<Typography className="name">{pkg?.packageTitle ?? 'Package removed'}</Typography>
												<Typography className="address">
													{pkg?.packageLocation} · {pkg?.packageType}
												</Typography>
											</Stack>
										</Stack>
										{isStudio ? (
											<Stack className="cell">
												<Typography className="strong">{reservation.memberData?.memberNick}</Typography>
												<Typography className="muted">{reservation.memberData?.memberPhone}</Typography>
											</Stack>
										) : (
											<Stack className="cell">
												<Typography className="strong">
													<Moment format="DD MMMM, YYYY">{reservation.reservationDate}</Moment>
												</Typography>
											</Stack>
										)}
										<Stack className="cell">
											{isStudio ? (
												<Typography className="strong">
													<Moment format="DD MMMM, YYYY">{reservation.reservationDate}</Moment>
												</Typography>
											) : (
												<Typography className="strong">${formatterStr(reservation.reservationPrice)}</Typography>
											)}
											{reservation.reservationNote && (
												<Typography className="muted note" title={reservation.reservationNote}>
													{reservation.reservationNote}
												</Typography>
											)}
										</Stack>
										<Stack className="cell">
											<span className={`status-chip ${reservation.reservationStatus.toLowerCase()}`}>
												{reservation.reservationStatus}
											</span>
										</Stack>
										<Stack className="cell actions">
											{getActions(reservation).map((status) => (
												<Button
													key={status}
													size="small"
													className={`action-button ${status.toLowerCase()}`}
													onClick={() => updateReservationHandler(reservation._id, status)}
												>
													{status === ReservationStatus.CONFIRMED
														? 'Confirm'
														: status === ReservationStatus.COMPLETED
														? 'Complete'
														: 'Cancel'}
												</Button>
											))}
										</Stack>
									</Stack>
								);
							})
						)}

						{reservations.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>
										{total} reservation{total > 1 ? 's' : ''}
									</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyReservations.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyReservations;
