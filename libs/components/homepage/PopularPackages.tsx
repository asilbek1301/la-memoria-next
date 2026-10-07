import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Navigation } from 'swiper';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PopularPackageCard from './PopularPackageCard';
import { Package } from '../../types/package/package';
import { PackagesInquiry } from '../../types/package/package.input';
import { PackageStyle } from '../../enums/package.enum';
import { GET_PACKAGES } from '../../../apollo/user/query';
import { prettyEnum } from '../../utils';
import HomeSection, { EmptyState, FilterTabs } from './HomeSection';

interface PopularPackagesProps {
	initialInput: PackagesInquiry;
}

type StyleTab = PackageStyle | 'ALL';

const styleTabs: { value: StyleTab; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	...Object.values(PackageStyle).map((value) => ({ value, label: prettyEnum(value) })),
];

const PopularPackages = (props: PopularPackagesProps) => {
	const { initialInput } = props;
	const [style, setStyle] = useState<StyleTab>('ALL');
	const input: PackagesInquiry = {
		...initialInput,
		search: style === 'ALL' ? {} : { styleList: [style] },
	};

	/** APOLLO REQUESTS **/

	const { loading: getPackagesLoading, data: getPackagesData } = useQuery(GET_PACKAGES, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
	});
	const popularPackages: Package[] = getPackagesData?.getPackages?.list ?? [];
	const showSkeleton = getPackagesLoading && popularPackages.length === 0;

	return (
		<HomeSection
			id="popular"
			title="Most Popular Packages"
			aside={
				<>
					<FilterTabs label="Filter by style" options={styleTabs} value={style} onChange={setStyle} />
					<div className={'arrow-box'}>
						<button type="button" className={'arrow-btn popular-prev'} aria-label="Previous packages">
							<ChevronLeftRoundedIcon />
						</button>
						<button type="button" className={'arrow-btn popular-next'} aria-label="Next packages">
							<ChevronRightRoundedIcon />
						</button>
					</div>
				</>
			}
		>
			{showSkeleton ? (
				<div className={'popular-skeleton'} aria-busy="true" aria-label="Loading popular packages">
					{[0, 1, 2].map((i) => (
						<div key={i}>
							<Skeleton variant="rectangular" className={'skeleton portrait'} />
							<Skeleton width="80%" />
							<Skeleton width="60%" />
						</div>
					))}
				</div>
			) : popularPackages.length === 0 ? (
				<EmptyState
					message={
						style === 'ALL'
							? 'No packages have been published yet. Popular packages will appear here as couples start viewing them.'
							: `No ${prettyEnum(style).toLowerCase()} style packages yet.`
					}
					href="/package"
					linkLabel="Browse all packages"
				/>
			) : (
				<Swiper
					className={'popular-swiper'}
					modules={[Navigation, A11y]}
					navigation={{ prevEl: '.popular-prev', nextEl: '.popular-next' }}
					slidesPerView={1.15}
					spaceBetween={20}
					breakpoints={{
						768: { slidesPerView: 2, spaceBetween: 28 },
						1024: { slidesPerView: 3, spaceBetween: 40 },
					}}
				>
					{popularPackages.map((pkg: Package) => (
						<SwiperSlide key={pkg._id}>
							<PopularPackageCard pkg={pkg} />
						</SwiperSlide>
					))}
				</Swiper>
			)}
		</HomeSection>
	);
};

PopularPackages.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'packageViews',
		direction: 'DESC',
		search: {},
	},
};

export default PopularPackages;
