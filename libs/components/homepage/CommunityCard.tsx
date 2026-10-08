import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { useReactiveVar } from '@apollo/client';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import { userVar } from '../../../apollo/store';
import { articleExcerpt, articleHref, categoryLabel } from '../community/communitySearch';
import { ArticleAuthor, ArticleCounts } from '../community/ArticleBits';

interface CommunityCardProps {
	article: BoardArticle;
	/** the community list adds the author and counts under the excerpt */
	withFooter?: boolean;
	/** shows the like (heart) button on the photo */
	likeArticleHandler?: (user: any, id: string) => void;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { article, withFooter, likeArticleHandler } = props;
	const user = useReactiveVar(userVar);
	const image = article?.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '';
	const href = articleHref(article);
	const text = articleExcerpt(article?.articleContent);
	const category = categoryLabel(article?.articleCategory);
	const liked = Boolean(article?.meLiked?.[0]?.myFavorite);

	return (
		<article className={'article-card'}>
			<Link href={href} className={'card-media'} tabIndex={-1} aria-hidden="true">
				{image ? (
					<img src={image} alt="" loading="lazy" />
				) : (
					<span className={'img-placeholder category'}>{category}</span>
				)}
			</Link>
			{likeArticleHandler && (
				<button
					type="button"
					className={`like-btn ${liked ? 'liked' : ''}`}
					aria-label={liked ? `Unlike ${article?.articleTitle}` : `Like ${article?.articleTitle}`}
					aria-pressed={liked}
					onClick={() => likeArticleHandler(user, article?._id)}
				>
					{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</button>
			)}
			<div className={'card-meta'}>
				<span>{category}</span>
				<Moment format="MMMM D, YYYY">{article?.createdAt}</Moment>
			</div>
			<h3 className={'card-title'}>
				<Link href={href}>{article?.articleTitle}</Link>
			</h3>
			{text && <p className={'card-excerpt'}>{text}</p>}
			{withFooter && (
				<div className={'card-foot'}>
					<ArticleAuthor article={article} />
					<ArticleCounts article={article} />
				</div>
			)}
		</article>
	);
};

export default CommunityCard;
