import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PackageCard } from './PackageCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Package } from '../../types/package/package';
import { StudioPackagesInquiry } from '../../types/package/package.input';
import { T } from '../../types/common';
import { PackageStatus } from '../../enums/package.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { UPDATE_PACKAGE } from '../../../apollo/user/mutation';
import { GET_STUDIO_PACKAGES } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyPackages: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<StudioPackagesInquiry>(initialInput);
	const [studioPackages, setStudioPackages] = useState<Package[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/

	const [updatePackage] = useMutation(UPDATE_PACKAGE);

	const {
		loading: getStudioPackagesLoading,
		data: getStudioPackagesData,
		error: getStudioPackagesError,
		refetch: getStudioPackagesRefetch,
	} = useQuery(GET_STUDIO_PACKAGES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setStudioPackages(data?.getStudioPackages?.list);
			setTotal(data?.getStudioPackages?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: PackageStatus) => {
		setSearchFilter({ ...searchFilter, search: { packageStatus: value } });
	};

	const deletePackageHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this package?')) {
				await updatePackage({
					variables: {
						input: {
							_id: id,
							packageStatus: 'DELETE',
						},
					},
				});
				await getStudioPackagesRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};
	const updatePackageHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`Are you sure to change ${status} status?`)) {
				await updatePackage({
					variables: {
						input: {
							_id: id,
							packageStatus: status,
						},
					},
				});
				await getStudioPackagesRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'STUDIO') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>LA MEMORIA PACKAGES MOBILE</div>;
	} else {
		return (
			<div id="my-package-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Packages</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="package-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(PackageStatus.ACTIVE)}
							className={searchFilter.search.packageStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							Active
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(PackageStatus.PAUSE)}
							className={searchFilter.search.packageStatus === 'PAUSE' ? 'active-tab-name' : 'tab-name'}
						>
							Paused
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(PackageStatus.HOLD)}
							className={searchFilter.search.packageStatus === 'HOLD' ? 'active-tab-name' : 'tab-name'}
						>
							On Hold
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Package title</Typography>
							<Typography className="title-text">Date Published</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">View</Typography>
							{searchFilter.search.packageStatus !== 'DELETE' && (
								<Typography className="title-text">Action</Typography>
							)}
						</Stack>

						{studioPackages?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Package found!</p>
							</div>
						) : (
							studioPackages.map((pkg: Package) => {
								return (
									<PackageCard
										pkg={pkg}
										deletePackageHandler={deletePackageHandler}
										updatePackageHandler={updatePackageHandler}
									/>
								);
							})
						)}

						{studioPackages.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} package available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyPackages.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			packageStatus: 'ACTIVE',
		},
	},
};

export default MyPackages;
