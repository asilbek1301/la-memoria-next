import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { GET_PACKAGES } from '../../../apollo/user/query';
import { PackageType } from '../../enums/package.enum';
import { formatKRW, packageSearchHref, prettyEnum } from '../../utils';
import HomeSection from './HomeSection';

const tierCopy: Record<PackageType, string> = {
	[PackageType.PEARL]: 'Our entry tier. A simple, focused session for natural portraits.',
	[PackageType.GOLD]: 'Our middle tier. A balance of shooting time, photos and styling.',
	[PackageType.DIAMOND]: 'Our top tier. The most complete packages each studio offers.',
};

/** cheapest active package and package count for one tier, from the existing package query **/
const useTierSummary = (type: PackageType) => {
	const { loading, data } = useQuery(GET_PACKAGES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 1, sort: 'packagePrice', direction: 'ASC', search: { typeList: [type] } },
		},
	});
	return {
		type,
		loading: loading && !data,
		fromPrice: data?.getPackages?.list?.[0]?.packagePrice as number | undefined,
		total: (data?.getPackages?.metaCounter?.[0]?.total ?? 0) as number,
	};
};

const PackageTiers = () => {
	const tiers = [
		useTierSummary(PackageType.PEARL),
		useTierSummary(PackageType.GOLD),
		useTierSummary(PackageType.DIAMOND),
	];

	return (
		<HomeSection
			id="tier-list"
			tone="tinted"
			title="Choose Your Tier"
			subtitle="Every studio offers its packages in three tiers. Compare prices and find the one that fits your day."
		>
			<ol className={'tier-list'}>
				{tiers.map((tier) => (
					<li className={'tier-row'} key={tier.type}>
						<div className={'tier-name'}>
							<h3>{prettyEnum(tier.type)}</h3>
						</div>
						<p className={'tier-copy'}>{tierCopy[tier.type]}</p>
						<div className={'tier-chips'}>
							{tier.loading ? (
								<Skeleton width={120} />
							) : (
								tier.total > 0 && (
									<span className={'tier-count'}>
										{tier.total} {tier.total === 1 ? 'package' : 'packages'} available
									</span>
								)
							)}
						</div>
						<div className={'tier-price'}>
							{tier.loading ? (
								<Skeleton width={140} height={40} />
							) : tier.total > 0 && tier.fromPrice !== undefined ? (
								<>
									<span className={'tier-from'}>From</span>
									<span className={'price large'}>{formatKRW(tier.fromPrice)}</span>
									<Link href={packageSearchHref({ typeList: [tier.type] })} className={'button-secondary'}>
										View packages
									</Link>
								</>
							) : (
								<span className={'tier-none'}>No packages yet</span>
							)}
						</div>
					</li>
				))}
			</ol>
		</HomeSection>
	);
};

export default PackageTiers;
