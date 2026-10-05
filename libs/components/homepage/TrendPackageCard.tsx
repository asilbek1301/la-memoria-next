import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Package } from '../../types/package/package';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TrendPackageCardProps {
	pkg: Package;
	likePackageHandler: any;
}

const TrendPackageCard = (props: TrendPackageCardProps) => {
	const { pkg, likePackageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** HANDLERS **/

	const pushDetailHandler = async (packageId: string) => {
		console.log('packageId:', packageId);
		await router.push({ pathname: '/package/detail', query: { id: packageId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="trend-card-box" key={pkg._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${pkg?.packageImages[0]})` }}
					onClick={() => pushDetailHandler(pkg._id)}
				>
					<div>${pkg.packagePrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => pushDetailHandler(pkg._id)}>
						{pkg.packageTitle}
					</strong>
					<p className={'desc'}>{pkg.packageDesc ?? 'no description'}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{pkg.packagePhotos} photos</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{pkg.packageStyle}</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{pkg.packageDuration} h</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>
							{[pkg.packageAlbum && 'Album', pkg.packageDress && 'Dress', pkg.packageMakeup && 'Makeup']
								.filter(Boolean)
								.join(' / ')}
						</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{pkg?.packageViews}</Typography>
							<IconButton color={'default'} onClick={() => likePackageHandler(user, pkg?._id)}>
								{pkg?.meLiked && pkg?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{pkg?.packageLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="trend-card-box" key={pkg._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${pkg?.packageImages[0]})` }}
					onClick={() => pushDetailHandler(pkg._id)}
				>
					<div>${pkg.packagePrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => pushDetailHandler(pkg._id)}>
						{pkg.packageTitle}{''}
					</strong>
					<p className={'desc'}>{pkg.packageDesc ?? 'no description'}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{pkg.packagePhotos} photos</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{pkg.packageStyle}</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{pkg.packageDuration} h</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>
							{[pkg.packageAlbum && 'Album', pkg.packageDress && 'Dress', pkg.packageMakeup && 'Makeup']
								.filter(Boolean)
								.join(' / ')}
						</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{pkg?.packageViews}</Typography>
							<IconButton color={'default'} onClick={() => likePackageHandler(user, pkg?._id)}>
								{pkg?.meLiked && pkg?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{pkg?.packageLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default TrendPackageCard;
