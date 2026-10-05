import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface StudioCardProps {
	studio: any;
	likeMemberHandler: any;
}

const StudioCard = (props: StudioCardProps) => {
	const { studio, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = studio?.memberImage
		? `${REACT_APP_API_URL}/${studio?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <div>STUDIO CARD</div>;
	} else {
		return (
			<Stack className="studio-general-card" sx={{ width: '233px', height: '347px', flexShrink: 0 }}>
				<Link
					href={{
						pathname: '/studio/detail',
						query: { studioId: studio?._id },
					}}
				>
					<Box
						component={'div'}
						className={'studio-img'}
						style={{
							backgroundImage: `url(${imagePath})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						<div>{studio?.memberPackages} packages</div>
					</Box>
				</Link>

				<Stack className={'studio-desc'}>
					<Box component={'div'} className={'studio-info'}>
						<Link
							href={{
								pathname: '/studio/detail',
								query: { studioId: 'id' },
							}}
						>
							<strong>{studio?.memberFullName ?? studio?.memberNick}</strong>
						</Link>
						<span>Studio</span>
					</Box>
					<Box component={'div'} className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{studio?.memberViews}</Typography>
						<IconButton color={'default'} onClick={() => likeMemberHandler(user, studio?._id)}>
							{studio?.meLiked && studio?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{studio?.memberLikes}</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default StudioCard;
