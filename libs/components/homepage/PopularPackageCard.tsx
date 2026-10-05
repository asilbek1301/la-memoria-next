import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Package } from '../../types/package/package';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL, topPackageRank } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface PopularPackageCardProps {
	pkg: Package;
}

const PopularPackageCard = (props: PopularPackageCardProps) => {
	const { pkg } = props;
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
			<Stack className="popular-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${pkg?.packageImages[0]})` }}
					onClick={() => pushDetailHandler(pkg._id)}
				>
					{pkg && pkg?.packageRank >= topPackageRank ? (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					) : (
						''
					)}

					<div className={'price'}>${pkg.packagePrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => pushDetailHandler(pkg._id)}>
						{pkg.packageTitle}
					</strong>
					<p className={'desc'}>{pkg.packageAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{pkg?.packagePhotos} photos</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{pkg?.packageStyle}</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{pkg?.packageDuration} h</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{pkg?.packageType}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{pkg?.packageViews}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="popular-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${pkg?.packageImages[0]})` }}
					onClick={() => pushDetailHandler(pkg._id)}
				>
					{pkg && pkg?.packageRank >= topPackageRank ? (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					) : (
						''
					)}

					<div className={'price'}>${pkg.packagePrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => pushDetailHandler(pkg._id)}>
						{pkg.packageTitle}
					</strong>
					<p className={'desc'}>{pkg.packageAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{pkg?.packagePhotos} photos</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{pkg?.packageStyle}</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{pkg?.packageDuration} h</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{pkg?.packageType}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{pkg?.packageViews}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default PopularPackageCard;
