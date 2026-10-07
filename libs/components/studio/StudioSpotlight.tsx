import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { Member } from '../../types/member/member';
import { Package } from '../../types/package/package';
import { GET_PACKAGES, GET_STUDIOS } from '../../../apollo/user/query';
import { packageDetailHref, packageImage } from '../homepage/TrendPackageCard';
import { plural, studioHref, studioImage, studioLocation, studioName, studioStats } from './studioSearch';

const RECENT_PACKAGES = 3;

/** the top-ranked studio, shown large above the grid (page 1 without a search only) **/
const StudioSpotlight = () => {
	/** APOLLO REQUESTS: one studio (memberRank), then its three newest packages **/
	const { data: studioData, loading: studioLoading } = useQuery(GET_STUDIOS, {
		variables: { input: { page: 1, limit: 1, sort: 'memberRank', direction: 'DESC', search: {} } },
	});
	const studio: Member | undefined = studioData?.getStudios?.list?.[0];
	const packageCount = studio?.memberPackages ?? 0;

	const { data: packagesData, loading: packagesLoading } = useQuery(GET_PACKAGES, {
		variables: {
			input: { page: 1, limit: RECENT_PACKAGES, sort: 'createdAt', direction: 'DESC', search: { memberId: studio?._id } },
		},
		skip: !studio?._id || packageCount === 0,
	});
	const packages: Package[] = packagesData?.getPackages?.list ?? [];

	if (studioLoading) {
		return (
			<section className={'studio-spotlight'} aria-busy="true" aria-label="Loading studio spotlight">
				<div className={'spotlight-portrait'}>
					<Skeleton variant="rectangular" className={'skeleton arch-skeleton'} />
				</div>
				<div className={'spotlight-body'}>
					<Skeleton width="40%" />
					<Skeleton width="60%" height={64} />
					<Skeleton width="80%" />
				</div>
			</section>
		);
	}
	if (!studio) return null;

	const name = studioName(studio);
	const href = studioHref(studio);
	const image = studioImage(studio);
	const location = studioLocation(studio.memberAddress);
	const likes = studio.memberLikes ?? 0;
	const stats = [studioStats(studio), likes > 0 && plural(likes, 'like')].filter(Boolean).join(' · ');

	return (
		<section className={'studio-spotlight'} aria-labelledby="spotlight-name">
			<div className={'spotlight-portrait'}>
				<div className={'arch-frame'}>
					<Link href={href} className={'arch-media'} tabIndex={-1} aria-hidden="true">
						{image ? <img src={image} alt="" /> : <span className={'arch-initial'}>{name.charAt(0)}</span>}
					</Link>
				</div>
			</div>

			<div className={'spotlight-body'}>
				<p className={'spotlight-label'}>
					Studio spotlight{location ? ` · ${location}` : ''}
				</p>
				<h2 id="spotlight-name" className={'spotlight-name'}>
					{name}
				</h2>
				{studio.memberDesc && <p className={'spotlight-desc'}>{studio.memberDesc}</p>}
				{stats && <p className={'spotlight-stats'}>{stats}</p>}

				{packageCount > 0 && (
					<div className={'spotlight-packages'}>
						<p className={'mini-label'}>Recent packages</p>
						<ul className={'mini-grid'}>
							{packagesLoading && packages.length === 0
								? Array.from({ length: Math.min(packageCount, RECENT_PACKAGES) }).map((_, i) => (
										<li key={i}>
											<Skeleton variant="rectangular" className={'skeleton mini-media'} />
										</li>
								  ))
								: packages.map((pkg) => {
										const thumb = packageImage(pkg);
										return (
											<li key={pkg._id}>
												<Link href={packageDetailHref(pkg)} className={'mini-link'}>
													<span className={'mini-media'}>
														{thumb ? <img src={thumb} alt="" loading="lazy" /> : <span className={'img-placeholder'} />}
													</span>
													<span className={'mini-title'}>{pkg.packageTitle}</span>
												</Link>
											</li>
										);
								  })}
						</ul>
					</div>
				)}

				<Link href={href} className={'button-primary'}>
					View studio
				</Link>
			</div>
		</section>
	);
};

export default StudioSpotlight;
