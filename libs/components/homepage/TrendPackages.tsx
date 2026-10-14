import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { Package } from '../../types/package/package';
import { PackagesInquiry } from '../../types/package/package.input';
import { PackageLocation } from '../../enums/package.enum';
import { GET_PACKAGES } from '../../../apollo/user/query';
import { LIKE_TARGET_PACKAGE } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { prettyEnum } from '../../utils';
import TrendPackageCard from './TrendPackageCard';
import HomeSection, { EmptyState, FilterTabs, ViewAllLink } from './HomeSection';

interface TrendPackagesProps {
	initialInput: PackagesInquiry;
}

type LocationTab = PackageLocation | 'ALL';

const locationTabs: { value: LocationTab; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	...[PackageLocation.SEOUL, PackageLocation.BUSAN, PackageLocation.JEJU].map((value) => ({
		value,
		label: prettyEnum(value),
	})),
];

const TrendPackages = (props: TrendPackagesProps) => {
	const { initialInput } = props;
	const [location, setLocation] = useState<LocationTab>('ALL');
	const input: PackagesInquiry = {
		...initialInput,
		search: location === 'ALL' ? {} : { locationList: [location] },
	};

	/** APOLLO REQUESTS **/

	const [likeTargetPackage] = useMutation(LIKE_TARGET_PACKAGE);

	const {
		loading: getPackagesLoading,
		data: getPackagesData,
		refetch: getPackagesRefetch,
	} = useQuery(GET_PACKAGES, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
	});
	const trendPackages: Package[] = getPackagesData?.getPackages?.list ?? [];

	/** HANDLERS **/

	const likePackageHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			//execute likeTargetPackage Mutation
			await likeTargetPackage({
				variables: { input: id },
			});

			//execute getPackagesRefetch
			await getPackagesRefetch({ input });

		} catch (err: any) {
			console.log('Error:likePackageHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const [featured, ...rest] = trendPackages;
	const showSkeleton = getPackagesLoading && trendPackages.length === 0;

	return (
		<HomeSection
			id="trending"
			title="Trending Packages"
			subtitle="Ranked by likes from couples"
			aside={
				<>
					<FilterTabs label="Filter by location" options={locationTabs} value={location} onChange={setLocation} />
					<ViewAllLink href={'/package'} label="View all" />
				</>
			}
		>
			{showSkeleton ? (
				<div className={'trend-grid'} aria-busy="true" aria-label="Loading trending packages">
					<Skeleton variant="rectangular" className={'skeleton feature-box'} />
					<div className={'trend-list'}>
						{[0, 1, 2, 3].map((i) => (
							<div key={i}>
								<Skeleton variant="rectangular" className={'skeleton media'} />
								<Skeleton width="70%" />
								<Skeleton width="40%" />
							</div>
						))}
					</div>
				</div>
			) : trendPackages.length === 0 ? (
				<EmptyState
					message={
						location === 'ALL'
							? 'No packages have been published yet. Trending packages will appear here once couples start saving them.'
							: `No packages in ${prettyEnum(location)} yet.`
					}
					href="/package"
					linkLabel="Browse all packages"
				/>
			) : (
				<div className={'trend-grid'}>
					<div className={'feature-box'}>
						<TrendPackageCard pkg={featured} rank={1} variant="featured" likePackageHandler={likePackageHandler} />
					</div>
					{rest.length > 0 && (
						<div className={'trend-list'}>
							{rest.map((pkg: Package, index: number) => (
								<TrendPackageCard
									key={pkg._id}
									pkg={pkg}
									rank={index + 2}
									likePackageHandler={likePackageHandler}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</HomeSection>
	);
};

TrendPackages.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'packageLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TrendPackages;
