import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PackageCard } from '../mypage/PackageCard';
import { Package } from '../../types/package/package';
import { PackagesInquiry } from '../../types/package/package.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PACKAGES } from '../../../apollo/user/query';

const MyPackages: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<PackagesInquiry>({ ...initialInput });
	const [studioPackages, setStudioPackages] = useState<Package[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/

	const {
		refetch: getPackagesRefetch,
	} = useQuery(GET_PACKAGES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setStudioPackages(data?.getPackages?.list);
			setTotal(data?.getPackages?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/

	useEffect(() => {
		getPackagesRefetch().then();
	}, [searchFilter]);

	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (device === 'mobile') {
		return <div>LA MEMORIA PACKAGES MOBILE</div>;
	} else {
		return (
			<div id="member-packages-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Packages</Typography>
					</Stack>
				</Stack>
				<Stack className="packages-list-box">
					<Stack className="list-box">
						{studioPackages?.length > 0 && (
							<Stack className="listing-title-box">
								<Typography className="title-text">Package title</Typography>
								<Typography className="title-text">Date Published</Typography>
								<Typography className="title-text">Status</Typography>
								<Typography className="title-text">View</Typography>
							</Stack>
						)}
						{studioPackages?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Package found!</p>
							</div>
						)}
						{studioPackages?.map((pkg: Package) => {
							return <PackageCard pkg={pkg} memberPage={true} key={pkg?._id} />;
						})}

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
			memberId: '',
		},
	},
};

export default MyPackages;
