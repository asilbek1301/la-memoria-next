import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Package } from '../../types/package/package';
import { REACT_APP_API_URL, topPackageRank } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PackageBigCardProps {
	pkg: Package;
	likePackageHandler?: any;
}

const PackageBigCard = (props: PackageBigCardProps) => {
	const { pkg, likePackageHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** HANDLERS **/

	const goPackageDetatilPage = (packageId: string) => {
		router.push(`/package/detail?id=${packageId}`);
	};

	if (device === 'mobile') {
		return <div>APARTMEND BIG CARD</div>;
	} else {
		return (
			<Stack className="package-big-card-box" onClick={() => goPackageDetatilPage(pkg?._id)}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${pkg?.packageImages?.[0]})` }}
				>
					{pkg && pkg?.packageRank >= topPackageRank && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}

					<div className={'price'}>${formatterStr(pkg?.packagePrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{pkg?.packageTitle}</strong>
					<p className={'desc'}>{pkg?.packageAddress}</p>
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
						<div>
							{pkg?.packageAlbum ? <p>Album</p> : <span>Album</span>}
							{pkg?.packageDress ? <p>Dress</p> : <span>Dress</span>}
							{pkg?.packageMakeup ? <p>Makeup</p> : <span>Makeup</span>}
						</div>
						<div className="buttons-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{pkg?.packageViews}</Typography>
							<IconButton
								color={'default'}
								onClick={(e) => {
									e.stopPropagation();
									likePackageHandler(user, pkg?._id);
								}}
							>
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

export default PackageBigCard;
