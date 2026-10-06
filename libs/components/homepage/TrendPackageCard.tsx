import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { Package } from '../../types/package/package';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
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

	const isLiked = Boolean(pkg?.meLiked && pkg?.meLiked[0]?.myFavorite);
	const inclusions = [
		pkg?.packageAlbum && 'Album',
		pkg?.packageDress && 'Dress',
		pkg?.packageMakeup && 'Makeup',
	].filter(Boolean) as string[];

	/** HANDLERS **/

	const pushDetailHandler = async (packageId: string) => {
		await router.push({ pathname: '/package/detail', query: { id: packageId } });
	};

	const keyOpenHandler = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			pushDetailHandler(pkg._id);
		}
	};

	const likeClickHandler = (e: React.MouseEvent) => {
		e.stopPropagation();
		likePackageHandler(user, pkg?._id);
	};

	return (
		<article className={`lm-pkg-card ${device === 'mobile' ? 'mobile' : ''}`} key={pkg._id}>
			<div className="lm-pkg-media">
				<div
					className="lm-pkg-media-link"
					role="link"
					tabIndex={0}
					aria-label={`Open ${pkg?.packageTitle}`}
					onClick={() => pushDetailHandler(pkg._id)}
					onKeyDown={keyOpenHandler}
				>
					<img src={`${REACT_APP_API_URL}/${pkg?.packageImages[0]}`} alt="" loading="lazy" />
				</div>
				<span className="lm-pkg-tier">{pkg?.packageType}</span>
				<button
					type="button"
					className={`lm-pkg-like ${isLiked ? 'liked' : ''}`}
					aria-label={isLiked ? 'Remove from saved packages' : 'Save package'}
					aria-pressed={isLiked}
					onClick={likeClickHandler}
				>
					{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
				</button>
			</div>

			<div className="lm-pkg-content">
				<p className="lm-pkg-eyebrow">
					<PlaceOutlinedIcon />
					<span>
						{pkg?.packageLocation} · {pkg?.packageStyle}
					</span>
				</p>
				<h3
					className="lm-pkg-title"
					role="link"
					tabIndex={0}
					onClick={() => pushDetailHandler(pkg._id)}
					onKeyDown={keyOpenHandler}
					title={pkg?.packageTitle}
				>
					{pkg?.packageTitle}
				</h3>
				<div className="lm-pkg-meta">
					<span>
						<AccessTimeRoundedIcon />
						{pkg?.packageDuration}h
					</span>
					<span>
						<PhotoCameraOutlinedIcon />
						{pkg?.packagePhotos} photos
					</span>
				</div>
				<div className="lm-pkg-badges">
					{inclusions.length ? (
						inclusions.map((item) => (
							<span className="lm-pkg-badge" key={item}>
								{item}
							</span>
						))
					) : (
						<span className="lm-pkg-badge muted">Photography only</span>
					)}
				</div>
			</div>

			<div className="lm-pkg-footer">
				<p className="lm-pkg-price">
					${formatterStr(pkg?.packagePrice) || '0'}
					<small>/ package</small>
				</p>
				<div className="lm-pkg-stats">
					<span aria-label="views">
						<VisibilityOutlinedIcon />
						{pkg?.packageViews}
					</span>
					<span aria-label="likes">
						<FavoriteBorderIcon />
						{pkg?.packageLikes}
					</span>
				</div>
			</div>
		</article>
	);
};

export default TrendPackageCard;
