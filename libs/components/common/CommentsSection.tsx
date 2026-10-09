import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import moment from 'moment';
import { Comment } from '../../types/comment/comment';
import { CommentsInquiry } from '../../types/comment/comment.input';
import { CommentGroup, CommentStatus } from '../../enums/comment.enum';
import { Direction, Message } from '../../enums/common.enum';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { CREATE_COMMENT, UPDATE_COMMENT } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../config';
import { sweetErrorHandling } from '../../sweetAlert';
import { ResultsPagination } from './ListControls';

/** the backend accepts 1-100 characters (CommentInput) **/
const COMMENT_MAX = 100;
const PAGE_SIZE = 5;

interface CommentsSectionProps {
	/** the package, studio or post the comments belong to */
	refId: string;
	group: CommentGroup;
	user: any;
	/** shown instead of the form, e.g. on your own studio */
	formNote?: string;
	/** called after a comment is added or deleted, so the page can refresh its count */
	onCommented?: () => void;
}

interface CommentItemProps {
	comment: Comment;
	isMine: boolean;
	authorHref: string;
	onSave: (comment: Comment, text: string) => Promise<boolean>;
	onDelete: (comment: Comment) => Promise<void>;
}

/** one comment; your own can be edited in place or deleted after a second click **/
const CommentItem = ({ comment, isMine, authorHref, onSave, onDelete }: CommentItemProps) => {
	const [mode, setMode] = useState<'read' | 'edit' | 'confirm'>('read');
	const [draft, setDraft] = useState<string>(comment.commentContent);
	const [busy, setBusy] = useState<boolean>(false);
	const author = comment?.memberData;
	const avatar = author?.memberImage ? `${REACT_APP_API_URL}/${author.memberImage}` : '/img/profile/defaultUser.svg';
	const editId = `comment-edit-${comment._id}`;

	const save = async (e: React.FormEvent) => {
		e.preventDefault();
		const text = draft.trim();
		if (!text || busy) return;
		if (text === comment.commentContent) return setMode('read');
		setBusy(true);
		if (await onSave(comment, text)) setMode('read');
		setBusy(false);
	};

	const remove = async () => {
		setBusy(true);
		await onDelete(comment); // the list refreshes without this comment
		setBusy(false);
	};

	return (
		<li className={'comment'}>
			<img className={'comment-avatar'} src={avatar} alt="" loading="lazy" />
			<div className={'comment-body'}>
				<p className={'comment-meta'}>
					<Link href={authorHref} className={'comment-author'}>
						{author?.memberFullName || author?.memberNick}
					</Link>
					<time dateTime={String(comment.createdAt)}>{moment(comment.createdAt).format('D MMMM YYYY')}</time>
				</p>

				{mode === 'edit' ? (
					<form className={'comment-form comment-edit'} onSubmit={save}>
						<label className={'visually-hidden'} htmlFor={editId}>
							Edit your comment
						</label>
						<textarea
							id={editId}
							rows={2}
							maxLength={COMMENT_MAX}
							value={draft}
							autoFocus
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={(e) => e.key === 'Escape' && setMode('read')}
						/>
						<div className={'comment-form-foot'}>
							<span className={'field-count'} aria-hidden="true">
								{draft.length} / {COMMENT_MAX}
							</span>
							<span className={'comment-actions'}>
								<button type="button" className={'button-link'} onClick={() => setMode('read')}>
									Cancel
								</button>
								<button type="submit" className={'button-secondary'} disabled={!draft.trim() || busy}>
									{busy ? 'Saving…' : 'Save'}
								</button>
							</span>
						</div>
					</form>
				) : (
					<p className={'comment-text'}>{comment.commentContent}</p>
				)}

				{isMine && mode === 'read' && (
					<span className={'comment-actions'}>
						<button
							type="button"
							className={'button-link'}
							onClick={() => {
								setDraft(comment.commentContent);
								setMode('edit');
							}}
						>
							Edit
						</button>
						<button type="button" className={'button-link'} onClick={() => setMode('confirm')}>
							Delete
						</button>
					</span>
				)}
				{isMine && mode === 'confirm' && (
					<span className={'comment-actions'} role="group" aria-label="Delete this comment?">
						<span className={'confirm-text'}>Delete this comment?</span>
						<button type="button" className={'button-link danger'} disabled={busy} onClick={remove}>
							{busy ? 'Deleting…' : 'Delete'}
						</button>
						<button type="button" className={'button-link'} onClick={() => setMode('read')}>
							Cancel
						</button>
					</span>
				)}
			</div>
		</li>
	);
};

