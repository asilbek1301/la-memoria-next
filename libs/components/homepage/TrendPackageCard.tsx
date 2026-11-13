import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { Package } from '../../types/package/package';
import { REACT_APP_API_URL } from '../../config';
import { formatKRW, prettyEnum } from '../../utils';
import { userVar } from '../../../apollo/store';

interface TrendPackageCardProps {
	pkg: Package;
	rank: number;
	variant?: 'featured' | 'compact';
	likePackageHandler: any;
}

/** shared helpers for the editorial package cards **/
export const packageImage = (pkg: Package) =>
	pkg?.packageImages?.[0] ? `${REACT_APP_API_URL}/${pkg.packageImages[0]}` : '';

export const packageInclusions = (pkg: Package) =>
	[pkg?.packageAlbum && 'Album', pkg?.packageDress && 'Dress', pkg?.packageMakeup && 'Makeup'].filter(
		Boolean,
	) as string[];

export const packageDetailHref = (pkg: Package) => `/package/detail?id=${pkg?._id}`;

const TrendPackageCard = (props: TrendPackageCardProps) => {
	const { pkg, rank, variant = 'compact', likePackageHandler } = props;
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const isLiked = Boolean(pkg?.meLiked && pkg?.meLiked[0]?.myFavorite);
	const image = packageImage(pkg);
	const studioName = pkg?.memberData?.memberNick;
	const location = `${t(prettyEnum(pkg?.packageLocation))} — ${t(prettyEnum(pkg?.packageStyle))}`;
	const rankLabel = String(rank).padStart(2, '0');

	const likeButton = (
		<button
			type="button"
			className={`like-btn ${isLiked ? 'liked' : ''}`}
			aria-label={t(isLiked ? 'Unlike {{title}}' : 'Like {{title}}', { title: t(pkg?.packageTitle) })}
			aria-pressed={isLiked}
			onClick={() => likePackageHandler(user, pkg?._id)}
		>
			{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
		</button>
	);

	if (variant === 'featured') {
		const details = [
			t('{{count}} hours', { count: pkg?.packageDuration }),
			t('{{count}} photos', { count: pkg?.packagePhotos }),
			...packageInclusions(pkg).map((item) => t(item)),
		].join(' · ');

		return (
			<article className={'trend-feature'}>
				<div className={'feature-visual'}>
					<span className={'feature-media'} tabIndex={-1} aria-hidden="true">
						{image ? <img src={image} alt="" /> : <span className={'img-placeholder'} />}
					</span>
					<span className={'tag rank-tag'}>{t('No. {{rank}} by likes', { rank })}</span>
					<div className={'like-box'}>{likeButton}</div>
				</div>

				<div className={'feature-panel'}>
					<div className={'panel-meta'}>
						<span>{location}</span>
						<span>{prettyEnum(pkg?.packageType)}</span>
					</div>
					<h3 className={'panel-title'}>
						<Link href={packageDetailHref(pkg)}>{t(pkg?.packageTitle)}</Link>
					</h3>
					{studioName && <p className={'panel-studio'}>{studioName}</p>}
					<p className={'panel-details'}>{details}</p>
					<div className={'panel-price'}>
						<span className={'price'}>{formatKRW(pkg?.packagePrice)}</span>
						<span className={'panel-likes'}>
							<FavoriteBorderRoundedIcon /> {t('{{count}} likes', { count: pkg?.packageLikes ?? 0 })}
						</span>
					</div>
					<Link href={packageDetailHref(pkg)} className={'button-primary'}>
						{t('View & reserve')}
					</Link>
				</div>
			</article>
		);
	}

	return (
		<article className={'trend-card'}>
			<div className={'card-media'}>
				<Link href={packageDetailHref(pkg)} tabIndex={-1} aria-hidden="true">
					{image ? <img src={image} alt="" loading="lazy" /> : <span className={'img-placeholder'} />}
				</Link>
				<span className={'tag rank-tag'}>{rankLabel}</span>
				<div className={'like-box'}>{likeButton}</div>
			</div>
			<p className={'card-meta'}>
				{location} · {prettyEnum(pkg?.packageType)}
			</p>
			<h3 className={'card-title'}>
				<Link href={packageDetailHref(pkg)}>{t(pkg?.packageTitle)}</Link>
			</h3>
			{studioName && <p className={'card-studio'}>{studioName}</p>}
			<div className={'card-footer'}>
				<span className={'price'}>{formatKRW(pkg?.packagePrice)}</span>
				<Link
					href={packageDetailHref(pkg)}
					className={'button-link'}
					aria-label={t('Reserve {{title}}', { title: t(pkg?.packageTitle) })}
				>
					{t('Reserve')}
				</Link>
			</div>
		</article>
	);
};

export default TrendPackageCard;
