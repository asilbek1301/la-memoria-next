import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { DocumentNode, useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import {
	GET_ALL_BOARD_ARTICLES_BY_ADMIN,
	GET_ALL_INQUIRIES_BY_ADMIN,
	GET_ALL_MEMBERS_BY_ADMIN,
	GET_ALL_PACKAGES_BY_ADMIN,
	GET_ALL_RESERVATIONS_BY_ADMIN,
} from '../../../apollo/admin/query';
import { Reservation } from '../../types/reservation/reservation';
import { Inquiry } from '../../types/inquiry/inquiry';
import { formatKRW } from '../../utils';
import { statusBadge, statusLabel } from './adminLabels';

const RECENT = 5;

/** the total of an admin list query, asked for with limit 1 (only metaCounter is used) **/
const useTotal = (query: DocumentNode, field: string, search: Record<string, unknown> = {}) => {
	const { data, loading } = useQuery(query, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1, search } },
	});
	return { total: (data?.[field]?.metaCounter?.[0]?.total ?? 0) as number, loading: loading && !data };
};

const Tile = (props: { label: string; total: number; loading: boolean; href: string; note?: string; highlight?: boolean }) => {
	const { label, total, loading, href, note, highlight } = props;
	return (
		<Link href={href} className={`stat-tile ${highlight && total > 0 ? 'highlight' : ''}`}>
			<span className={'stat-label'}>{label}</span>
			{loading ? <Skeleton width={60} height={44} /> : <span className={'stat-value'}>{total.toLocaleString('en-US')}</span>}
			{note && <span className={'stat-note'}>{note}</span>}
		</Link>
	);
};

/** /_admin: counts and the latest activity, each linking to its page; built only from the existing admin queries **/
const AdminDashboard = () => {
	const members = useTotal(GET_ALL_MEMBERS_BY_ADMIN, 'getAllMembersByAdmin');
	const studios = useTotal(GET_ALL_MEMBERS_BY_ADMIN, 'getAllMembersByAdmin', { memberType: 'STUDIO' });
	const couples = useTotal(GET_ALL_MEMBERS_BY_ADMIN, 'getAllMembersByAdmin', { memberType: 'USER' });
	const packages = useTotal(GET_ALL_PACKAGES_BY_ADMIN, 'getAllPackagesByAdmin', { packageStatus: 'ACTIVE' });
	const pending = useTotal(GET_ALL_RESERVATIONS_BY_ADMIN, 'getAllReservationsByAdmin', { reservationStatus: 'PENDING' });
	const confirmed = useTotal(GET_ALL_RESERVATIONS_BY_ADMIN, 'getAllReservationsByAdmin', { reservationStatus: 'CONFIRMED' });
	const newMessages = useTotal(GET_ALL_INQUIRIES_BY_ADMIN, 'getAllInquiriesByAdmin', { inquiryStatus: 'NEW' });
	const posts = useTotal(GET_ALL_BOARD_ARTICLES_BY_ADMIN, 'getAllBoardArticlesByAdmin', { articleStatus: 'ACTIVE' });

	const latestReservations = useQuery(GET_ALL_RESERVATIONS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: RECENT, sort: 'createdAt', direction: 'DESC', search: {} } },
	});
	const latestMessages = useQuery(GET_ALL_INQUIRIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: RECENT, search: { inquiryStatus: 'NEW' } } },
	});
	const reservations: Reservation[] = latestReservations.data?.getAllReservationsByAdmin?.list ?? [];
	const messages: Inquiry[] = latestMessages.data?.getAllInquiriesByAdmin?.list ?? [];

	const memberNote =
		studios.loading || couples.loading
			? undefined
			: `${studios.total.toLocaleString('en-US')} studios · ${couples.total.toLocaleString('en-US')} couples`;

	return (
		<div className={'content dashboard'}>
			<div className={'dashboard-head'}>
				<h2 className={'tit'}>Dashboard</h2>
				<p className={'dashboard-intro'}>La Memoria at a glance. Each number opens its list.</p>
			</div>

			<div className={'stat-grid'}>
				<Tile label={'Members'} {...members} href={'/_admin/users'} note={memberNote} />
				<Tile label={'Active packages'} {...packages} href={'/_admin/packages'} />
				<Tile
					label={'Pending reservations'}
					{...pending}
					href={'/_admin/reservations'}
					note={confirmed.loading ? undefined : `${confirmed.total.toLocaleString('en-US')} confirmed`}
				/>
				<Tile label={'New messages'} {...newMessages} href={'/_admin/cs/inquiry'} highlight />
				<Tile label={'Community posts'} {...posts} href={'/_admin/community'} />
			</div>

			<div className={'panel-grid'}>
				<section className={'dash-panel'} aria-labelledby="latest-reservations">
					<div className={'panel-head'}>
						<h3 id="latest-reservations">Latest reservations</h3>
						<Link href={'/_admin/reservations'} className={'panel-link'}>
							All reservations
						</Link>
					</div>
					{latestReservations.loading && !latestReservations.data ? (
						<Skeleton variant="rectangular" height={180} />
					) : reservations.length === 0 ? (
						<p className={'panel-empty'}>No reservations yet.</p>
					) : (
						<ul className={'dash-list'}>
							{reservations.map((reservation) => (
								<li key={reservation._id}>
									<div className={'item-main'}>
										<span className={'item-title'}>{reservation.packageData?.packageTitle ?? 'Package removed'}</span>
										<span className={'item-meta'}>
											{reservation.memberData?.memberNick ?? '-'} · shoot{' '}
											<Moment format="YYYY-MM-DD">{reservation.reservationDate}</Moment> · {formatKRW(reservation.reservationPrice)}
										</span>
									</div>
									<span className={statusBadge(reservation.reservationStatus)}>{statusLabel(reservation.reservationStatus)}</span>
								</li>
							))}
						</ul>
					)}
				</section>

				<section className={'dash-panel'} aria-labelledby="new-messages">
					<div className={'panel-head'}>
						<h3 id="new-messages">New messages</h3>
						<Link href={'/_admin/cs/inquiry'} className={'panel-link'}>
							Open the inbox
						</Link>
					</div>
					{latestMessages.loading && !latestMessages.data ? (
						<Skeleton variant="rectangular" height={180} />
					) : messages.length === 0 ? (
						<p className={'panel-empty'}>No new messages. Everything has been answered.</p>
					) : (
						<ul className={'dash-list'}>
							{messages.map((message) => (
								<li key={message._id}>
									<div className={'item-main'}>
										<span className={'item-title'}>{message.inquiryName}</span>
										<span className={'item-meta item-preview'}>{message.inquiryMessage}</span>
									</div>
									<span className={'item-date'}>
										<Moment fromNow>{message.createdAt}</Moment>
									</span>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>
		</div>
	);
};

export default AdminDashboard;
