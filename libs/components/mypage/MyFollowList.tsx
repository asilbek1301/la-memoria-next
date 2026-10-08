import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Skeleton } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { Member } from '../../types/member/member';
import { MemberType } from '../../enums/member.enum';
import { ResultsPagination } from '../common/ListControls';
import { memberPhoto, plural, studioLocation, studioName } from '../studio/studioSearch';

const PAGE_SIZE = 8;

interface MyFollowListProps {
	mode: 'followers' | 'followings';
	/** whose list to show; defaults to you (a studio page passes the studio) */
	memberId?: string;
	/** the page's handlers: (memberId, refetch, query) */
	subscribeHandler: (id: string, refetch: any, query: any) => Promise<void>;
	unsubscribeHandler: (id: string, refetch: any, query: any) => Promise<void>;
	/** inside the side panel: the panel shows the title, so the list leaves it out */
	inPanel?: boolean;
}

const profileHref = (member: Member) =>
	member?.memberType === MemberType.STUDIO
		? { pathname: '/studio/detail', query: { studioId: member._id } }
		: { pathname: '/member', query: { memberId: member?._id } };

/** people you follow, or who follow you: avatar, name, counts and Follow / Following **/
const MyFollowList = (props: MyFollowListProps) => {
	const { mode, subscribeHandler, unsubscribeHandler, inPanel } = props;
	const user = useReactiveVar(userVar);
	const ownerId = props.memberId ?? user?._id;
	const [page, setPage] = useState<number>(1);
	const isFollowers = mode === 'followers';
	const input = {
		page,
		limit: PAGE_SIZE,
		search: isFollowers ? { followingId: ownerId } : { followerId: ownerId },
	};

	/** APOLLO REQUESTS **/

	const { data, loading, refetch } = useQuery(isFollowers ? GET_MEMBER_FOLLOWERS : GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input },
		skip: !ownerId,
		notifyOnNetworkStatusChange: true,
	});
	const result = isFollowers ? data?.getMemberFollowers : data?.getMemberFollowings;
	const list: any[] = result?.list ?? [];
	const total: number = result?.metaCounter?.[0]?.total ?? 0;

	return (
		<section className={'my-section follow-section'} aria-label={isFollowers ? 'Followers' : 'Following'}>
			<div className={'section-row'} hidden={inPanel}>
				<div>
					<h2 className={'detail-title'}>
						{isFollowers ? 'Followers' : 'Following'}
					</h2>
					<p className={'section-note'}>
						{isFollowers ? 'People and studios who follow you.' : 'Studios and people you follow.'}
					</p>
				</div>
			</div>

			{loading && list.length === 0 ? (
				<div className={'follow-list'} aria-busy="true">
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} variant="rectangular" className={'skeleton follow-skeleton'} />
					))}
				</div>
			) : list.length === 0 ? (
				<div className={'empty-box my-empty'}>
					<p>{isFollowers ? 'No followers yet.' : 'You are not following anyone yet.'}</p>
					{!isFollowers && (
						<Link href={'/studio'} className={'button-primary'}>
							Meet the studios
						</Link>
					)}
				</div>
			) : (
				<ul className={'follow-list'}>
					{list.map((item) => {
						const person: Member = isFollowers ? item.followerData : item.followingData;
						if (!person) return null;
						const following = Boolean(item?.meFollowed?.[0]?.myFollowing);
						const name = studioName(person);
						const image = memberPhoto(person.memberImage);
						const location = person.memberType === MemberType.STUDIO ? studioLocation(person.memberAddress) : '';
						const counts = [
							(person.memberPackages ?? 0) > 0 && plural(person.memberPackages, 'package'),
							(person.memberFollowers ?? 0) > 0 && plural(person.memberFollowers ?? 0, 'follower'),
						]
							.filter(Boolean)
							.join(' · ');
						const isSelf = person._id === user?._id;
						return (
							<li className={'follow-row'} key={item._id}>
								<Link href={profileHref(person)} className={'follow-avatar'} tabIndex={-1} aria-hidden="true">
									{image ? <img src={image} alt="" loading="lazy" /> : <span>{name.charAt(0)}</span>}
								</Link>
								<div className={'follow-info'}>
									<Link href={profileHref(person)} className={'follow-name'}>
										{name}
									</Link>
									{(location || counts) && <p className={'follow-meta'}>{[location, counts].filter(Boolean).join(' · ')}</p>}
								</div>
								{!isSelf && (
									<button
										type="button"
										className={`follow-toggle ${following ? 'following' : ''}`}
										aria-pressed={following}
										aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
										onClick={() =>
											following
												? unsubscribeHandler(person._id, refetch, input)
												: subscribeHandler(person._id, refetch, input)
										}
									>
										{following && <CheckRoundedIcon aria-hidden="true" />}
										{following ? 'Following' : 'Follow'}
									</button>
								)}
							</li>
						);
					})}
				</ul>
			)}

			{total > PAGE_SIZE && (
				<ResultsPagination page={page} limit={PAGE_SIZE} total={total} onPage={setPage} noun={isFollowers ? 'followers' : 'people'} />
			)}
		</section>
	);
};

export default MyFollowList;
