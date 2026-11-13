import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@mui/material';

// the editor needs the browser; a skeleton in its shape shows while it loads
const TuiEditor = dynamic(() => import('../community/Teditor'), {
	ssr: false,
	loading: () => <Skeleton variant="rectangular" className={'skeleton editor-skeleton'} />,
});

/** the community post form inside the My Page frame **/
const WriteArticle = () => {
	const { t } = useTranslation('common');

	return (
		<section className={'my-section'} aria-labelledby="write-title">
			<div className={'section-row'}>
				<div>
					<h2 id="write-title" className={'detail-title'}>
						{t('Write a post')}
					</h2>
					<p className={'section-note'}>{t('Share your plans, questions or tips with other couples.')}</p>
				</div>
				<Link href={{ pathname: '/mypage', query: { category: 'myArticles' } }} className={'button-link'}>
					{t('Back to my posts')}
				</Link>
			</div>
			<TuiEditor />
		</section>
	);
};

export default WriteArticle;
