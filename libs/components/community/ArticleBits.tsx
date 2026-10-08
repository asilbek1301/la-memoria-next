import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { BoardArticle } from '../../types/board-article/board-article';
import { memberPhoto, plural, studioName } from '../studio/studioSearch';
import { authorHref } from './communitySearch';

/** the author's photo (or first letter) and name, with the date when asked **/
export const ArticleAuthor = ({ article, withDate }: { article: BoardArticle; withDate?: boolean }) => {
	const member = article?.memberData;
	const name = member ? studioName(member) : 'Member';
	const photo = memberPhoto(member?.memberImage);
	return (
		<div className={'article-author'}>
			<Link href={authorHref(article)} className={'author-avatar'} tabIndex={-1} aria-hidden="true">
				{photo ? <img src={photo} alt="" loading="lazy" /> : <span>{name.charAt(0)}</span>}
			</Link>
			<span className={'author-text'}>
				<Link href={authorHref(article)} className={'author-name'}>
					{name}
				</Link>
				{withDate && (
					<Moment className={'author-date'} format="MMMM D, YYYY">
						{article?.createdAt}
					</Moment>
				)}
			</span>
		</div>
	);
};

/** views, likes and comments as small icons; only counts above 0 **/
export const ArticleCounts = ({ article }: { article: BoardArticle }) => {
	const counts = [
		{ key: 'views', value: article?.articleViews ?? 0, word: 'view', icon: <VisibilityOutlinedIcon /> },
		{ key: 'likes', value: article?.articleLikes ?? 0, word: 'like', icon: <FavoriteBorderRoundedIcon /> },
		{ key: 'comments', value: article?.articleComments ?? 0, word: 'comment', icon: <ChatBubbleOutlineRoundedIcon /> },
	].filter((count) => count.value > 0);
	if (!counts.length) return null;
	return (
		<p className={'article-counts'}>
			{counts.map((count) => (
				<span key={count.key} title={plural(count.value, count.word)}>
					<span aria-hidden="true">{count.icon}</span>
					<span className={'visually-hidden'}>{plural(count.value, count.word)}</span>
					<span aria-hidden="true">{count.value.toLocaleString('en-US')}</span>
				</span>
			))}
		</p>
	);
};
