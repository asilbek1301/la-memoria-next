import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NetworkStatus, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import CommunityCard from '../../libs/components/homepage/CommunityCard';
import CommunityFront from '../../libs/components/community/CommunityFront';
import { ResultsPagination, SortMenu } from '../../libs/components/common/ListControls';
import {
	categoryLabel,
	categoryTabs,
	communityHref,
	communitySortOptions,
	defaultCommunityInput,
	parseCommunityInput,
} from '../../libs/components/community/communitySearch';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const WRITE_HREF = '/mypage?category=writeArticle';

type TabValue = BoardArticleCategory | 'ALL';

/** one category tab; it asks for its own post count (limit 1, the total only) **/
const CategoryTab = (props: {
	value: TabValue;
	label: string;
	active: boolean;
	onSelect: (value: TabValue) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}) => {
	const { value, label, active, onSelect, onKeyDown } = props;
	const { data } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, search: value === 'ALL' ? {} : { articleCategory: value } } },
	});
	const count: number = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
	return (
		<button
			type="button"
			role="tab"
			id={`tab-${value}`}
			aria-selected={active}
			aria-controls="community-results"
			tabIndex={active ? 0 : -1}
			className={`category-tab ${active ? 'active' : ''}`}
			onClick={() => onSelect(value)}
			onKeyDown={onKeyDown}
		>
			{label}
			{count > 0 && <span className={'tab-count'}>{count}</span>}
		</button>
	);
};

