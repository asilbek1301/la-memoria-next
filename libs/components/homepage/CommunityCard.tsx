import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import { prettyEnum } from '../../utils';

interface CommunityCardProps {
	article: BoardArticle;
}

/** plain-text excerpt from the editor's HTML content **/
const excerpt = (html?: string) =>
	(html ?? '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const CommunityCard = (props: CommunityCardProps) => {
	const { article } = props;
	const image = article?.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '';
	const href = `/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`;
	const text = excerpt(article?.articleContent);

	return (
		<article className={'article-card'}>
			<Link href={href} className={'card-media'} tabIndex={-1} aria-hidden="true">
				{image ? (
					<img src={image} alt="" loading="lazy" />
				) : (
					<span className={'img-placeholder category'}>{prettyEnum(article?.articleCategory)}</span>
				)}
			</Link>
			<div className={'card-meta'}>
				<span>{prettyEnum(article?.articleCategory)}</span>
				<Moment format="MMMM D, YYYY">{article?.createdAt}</Moment>
			</div>
			<h3 className={'card-title'}>
				<Link href={href}>{article?.articleTitle}</Link>
			</h3>
			{text && <p className={'card-excerpt'}>{text}</p>}
		</article>
	);
};

export default CommunityCard;
