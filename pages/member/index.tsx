import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Drawer, Skeleton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import CommunityCard from '../../libs/components/homepage/CommunityCard';
import MyFollowList from '../../libs/components/mypage/MyFollowList';
import { ResultsPagination } from '../../libs/components/common/ListControls';
import { memberPhoto, studioName } from '../../libs/components/studio/studioSearch';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLES, GET_MEMBER } from '../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Member } from '../../libs/types/member/member';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction } from '../../libs/enums/common.enum';
import { sweetErrorHandling } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PAGE_SIZE = 6; // posts per page
type Panel = 'followers' | 'followings' | null;

/** what kind of member this is, in plain words **/
const memberKind = (member: Member) => (member.memberType === MemberType.ADMIN ? 'La Memoria team' : 'Couple');

/** A couple's (or admin's) public profile: who they are, Follow, followers / following, and their community posts.
    The URL is /member?memberId=…; a studio opens its studio page and your own profile opens My Page.
    Older links with ?category=followers or followings open that list **/
const MemberProfile: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const memberId = typeof router.query.memberId === 'string' ? router.query.memberId : '';
	const [page, setPage] = useState<number>(1);
	const [panel, setPanel] = useState<Panel>(null);
	const [following, setFollowing] = useState<boolean>(false); // while Follow / Unfollow is being sent

	/** APOLLO REQUESTS **/

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	// getMember also records the view; a missing member shows this page's own message, so no popup
	const { data, loading, error, refetch } = useQuery(GET_MEMBER, {
		context: { quiet: true },
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
	});
	const member: Member | undefined = data?.getMember;

	const { data: postsData, loading: postsLoading } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page, limit: PAGE_SIZE, sort: 'createdAt', direction: Direction.DESC, search: { memberId } },
		},
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
	});
	const posts: BoardArticle[] = postsData?.getBoardArticles?.list ?? [];
	const postTotal: number = postsData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/

	// a studio has its own page, and your own profile is My Page
	useEffect(() => {
		if (!member) return;
		if (member.memberType === MemberType.STUDIO) router.replace({ pathname: '/studio/detail', query: { studioId: member._id } });
		else if (user?._id && member._id === user._id) router.replace('/mypage');
	}, [member, user?._id, router]);

	// older links: ?category=followers / followings opens that list
	useEffect(() => {
		const category = router.query.category;
		if (category === 'followers' || category === 'followings') setPanel(category);
	}, [router.query.category]);

	/** HANDLERS **/

	const loginHref = `/account/join?referrer=${encodeURIComponent(router.asPath)}`;

	// logged out: log in first, then come back here
	const followHandler = async () => {
		if (!member || following) return;
		if (!user?._id) return router.push(loginHref);
		setFollowing(true);
		try {
			const isFollowing = Boolean(member.meFollowed?.[0]?.myFollowing);
			if (isFollowing) await unsubscribe({ variables: { input: member._id } });
			else await subscribe({ variables: { input: member._id } });
			await refetch({ input: memberId });
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setFollowing(false);
		}
	};

	// Follow / Following on a row of the followers or following list
	const toggleFollowHandler = (follow: boolean) => async (id: string, listRefetch: any, query: any) => {
		try {
			if (!user?._id) return void router.push(loginHref);
			if (follow) await subscribe({ variables: { input: id } });
			else await unsubscribe({ variables: { input: id } });
			await Promise.all([listRefetch({ input: query }), refetch({ input: memberId })]);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	/** STATES **/

	const notFound =
		router.isReady && (!memberId || Boolean(error) || (!loading && !member) || member?.memberStatus === MemberStatus.BLOCK);

	if (notFound) {
		return (
			<div id="member-page" className={'detail-page member-profile'}>
				<div className={'container'}>
					<div className={'empty-box detail-missing'}>
						<p>This member doesn&apos;t exist or was removed.</p>
						<Link href={'/community'} className={'button-primary'}>
							Back to Community
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// also while a studio or your own profile is being sent on
	const leaving = member && (member.memberType === MemberType.STUDIO || member._id === user?._id);
	if (!member || leaving) {
		return (
			<div id="member-page" className={'detail-page member-profile'} aria-busy="true" aria-label="Loading profile">
				<div className={'container'}>
					<div className={'profile-head'}>
						<Skeleton variant="circular" className={'skeleton profile-photo-skeleton'} />
						<div className={'profile-info'}>
							<Skeleton width={90} />
							<Skeleton width="40%" height={56} />
							<Skeleton width={180} />
						</div>
					</div>
					<div className={'post-grid'}>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} variant="rectangular" className={'skeleton post-skeleton'} />
						))}
					</div>
				</div>
			</div>
		);
	}

	const name = studioName(member);
	const photo = memberPhoto(member.memberImage);
	const isFollowing = Boolean(member.meFollowed?.[0]?.myFollowing);
	const followers = member.memberFollowers ?? 0;
	const followings = member.memberFollowings ?? 0;
	const panelTitle = panel === 'followers' ? `Followers of ${name}` : `${name} follows`;

	return (
		<div id="member-page" className={'detail-page member-profile'}>
			<div className={'container'}>
				<header className={'profile-head'}>
					<div className={'profile-photo'}>
						{photo ? <img src={photo} alt={name} /> : <span aria-hidden="true">{name.charAt(0)}</span>}
					</div>
					<div className={'profile-info'}>
						<p className={'profile-kind'}>{memberKind(member)}</p>
						<h1 className={'profile-name'}>{name}</h1>
						<p className={'profile-since'}>Member since {moment(member.createdAt).format('MMMM YYYY')}</p>
						{member.memberDesc && <p className={'profile-desc'}>{member.memberDesc}</p>}
						<div className={'profile-actions'}>
							<button
								type="button"
								className={isFollowing ? 'button-secondary following' : 'button-primary'}
								aria-pressed={isFollowing}
								disabled={following}
								onClick={followHandler}
							>
								{isFollowing ? 'Following' : 'Follow'}
							</button>
							{followers > 0 && (
								<button type="button" className={'followers-btn'} aria-haspopup="dialog" onClick={() => setPanel('followers')}>
									<strong>{followers}</strong> {followers === 1 ? 'follower' : 'followers'}
								</button>
							)}
							{followings > 0 && (
								<button type="button" className={'followers-btn'} aria-haspopup="dialog" onClick={() => setPanel('followings')}>
									<strong>{followings}</strong> following
								</button>
							)}
						</div>
					</div>
				</header>

				<section className={'detail-section profile-posts'} aria-labelledby="posts-title">
					<h2 id="posts-title" className={'detail-title'}>
						Posts{postTotal > 0 ? ` (${postTotal})` : ''}
					</h2>
					{postsLoading && posts.length === 0 ? (
						<div className={'post-grid'} aria-busy="true">
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} variant="rectangular" className={'skeleton post-skeleton'} />
							))}
						</div>
					) : posts.length === 0 ? (
						<div className={'empty-box'}>
							<p>{name} hasn&apos;t posted yet.</p>
							<Link href={'/community'} className={'button-secondary'}>
								Go to Community
							</Link>
						</div>
					) : (
						<ul className={'post-grid'}>
							{posts.map((post) => (
								<li key={post._id}>
									<CommunityCard article={post} />
								</li>
							))}
						</ul>
					)}
					{postTotal > PAGE_SIZE && (
						<ResultsPagination page={page} limit={PAGE_SIZE} total={postTotal} onPage={setPage} noun="posts" />
					)}
				</section>
			</div>

			<Drawer
				anchor={device === 'mobile' ? 'bottom' : 'right'}
				open={Boolean(panel)}
				onClose={() => setPanel(null)}
				classes={{ paper: `filter-panel follow-panel ${device === 'mobile' ? 'full' : ''}` }}
				PaperProps={{ role: 'dialog', 'aria-labelledby': 'member-follow-title' } as any}
			>
				<header className={'panel-head'}>
					<h2 id="member-follow-title" className={'panel-title'}>
						{panelTitle}
					</h2>
					<button type="button" className={'icon-btn'} aria-label="Close" onClick={() => setPanel(null)}>
						<CloseRoundedIcon />
					</button>
				</header>
				<div className={'panel-body'}>
					{panel && (
						<MyFollowList
							key={panel}
							mode={panel}
							memberId={member._id}
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

export default withLayoutFull(MemberProfile);
