import React, { useState } from 'react';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { GET_NOTICES } from '../../../apollo/user/query';
import { Notice as NoticeItem } from '../../types/notice/notice';
import { NoticeCategory } from '../../enums/notice.enum';

const NOTICE_LIMIT = 50;

/** notices written by admins, newest first; each one opens in place **/
const Notice = ({ onFaq }: { onFaq: () => void }) => {
	const { t } = useTranslation('common');
	const [open, setOpen] = useState<string[]>([]);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: NOTICE_LIMIT, search: { noticeCategory: NoticeCategory.NOTICE } } },
	});
	const list: NoticeItem[] = data?.getNotices?.list ?? [];

	const toggle = (id: string) =>
		setOpen((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

	return (
		<section className={'help-notices'} aria-labelledby="notices-title">
			<div className={'section-head'}>
				<h2 id="notices-title" className={'section-title'}>
					{t('Notices')}
				</h2>
			</div>
			{loading && list.length === 0 ? (
				<ul className={'faq-list'} aria-busy="true" aria-label={t('Loading notices')}>
					{Array.from({ length: 3 }).map((_, i) => (
						<li key={i} className={'faq-item'}>
							<Skeleton width="50%" height={32} className={'faq-skeleton'} />
						</li>
					))}
				</ul>
			) : list.length === 0 ? (
				<div className={'empty-box help-empty'}>
					<p>{t('No notices right now.')}</p>
					<button type="button" className={'button-primary'} onClick={onFaq}>
						{t('Read the FAQ')}
					</button>
				</div>
			) : (
				<ul className={'faq-list'}>
					{list.map((item) => {
						const expanded = open.includes(item._id);
						return (
							<li key={item._id} className={`faq-item notice-item ${expanded ? 'open' : ''}`}>
								<h3 className={'faq-question'}>
									<button
										type="button"
										id={`n-${item._id}`}
										aria-expanded={expanded}
										aria-controls={`nc-${item._id}`}
										onClick={() => toggle(item._id)}
									>
										<span className={'notice-head'}>
											<Moment className={'notice-date'} format="LL">
												{item.createdAt}
											</Moment>
											<span>{t(item.noticeTitle)}</span>
										</span>
										<i className={'faq-sign'} aria-hidden="true" />
									</button>
								</h3>
								<div
									id={`nc-${item._id}`}
									role="region"
									aria-labelledby={`n-${item._id}`}
									className={'faq-answer'}
									hidden={!expanded}
								>
									<p>{t(item.noticeContent)}</p>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
};

export default Notice;
