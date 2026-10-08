import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Drawer } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import MyHeader from '../../libs/components/mypage/MyHeader';
import NextShoot from '../../libs/components/mypage/NextShoot';
import MyOverview from '../../libs/components/mypage/MyOverview';
import MyPackages from '../../libs/components/mypage/MyPackages';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import MyReservations from '../../libs/components/mypage/MyReservations';
import AddPackage from '../../libs/components/mypage/AddNewPackage';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MyFollowList from '../../libs/components/mypage/MyFollowList';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { GET_FAVORITES, GET_MEMBER, GET_MY_RESERVATIONS, GET_STUDIO_PACKAGES, GET_STUDIO_RESERVATIONS } from '../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { MemberType } from '../../libs/enums/member.enum';
import { Member } from '../../libs/types/member/member';
import { Messages } from '../../libs/config';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

interface Tab {
	category: string;
	label: string;
	count?: number;
}

const MyPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const device = useDeviceDetect();
	const isStudio = user?.memberType === MemberType.STUDIO;
	const isAdmin = user?.memberType === MemberType.ADMIN;
	const requested: string = (router.query?.category as string) ?? 'overview';
	// studio-only sections fall back to the overview for other accounts
	const category = !isStudio && ['myPackages', 'addPackage'].includes(requested) ? 'overview' : requested;
	// Following / Followers open as a side panel over the overview (old ?category= links still work)
	const followMode = category === 'followings' || category === 'followers' ? category : null;
	const view = followMode ? 'overview' : category;

	/** APOLLO REQUESTS **/

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	// your own member record: member since, follow counts and photo
	const { data: memberData } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: user?._id },
		skip: !user?._id,
	});
	const member: Member | undefined = memberData?.getMember;

	// counts for the header and the tabs; the first three liked packages also give the header its prints
	const { data: savedData, refetch: savedRefetch } = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 3 } },
		skip: !user?._id || isStudio || isAdmin,
	});
	const { data: ownData } = useQuery(GET_STUDIO_PACKAGES, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 3, sort: 'createdAt', direction: 'DESC', search: { packageStatus: 'ACTIVE' } } },
		skip: !user?._id || !isStudio,
	});
	const prints: string[] = ((isStudio ? ownData?.getStudioPackages?.list : savedData?.getFavorites?.list) ?? [])
		.map((pkg: any) => pkg?.packageImages?.[0])
		.filter(Boolean);
	const { data: resData, refetch: resRefetch } = useQuery(isStudio ? GET_STUDIO_RESERVATIONS : GET_MY_RESERVATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1, search: {} } },
		skip: !user?._id || isAdmin,
	});
	const savedTotal: number = savedData?.getFavorites?.metaCounter?.[0]?.total ?? 0;
	const reservationTotal: number =
		(isStudio ? resData?.getStudioReservations : resData?.getMyReservations)?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/

	// only members have a My Page: without a login, go to login and come back here
	// (after the router is ready: Next fills in the query first, which would cancel an earlier redirect)
	useEffect(() => {
		if (!router.isReady || getJwtToken()) return;
		router.replace(`/account/join?referrer=${encodeURIComponent(router.asPath)}`).then();
	}, [router.isReady, router]);

	/** HANDLERS **/

	const refreshCounts = () => {
		if (!isStudio && !isAdmin) savedRefetch();
		if (!isAdmin) resRefetch();
	};

	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Following', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Unfollowed', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	/** TABS: the same ?category= values as before, so existing links keep working **/

	const tabs: Tab[] = [
		{ category: 'overview', label: 'Overview' },
		...(isStudio
			? [
					{ category: 'myReservations', label: 'Requests', count: reservationTotal },
					{ category: 'myPackages', label: 'My packages', count: member?.memberPackages },
					{ category: 'addPackage', label: 'Add package' },
			  ]
			: isAdmin
			? []
			: [
					{ category: 'myReservations', label: 'Reservations', count: reservationTotal },
					{ category: 'myFavorites', label: 'Liked', count: savedTotal },
					{ category: 'recentlyVisited', label: 'Recently viewed' },
			  ]),
		{ category: 'myArticles', label: 'My posts', count: member?.memberArticles },
		{ category: 'myProfile', label: 'Profile' },
	];
	const activeTab = view === 'writeArticle' ? 'myArticles' : view;
	const closePanel = () => router.push({ pathname: '/mypage' }, undefined, { scroll: false });
	const openPanel = (mode: string) => router.replace({ pathname: '/mypage', query: { category: mode } }, undefined, { scroll: false });

	if (!user?._id) {
		return <div id="my-page" className={'detail-page my-page'} aria-busy="true" />;
	}

	return (
		<div id="my-page" className={'detail-page my-page'}>
			<div className={'container'}>
				<MyHeader
					member={member}
					user={user}
					isStudio={isStudio}
					savedTotal={savedTotal}
					reservationTotal={reservationTotal}
					prints={prints}
					onOpenFollows={openPanel}
				/>

				<nav className={'my-tabs'} aria-label="My Page">
					{tabs.map((tab) => (
						<Link
							key={tab.category}
							href={{ pathname: '/mypage', query: { category: tab.category } }}
							className={`my-tab ${activeTab === tab.category ? 'active' : ''}`}
							aria-current={activeTab === tab.category ? 'page' : undefined}
							scroll={false}
						>
							{tab.label}
							{(tab.count ?? 0) > 0 && <span className={'tab-count'}>{tab.count}</span>}
						</Link>
					))}
				</nav>

				<div className={'my-panel'}>
					{view === 'overview' && (
						<>
							{!isAdmin && <NextShoot isStudio={isStudio} onChanged={refreshCounts} />}
							<MyOverview user={user} isStudio={isStudio} onChanged={refreshCounts} />
						</>
					)}
					{view === 'myReservations' && <MyReservations />}
					{view === 'myFavorites' && <MyFavorites />}
					{view === 'recentlyVisited' && <RecentlyVisited />}
					{view === 'addPackage' && <AddPackage />}
					{view === 'myPackages' && <MyPackages />}
					{view === 'myArticles' && <MyArticles />}
					{view === 'writeArticle' && <WriteArticle />}
					{view === 'myProfile' && <MyProfile />}
				</div>
			</div>

			<Drawer
				anchor={device === 'mobile' ? 'bottom' : 'right'}
				open={Boolean(followMode)}
				onClose={closePanel}
				classes={{ paper: `filter-panel follow-panel ${device === 'mobile' ? 'full' : ''}` }}
				PaperProps={{ role: 'dialog', 'aria-labelledby': 'follow-panel-title' } as any}
			>
				<header className={'panel-head'}>
					<h2 id="follow-panel-title" className={'panel-title'}>
						{followMode === 'followers' ? 'Followers' : 'Following'}
					</h2>
					<button type="button" className={'icon-btn'} aria-label="Close" onClick={closePanel}>
						<CloseRoundedIcon />
					</button>
				</header>
				<div className={'panel-body'}>
					<div className={'follow-switch'} role="group" aria-label="Show">
						{[
							{ mode: 'followings', label: 'Following', count: member?.memberFollowings ?? 0 },
							{ mode: 'followers', label: 'Followers', count: member?.memberFollowers ?? 0 },
						].map((item) => (
							<button
								type="button"
								key={item.mode}
								className={followMode === item.mode ? 'active' : ''}
								aria-pressed={followMode === item.mode}
								onClick={() => openPanel(item.mode)}
							>
								{item.label}
								{item.count > 0 && <span className={'tab-count'}>{item.count}</span>}
							</button>
						))}
					</div>
					{followMode && (
						<MyFollowList
							key={followMode}
							mode={followMode}
							inPanel
							subscribeHandler={subscribeHandler}
							unsubscribeHandler={unsubscribeHandler}
						/>
					)}
				</div>
			</Drawer>
		</div>
	);
};

export default withLayoutFull(MyPage);
