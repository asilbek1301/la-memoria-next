import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { BoardArticle, BoardArticleNeighbors } from '../../types/board-article/board-article';
import { MemberType } from '../../enums/member.enum';
import { memberPhoto, plural, studioName } from '../studio/studioSearch';
import { articleHref, authorHref, categoryHref, categoryLabel } from './communitySearch';

interface PostAsideProps {
	article: BoardArticle;
	neighbors: BoardArticleNeighbors;
	/** newest posts of the same category, without this post or its neighbours */
	latest: BoardArticle[];
}

/** the side column of a post: who wrote it, then where to go next in the same category **/
const PostAside = ({ article, neighbors, latest }: PostAsideProps) => {
	const author = article.memberData;
	const name = author ? studioName(author) : 'Member';
	const photo = memberPhoto(author?.memberImage);
	const isStudio = author?.memberType === MemberType.STUDIO;
	const posts = author?.memberArticles ?? 0;
	const label = categoryLabel(article.articleCategory);
	const { previous, next } = neighbors;

	return (
		<aside className={'post-aside'} aria-label="About this post">
			<section className={'aside-box author-box'} aria-labelledby="author-title">
				<h2 id="author-title" className={'aside-label'}>
					Written by
				</h2>
				<div className={'author-row'}>
					<span className={'author-photo'}>{photo ? <img src={photo} alt="" /> : name.charAt(0)}</span>
					<span className={'author-text'}>
						<span className={'author-name'}>{name}</span>
						<span className={'author-meta'}>
							{isStudio ? 'Studio' : 'Member'}
							{posts > 0 && ` · ${plural(posts, 'post')}`}
						</span>
					</span>
				</div>
				<Link href={authorHref(article)} className={'button-link'}>
					{isStudio ? 'View studio' : 'View profile'}
				</Link>
			</section>

			<nav className={'aside-box board-box'} aria-labelledby="board-title">
				<h2 id="board-title" className={'aside-label'}>
					In {label}
				</h2>
				{(previous || next) && (
					<ul className={'board-list steps'}>
						{previous && (
							<li>
								<Link href={articleHref(previous)} className={'board-row'}>
									<span className={'row-label'}>
										<ArrowBackRoundedIcon /> Previous post
									</span>
									<span className={'row-title'}>{previous.articleTitle}</span>
								</Link>
							</li>
						)}
						{next && (
							<li>
								<Link href={articleHref(next)} className={'board-row'}>
									<span className={'row-label'}>
										Next post <ArrowForwardRoundedIcon />
									</span>
									<span className={'row-title'}>{next.articleTitle}</span>
								</Link>
							</li>
						)}
					</ul>
				)}
				{latest.length > 0 && (
					<ul className={'board-list'}>
						{latest.map((item) => (
							<li key={item._id}>
								<Link href={articleHref(item)} className={'board-row'}>
									<span className={'row-title'}>{item.articleTitle}</span>
									<time className={'row-label'} dateTime={new Date(item.createdAt).toISOString()}>
										{moment(item.createdAt).format('MMMM D, YYYY')}
									</time>
								</Link>
							</li>
						))}
					</ul>
				)}
				<Link href={categoryHref(article.articleCategory)} className={'button-link'}>
					All posts in {label}
				</Link>
			</nav>
		</aside>
	);
};

export default PostAside;
