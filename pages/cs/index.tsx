import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import Faq from '../../libs/components/cs/Faq';
import Notice from '../../libs/components/cs/Notice';
import Contact from '../../libs/components/cs/Contact';
import { HelpTab, TopicKey, helpTabs, isHelpTab, isTopicKey } from '../../libs/components/cs/helpContent';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

type TopicValue = TopicKey | 'ALL';

/** Help: FAQ, notices and contact (FAQ and notices are written by admins). The tab, FAQ topic and a starting search
    live in the URL (?tab=faq&topic=community, ?q=guidelines), so links work **/
const CS: NextPage = () => {
	const router = useRouter();
	const [query, setQuery] = useState<string>('');
	const tab: HelpTab = isHelpTab(router.query.tab) ? router.query.tab : 'faq';
	const topic: TopicValue = isTopicKey(router.query.topic) ? router.query.topic : 'ALL';

	/** LIFECYCLES **/

	// ?q= starts the page with a search (the community guidelines link uses it)
	useEffect(() => {
		if (router.isReady && typeof router.query.q === 'string') setQuery(router.query.q);
	}, [router.isReady, router.query.q]);

	/** HANDLERS **/

	const go = (nextTab: HelpTab, nextTopic: TopicValue = 'ALL') => {
		const nextQuery: Record<string, string> = { tab: nextTab };
		if (nextTab === 'faq' && nextTopic !== 'ALL') nextQuery.topic = nextTopic;
		return router.push({ pathname: '/cs', query: nextQuery }, undefined, { scroll: false, shallow: true });
	};

	// typing a question always shows the FAQ
	const searchHandler = (text: string) => {
		setQuery(text);
		if (text.trim() && tab !== 'faq') go('faq');
	};

	// arrow keys move between tabs (and select them), Home / End jump to the ends
	const tabKeyHandler = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		const index = helpTabs.findIndex((item) => item.value === tab);
		let next = index;
		if (e.key === 'ArrowRight') next = (index + 1) % helpTabs.length;
		else if (e.key === 'ArrowLeft') next = (index - 1 + helpTabs.length) % helpTabs.length;
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = helpTabs.length - 1;
		else return;
		e.preventDefault();
		const value = helpTabs[next].value;
		go(value);
		document.getElementById(`help-tab-${value}`)?.focus();
	};

	const toContact = () => {
		setQuery('');
		go('contact');
	};
	const toFaq = () => go('faq');

	return (
		<div id="help-page" className={'help-page'}>
			<header className={'help-header'}>
				<div className={'container'}>
					<div className={'header-row'}>
						<div className={'header-text'}>
							<span className={'header-label'}>Help</span>
							<h1 className={'page-title'}>How can we help?</h1>
							<p className={'page-intro'}>Answers about packages, reservations, payments and the community.</p>
						</div>
						<form className={'search-field'} role="search" onSubmit={(e) => e.preventDefault()}>
							<SearchRoundedIcon aria-hidden="true" />
							<input
								type="search"
								value={query}
								placeholder="Search questions"
								aria-label="Search questions"
								onChange={(e) => searchHandler(e.target.value)}
							/>
							{query && (
								<button type="button" className={'clear-btn'} aria-label="Clear search" onClick={() => setQuery('')}>
									<CloseRoundedIcon />
								</button>
							)}
						</form>
					</div>

					<div className={'category-tabs help-tabs'} role="tablist" aria-label="Help sections">
						{helpTabs.map((item) => (
							<button
								type="button"
								key={item.value}
								role="tab"
								id={`help-tab-${item.value}`}
								aria-selected={tab === item.value}
								aria-controls="help-panel"
								tabIndex={tab === item.value ? 0 : -1}
								className={`category-tab ${tab === item.value ? 'active' : ''}`}
								onClick={() => go(item.value)}
								onKeyDown={tabKeyHandler}
							>
								{item.label}
							</button>
						))}
					</div>
				</div>
			</header>

			<div className={'container help-body'} id="help-panel" role="tabpanel" aria-labelledby={`help-tab-${tab}`}>
				{tab === 'faq' && (
					<Faq
						topic={topic}
						onTopic={(value) => go('faq', value)}
						query={query}
						onClearSearch={() => setQuery('')}
						onContact={toContact}
					/>
				)}
				{tab === 'notice' && <Notice onFaq={toFaq} />}
				{tab === 'contact' && <Contact />}
			</div>
		</div>
	);
};

export default withLayoutFull(CS);
