import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { GET_NOTICES } from '../../../apollo/user/query';
import { Notice } from '../../types/notice/notice';
import { NoticeCategory } from '../../enums/notice.enum';
import { FilterTabs } from '../homepage/HomeSection';
import { TopicKey, helpTopics } from './helpContent';

type TopicValue = TopicKey | 'ALL';

// all FAQ items are loaded once; topic and search filter them in the browser, so typing feels instant
const FAQ_LIMIT = 200;

interface FaqProps {
	topic: TopicValue;
	onTopic: (topic: TopicValue) => void;
	/** the header search; when set, matches from every topic are shown */
	query: string;
	onClearSearch: () => void;
	onContact: () => void;
}

const matches = (item: Notice, query: string) =>
	`${item.noticeTitle} ${item.noticeContent}`.toLowerCase().includes(query.trim().toLowerCase());

/** questions written by admins (FAQ category), by topic; each one opens in place **/
const Faq = (props: FaqProps) => {
	const { topic, onTopic, query, onClearSearch, onContact } = props;
	const [open, setOpen] = useState<string[]>([]);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: FAQ_LIMIT, search: { noticeCategory: NoticeCategory.FAQ } } },
	});
	const all: Notice[] = data?.getNotices?.list ?? [];

	const searching = query.trim().length > 0;
	const topicEnum = helpTopics.find((item) => item.value === topic)?.topic;
	const list = searching
		? all.filter((item) => matches(item, query))
		: all.filter((item) => !topicEnum || item.noticeTopic === topicEnum);
	const singleMatch = searching && list.length === 1 ? list[0]._id : '';

	// a search with exactly one answer opens it (e.g. the "Community guidelines" link)
	useEffect(() => {
		if (singleMatch) setOpen((current) => (current.includes(singleMatch) ? current : [...current, singleMatch]));
	}, [singleMatch]);

	const toggle = (id: string) => setOpen((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

	return (
		<section className={'help-faq'} aria-labelledby="faq-title">
			<div className={'section-head'}>
				<h2 id="faq-title" className={'section-title'}>
					{searching ? `Answers for “${query.trim()}”` : 'Frequently asked questions'}
				</h2>
				{!searching && all.length > 0 && (
					<FilterTabs
						label="Topics"
						options={[{ value: 'ALL', label: 'All' }, ...helpTopics.map(({ value, label }) => ({ value, label }))]}
						value={topic}
						onChange={(value) => onTopic(value as TopicValue)}
					/>
				)}
			</div>

			{loading && all.length === 0 ? (
				<ul className={'faq-list'} aria-busy="true" aria-label="Loading questions">
					{Array.from({ length: 5 }).map((_, i) => (
						<li key={i} className={'faq-item'}>
							<Skeleton width="60%" height={32} className={'faq-skeleton'} />
						</li>
					))}
				</ul>
			) : list.length === 0 ? (
				<div className={'empty-box help-empty'}>
					<p>{searching ? `No questions match “${query.trim()}”.` : 'No questions here yet.'}</p>
					<div className={'empty-actions'}>
						{searching && (
							<button type="button" className={'button-secondary'} onClick={onClearSearch}>
								Clear search
							</button>
						)}
						<button type="button" className={'button-primary'} onClick={onContact}>
							Contact us
						</button>
					</div>
				</div>
			) : (
				<ul className={'faq-list'}>
					{list.map((item) => {
						const expanded = open.includes(item._id);
						return (
							<li key={item._id} className={`faq-item ${expanded ? 'open' : ''}`}>
								<h3 className={'faq-question'}>
									<button
										type="button"
										id={`q-${item._id}`}
										aria-expanded={expanded}
										aria-controls={`a-${item._id}`}
										onClick={() => toggle(item._id)}
									>
										<span>{item.noticeTitle}</span>
										<i className={'faq-sign'} aria-hidden="true" />
									</button>
								</h3>
								<div id={`a-${item._id}`} role="region" aria-labelledby={`q-${item._id}`} className={'faq-answer'} hidden={!expanded}>
									<p>{item.noticeContent}</p>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			<aside className={'help-cta'}>
				<div>
					<h3 className={'cta-title'}>Still have a question?</h3>
					<p className={'cta-text'}>Call us and we will help with packages, studios and reservations.</p>
				</div>
				<button type="button" className={'button-primary'} onClick={onContact}>
					Contact us
				</button>
			</aside>
		</section>
	);
};

export default Faq;
