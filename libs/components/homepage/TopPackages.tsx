import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopPackageCard from './TopPackageCard';
import { PackagesInquiry } from '../../types/package/package.input';
import { Package } from '../../types/package/package';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PACKAGES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_PACKAGE } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../sweetAlert';

interface TopPackagesProps {
	initialInput: PackagesInquiry;
}

const TopPackages = (props: TopPackagesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topPackages, setTopPackages] = useState<Package[]>([]);

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
			setTopPackages(data?.getPackages?.list);
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

	if (device === 'mobile') {
		return (
			<Stack className={'top-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top packages</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-package-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={15}
							modules={[Autoplay]}
						>
							{topPackages.map((pkg: Package) => {
								return (
									<SwiperSlide className={'top-package-slide'} key={pkg?._id}>
										<TopPackageCard pkg={pkg} likePackageHandler={likePackageHandler} />
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
			<Stack className={'top-packages'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top packages</span>
							<p>Check out our Top Packages</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-top-prev'} />
								<div className={'swiper-top-pagination'}></div>
								<EastIcon className={'swiper-top-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-package-swiper'}
							slidesPerView={'auto'}
							spaceBetween={15}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-top-next',
								prevEl: '.swiper-top-prev',
							}}
							pagination={{
								el: '.swiper-top-pagination',
							}}
						>
							{topPackages.map((pkg: Package) => {
								return (
									<SwiperSlide className={'top-package-slide'} key={pkg?._id}>
										<TopPackageCard pkg={pkg} likePackageHandler={likePackageHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopPackages.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'packageRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopPackages;
