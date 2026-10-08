import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticle } from '../../types/board-article/board-article';
import { Direction } from '../../enums/common.enum';
import CommunityCard from '../homepage/CommunityCard';
import { ResultsPagination } from '../common/ListControls';

const PAGE_SIZE = 6;

/** your community posts, newest first, with "Write a post" **/
const MyArticles = () => {
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState<number>(1);

	/** APOLLO REQUESTS **/

	const { data, loading } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: { page, limit: PAGE_SIZE, sort: 'createdAt', direction: Direction.DESC, search: { memberId: user?._id } },
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});
	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];
	const total: number = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
	const writeHref = { pathname: '/mypage', query: { category: 'writeArticle' } };

	return (
		<section className={'my-section'} aria-labelledby="posts-title">
			<div className={'section-row'}>
				<div>
					<h2 id="posts-title" className={'detail-title'}>
						My posts
					</h2>
					<p className={'section-note'}>Your posts in the community.</p>
				</div>
				{articles.length > 0 && (
					<Link href={writeHref} className={'button-secondary'}>
						Write a post
					</Link>
				)}
			</div>
			{loading && articles.length === 0 ? (
				<div className={'my-grid three'} aria-busy="true">
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} variant="rectangular" className={'skeleton res-skeleton'} />
					))}
				</div>
			) : articles.length === 0 ? (
				<div className={'empty-box my-empty'}>
					<p>You haven&apos;t written any posts yet.</p>
					<Link href={writeHref} className={'button-primary'}>
						Write a post
					</Link>
				</div>
			) : (
				<ul className={'my-grid three'}>
					{articles.map((article) => (
						<li key={article._id}>
							<CommunityCard article={article} />
						</li>
					))}
				</ul>
			)}
			{total > PAGE_SIZE && <ResultsPagination page={page} limit={PAGE_SIZE} total={total} onPage={setPage} noun="posts" />}
		</section>
	);
};

export default MyArticles;