/** comments (not reviews) for a package, studio or post: list, pagination, a form for logged-in members, and
    edit / delete for your own comments **/
const CommentsSection = (props: CommentsSectionProps) => {
	const { refId, group, user, formNote, onCommented } = props;
	const router = useRouter();
	const [page, setPage] = useState<number>(1);
	const [content, setContent] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);

	const inquiry: CommentsInquiry = {
		page,
		limit: PAGE_SIZE,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentRefId: refId },
	};

	/** APOLLO REQUESTS **/

	const { data, loading, refetch } = useQuery(GET_COMMENTS, {
		variables: { input: inquiry },
		skip: !refId,
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const comments: Comment[] = data?.getComments?.list ?? [];
	const total: number = data?.getComments?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const text = content.trim();
		if (!text || sending) return;
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			setSending(true);
			await createComment({
				variables: { input: { commentGroup: group, commentContent: text, commentRefId: refId } },
			});
			setContent('');
			setPage(1);
			await refetch({ input: { ...inquiry, page: 1 } });
			onCommented?.();
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setSending(false);
		}
	};

	const saveComment = async (comment: Comment, text: string) => {
		try {
			await updateComment({ variables: { input: { _id: comment._id, commentContent: text } } });
			await refetch();
			return true;
		} catch (err) {
			await sweetErrorHandling(err);
			return false;
		}
	};

	const deleteComment = async (comment: Comment) => {
		try {
			await updateComment({ variables: { input: { _id: comment._id, commentStatus: CommentStatus.DELETE } } });
			// the last comment on a later page: go back one page
			const lastOnPage = comments.length === 1 && page > 1;
			if (lastOnPage) setPage(page - 1);
			await refetch({ input: { ...inquiry, page: lastOnPage ? page - 1 : page } });
			onCommented?.();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const authorHref = (comment: Comment) =>
		comment?.memberData?._id === user?._id ? '/mypage' : `/member?memberId=${comment?.memberData?._id}`;

	return (
		<section id="comments" className={'detail-section comments-section'} aria-labelledby="comments-title">
			<h2 id="comments-title" className={'detail-title'}>
				Comments{total > 0 ? ` (${total})` : ''}
			</h2>

			{formNote ? (
				<p className={'comment-login'}>{formNote}</p>
			) : user?._id ? (
				<form className={'comment-form'} onSubmit={submit}>
					<label className={'visually-hidden'} htmlFor="comment-text">
						Write a comment
					</label>
					<textarea
						id="comment-text"
						rows={3}
						maxLength={COMMENT_MAX}
						value={content}
						placeholder="Write a comment"
						onChange={(e) => setContent(e.target.value)}
					/>
					<div className={'comment-form-foot'}>
						<span className={'field-count'} aria-hidden="true">
							{content.length} / {COMMENT_MAX}
						</span>
						<button type="submit" className={'button-secondary'} disabled={!content.trim() || sending}>
							{sending ? 'Posting…' : 'Post comment'}
						</button>
					</div>
				</form>
			) : (
				<p className={'comment-login'}>
					<Link
						href={`/account/join?referrer=${encodeURIComponent(router.asPath)}`}
						className={'button-link'}
					>
						Log in to comment
					</Link>
				</p>
			)}

			{loading && comments.length === 0 ? (
				<ul className={'comment-list'} aria-busy="true">
					{[0, 1].map((i) => (
						<li className={'comment'} key={i}>
							<Skeleton variant="circular" width={44} height={44} />
							<div className={'comment-body'}>
								<Skeleton width="30%" />
								<Skeleton width="80%" />
							</div>
						</li>
					))}
				</ul>
			) : comments.length === 0 ? (
				<p className={'comment-empty'}>No comments yet.</p>
			) : (
				<ul className={'comment-list'}>
					{comments.map((comment) => (
						<CommentItem
							// a new key after an edit, so the item starts again from the saved text
							key={`${comment._id}-${comment.updatedAt}`}
							comment={comment}
							isMine={Boolean(user?._id) && comment.memberId === user._id}
							authorHref={authorHref(comment)}
							onSave={saveComment}
							onDelete={deleteComment}
						/>
					))}
				</ul>
			)}

			{total > PAGE_SIZE && (
				<ResultsPagination page={page} limit={PAGE_SIZE} total={total} onPage={setPage} noun="comments" />
			)}
		</section>
	);
};

export default CommentsSection;
