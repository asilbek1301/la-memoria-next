import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Skeleton } from '@mui/material';

// the editor needs the browser; a skeleton in its shape shows while it loads
const TuiEditor = dynamic(() => import('../community/Teditor'), {
	ssr: false,
	loading: () => <Skeleton variant="rectangular" className={'skeleton editor-skeleton'} />,
});

/** the community post form inside the My Page frame **/
const WriteArticle = () => (
	<section className={'my-section'} aria-labelledby="write-title">
		<div className={'section-row'}>
			<div>
				<h2 id="write-title" className={'detail-title'}>
					Write a post
				</h2>
				<p className={'section-note'}>Share your plans, questions or tips with other couples.</p>
			</div>
			<Link href={{ pathname: '/mypage', query: { category: 'myArticles' } }} className={'button-link'}>
				Back to my posts
			</Link>
		</div>
		<TuiEditor />
	</section>
);

export default WriteArticle;
