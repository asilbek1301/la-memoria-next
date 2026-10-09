import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Skeleton } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import CommentsSection from '../../libs/components/common/CommentsSection';
import ArticleActions from '../../libs/components/community/ArticleActions';
import PostAside from '../../libs/components/community/PostAside';
import { authorHref, categoryHref, categoryLabel, withoutCover } from '../../libs/components/community/communitySearch';
import { plural, studioName } from '../../libs/components/studio/studioSearch';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLE, GET_BOARD_ARTICLE_NEIGHBORS, GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { BoardArticle, BoardArticleNeighbors } from '../../libs/types/board-article/board-article';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction } from '../../libs/enums/common.enum';
import { REACT_APP_API_URL } from '../../libs/config';
import { sweetErrorHandling } from '../../libs/sweetAlert';

// the viewer needs the browser; text-shaped lines show while it loads
const TViewer = dynamic(() => import('../../libs/components/community/TViewer'), {
	ssr: false,
	loading: () => (
		<div aria-hidden="true">
			<Skeleton width="100%" />
			<Skeleton width="92%" />
			<Skeleton width="60%" />
		</div>
	),
});

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const LATEST_LIMIT = 4; // newest posts listed in the side column

/** One community post: the post on a sheet with its actions and comments; beside it the author and the rest of the
    category. The URL is /community/detail?id=… (older links also carry ?articleCategory=, which is no longer needed) **/
const CommunityDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const articleId = typeof router.query.id === 'string' ? router.query.id : '';
	const [liking, setLiking] = useState<boolean>(false);
	const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
	const [deleting, setDeleting] = useState<boolean>(false);

	/** APOLLO REQUESTS **/

	// getBoardArticle also records the view (once per logged-in member). A missing post shows this page's own
	// message, so its error stays quiet instead of opening the global popup
	const { data, loading, error, refetch } = useQuery(GET_BOARD_ARTICLE, {
		context: { quiet: true },
		fetchPolicy: 'network-only',
		variables: { input: articleId },
		skip: !articleId,
		notifyOnNetworkStatusChange: true,
	});
	const article: BoardArticle | undefined = data?.getBoardArticle;
	const category = article?.articleCategory;

	const { data: neighborData } = useQuery(GET_BOARD_ARTICLE_NEIGHBORS, {
		context: { quiet: true },
		fetchPolicy: 'cache-and-network',
		variables: { input: articleId },
		skip: !article,
	});
	const neighbors: BoardArticleNeighbors = neighborData?.getBoardArticleNeighbors ?? {};

	// a few extra, because this post and its neighbours are left out of the list
	const { data: latestData } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: LATEST_LIMIT + 3,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { articleCategory: category },
			},
		},
		skip: !category,
	});
	const shownIds = [article?._id, neighbors.previous?._id, neighbors.next?._id];
	const latest: BoardArticle[] = (latestData?.getBoardArticles?.list ?? [])
		.filter((item: BoardArticle) => !shownIds.includes(item._id))
		.slice(0, LATEST_LIMIT);

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	/** HANDLERS **/

	// logged out: log in first, then come back to this post
	const likeHandler = async () => {
		if (!article || liking) return;
		if (!user?._id) return router.push(`/account/join?referrer=${encodeURIComponent(router.asPath)}`);
		setLiking(true);
		try {
			await likeTargetBoardArticle({ variables: { input: article._id } });
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setLiking(false);
		}
	};

	const deleteHandler = async () => {
		if (!article) return;
		setDeleting(true);
		try {
			await updateBoardArticle({ variables: { input: { _id: article._id, articleStatus: BoardArticleStatus.DELETE } } });
			await router.replace(categoryHref(article.articleCategory));
		} catch (err) {
			setDeleting(false);
			await sweetErrorHandling(err);
		}
	};

	/** STATES **/

	const notFound = router.isReady && (!articleId || Boolean(error) || (!loading && !article));

	if (notFound) {
		return (
			<div id="community-detail-page" className={'detail-page community-detail'}>
				<div className={'container'}>
					<div className={'empty-box detail-missing'}>
						<p>This post doesn&apos;t exist or was removed.</p>
						<Link href={'/community'} className={'button-primary'}>
							Back to Community
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!article) {
		return (
			<div id="community-detail-page" className={'detail-page community-detail'} aria-busy="true" aria-label="Loading post">
				<div className={'container'}>
					<Skeleton width={200} className={'crumb-skeleton'} />
					<div className={'post-layout'}>
						<div className={'post-sheet'}>
							<div className={'sheet-text'}>
								<Skeleton width="20%" />
								<Skeleton width="70%" height={64} />
								<Skeleton width="40%" />
								<Skeleton width="100%" />
								<Skeleton width="85%" />
							</div>
						</div>
						<div className={'post-aside'}>
							<Skeleton variant="rectangular" className={'skeleton aside-skeleton'} />
							<Skeleton variant="rectangular" className={'skeleton aside-skeleton'} />
						</div>
					</div>
				</div>
			</div>
		);
	}

	const author = article.memberData;
	const isMine = Boolean(user?._id) && user._id === article.memberId;
	const views = article.articleViews ?? 0;
	const label = categoryLabel(category);
	const cover = article.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '';

	return (
		<div id="community-detail-page" className={'detail-page community-detail'}>
			<div className={'container'}>
				<nav className={'breadcrumb'} aria-label="Breadcrumb">
					<ol>
						<li>
							<Link href={'/community'}>Community</Link>
						</li>
						<li>
							<Link href={categoryHref(category)}>{label}</Link>
						</li>
					</ol>
				</nav>

				<div className={'post-layout'}>
					<div className={'post-main'}>
						<article className={'post-sheet'} aria-labelledby="article-title">
							{cover && (
								<figure className={'sheet-cover'}>
									<img src={cover} alt="" />
								</figure>
							)}
							<div className={'sheet-text'}>
								<header className={'article-head'}>
									<p className={'article-category'}>{label}</p>
									<h1 id="article-title" className={'article-title'}>
										{article.articleTitle}
									</h1>
									<p className={'article-meta'}>
										<span>
											By{' '}
											<Link href={authorHref(article)} className={'meta-author'}>
												{author ? studioName(author) : 'Member'}
											</Link>
										</span>
										<time dateTime={new Date(article.createdAt).toISOString()}>
											{moment(article.createdAt).format('MMMM D, YYYY')}
										</time>
										{views > 0 && <span>{plural(views, 'view')}</span>}
									</p>
								</header>

								<div className={'article-body'}>
									<TViewer key={article._id} content={withoutCover(article.articleContent, article.articleImage)} />
								</div>
							</div>

							<footer className={'sheet-foot'}>
								<ArticleActions
									liked={Boolean(article.meLiked?.[0]?.myFavorite)}
									likes={article.articleLikes ?? 0}
									comments={article.articleComments ?? 0}
									onLike={likeHandler}
								/>
								{isMine &&
									(confirmDelete ? (
										<span className={'owner-actions'} role="group" aria-label="Delete this post?">
											<span className={'confirm-text'}>Delete this post?</span>
											<button type="button" className={'button-link danger'} disabled={deleting} onClick={deleteHandler}>
												{deleting ? 'Deleting…' : 'Delete'}
											</button>
											<button type="button" className={'button-link'} onClick={() => setConfirmDelete(false)}>
												Cancel
											</button>
										</span>
									) : (
										<span className={'owner-actions'}>
											<button type="button" className={'button-link'} onClick={() => setConfirmDelete(true)}>
												Delete post
											</button>
										</span>
									))}
							</footer>
						</article>

						<CommentsSection
							key={article._id}
							refId={article._id}
							group={CommentGroup.ARTICLE}
							user={user}
							onCommented={() => refetch()}
						/>
					</div>

					<PostAside article={article} neighbors={neighbors} latest={latest} />
				</div>
			</div>
		</div>
	);
};

export default withLayoutFull(CommunityDetail);
