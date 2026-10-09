import React, { useEffect, useState } from 'react';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

const COPIED_MS = 2000; // how long "Link copied" stays

interface ArticleActionsProps {
	liked: boolean;
	likes: number;
	comments: number;
	onLike: () => void;
}

/** like, comments and copy link as labelled pill buttons, at the foot of the post **/
const ArticleActions = ({ liked, likes, comments, onLike }: ArticleActionsProps) => {
	const [copied, setCopied] = useState<boolean>(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), COPIED_MS);
		return () => clearTimeout(timer);
	}, [copied]);

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
		} catch {
			// the browser refused the clipboard: the address bar still has the link
		}
	};

	return (
		<div className={'article-actions'}>
			<button type="button" className={`action-pill ${liked ? 'liked' : ''}`} aria-pressed={liked} onClick={onLike}>
				{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				{liked ? 'Liked' : 'Like'}
				{likes > 0 && <span className={'pill-count'}>{likes}</span>}
			</button>
			<a href="#comments" className={'action-pill'}>
				<ChatBubbleOutlineRoundedIcon />
				Comments
				{comments > 0 && <span className={'pill-count'}>{comments}</span>}
			</a>
			<button type="button" className={`action-pill ${copied ? 'copied' : ''}`} onClick={copyLink}>
				{copied ? <CheckRoundedIcon /> : <LinkRoundedIcon />}
				<span role="status">{copied ? 'Link copied' : 'Copy link'}</span>
			</button>
		</div>
	);
};

export default ArticleActions;
