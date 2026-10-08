import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { LIKE_TARGET_PACKAGE } from '../../../apollo/user/mutation';
import { Package } from '../../types/package/package';
import { T } from '../../types/common';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import PopularPackageCard from '../homepage/PopularPackageCard';
import { ResultsPagination } from '../common/ListControls';

const PAGE_SIZE = 6;

/** liked packages: every package here is liked, so the heart shows filled and removes it **/
const MyFavorites = () => {
	const [page, setPage] = useState<number>(1);

	/** APOLLO REQUESTS **/

	const [likeTargetPackage] = useMutation(LIKE_TARGET_PACKAGE);
	const { data, loading, refetch } = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_SIZE } },
		notifyOnNetworkStatusChange: true,
	});
	const favorites: Package[] = (data?.getFavorites?.list ?? []).map((pkg: Package) => ({
		...pkg,
		meLiked: [{ memberId: '', likeRefId: pkg._id, myFavorite: true }],
	}));
	const total: number = data?.getFavorites?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/

	const likePackageHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetPackage({ variables: { input: id } });
			await refetch({ input: { page, limit: PAGE_SIZE } });
			await sweetTopSmallSuccessAlert('Removed from liked', 800);
		} catch (err: any) {
			console.log('Error, likePackageHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<section className={'my-section'} aria-labelledby="liked-title">
			<div className={'section-row'}>
				<div>
					<h2 id="liked-title" className={'detail-title'}>
						Liked packages
					</h2>
					<p className={'section-note'}>Packages you liked with the heart.</p>
				</div>
			</div>
			{loading && favorites.length === 0 ? (
				<div className={'my-grid'} aria-busy="true">
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} variant="rectangular" className={'skeleton portrait'} />
					))}
				</div>
			) : favorites.length === 0 ? (
				<div className={'empty-box my-empty'}>
					<p>No liked packages yet.</p>
					<Link href={'/package'} className={'button-primary'}>
						Browse packages
					</Link>
				</div>
			) : (
				<ul className={'my-grid'}>
					{favorites.map((pkg) => (
						<li key={pkg._id}>
							<PopularPackageCard pkg={pkg} likePackageHandler={likePackageHandler} />
						</li>
					))}
				</ul>
			)}
			{total > PAGE_SIZE && (
				<ResultsPagination page={page} limit={PAGE_SIZE} total={total} onPage={setPage} noun="liked packages" />
			)}
		</section>
	);
};

export default MyFavorites;
