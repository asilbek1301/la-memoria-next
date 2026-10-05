import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopStudioCard from './TopStudioCard';
import { Member } from '../../types/member/member';
import { StudiosInquiry } from '../../types/member/member.input';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { GET_STUDIOS } from '../../../apollo/user/query';

interface TopStudiosProps {
	initialInput: StudiosInquiry;
}

const TopStudios = (props: TopStudiosProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [topStudios, setTopStudios] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	
	const {
		loading: getStudiosLoading,
		data: getStudiosData,
		error: getStudiosError,
		refetch: getStudiosRefetch,
	} = useQuery(GET_STUDIOS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopStudios(data?.getStudios?.list);
		},
	});
	
	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className={'top-studios'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top Studios</span>
					</Stack>
					<Stack className={'wrapper'}>
						<Swiper
							className={'top-studios-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={29}
							modules={[Autoplay]}
						>
							{topStudios.map((studio: Member) => {
								return (
									<SwiperSlide className={'top-studios-slide'} key={studio?._id}>
										<TopStudioCard studio={studio} key={studio?.memberNick} />
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
			<Stack className={'top-studios'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top Studios</span>
							<p>Our Top Studios always ready to serve you</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<span>See All Studios</span>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-studios-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-studios-swiper'}
								slidesPerView={'auto'}
								spaceBetween={29}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-studios-next',
									prevEl: '.swiper-studios-prev',
								}}
							>
								{topStudios.map((studio: Member) => {
									return (
										<SwiperSlide className={'top-studios-slide'} key={studio?._id}>
											<TopStudioCard studio={studio} key={studio?.memberNick} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-studios-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopStudios.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopStudios;
