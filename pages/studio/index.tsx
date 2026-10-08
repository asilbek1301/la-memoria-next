import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import Link from 'next/link';
import StudioCard from '../../libs/components/studio/StudioCard';
import StudioSpotlight from '../../libs/components/studio/StudioSpotlight';
import { ResultsPagination, SortMenu } from '../../libs/components/common/ListControls';
import {
	defaultStudiosInput,
	parseStudiosInput,
	plural,
	studioSortOptions,
	studiosHref,
} from '../../libs/components/studio/studioSearch';
import { StudiosInquiry } from '../../libs/types/member/member.input';
import { Member } from '../../libs/types/member/member';
import { GET_STUDIOS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { T } from '../../libs/types/common';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const StudioList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const [searchFilter, setSearchFilter] = useState<StudiosInquiry>(
		router?.query?.input ? parseStudiosInput(router.query.input) : initialInput,
	);
	const [studios, setStudios] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>(searchFilter.search?.text ?? '');
	const listRef = useRef<HTMLElement>(null);

	/** APOLLO REQUESTS **/

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const {
		loading: getStudiosLoading,
		networkStatus,
		refetch: getStudiosRefetch,
	} = useQuery(GET_STUDIOS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !router.isReady,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setStudios(data?.getStudios?.list ?? []);
			setTotal(data?.getStudios?.metaCounter[0]?.total ?? 0);
		},
	});
	// a like refetches quietly; every other request shows the skeleton rows
	const loading = !router.isReady || (getStudiosLoading && networkStatus !== NetworkStatus.refetch);

	/** LIFECYCLES **/

	// the URL is the source of truth: search, sort and page all live in ?input=
	useEffect(() => {
		if (!router.isReady) return;
		setSearchFilter(router.query.input ? parseStudiosInput(router.query.input) : initialInput);
	}, [router.isReady, router.query.input, initialInput]);

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

	/** HANDLERS **/

	const pushInput = async (next: StudiosInquiry) => {
		await router.push(studiosHref(next), studiosHref(next), { scroll: false });
	};

	const searchHandler = (text: string) => {
		const search = { ...searchFilter.search, text: text.trim() || undefined };
		if (!search.text) delete search.text;
		return pushInput({ ...searchFilter, page: 1, search });
	};

	const sortHandler = (sort: string, direction: StudiosInquiry['direction']) =>
		pushInput({ ...searchFilter, sort, direction, page: 1 });

	const paginationChangeHandler = async (value: number) => {
		await pushInput({ ...searchFilter, page: value });
		listRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
	};

	const likeMemberHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: { input: id },
			});

			await getStudiosRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('Error:likeMemberHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const page = searchFilter.page ?? 1;
	const limit = searchFilter.limit ?? defaultStudiosInput.limit;

	const showSpotlight = page === 1 && !searchFilter.search?.text;

	return (
		<div id="studio-list-page" className={'studio-page'}>
			<header className={'studio-header'}>
				<div className={'container'}>
					<div className={'header-row'}>
						<div className={'header-text'}>
							<span className={'header-label'}>Studios</span>
							<h1 className={'page-title'}>Meet the studios</h1>
							<p className={'page-intro'}>
								The photography studios behind every package, from Seoul to Jeju.
							</p>
						</div>
						<p className={'studio-count'} aria-live="polite">
							<i className={'count-dot'} aria-hidden="true" />
							{loading ? 'Loading studios' : plural(total, 'studio')}
						</p>
					</div>
					<div className={'monogram-rule'} aria-hidden="true">
						<img src="/img/logo/monogram.svg" alt="" />
					</div>
				</div>
			</header>

			{showSpotlight && (
				<div className={'container'}>
					<StudioSpotlight />
				</div>
			)}

			<section className={'studio-results'} ref={listRef} aria-label="All studios">
				<div className={'container'}>
					<div className={'studio-toolbar'}>
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
								placeholder="Search studios"
								aria-label="Search studios"
								onChange={(e) => setSearchText(e.target.value)}
							/>
							{searchText && (
								<button
									type="button"
									className={'clear-btn'}
									aria-label="Clear search"
									onClick={() => setSearchText('')}
								>
									<CloseRoundedIcon />
								</button>
							)}
						</form>
						<SortMenu
							options={studioSortOptions}
							sort={searchFilter.sort}
							direction={searchFilter.direction}
							onSort={sortHandler}
						/>
					</div>

					{loading ? (
						<ul className={'studio-grid'} aria-busy="true" aria-label="Loading studios">
							{Array.from({ length: 4 }).map((_, i) => (
								<li className={'tile-skeleton'} key={i}>
									<Skeleton variant="rectangular" className={'skeleton arch-skeleton'} />
									<Skeleton width="50%" />
									<Skeleton width="70%" height={32} />
									<Skeleton width="40%" />
								</li>
							))}
						</ul>
					) : studios.length === 0 ? (
						<div className={'empty-box studio-empty'}>
							<p>
								{searchFilter.search?.text
									? `No studios match “${searchFilter.search.text}”.`
									: 'No studios match your search.'}
							</p>
							{searchFilter.search?.text && (
								<button type="button" className={'button-primary'} onClick={() => searchHandler('')}>
									Clear search
								</button>
							)}
						</div>
					) : (
						<ul className={'studio-grid'}>
							{studios.map((studio: Member) => (
								<li key={studio._id}>
									<StudioCard studio={studio} likeMemberHandler={likeMemberHandler} showViews />
								</li>
							))}
						</ul>
					)}

					{!loading && studios.length > 0 && (
						<ResultsPagination
							page={page}
							limit={limit}
							total={total}
							onPage={paginationChangeHandler}
							noun={total === 1 ? 'studio' : 'studios'}
						/>
					)}

					<aside className={'studio-help'} aria-labelledby="studio-help-title">
						<div className={'help-text'}>
							<span className={'help-label'}>Need help?</span>
							<h2 id="studio-help-title" className={'help-title'}>
								Not sure which studio fits you?
							</h2>
							<p className={'help-desc'}>
								Call us and we will help you compare studios and packages for your date.
							</p>
						</div>
						<div className={'help-actions'}>
							<a className={'button-link'} href="tel:+821048672909">
								+82 10 4867 2909
							</a>
							<Link href={'/cs'} className={'button-primary'}>
								Contact us
							</Link>
						</div>
					</aside>
				</div>
			</section>
		</div>
	);
};

StudioList.defaultProps = {
	initialInput: defaultStudiosInput,
};

export default withLayoutFull(StudioList);
