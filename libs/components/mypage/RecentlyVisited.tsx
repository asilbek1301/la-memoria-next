import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { GET_VISITED } from '../../../apollo/user/query';
import { Package } from '../../types/package/package';
import PopularPackageCard from '../homepage/PopularPackageCard';
import { ResultsPagination } from '../common/ListControls';

const PAGE_SIZE = 6;

/** packages you opened recently (the backend records a view when a logged-in member opens a package) **/
const RecentlyVisited = () => {
	const [page, setPage] = useState<number>(1);

	/** APOLLO REQUESTS **/

	const { data, loading } = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_SIZE } },
		notifyOnNetworkStatusChange: true,
	});
	const visited: Package[] = data?.getVisited?.list ?? [];
	const total: number = data?.getVisited?.metaCounter?.[0]?.total ?? 0;

	return (
		<section className={'my-section'} aria-labelledby="visited-title">
			<div className={'section-row'}>
				<div>
					<h2 id="visited-title" className={'detail-title'}>
						Recently viewed
					</h2>
					<p className={'section-note'}>Packages you opened lately.</p>
				</div>
			</div>
			{loading && visited.length === 0 ? (
				<div className={'my-grid'} aria-busy="true">
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} variant="rectangular" className={'skeleton portrait'} />
					))}
				</div>
			) : visited.length === 0 ? (
				<div className={'empty-box my-empty'}>
					<p>Packages you open will show up here.</p>
					<Link href={'/package'} className={'button-primary'}>
						Browse packages
					</Link>
				</div>
			) : (
				<ul className={'my-grid'}>
					{visited.map((pkg) => (
						<li key={pkg._id}>
							<PopularPackageCard pkg={pkg} />
						</li>
					))}
				</ul>
			)}
			{total > PAGE_SIZE && (
				<ResultsPagination page={page} limit={PAGE_SIZE} total={total} onPage={setPage} noun="packages" />
			)}
		</section>
	);
};

export default RecentlyVisited;
