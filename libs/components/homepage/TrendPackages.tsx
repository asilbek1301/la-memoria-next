import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Package } from '../../types/package/package';
import { PackagesInquiry } from '../../types/package/package.input';
import TrendPackageCard from './TrendPackageCard';
import { GET_PACKAGES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { useQuery, useMutation } from '@apollo/client';
import { LIKE_TARGET_PACKAGE } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

interface TrendPackagesProps {
	initialInput: PackagesInquiry;
}

const TrendPackages = (props: TrendPackagesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [trendPackages, setTrendPackages] = useState<Package[]>([]);

	/** APOLLO REQUESTS **/

	const [likeTargetPackage] = useMutation(LIKE_TARGET_PACKAGE);

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
			setTrendPackages(data?.getPackages?.list);
		},
	});

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
			await getPackagesRefetch({ input: initialInput });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('Error:likePackageHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (trendPackages) console.log('trendPackages:', trendPackages);
	if (!trendPackages) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'trend-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Trend Packages</span>
					</Stack>
					<Stack className={'card-box'}>
						{trendPackages.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Trends Empty
							</Box>
						) : (
							<Swiper
								className={'trend-package-swiper'}
								slidesPerView={'auto'}
								centeredSlides={true}
								spaceBetween={15}
								modules={[Autoplay]}
							>
								{trendPackages.map((pkg: Package) => {
									return (
										<SwiperSlide key={pkg._id} className={'trend-package-slide'}>
											<TrendPackageCard pkg={pkg} likePackageHandler={likePackageHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'trend-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Trend Packages</span>
							<p>Trend is based on likes</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-trend-prev'} />
								<div className={'swiper-trend-pagination'}></div>
								<EastIcon className={'swiper-trend-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						{trendPackages.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Trends Empty
							</Box>
						) : (
							<Swiper
								className={'trend-package-swiper'}
								slidesPerView={'auto'}
								spaceBetween={15}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-trend-next',
									prevEl: '.swiper-trend-prev',
								}}
								pagination={{
									el: '.swiper-trend-pagination',
								}}
							>
								{trendPackages.map((pkg: Package) => {
									return (
										<SwiperSlide key={pkg._id} className={'trend-package-slide'}>
											<TrendPackageCard pkg={pkg} likePackageHandler={likePackageHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TrendPackages.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'packageLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TrendPackages;
