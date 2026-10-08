import React, { useRef, useState } from 'react';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation } from '@apollo/client';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { categoryLabels } from './communitySearch';

// the backend's limits (BoardArticleInput): title 3–50, content 3–250 characters of the editor's HTML
const TITLE_MIN = 3;
const TITLE_MAX = 50;
const CONTENT_MIN = 3;
const CONTENT_MAX = 250;

/** an empty editor still returns '<p><br></p>'; treat that as no text **/
const isBlank = (html: string) => html.replace(/<p><br><\/p>/g, '').replace(/<[^>]+>/g, '').trim() === '' && !/<img/i.test(html);

/** the community post form: category, title and the editor; publishes with CREATE_BOARD_ARTICLE **/
const TuiEditor = () => {
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [articleTitle, setArticleTitle] = useState<string>('');
	const [articleContent, setArticleContent] = useState<string>('');
	const [articleImage, setArticleImage] = useState<string>('');
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/

	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	/** HANDLERS **/

	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			// the first photo becomes the post's cover in the community list
			setArticleImage((current) => current || responseImage);

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const contentChangeHandler = () => {
		const html = editorRef.current?.getInstance().getHTML() ?? '';
		setArticleContent(isBlank(html) ? '' : html);
	};

	const title = articleTitle.trim();
	const titleShort = title.length < TITLE_MIN;
	const contentShort = articleContent.length < CONTENT_MIN;
	const contentLong = articleContent.length > CONTENT_MAX;
	const blocked = titleShort || contentShort || contentLong;

	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (blocked) throw new Error(Message.INSERT_ALL_INPUTS);
			setSaving(true);

			await createBoardArticle({
				variables: {
					input: { articleCategory, articleTitle: title, articleContent, articleImage },
				},
			});

			await sweetTopSuccessAlert('Your post is published', 700);
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (err: any) {
			console.log('Error, submitHandler:', err);
			sweetErrorHandling(err).then();
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className={'my-form write-form'} onSubmit={submitHandler}>
			<fieldset className={'form-group'}>
				<legend className={'field-label'}>Category</legend>
				<div className={'check-row'} role="radiogroup" aria-label="Category">
					{Object.values(BoardArticleCategory).map((value) => (
						<label key={value} className={`check-chip ${articleCategory === value ? 'active' : ''}`}>
							<input
								type="radio"
								name="articleCategory"
								value={value}
								checked={articleCategory === value}
								onChange={() => setArticleCategory(value)}
							/>
							{categoryLabels[value]}
						</label>
					))}
				</div>
			</fieldset>

			<label className={'field'}>
				<span className={'field-label'}>Title</span>
				<input
					type="text"
					value={articleTitle}
					maxLength={TITLE_MAX}
					placeholder="Give your post a short title"
					onChange={(e) => setArticleTitle(e.target.value)}
				/>
				<span className={'field-help'}>
					{title.length} / {TITLE_MAX}
				</span>
			</label>

			<div className={'field'}>
				<span className={'field-label'} id="post-label">
					Your post
				</span>
				<div className={'editor-frame'} aria-labelledby="post-label">
					<Editor
						// not '': an empty value makes Toast UI load the container's old HTML (its own labels) as the post
						initialValue={' '}
						placeholder={'Share your preparations, a question or a recommendation.'}
						previewStyle={'vertical'}
						height={'480px'}
						// @ts-ignore
						initialEditType={'wysiwyg'}
						hideModeSwitch
						autofocus={false}
						toolbarItems={[
							['heading', 'bold', 'italic', 'strike'],
							['image', 'link'],
							['ul', 'ol'],
						]}
						ref={editorRef}
						onChange={contentChangeHandler}
						hooks={{
							addImageBlobHook: async (image: any, callback: any) => {
								const uploadedImageURL = await uploadImage(image);
								callback(uploadedImageURL);
								return false;
							},
						}}
					/>
				</div>
				<span className={`field-help ${contentLong ? 'over' : ''}`} aria-live="polite">
					{articleContent.length} / {CONTENT_MAX} characters, photos and formatting included. The first photo
					becomes the cover.
				</span>
			</div>

			<div className={'form-foot'}>
				{titleShort || contentShort ? (
					<p className={'field-help'}>Add a title and write your post to publish it.</p>
				) : contentLong ? (
					<p className={'field-help over'}>Your post is too long. Shorten it or remove a photo.</p>
				) : null}
				<button type="submit" className={'button-primary'} disabled={blocked || saving}>
					{saving ? 'Publishing…' : 'Publish post'}
				</button>
			</div>
		</form>
	);
};

export default TuiEditor;
