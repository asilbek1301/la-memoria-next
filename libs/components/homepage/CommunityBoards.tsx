import React from 'react';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import HomeSection, { EmptyState, ViewAllLink } from './HomeSection';

const articlesInput = {
	page: 1,
	limit: 3,
	sort: 'articleViews',
	direction: 'DESC',
	search: {},
};

const CommunityBoards = () => {
	/** APOLLO REQUESTS **/

	const { loading: getArticlesLoading, data: getArticlesData } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: articlesInput },
		notifyOnNetworkStatusChange: true,
	});
	const articles: BoardArticle[] = getArticlesData?.getBoardArticles?.list ?? [];

	return (
		<HomeSection
			id="community"
			title="From the Community"
			aside={<ViewAllLink href={'/community?articleCategory=FREE'} label="Read all articles" />}
		>
			{getArticlesLoading && articles.length === 0 ? (
				<div className={'article-grid'} aria-busy="true" aria-label="Loading articles">
					{[0, 1, 2].map((i) => (
						<div key={i}>
							<Skeleton variant="rectangular" className={'skeleton wide'} />
							<Skeleton width="40%" />
							<Skeleton width="85%" />
						</div>
					))}
				</div>
			) : articles.length === 0 ? (
				<EmptyState
					message="No articles yet. Be the first to share your story."
					href="/community?articleCategory=FREE"
					linkLabel="Go to the community"
				/>
			) : (
				<div className={`article-grid ${articles.length === 1 ? 'single' : ''}`}>
					{articles.map((article: BoardArticle) => (
						<CommunityCard article={article} key={article?._id} />
					))}
				</div>
			)}
		</HomeSection>
	);
};

export default CommunityBoards;
