import React, { useRef, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Drawer, Skeleton } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import PopularPackageCard from '../../libs/components/homepage/PopularPackageCard';
import { FilterTabs } from '../../libs/components/homepage/HomeSection';
import StudioCard from '../../libs/components/studio/StudioCard';
import StudioTiers, { TierFilter } from '../../libs/components/studio/detail/StudioTiers';
import PortfolioWall from '../../libs/components/studio/detail/PortfolioWall';
import CommentsSection from '../../libs/components/common/CommentsSection';
import MyFollowList from '../../libs/components/mypage/MyFollowList';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { SortMenu, SortOption } from '../../libs/components/common/ListControls';
import {
	plural,
	studioImage,
	studioLocation,
	studioName,
} from '../../libs/components/studio/studioSearch';
import { Member } from '../../libs/types/member/member';
import { Package } from '../../libs/types/package/package';
import { T } from '../../libs/types/common';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PackageType } from '../../libs/enums/package.enum';
import { prettyEnum } from '../../libs/utils';
import { userVar } from '../../apollo/store';
import { GET_MEMBER, GET_PACKAGES, GET_STUDIOS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER, LIKE_TARGET_PACKAGE, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PAGE_STEP = 6;
const ALL_PACKAGES = 100;
const MORE_STUDIOS = 4;

const packageSorts: SortOption[] = [
	{ id: 'newest', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'price-asc', label: 'Price low to high', sort: 'packagePrice', direction: Direction.ASC },
	{ id: 'liked', label: 'Most liked', sort: 'packageLikes', direction: Direction.DESC },
];

const tierTabs: { value: TierFilter; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	...Object.values(PackageType).map((value) => ({ value, label: prettyEnum(value) })),
];

/** the city is the last part of the address: "35, Gunam-ro, Haeundae-gu, Busan" -> "Busan" **/
const cityOf = (studio?: Member) => studio?.memberAddress?.split(',').pop()?.trim().toLowerCase() ?? '';

const StudioDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const reduceMotion = useReducedMotion();
	const device = useDeviceDetect();
	const studioId = typeof router.query.studioId === 'string' ? router.query.studioId : '';
	const [tier, setTier] = useState<TierFilter>('ALL');
	const [sort, setSort] = useState<SortOption>(packageSorts[0]);
	const [visible, setVisible] = useState<number>(PAGE_STEP);
	const [followersOpen, setFollowersOpen] = useState<boolean>(false);
	const packagesRef = useRef<HTMLElement>(null);

	/** APOLLO REQUESTS **/

	const [likeTargetPackage] = useMutation(LIKE_TARGET_PACKAGE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	// getMember also records the view on the backend
	const {
		data: memberData,
		loading: memberLoading,
		error: memberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: studioId },
		skip: !studioId,
		notifyOnNetworkStatusChange: true,
	});
	const studio: Member | undefined = memberData?.getMember;

	// every package of this studio at once: the tier cards, filters, sort and portfolio all read this list
	const {
		data: packagesData,
		loading: packagesLoading,
		refetch: getPackagesRefetch,
	} = useQuery(GET_PACKAGES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: ALL_PACKAGES, sort: 'createdAt', direction: Direction.DESC, search: { memberId: studioId } },
		},
		skip: !studioId,
	});
	const packages: Package[] = packagesData?.getPackages?.list ?? [];

	// studios in the same city (no city filter on the backend: read the address of the top studios)
	const { data: studiosData, refetch: getStudiosRefetch } = useQuery(GET_STUDIOS, {
		variables: { input: { page: 1, limit: 50, sort: 'memberRank', direction: Direction.DESC, search: {} } },
		skip: !studio,
	});
	const sameCity: Member[] = (studiosData?.getStudios?.list ?? [])
		.filter((item: Member) => item._id !== studio?._id && cityOf(item) && cityOf(item) === cityOf(studio))
		.slice(0, MORE_STUDIOS);

	/** HANDLERS **/

	const requireLogin = () => {
		if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
	};

	const followHandler = async () => {
		try {
			requireLogin();
			const following = Boolean(studio?.meFollowed?.[0]?.myFollowing);
			if (following) await unsubscribe({ variables: { input: studioId } });
			else await subscribe({ variables: { input: studioId } });
			await getMemberRefetch({ input: studioId });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// Follow / Following on a row of the followers panel
	const toggleFollowHandler = (follow: boolean) => async (id: string, refetch: any, query: any) => {
		try {
			requireLogin();
			if (follow) await subscribe({ variables: { input: id } });
			else await unsubscribe({ variables: { input: id } });
			await refetch({ input: query });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const likeStudioHandler = async (likeUser: T, id: string) => {
		try {
			if (!id) return;
			if (!likeUser?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetMember({ variables: { input: id } });
			if (id === studioId) await getMemberRefetch({ input: studioId });
			else await getStudiosRefetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const likePackageHandler = async (likeUser: T, id: string) => {
		try {
			if (!id) return;
			if (!likeUser?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetPackage({ variables: { input: id } });
			await getPackagesRefetch();
		} catch (err: any) {
			console.log('Error:likePackageHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const selectTier = (next: TierFilter, scroll = false) => {
		setTier(next);
		setVisible(PAGE_STEP);
		if (scroll) packagesRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
	};

	/** STATES **/

	const notFound = router.isReady && (!studioId || Boolean(memberError) || (!memberLoading && !studio));

	if (notFound) {
		return (
			<div id="studio-detail-page" className={'detail-page studio-detail'}>
				<div className={'container'}>
					<div className={'empty-box detail-missing'}>
						<p>Studio not found.</p>
						<Link href={'/studio'} className={'button-primary'}>
							Back to studios
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!studio) {
		return (
			<div id="studio-detail-page" className={'detail-page studio-detail'} aria-busy="true" aria-label="Loading studio">
				<div className={'container'}>
					<Skeleton width={220} className={'crumb-skeleton'} />
					<div className={'studio-hero'}>
						<Skeleton variant="rectangular" className={'skeleton arch-skeleton'} />
						<div className={'hero-info'}>
							<Skeleton width="30%" />
							<Skeleton width="60%" height={80} />
							<Skeleton width="45%" />
						</div>
					</div>
					<Skeleton variant="rectangular" className={'skeleton tiers-skeleton'} />
				</div>
			</div>
		);
	}

	const name = studioName(studio);
	const image = studioImage(studio);
	const location = studioLocation(studio.memberAddress);
	const city = studio.memberAddress?.split(',').pop()?.trim() ?? '';
	const likes = studio.memberLikes ?? 0;
	// the follower count opens the followers panel, so it sits next to the Follow button, not in the stats
	const packageCount = studio.memberPackages ?? 0;
	const followerCount = studio.memberFollowers ?? 0;
	const isSelf = Boolean(user?._id) && user._id === studio._id;
	const stats = [
		packageCount > 0 && plural(packageCount, 'package'),
		likes > 0 && plural(likes, 'like'),
	]
		.filter(Boolean)
		.join(' · ');
	const following = Boolean(studio.meFollowed?.[0]?.myFollowing);
	const liked = Boolean(studio.meLiked?.[0]?.myFavorite);
	const hasPackages = packages.length > 0;

	const shown = packages
		.filter((pkg) => tier === 'ALL' || pkg.packageType === tier)
		.slice()
		.sort((a: any, b: any) => {
			const key = sort.sort;
			const av = key === 'createdAt' ? new Date(a[key]).getTime() : a[key] ?? 0;
			const bv = key === 'createdAt' ? new Date(b[key]).getTime() : b[key] ?? 0;
			return sort.direction === Direction.ASC ? av - bv : bv - av;
		});

	return (
		<div id="studio-detail-page" className={'detail-page studio-detail'}>
			<div className={'container'}>
				<nav className={'breadcrumb'} aria-label="Breadcrumb">
					<ol>
						<li>
							<Link href={'/studio'}>Studios</Link>
						</li>
						{city && <li>{city}</li>}
						<li aria-current="page">{name}</li>
					</ol>
				</nav>

				<header className={'studio-hero'}>
					<div className={'hero-portrait'}>
						{image ? (
							<img src={image} alt={`${name} studio`} />
						) : (
							<span className={'arch-initial'} aria-hidden="true">
								{name.charAt(0)}
							</span>
						)}
					</div>
					<div className={'hero-info'}>
						{location && <p className={'hero-location'}>{location}</p>}
						<h1 className={'hero-name'}>{name}</h1>
						{studio.memberDesc && <p className={'hero-desc'}>{studio.memberDesc}</p>}
						{stats && <p className={'hero-stats'}>{stats}</p>}
						{(!isSelf || followerCount > 0) && (
							<div className={'hero-actions'}>
								{!isSelf && (
									<>
										<button
											type="button"
											className={following ? 'button-secondary following' : 'button-primary'}
											aria-pressed={following}
											onClick={followHandler}
										>
											{following ? 'Following' : 'Follow'}
										</button>
										<button
											type="button"
											className={`icon-action ${liked ? 'liked' : ''}`}
											aria-label={liked ? `Unlike ${name}` : `Like ${name}`}
											aria-pressed={liked}
											onClick={() => likeStudioHandler(user, studio._id)}
										>
											{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
											{likes > 0 && <span className={'action-count'}>{likes}</span>}
										</button>
									</>
								)}
								{followerCount > 0 && (
									<button type="button" className={'followers-btn'} aria-haspopup="dialog" onClick={() => setFollowersOpen(true)}>
										<strong>{followerCount}</strong> {followerCount === 1 ? 'follower' : 'followers'}
									</button>
								)}
							</div>
						)}
					</div>
				</header>

				{packagesLoading && !hasPackages ? (
					<Skeleton variant="rectangular" className={'skeleton tiers-skeleton'} />
				) : !hasPackages ? (
					<div className={'empty-box studio-no-packages'}>
						<p>{name} hasn&apos;t published any packages yet.</p>
						<Link href={'/studio'} className={'button-secondary'}>
							Back to studios
						</Link>
					</div>
				) : (
					<>
						<section className={'detail-section tiers-section'} aria-labelledby="tiers-title">
							<h2 id="tiers-title" className={'detail-title'}>
								Packages by tier
							</h2>
							<StudioTiers packages={packages} active={tier} onSelect={(next) => selectTier(next, true)} />
						</section>

						<section className={'detail-section'} ref={packagesRef} aria-labelledby="packages-title">
							<div className={'section-row'}>
								<h2 id="packages-title" className={'detail-title'}>
									Packages ({shown.length})
								</h2>
								<div className={'section-tools'}>
									<FilterTabs label="Filter by tier" options={tierTabs} value={tier} onChange={(next) => selectTier(next)} />
									<SortMenu
										options={packageSorts}
										sort={sort.sort}
										direction={sort.direction}
										onSort={(nextSort, nextDirection) => {
											setSort(packageSorts.find((o) => o.sort === nextSort && o.direction === nextDirection) ?? packageSorts[0]);
											setVisible(PAGE_STEP);
										}}
									/>
								</div>
							</div>
							{shown.length === 0 ? (
								<p className={'comment-empty'}>No {prettyEnum(tier as string)} packages from this studio.</p>
							) : (
								<ul className={'studio-package-grid'}>
									{shown.slice(0, visible).map((pkg) => (
										<li key={pkg._id}>
											<PopularPackageCard pkg={pkg} likePackageHandler={likePackageHandler} />
										</li>
									))}
								</ul>
							)}
							{shown.length > visible && (
								<div className={'show-more'}>
									<button type="button" className={'button-secondary'} onClick={() => setVisible(visible + PAGE_STEP)}>
										Show more ({shown.length - visible})
									</button>
								</div>
							)}
						</section>

						<PortfolioWall packages={packages} studioName={name} />
					</>
				)}

				<CommentsSection
					refId={studio._id}
					group={CommentGroup.MEMBER}
					user={user}
					formNote={isSelf ? 'This is your studio, so you can read comments here but not post them.' : undefined}
				/>

				{sameCity.length > 0 && (
					<section className={'detail-section similar'} aria-labelledby="more-studios-title">
						<h2 id="more-studios-title" className={'detail-title'}>
							More studios in {city}
						</h2>
						<ul className={'more-studios'}>
							{sameCity.map((item) => (
								<li key={item._id}>
									<StudioCard studio={item} likeMemberHandler={likeStudioHandler} />
								</li>
							))}
						</ul>
					</section>
				)}
			</div>

			<Drawer
				anchor={device === 'mobile' ? 'bottom' : 'right'}
				open={followersOpen}
				onClose={() => setFollowersOpen(false)}
				classes={{ paper: `filter-panel follow-panel ${device === 'mobile' ? 'full' : ''}` }}
				PaperProps={{ role: 'dialog', 'aria-labelledby': 'studio-followers-title' } as any}
			>
				<header className={'panel-head'}>
					<h2 id="studio-followers-title" className={'panel-title'}>
						Followers of {name}
					</h2>
					<button type="button" className={'icon-btn'} aria-label="Close" onClick={() => setFollowersOpen(false)}>
						<CloseRoundedIcon />
					</button>
				</header>
				<div className={'panel-body'}>
					{followersOpen && (
						<MyFollowList
							mode={'followers'}
							memberId={studio._id}
							inPanel
							subscribeHandler={toggleFollowHandler(true)}
							unsubscribeHandler={toggleFollowHandler(false)}
						/>
					)}
				</div>
			</Drawer>
		</div>
	);
};

export default withLayoutFull(StudioDetail);
