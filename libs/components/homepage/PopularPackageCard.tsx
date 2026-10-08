import React from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { Package } from '../../types/package/package';
import { formatKRW, prettyEnum } from '../../utils';
import { packageDetailHref, packageImage, packageInclusions } from './TrendPackageCard';
import { userVar } from '../../../apollo/store';

interface PopularPackageCardProps {
	pkg: Package;
	/** when given, a save (like) button is shown on the photo (the package list uses it; the homepage does not) */
	likePackageHandler?: (user: any, id: string) => void;
}

const PopularPackageCard = (props: PopularPackageCardProps) => {
	const { pkg, likePackageHandler } = props;
	const user = useReactiveVar(userVar);
	const isLiked = Boolean(pkg?.meLiked && pkg?.meLiked[0]?.myFavorite);
	const image = packageImage(pkg);
	const studioName = pkg?.memberData?.memberNick;
	const details = [
		studioName && `By ${studioName}`,
		`${pkg?.packageDuration} hours`,
		`${pkg?.packagePhotos} photos`,
		...packageInclusions(pkg),
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<article className={'popular-card'}>
			<Link href={packageDetailHref(pkg)} className={'card-media'} tabIndex={-1} aria-hidden="true">
				{image ? <img src={image} alt="" loading="lazy" /> : <span className={'img-placeholder'} />}
				<span className={'tag'}>{prettyEnum(pkg?.packageType)} tier</span>
			</Link>
			{likePackageHandler && (
				<button
					type="button"
					className={`like-btn ${isLiked ? 'liked' : ''}`}
					aria-label={isLiked ? `Unlike ${pkg?.packageTitle}` : `Like ${pkg?.packageTitle}`}
					aria-pressed={isLiked}
					onClick={() => likePackageHandler(user, pkg?._id)}
				>
					{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</button>
			)}
			<div className={'card-meta'}>
				<span>
					{prettyEnum(pkg?.packageLocation)} — {prettyEnum(pkg?.packageStyle)}
				</span>
				<span className={'price'}>{formatKRW(pkg?.packagePrice)}</span>
			</div>
			<h3 className={'card-title'}>
				<Link href={packageDetailHref(pkg)}>{pkg?.packageTitle}</Link>
			</h3>
			<p className={'card-details'}>
				<span className={'details-text'}>{details}</span>
			</p>
		</article>
	);
};

export default PopularPackageCard;
