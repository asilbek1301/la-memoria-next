import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { REACT_APP_API_URL } from '../../config';
import { plural, studioName } from '../studio/studioSearch';
import { articleExcerpt, articleHref, categoryLabel } from './communitySearch';
import { ArticleAuthor, ArticleCounts } from './ArticleBits';

const MOST_READ = 5;
// below this many posts the front page would only repeat the grid
const MIN_POSTS = 4;

const frontInput = (sort: string, limit: number, category?: BoardArticleCategory) => ({
	page: 1,
	limit,
	sort,
	direction: Direction.DESC,
	search: category ? { articleCategory: category } : {},
});

/** first page only: the most-liked post as a lead story, and the five most-read posts **/
const CommunityFront = ({ category }: { category?: BoardArticleCategory }) => {
	/** APOLLO REQUESTS **/
	const lead = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: frontInput('articleLikes', 1, category) },
	});
	const read = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: frontInput('articleViews', MOST_READ, category) },
	});

	const story: BoardArticle | undefined = lead.data?.getBoardArticles?.list?.[0];
	const mostRead: BoardArticle[] = read.data?.getBoardArticles?.list ?? [];
	const total: number = lead.data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	if ((lead.loading && !lead.data) || (read.loading && !read.data)) {
		return (
			<section className={'community-front'} aria-busy="true" aria-label="Loading top posts">
				<div className={'front-lead'}>
					<Skeleton variant="rectangular" className={'skeleton wide'} />
					<div className={'lead-body'}>
						<Skeleton width="30%" />
						<Skeleton width="90%" height={44} />
						<Skeleton width="70%" />
					</div>
				</div>
				<div className={'front-read'}>
					<Skeleton width="40%" />
					{Array.from({ length: MOST_READ }).map((_, i) => (
						<Skeleton key={i} width="100%" height={56} />
					))}
				</div>
			</section>
		);
	}
	if (!story || total < MIN_POSTS) return null;

	const image = story.articleImage ? `${REACT_APP_API_URL}/${story.articleImage}` : '';
	const href = articleHref(story);
	const text = articleExcerpt(story.articleContent);
	const label = categoryLabel(story.articleCategory);

	return (
		<section className={'community-front'} aria-label="Top posts">
			<article className={'front-lead'}>
				<Link href={href} className={`lead-media ${image ? '' : 'no-image'}`} tabIndex={-1} aria-hidden="true">
					{image ? <img src={image} alt="" /> : <span className={'img-placeholder category'}>{label}</span>}
				</Link>
				<div className={'lead-body'}>
					<p className={'lead-category'}>{label}</p>
					<h2 className={'lead-title'}>
						<Link href={href}>{story.articleTitle}</Link>
					</h2>
					{text && <p className={'lead-excerpt'}>{text}</p>}
					<div className={'lead-foot'}>
						<ArticleAuthor article={story} withDate />
						<ArticleCounts article={story} />
					</div>
				</div>
			</article>

			{mostRead.length > 0 && (
				<aside className={'front-read'} aria-labelledby="most-read-title">
					<h2 id="most-read-title" className={'read-title'}>
						Most read
					</h2>
					<ol className={'read-list'}>
						{mostRead.map((article, index) => {
							const comments = article.articleComments ?? 0;
							const author = article.memberData ? studioName(article.memberData) : '';
							return (
								<li key={article._id} className={'read-item'}>
									<span className={'read-number'} aria-hidden="true">
										{index + 1}
									</span>
									<div className={'read-text'}>
										<Link href={articleHref(article)} className={'read-link'}>
											{article.articleTitle}
										</Link>
										<p className={'read-meta'}>
											{[author, comments > 0 && plural(comments, 'comment')].filter(Boolean).join(' · ')}
										</p>
									</div>
								</li>
							);
						})}
					</ol>
				</aside>
			)}
		</section>
	);
};

export default CommunityFront;