const Community: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(
		router?.query?.input ? parseCommunityInput(router.query.input) : initialInput,
	);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>(searchFilter.search?.text ?? '');
	const listRef = useRef<HTMLElement>(null);

	/** APOLLO REQUESTS **/

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: articlesLoading,
		networkStatus,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !router.isReady,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getBoardArticles?.list ?? []);
			setTotal(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});
	// a like refetches quietly; every other request shows the skeleton cards
	const loading = !router.isReady || (articlesLoading && networkStatus !== NetworkStatus.refetch);

	/** LIFECYCLES **/

	// the URL is the source of truth: category, search, sort and page all live in ?input=
	useEffect(() => {
		if (!router.isReady) return;
		setSearchFilter(parseCommunityInput(router.query.input, router.query.articleCategory));
	}, [router.isReady, router.query.input, router.query.articleCategory]);

	// keep the field in step with the URL (back button, pasted links, Clear search)
	useEffect(() => {
		setSearchText(searchFilter.search?.text ?? '');
	}, [searchFilter.search?.text]);

	// search as you type, after a short pause
	useEffect(() => {
		const current = searchFilter.search?.text ?? '';
		if (searchText.trim() === current) return;
		const timer = setTimeout(() => searchHandler(searchText), 450);
		return () => clearTimeout(timer);
		// runs only when the typed text changes; the URL text is compared inside
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchText]);

	const category = searchFilter.search?.articleCategory;
	const active: TabValue = category ?? 'ALL';
	const text = searchFilter.search?.text;

	/** HANDLERS **/

	const pushInput = async (next: BoardArticlesInquiry) => {
		await router.push(communityHref(next), communityHref(next), { scroll: false });
	};

	const categoryHandler = (value: TabValue) => {
		const search = { ...searchFilter.search };
		if (value === 'ALL') delete search.articleCategory;
		else search.articleCategory = value;
		return pushInput({ ...searchFilter, page: 1, search });
	};

	// arrow keys move between tabs (and select them), Home / End jump to the ends
	const tabKeyHandler = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		const index = categoryTabs.findIndex((tab) => tab.value === active);
		let next = index;
		if (e.key === 'ArrowRight') next = (index + 1) % categoryTabs.length;
		else if (e.key === 'ArrowLeft') next = (index - 1 + categoryTabs.length) % categoryTabs.length;
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = categoryTabs.length - 1;
		else return;
		e.preventDefault();
		const value = categoryTabs[next].value;
		categoryHandler(value);
		document.getElementById(`tab-${value}`)?.focus();
	};

	const searchHandler = (text: string) => {
		const search = { ...searchFilter.search, text: text.trim() || undefined };
		if (!search.text) delete search.text;
		return pushInput({ ...searchFilter, page: 1, search });
	};

	const sortHandler = (sort: string, direction: BoardArticlesInquiry['direction']) =>
		pushInput({ ...searchFilter, sort, direction, page: 1 });

	const paginationChangeHandler = async (value: number) => {
		await pushInput({ ...searchFilter, page: value });
		listRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
	};

	const likeArticleHandler = async (likeUser: T, id: string) => {
		try {
			if (!id) return;
			if (!likeUser?._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetBoardArticle({
				variables: { input: id },
			});

			await boardArticlesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('Error:likeArticleHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const page = searchFilter.page ?? 1;
	const limit = searchFilter.limit ?? defaultCommunityInput.limit;
	const writeHref = user?._id ? WRITE_HREF : `/account/join?referrer=${encodeURIComponent(WRITE_HREF)}`;
	const showFront = page === 1 && !text;

	return (
		<div id="community-list-page" className={'community-page'}>
			<header className={'community-header'}>
				<div className={'container'}>
					<div className={'header-row'}>
						<div className={'header-text'}>
							<span className={'header-label'}>Community</span>
							<h1 className={'page-title'}>Stories from couples</h1>
							<p className={'page-intro'}>Share your preparations, ask questions and find recommendations.</p>
						</div>
						<Link href={writeHref} className={'button-primary'}>
							Write a post
						</Link>
					</div>

					<div className={'community-toolbar'}>
						<div className={'category-tabs'} role="tablist" aria-label="Categories">
							{categoryTabs.map((tab) => (
								<CategoryTab
									key={tab.value}
									value={tab.value}
									label={tab.label}
									active={tab.value === active}
									onSelect={categoryHandler}
									onKeyDown={tabKeyHandler}
								/>
							))}
						</div>
						<div className={'toolbar-tools'}>
							<form
								className={'search-field'}
								role="search"
								onSubmit={(e) => {
									e.preventDefault();
									searchHandler(searchText);
								}}
							>
								<SearchRoundedIcon aria-hidden="true" />
								<input
									type="search"
									value={searchText}
									placeholder="Search posts"
									aria-label="Search posts"
									onChange={(e) => setSearchText(e.target.value)}
								/>
								{searchText && (
									<button type="button" className={'clear-btn'} aria-label="Clear search" onClick={() => setSearchText('')}>
										<CloseRoundedIcon />
									</button>
								)}
							</form>
							<SortMenu
								options={communitySortOptions}
								sort={searchFilter.sort}
								direction={searchFilter.direction}
								onSort={sortHandler}
							/>
						</div>
					</div>
				</div>
			</header>

			<div className={'container'} id="community-results" role="tabpanel" aria-labelledby={`tab-${active}`}>
				{showFront && <CommunityFront key={active} category={category} />}

				<section className={'community-latest'} ref={listRef} aria-labelledby="latest-title">
					<h2 id="latest-title" className={'latest-title'}>
						{text ? `Posts matching “${text}”` : 'Latest posts'}
					</h2>

					{loading ? (
						<ul className={'article-grid'} aria-busy="true" aria-label="Loading posts">
							{Array.from({ length: 6 }).map((_, i) => (
								<li className={'card-skeleton'} key={i}>
									<Skeleton variant="rectangular" className={'skeleton wide'} />
									<Skeleton width="45%" />
									<Skeleton width="90%" height={32} />
									<Skeleton width="70%" />
								</li>
							))}
						</ul>
					) : articles.length === 0 ? (
						<div className={'empty-box community-empty'}>
							<p>
								{text
									? `No posts match “${text}”.`
									: category
									? `No posts in ${categoryLabel(category)} yet.`
									: 'No posts yet.'}
							</p>
							{text ? (
								<button type="button" className={'button-primary'} onClick={() => searchHandler('')}>
									Clear search
								</button>
							) : (
								<Link href={writeHref} className={'button-primary'}>
									Write the first post
								</Link>
							)}
						</div>
					) : (
						<ul className={'article-grid'}>
							{articles.map((article: BoardArticle) => (
								<li key={article._id}>
									<CommunityCard article={article} withFooter likeArticleHandler={likeArticleHandler} />
								</li>
							))}
						</ul>
					)}

					{!loading && articles.length > 0 && (
						<ResultsPagination
							page={page}
							limit={limit}
							total={total}
							onPage={paginationChangeHandler}
							noun={total === 1 ? 'post' : 'posts'}
						/>
					)}

					<p className={'community-guidelines'}>
						<Link href={'/cs?tab=faq&q=guidelines'} className={'button-link'}>
							Community guidelines
						</Link>
					</p>
				</section>
			</div>
		</div>
	);
};

Community.defaultProps = {
	initialInput: defaultCommunityInput,
};

export default withLayoutFull(Community);
