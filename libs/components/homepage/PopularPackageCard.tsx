import React from 'react';
import Link from 'next/link';
import { Package } from '../../types/package/package';
import { formatKRW, prettyEnum } from '../../utils';
import { packageDetailHref, packageImage, packageInclusions } from './TrendPackageCard';

interface PopularPackageCardProps {
	pkg: Package;
}

const PopularPackageCard = (props: PopularPackageCardProps) => {
	const { pkg } = props;
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
			<div className={'card-meta'}>
				<span>
					{prettyEnum(pkg?.packageLocation)} — {prettyEnum(pkg?.packageStyle)}
				</span>
				<span className={'price'}>{formatKRW(pkg?.packagePrice)}</span>
			</div>
			<h3 className={'card-title'}>
				<Link href={packageDetailHref(pkg)}>{pkg?.packageTitle}</Link>
			</h3>
			<p className={'card-details'}>{details}</p>
			<Link href={packageDetailHref(pkg)} className={'button-link'} aria-label={`View details of ${pkg?.packageTitle}`}>
				View package details
			</Link>
		</article>
	);
};

export default PopularPackageCard;
