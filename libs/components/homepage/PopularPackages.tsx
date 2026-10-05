import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import PopularPackageCard from './PopularPackageCard';
import { Package } from '../../types/package/package';
import Link from 'next/link';
import { PackagesInquiry } from '../../types/package/package.input';
import { GET_PACKAGES } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';

interface PopularPackagesProps {
	initialInput: PackagesInquiry;
}

const PopularPackages = (props: PopularPackagesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [popularPackages, setPopularPackages] = useState<Package[]>([]);

	/** APOLLO REQUESTS **/
	
	const {
		loading: getPackagesLoading,
		data: getPackagesData,
		error: getPackagesError,
		refetch: getPackagesRefetch,
	} = useQuery(GET_PACKAGES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPopularPackages(data?.getPackages?.list);
		},
	});
	
	/** HANDLERS **/

	if (!popularPackages) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Popular packages</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'popular-package-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={25}
							modules={[Autoplay]}
						>
							{popularPackages.map((pkg: Package) => {
								return (
									<SwiperSlide key={pkg._id} className={'popular-package-slide'}>
										<PopularPackageCard pkg={pkg} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'popular-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Popular packages</span>
							<p>Popularity is based on views</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<Link href={'/package'}>
									<span>See All Categories</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'popular-package-swiper'}
							slidesPerView={'auto'}
							spaceBetween={25}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-popular-next',
								prevEl: '.swiper-popular-prev',
							}}
							pagination={{
								el: '.swiper-popular-pagination',
							}}
						>
							{popularPackages.map((pkg: Package) => {
								return (
									<SwiperSlide key={pkg._id} className={'popular-package-slide'}>
										<PopularPackageCard pkg={pkg} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
					<Stack className={'pagination-box'}>
						<WestIcon className={'swiper-popular-prev'} />
						<div className={'swiper-popular-pagination'}></div>
						<EastIcon className={'swiper-popular-next'} />
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

PopularPackages.defaultProps = {
	initialInput: {
		page: 1,
		limit: 7,
		sort: 'packageViews',
		direction: 'DESC',
		search: {},
	},
};

export default PopularPackages;
