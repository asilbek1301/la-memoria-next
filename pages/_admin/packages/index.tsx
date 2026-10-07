import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { PackagePanelList } from '../../../libs/components/admin/packages/PackageList';
import { AllPackagesInquiry } from '../../../libs/types/package/package.input';
import { Package } from '../../../libs/types/package/package';
import { PackageLocation, PackageStatus } from '../../../libs/enums/package.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { PackageUpdate } from '../../../libs/types/package/package.update';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_PACKAGE_BY_ADMIN, UPDATE_PACKAGE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_PACKAGES_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminPackages: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [packagesInquiry, setPackagesInquiry] = useState<AllPackagesInquiry>(initialInquiry);
	const [packages, setPackages] = useState<Package[]>([]);
	const [packagesTotal, setPackagesTotal] = useState<number>(0);
	const [value, setValue] = useState(
		packagesInquiry?.search?.packageStatus ? packagesInquiry?.search?.packageStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/

	const [updatePackageByAdmin] = useMutation(UPDATE_PACKAGE_BY_ADMIN);
	const [removePackageByAdmin] = useMutation(REMOVE_PACKAGE_BY_ADMIN);

	const {
		refetch: getAllPackagesByAdminRefetch,
	} = useQuery(GET_ALL_PACKAGES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: packagesInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPackages(data?.getAllPackagesByAdmin?.list ?? []);
			setPackagesTotal(data?.getAllPackagesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/

	useEffect(() => {
		getAllPackagesByAdminRefetch({ input: packagesInquiry }).then();
	}, [packagesInquiry]);

	/** HANDLERS **/

	const changePageHandler = async (event: unknown, newPage: number) => {
		packagesInquiry.page = newPage + 1;
		await getAllPackagesByAdminRefetch({ input: packagesInquiry });
		setPackagesInquiry({ ...packagesInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		packagesInquiry.limit = parseInt(event.target.value, 10);
		packagesInquiry.page = 1;
		await getAllPackagesByAdminRefetch({ input: packagesInquiry });
		setPackagesInquiry({ ...packagesInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		setPackagesInquiry({ ...packagesInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setPackagesInquiry({ ...packagesInquiry, search: { packageStatus: PackageStatus.ACTIVE } });
				break;
			case 'HOLD':
				setPackagesInquiry({ ...packagesInquiry, search: { packageStatus: PackageStatus.HOLD } });
				break;
			case 'PAUSE':
				setPackagesInquiry({ ...packagesInquiry, search: { packageStatus: PackageStatus.PAUSE } });
				break;
			case 'DELETE':
				setPackagesInquiry({ ...packagesInquiry, search: { packageStatus: PackageStatus.DELETE } });
				break;
			default:
				delete packagesInquiry?.search?.packageStatus;
				setPackagesInquiry({ ...packagesInquiry });
				break;
		}
	};

	const removePackageHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removePackageByAdmin({
					variables: {
						input: id,
					},
				});

				await getAllPackagesByAdminRefetch({ input: packagesInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setPackagesInquiry({
					...packagesInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...packagesInquiry.search,
						packageLocationList: [newValue as PackageLocation],
					},
				});
			} else {
				delete packagesInquiry?.search?.packageLocationList;
				setPackagesInquiry({ ...packagesInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updatePackageHandler = async (updateData: PackageUpdate) => {
		try {
			console.log('+updateData: ', updateData);
			await updatePackageByAdmin({
				variables: {
					input: updateData,
				},
			});

			menuIconCloseHandler();
			await getAllPackagesByAdminRefetch({ input: packagesInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Package List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem
									onClick={(e) => tabChangeHandler(e, 'ALL')}
									value="ALL"
									className={value === 'ALL' ? 'li on' : 'li'}
								>
									All
								</ListItem>
								<ListItem
									onClick={(e) => tabChangeHandler(e, 'ACTIVE')}
									value="ACTIVE"
									className={value === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={(e) => tabChangeHandler(e, 'HOLD')}
									value="HOLD"
									className={value === 'HOLD' ? 'li on' : 'li'}
								>
									Hold
								</ListItem>
								<ListItem
									onClick={(e) => tabChangeHandler(e, 'PAUSE')}
									value="PAUSE"
									className={value === 'PAUSE' ? 'li on' : 'li'}
								>
									Paused
								</ListItem>
								<ListItem
									onClick={(e) => tabChangeHandler(e, 'DELETE')}
									value="DELETE"
									className={value === 'DELETE' ? 'li on' : 'li'}
								>
									Delete
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(PackageLocation).map((location: string) => (
										<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>
											{location}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<PackagePanelList
							packages={packages}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updatePackageHandler={updatePackageHandler}
							removePackageHandler={removePackageHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={packagesTotal}
							rowsPerPage={packagesInquiry?.limit}
							page={packagesInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminPackages.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminPackages);
