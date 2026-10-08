import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { Member } from '../../types/member/member';
import { Package } from '../../types/package/package';
import { GET_PACKAGES, GET_STUDIOS } from '../../../apollo/user/query';
import { packageDetailHref, packageImage } from '../homepage/TrendPackageCard';
import { plural, studioHref, studioImage, studioLocation, studioName } from './studioSearch';

const RECENT_PACKAGES = 3;
const CANDIDATES = 50;

type Lead = 'rank' | 'likes' | 'views' | 'followers';

// the order the spotlight is chosen by, and how each reason reads
const leads: { key: Lead; value: (studio: Member) => number; label: string; why: (name: string) => string }[] = [
	{
		key: 'rank',
		value: (studio) => studio.memberRank ?? 0,
		label: 'Top ranked studio',
		why: (name) => `${name} ranks first for packages, posts, likes and views. Rankings update every night.`,
	},
	{
		key: 'likes',
		value: (studio) => studio.memberLikes ?? 0,
		label: 'Most liked studio',
		why: (name) => `${name} has more likes than any other studio.`,
	},
	{
		key: 'views',
		value: (studio) => studio.memberViews ?? 0,
		label: 'Most viewed studio',
		why: (name) => `${name} has more profile views than any other studio.`,
	},
	{
		key: 'followers',
		value: (studio) => studio.memberFollowers ?? 0,
		label: 'Most followed studio',
		why: (name) => `${name} has more followers than any other studio.`,
	},
];

/** first by rank, ties broken by likes, views, then followers **/
const pickSpotlight = (studios: Member[]) => {
	const sorted = [...studios].sort((a, b) => {
		for (const lead of leads) {
			const diff = lead.value(b) - lead.value(a);
			if (diff !== 0) return diff;
		}
		return 0;
	});
	const studio = sorted[0];
	if (!studio) return { studio: undefined, lead: undefined };
	// the reason is the first number where this studio is ahead of every other studio
	const others = sorted.slice(1);
	const lead = leads.find((item) => item.value(studio) > 0 && others.every((other) => item.value(studio) > item.value(other)));
	return { studio, lead };
};

/** the leading studio, shown large above the grid with the reason it leads (page 1 without a search only) **/
const StudioSpotlight = () => {
	/** APOLLO REQUESTS: the top studios (memberRank), then the leader's three newest packages **/
	const { data: studioData, loading: studioLoading } = useQuery(GET_STUDIOS, {
		variables: { input: { page: 1, limit: CANDIDATES, sort: 'memberRank', direction: 'DESC', search: {} } },
	});
	const { studio, lead } = pickSpotlight(studioData?.getStudios?.list ?? []);
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
	const followers = studio.memberFollowers ?? 0;
	const likes = studio.memberLikes ?? 0;
	const views = studio.memberViews ?? 0;
	// the number behind the reason is darker; views only show when they are the reason
	const stats = [
		{ key: 'packages', text: packageCount > 0 && plural(packageCount, 'package') },
		{ key: 'followers', text: followers > 0 && plural(followers, 'follower') },
		{ key: 'likes', text: likes > 0 && plural(likes, 'like') },
		{ key: 'views', text: lead?.key === 'views' && plural(views, 'view') },
	].filter((stat) => stat.text);

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
					{lead ? lead.label : 'Studio spotlight'}
					{location ? ` · ${location}` : ''}
				</p>
				<h2 id="spotlight-name" className={'spotlight-name'}>
					{name}
				</h2>
				{lead && <p className={'spotlight-why'}>{lead.why(name)}</p>}
				{studio.memberDesc && <p className={'spotlight-desc'}>{studio.memberDesc}</p>}
				{stats.length > 0 && (
					<p className={'spotlight-stats'}>
						{stats.map((stat, index) => (
							<React.Fragment key={stat.key}>
								{index > 0 && ' · '}
								<span className={stat.key === lead?.key ? 'lead' : undefined}>{stat.text}</span>
							</React.Fragment>
						))}
					</p>
				)}

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
