import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { GET_MY_RESERVATIONS, GET_STUDIO_RESERVATIONS } from '../../../apollo/user/query';
import { Reservation } from '../../types/reservation/reservation';
import { ReservationsInquiry } from '../../types/reservation/reservation.input';
import { ReservationStatus } from '../../enums/reservation.enum';
import { MemberType } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';
import { FilterTabs } from '../homepage/HomeSection';
import { ResultsPagination } from '../common/ListControls';
import ReservationCard from './ReservationCard';

type StatusTab = ReservationStatus | 'ALL';

const statusTabs: { value: StatusTab; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	{ value: ReservationStatus.PENDING, label: 'Pending' },
	{ value: ReservationStatus.CONFIRMED, label: 'Confirmed' },
	{ value: ReservationStatus.COMPLETED, label: 'Completed' },
	{ value: ReservationStatus.CANCELLED, label: 'Cancelled' },
];

const initialInput: ReservationsInquiry = {
	page: 1,
	limit: 5,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

/** couples: their reservation requests; studios: requests from couples (same queries and rules as before) **/
const MyReservations = () => {
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const isStudio = user?.memberType === MemberType.STUDIO;
	const [searchFilter, setSearchFilter] = useState<ReservationsInquiry>(initialInput);

	/** APOLLO REQUESTS **/

	const { data, loading, refetch } = useQuery(isStudio ? GET_STUDIO_RESERVATIONS : GET_MY_RESERVATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});
	const result = isStudio ? data?.getStudioReservations : data?.getMyReservations;
	const reservations: Reservation[] = result?.list ?? [];
	const total: number = result?.metaCounter?.[0]?.total ?? 0;
	const active: StatusTab = searchFilter.search.reservationStatus ?? 'ALL';

	return (
		<section className={'my-section'} aria-labelledby="reservations-title">
			<div className={'section-row'}>
				<div>
					<h2 id="reservations-title" className={'detail-title'}>
						{isStudio ? t('Reservation requests') : t('Reservations')}
					</h2>
					<p className={'section-note'}>
						{isStudio
							? t('Confirm, complete or decline requests from couples.')
							: t('Your requests and confirmed shoots.')}
					</p>
				</div>
				<FilterTabs
					label={t('Filter by status')}
					options={statusTabs.map((tab) => ({ ...tab, label: t(tab.label) }))}
					value={active}
					onChange={(value) =>
						setSearchFilter({ ...searchFilter, page: 1, search: value === 'ALL' ? {} : { reservationStatus: value } })
					}
				/>
			</div>

			{loading && reservations.length === 0 ? (
				<div className={'reservation-list'} aria-busy="true">
					{[0, 1].map((i) => (
						<Skeleton key={i} variant="rectangular" className={'skeleton res-skeleton'} />
					))}
				</div>
			) : reservations.length === 0 ? (
				<div className={'empty-box my-empty'}>
					<p>
						{active !== 'ALL'
							? t('No {{status}} reservations.', {
									status: t(statusTabs.find((tab) => tab.value === active)?.label ?? '').toLowerCase(),
							  })
							: isStudio
							? t('No reservation requests yet.')
							: t('No reservations yet.')}
					</p>
					{!isStudio && active === 'ALL' && (
						<Link href={'/package'} className={'button-primary'}>
							{t('Browse packages')}
						</Link>
					)}
				</div>
			) : (
				<div className={'reservation-list'}>
					{reservations.map((reservation) => (
						<ReservationCard
							key={reservation._id}
							reservation={reservation}
							isStudio={isStudio}
							onUpdated={() => refetch({ input: searchFilter })}
						/>
					))}
				</div>
			)}

			{total > searchFilter.limit && (
				<ResultsPagination
					page={searchFilter.page}
					limit={searchFilter.limit}
					total={total}
					onPage={(page) => setSearchFilter({ ...searchFilter, page })}
					noun="reservations"
				/>
			)}
		</section>
	);
};

export default MyReservations;
