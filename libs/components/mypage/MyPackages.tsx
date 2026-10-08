import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { Package } from '../../types/package/package';
import { StudioPackagesInquiry } from '../../types/package/package.input';
import { PackageStatus } from '../../enums/package.enum';
import { Direction } from '../../enums/common.enum';
import { UPDATE_PACKAGE } from '../../../apollo/user/mutation';
import { GET_STUDIO_PACKAGES } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { formatKRW } from '../../utils';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { FilterTabs } from '../homepage/HomeSection';
import { ResultsPagination } from '../common/ListControls';
import { plural } from '../studio/studioSearch';

type StatusTab = PackageStatus.ACTIVE | PackageStatus.PAUSE | PackageStatus.HOLD;

const statusTabs: { value: StatusTab; label: string }[] = [
	{ value: PackageStatus.ACTIVE, label: 'Published' },
	{ value: PackageStatus.PAUSE, label: 'Paused' },
	{ value: PackageStatus.HOLD, label: 'On hold' },
];

const initialInput: StudioPackagesInquiry = {
	page: 1,
	limit: 5,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { packageStatus: PackageStatus.ACTIVE },
};

/** a studio's own packages: publish, pause, edit or delete (same UPDATE_PACKAGE calls as before) **/
const MyPackages = () => {
	const [searchFilter, setSearchFilter] = useState<StudioPackagesInquiry>(initialInput);

	/** APOLLO REQUESTS **/

	const [updatePackage] = useMutation(UPDATE_PACKAGE);
	const { data, loading, refetch } = useQuery(GET_STUDIO_PACKAGES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
	});
	const packages: Package[] = data?.getStudioPackages?.list ?? [];
	const total: number = data?.getStudioPackages?.metaCounter?.[0]?.total ?? 0;
	const active = (searchFilter.search.packageStatus ?? PackageStatus.ACTIVE) as StatusTab;

	/** HANDLERS **/

	const changeStatus = async (id: string, status: PackageStatus, question: string) => {
		try {
			if (!(await sweetConfirmAlert(question))) return;
			await updatePackage({ variables: { input: { _id: id, packageStatus: status } } });
			await refetch({ input: searchFilter });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<section className={'my-section'} aria-labelledby="packages-title">
			<div className={'section-row'}>
				<div>
					<h2 id="packages-title" className={'detail-title'}>
						My packages
					</h2>
					<p className={'section-note'}>Published packages are visible to couples. Paused ones are hidden.</p>
				</div>
				<div className={'section-tools'}>
					<FilterTabs
						label="Filter by status"
						options={statusTabs}
						value={active}
						onChange={(value) => setSearchFilter({ ...searchFilter, page: 1, search: { packageStatus: value as PackageStatus } })}
					/>
					<Link href={{ pathname: '/mypage', query: { category: 'addPackage' } }} className={'button-primary'}>
						Add package
					</Link>
				</div>
			</div>

			{loading && packages.length === 0 ? (
				<div className={'reservation-list'} aria-busy="true">
					{[0, 1].map((i) => (
						<Skeleton key={i} variant="rectangular" className={'skeleton res-skeleton'} />
					))}
				</div>
			) : packages.length === 0 ? (
				<div className={'empty-box my-empty'}>
					<p>No {statusTabs.find((tab) => tab.value === active)?.label.toLowerCase()} packages.</p>
					{active === PackageStatus.ACTIVE && (
						<Link href={{ pathname: '/mypage', query: { category: 'addPackage' } }} className={'button-primary'}>
							Add your first package
						</Link>
					)}
				</div>
			) : (
				<div className={'reservation-list'}>
					{packages.map((pkg) => {
						const image = pkg.packageImages?.[0] ? `${REACT_APP_API_URL}/${pkg.packageImages[0]}` : '';
						const href = { pathname: '/package/detail', query: { id: pkg._id } };
						const stats = [
							(pkg.packageViews ?? 0) > 0 && plural(pkg.packageViews, 'view'),
							(pkg.packageLikes ?? 0) > 0 && plural(pkg.packageLikes, 'like'),
						]
							.filter(Boolean)
							.join(' · ');
						return (
							<article className={`reservation-card package-row status-${String(pkg.packageStatus).toLowerCase()}`} key={pkg._id}>
								<Link href={href} className={'res-thumb'} tabIndex={-1} aria-hidden="true">
									{image ? <img src={image} alt="" loading="lazy" /> : <span className={'img-placeholder'} />}
								</Link>
								<div className={'res-body'}>
									<div className={'res-top'}>
										<span className={'status-pill'}>{statusTabs.find((tab) => tab.value === pkg.packageStatus)?.label ?? pkg.packageStatus}</span>
										<span className={'price'}>{formatKRW(pkg.packagePrice)}</span>
									</div>
									<h3 className={'res-title'}>
										<Link href={href}>{pkg.packageTitle}</Link>
									</h3>
									{stats && <p className={'res-meta'}>{stats}</p>}
									<div className={'res-actions'}>
										<Link
											href={{ pathname: '/mypage', query: { category: 'addPackage', packageId: pkg._id } }}
											className={'button-secondary'}
										>
											Edit
										</Link>
										{pkg.packageStatus === PackageStatus.ACTIVE ? (
											<button
												type="button"
												className={'button-link'}
												onClick={() => changeStatus(pkg._id, PackageStatus.PAUSE, 'Pause this package? Couples will not see it.')}
											>
												Pause
											</button>
										) : (
											<button
												type="button"
												className={'button-link'}
												onClick={() => changeStatus(pkg._id, PackageStatus.ACTIVE, 'Publish this package?')}
											>
												Publish
											</button>
										)}
										<button
											type="button"
											className={'button-link danger'}
											onClick={() => changeStatus(pkg._id, PackageStatus.DELETE, 'Delete this package? This cannot be undone.')}
										>
											Delete
										</button>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}

			{total > searchFilter.limit && (
				<ResultsPagination
					page={searchFilter.page}
					limit={searchFilter.limit}
					total={total}
					onPage={(page) => setSearchFilter({ ...searchFilter, page })}
					noun="packages"
				/>
			)}
		</section>
	);
};

export default MyPackages;
