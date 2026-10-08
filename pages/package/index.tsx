import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { useReducedMotion } from 'framer-motion';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import PopularPackageCard from '../../libs/components/homepage/PopularPackageCard';
import SentenceFilter, { SentenceBar } from '../../libs/components/package/SentenceFilter';
import MoreFilters from '../../libs/components/package/MoreFilters';
import ResultsToolbar from '../../libs/components/package/ResultsToolbar';
import { ResultsPagination } from '../../libs/components/common/ListControls';
import {
	SearchPatch,
	activeChips,
	applySearch,
	clearedSearch,
	defaultPackagesInput,
	emptySentence,
	extraFilterCount,
	packagesHref,
	parsePackagesInput,
} from '../../libs/components/package/packageSearch';
import { PackagesInquiry } from '../../libs/types/package/package.input';
import { Package } from '../../libs/types/package/package';
import { Message } from '../../libs/enums/common.enum';
import { GET_PACKAGES } from '../../apollo/user/query';
import { LIKE_TARGET_PACKAGE } from '../../apollo/user/mutation';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PackageList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const [searchFilter, setSearchFilter] = useState<PackagesInquiry>(
		router?.query?.input ? parsePackagesInput(router.query.input) : initialInput,
	);
	const [packages, setPackages] = useState<Package[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [moreOpen, setMoreOpen] = useState<boolean>(false);
	const [barVisible, setBarVisible] = useState<boolean>(false);
	const headerRef = useRef<HTMLElement>(null);
	const resultsRef = useRef<HTMLElement>(null);

	/** APOLLO REQUESTS **/

	const [likeTargetPackage] = useMutation(LIKE_TARGET_PACKAGE);

	const {
		loading: getPackagesLoading,
		networkStatus,
		refetch: getPackagesRefetch,
	} = useQuery(GET_PACKAGES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !router.isReady,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPackages(data?.getPackages?.list ?? []);
			setTotal(data?.getPackages?.metaCounter[0]?.total ?? 0);
		},
	});
	// a like refetches quietly; every other request shows the card skeletons
	const loading = !router.isReady || (getPackagesLoading && networkStatus !== NetworkStatus.refetch);

	/** LIFECYCLES **/

	// the URL is the source of truth: filters, sort and page all live in ?input=
	useEffect(() => {
		if (!router.isReady) return;
		setSearchFilter(router.query.input ? parsePackagesInput(router.query.input) : initialInput);
	}, [router.isReady, router.query.input, initialInput]);

	// the slim filter bar appears once the sentence has scrolled under the navbar
	useEffect(() => {
		const el = headerRef.current;
		if (!el || typeof IntersectionObserver === 'undefined') return;
		const observer = new IntersectionObserver(
			([entry]) => setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
			{ rootMargin: '-80px 0px 0px 0px' },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	/** HANDLERS **/

	const pushInput = async (next: PackagesInquiry) => {
		await router.push(packagesHref(next), packagesHref(next), { scroll: false });
	};

	const searchHandler = (patch: SearchPatch) => pushInput(applySearch(searchFilter, patch));

	const sortHandler = (sort: string, direction: PackagesInquiry['direction']) =>
		pushInput({ ...searchFilter, sort, direction, page: 1 });

	const handlePaginationChange = async (value: number) => {
		await pushInput({ ...searchFilter, page: value });
		resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
	};

	const likePackageHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetPackage({
				variables: { input: id },
			});
			await getPackagesRefetch({ input: searchFilter });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('Error:likePackageHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const chips = activeChips(searchFilter);
	const extraCount = extraFilterCount(searchFilter);
	const page = searchFilter.page ?? 1;
	const limit = searchFilter.limit ?? defaultPackagesInput.limit;

	return (
		<div id="package-list-page" className={'package-page'}>
			<header className={'package-header'} ref={headerRef}>
				<div className={'container'}>
					<h1 className={'visually-hidden'}>Find your package</h1>
					<SentenceFilter
						input={searchFilter}
						onSearch={searchHandler}
						onOpenMore={() => setMoreOpen(true)}
						extraCount={extraCount}
					/>
				</div>
			</header>

			<SentenceBar
				input={searchFilter}
				onSearch={searchHandler}
				onOpenMore={() => setMoreOpen(true)}
				extraCount={extraCount}
				visible={barVisible}
			/>

			<section className={'package-results'} ref={resultsRef} aria-label="Packages">
				<div className={'container'}>
					<ResultsToolbar
						input={searchFilter}
						total={total}
						loading={loading}
						chips={chips}
						onRemoveChip={(chip) => searchHandler(chip.patch)}
						onClearAll={() => pushInput(clearedSearch(searchFilter))}
						onSort={sortHandler}
					/>

					{loading ? (
						<div className={'package-grid'} aria-busy="true" aria-label="Loading packages">
							{Array.from({ length: limit }).map((_, i) => (
								<div className={'card-skeleton'} key={i}>
									<Skeleton variant="rectangular" className={'skeleton portrait'} />
									<Skeleton width="70%" />
									<Skeleton width="90%" height={32} />
									<Skeleton width="55%" />
								</div>
							))}
						</div>
					) : packages.length === 0 ? (
						<div className={'empty-box package-empty'}>
							<p>{emptySentence(searchFilter)}</p>
							{chips.length > 0 && (
								<div className={'empty-actions'}>
									{(searchFilter.search?.typeList?.length ?? 0) > 0 && (
										<button
											type="button"
											className={'button-secondary'}
											onClick={() => searchHandler({ typeList: [] })}
										>
											Show all tiers
										</button>
									)}
									<button
										type="button"
										className={'button-primary'}
										onClick={() => pushInput(clearedSearch(searchFilter))}
									>
										Clear filters
									</button>
								</div>
							)}
						</div>
					) : (
						<ul className={'package-grid'}>
							{packages.map((pkg: Package) => (
								<li key={pkg._id}>
									<PopularPackageCard pkg={pkg} likePackageHandler={likePackageHandler} showViews />
								</li>
							))}
						</ul>
					)}

					{!loading && packages.length > 0 && (
						<ResultsPagination page={page} limit={limit} total={total} onPage={handlePaginationChange} />
					)}
				</div>
			</section>

			<MoreFilters
				open={moreOpen}
				onClose={() => setMoreOpen(false)}
				input={searchFilter}
				onSearch={searchHandler}
				total={total}
				loading={loading}
			/>
		</div>
	);
};

PackageList.defaultProps = {
	initialInput: defaultPackagesInput,
};

export default withLayoutFull(PackageList);
