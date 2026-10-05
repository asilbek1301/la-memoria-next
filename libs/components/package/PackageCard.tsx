import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Package } from '../../types/package/package';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topPackageRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PackageCardType {
	pkg: Package;
	likePackageHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PackageCard = (props: PackageCardType) => {
	const { pkg, likePackageHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = pkg?.packageImages[0]
		? `${REACT_APP_API_URL}/${pkg?.packageImages[0]}`
		: '/img/banner/header1.svg';

	if (device === 'mobile') {
		return <div>PACKAGE CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link
						href={{
							pathname: '/package/detail',
							query: { id: pkg?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
					{pkg && pkg?.packageRank > topPackageRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					<Box component={'div'} className={'price-box'}>
						<Typography>${formatterStr(pkg?.packagePrice)}</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link
								href={{
									pathname: '/package/detail',
									query: { id: pkg?._id },
								}}
							>
								<Typography>{pkg.packageTitle}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>
								{pkg.packageAddress}, {pkg.packageLocation}
							</Typography>
						</Stack>
					</Stack>
					<Stack className="options">
						<Stack className="option">
							<img src="/img/icons/bed.svg" alt="" /> <Typography>{pkg.packagePhotos} photos</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/room.svg" alt="" /> <Typography>{pkg.packageStyle}</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/expand.svg" alt="" /> <Typography>{pkg.packageDuration} h</Typography>
						</Stack>
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={pkg.packageAlbum ? '' : 'disabled-type'}
							>
								Album
							</Typography>
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={pkg.packageDress ? '' : 'disabled-type'}
							>
								Dress
							</Typography>
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={pkg.packageMakeup ? '' : 'disabled-type'}
							>
								Makeup
							</Typography>
						</Stack>
						{!recentlyVisited && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{pkg?.packageViews}</Typography>
								<IconButton color={'default'} onClick={() => likePackageHandler(user, pkg?._id)}>
									{myFavorites ? (
										<FavoriteIcon color="primary" />
									) : pkg?.meLiked && pkg?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon color="primary" />
									) : (
										<FavoriteBorderIcon />
									)}
								</IconButton>
								<Typography className="view-cnt">{pkg?.packageLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PackageCard;
