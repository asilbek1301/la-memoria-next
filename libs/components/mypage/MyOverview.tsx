import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
	GET_BOARD_ARTICLES,
	GET_MY_RESERVATIONS,
	GET_STUDIO_RESERVATIONS,
	GET_VISITED,
} from '../../../apollo/user/query';
import { Reservation } from '../../types/reservation/reservation';
import { Package } from '../../types/package/package';
import { BoardArticle } from '../../types/board-article/board-article';
import { Direction } from '../../enums/common.enum';
import PopularPackageCard from '../homepage/PopularPackageCard';
import CommunityCard from '../homepage/CommunityCard';
import ReservationCard from './ReservationCard';

const SeeAll = ({ category, label }: { category: string; label: string }) => {
	const { t } = useTranslation('common');

	return (
		<Link href={{ pathname: '/mypage', query: { category } }} className={'button-link'} aria-label={t(label)}>
			{t('See all')}
			<ArrowForwardRoundedIcon />
		</Link>
	);
};

/** short previews of each part of My Page; empty parts are left out **/
const MyOverview = (props: { user: any; isStudio: boolean; isAdmin?: boolean; onChanged: () => void }) => {
	const { user, isStudio, isAdmin = false, onChanged } = props;
	const { t } = useTranslation('common');
	/** APOLLO REQUESTS **/

	const reservations = useQuery(isStudio ? GET_STUDIO_RESERVATIONS : GET_MY_RESERVATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 2, sort: 'createdAt', direction: Direction.DESC, search: {} } },
		// the admin has no reservations of its own; the backend refuses both queries for ADMIN
		skip: isAdmin,
	});
	const visited = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 4 } },
		skip: isStudio || isAdmin,
	});
	const articles = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: { page: 1, limit: 3, sort: 'createdAt', direction: Direction.DESC, search: { memberId: user?._id } },
		},
		skip: !user?._id,
	});

	const resList: Reservation[] =
		(isStudio ? reservations.data?.getStudioReservations : reservations.data?.getMyReservations)?.list ?? [];
	const visitedList: Package[] = visited.data?.getVisited?.list ?? [];
	const postList: BoardArticle[] = articles.data?.getBoardArticles?.list ?? [];
	const loading = reservations.loading || visited.loading || articles.loading;
	const nothing = !loading && !resList.length && !visitedList.length && !postList.length;

	// the admin's work happens in the admin area; My Page only keeps its posts and profile
	const adminNote = isAdmin && (
		<aside className={'admin-note'}>
			<div>
				<p className={'note-title'}>{t('You are signed in as the admin.')}</p>
				<p className={'note-text'}>
					{t('Members, packages, reservations, posts and messages are managed in the admin area.')}
				</p>
			</div>
			<Link href={'/_admin'} className={'button-primary'}>
				{t('Open the admin area')}
			</Link>
		</aside>
	);

	if (nothing && isAdmin) return <div className={'my-overview'}>{adminNote}</div>;

	if (nothing) {
		return (
			<div className={'empty-box my-empty'}>
				<p>
					{isStudio
						? t('Reservation requests and your posts will show up here.')
						: t('Start by saving a few packages you like. They will show up here.')}
				</p>
				<Link
					href={isStudio ? { pathname: '/mypage', query: { category: 'addPackage' } } : '/package'}
					className={'button-primary'}
				>
					{isStudio ? t('Add a package') : t('Browse packages')}
				</Link>
			</div>
		);
	}

	return (
		<div className={'my-overview'}>
			{adminNote}
			{resList.length > 0 && (
				<section className={'my-section'} aria-labelledby="ov-res-title">
					<div className={'section-row'}>
						<h2 id="ov-res-title" className={'detail-title'}>
							{isStudio ? t('Latest requests') : t('Reservations')}
						</h2>
						<SeeAll category={'myReservations'} label={'See all reservations'} />
					</div>
					<div className={'reservation-list two'}>
						{resList.map((reservation) => (
							<ReservationCard
								key={reservation._id}
								reservation={reservation}
								isStudio={isStudio}
								onUpdated={() => {
									reservations.refetch();
									onChanged();
								}}
							/>
						))}
					</div>
				</section>
			)}

			{visitedList.length > 0 && (
				<section className={'my-section'} aria-labelledby="ov-visited-title">
					<div className={'section-row'}>
						<h2 id="ov-visited-title" className={'detail-title'}>
							{t('Recently viewed')}
						</h2>
						<SeeAll category={'recentlyVisited'} label={'See all recently viewed packages'} />
					</div>
					<ul className={'my-grid four'}>
						{visitedList.map((pkg) => (
							<li key={pkg._id}>
								<PopularPackageCard pkg={pkg} />
							</li>
						))}
					</ul>
				</section>
			)}

			{postList.length > 0 && (
				<section className={'my-section'} aria-labelledby="ov-posts-title">
					<div className={'section-row'}>
						<h2 id="ov-posts-title" className={'detail-title'}>
							{t('My posts')}
						</h2>
						<SeeAll category={'myArticles'} label={'See all my posts'} />
					</div>
					<ul className={'my-grid three'}>
						{postList.map((article) => (
							<li key={article._id}>
								<CommunityCard article={article} />
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
};

export default MyOverview;
