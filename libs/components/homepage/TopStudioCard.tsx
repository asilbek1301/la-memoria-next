import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';

interface TopStudioProps {
	studio: Member;
}
const TopStudioCard = (props: TopStudioProps) => {
	const { studio } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const studioImage = studio?.memberImage
		? `${process.env.REACT_APP_API_URL}/${studio?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className="top-studio-card">
				<img src={studioImage} alt="" />

				<strong>{studio?.memberNick}</strong>
				<span>{studio?.memberType}</span>
			</Stack>
		);
	} else {
		return (
			<Stack className="top-studio-card">
				<img src={studioImage} alt="" />

				<strong>{studio?.memberNick}</strong>
				<span>{studio?.memberType}</span>
			</Stack>
		);
	}
};

export default TopStudioCard;
