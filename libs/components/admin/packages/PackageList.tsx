import React from 'react';
import { statusBadge, statusLabel } from '../adminLabels';
import { formatKRW, prettyEnum } from '../../../utils';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { Package } from '../../../types/package/package';
import { REACT_APP_API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { PackageStatus } from '../../../enums/package.enum';

interface Data {
	id: string;
	title: string;
	price: string;
	studio: string;
	location: string;
	type: string;
	status: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'id',
		numeric: true,
		disablePadding: false,
		label: 'Package ID',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'Title',
	},
	{
		id: 'price',
		numeric: false,
		disablePadding: false,
		label: 'Price',
	},
	{
		id: 'studio',
		numeric: false,
		disablePadding: false,
		label: 'Studio',
	},
	{
		id: 'location',
		numeric: false,
		disablePadding: false,
		label: 'Location',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'Tier',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'Status',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface PackagePanelListType {
	packages: Package[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updatePackageHandler: any;
	removePackageHandler: any;
}

export const PackagePanelList = (props: PackagePanelListType) => {
	const {
		packages,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updatePackageHandler,
		removePackageHandler,
	} = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{packages.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<span className={'no-data'}>No packages here.</span>
								</TableCell>
							</TableRow>
						)}

						{packages.length !== 0 &&
							packages.map((pkg: Package, index: number) => {
								const packageImage = `${REACT_APP_API_URL}/${pkg?.packageImages[0]}`;

								return (
									<TableRow hover key={pkg?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="left">{pkg._id}</TableCell>
										<TableCell align="left" className={'name'}>
											{pkg.packageStatus === PackageStatus.ACTIVE ? (
												<Stack direction={'row'}>
													<Link href={`/package/detail?id=${pkg?._id}`}>
														<div>
															<Avatar alt="" src={packageImage} sx={{ ml: '2px', mr: '10px' }} />
														</div>
													</Link>
													<Link href={`/package/detail?id=${pkg?._id}`}>
														<div>{pkg.packageTitle}</div>
													</Link>
												</Stack>
											) : (
												<Stack direction={'row'}>
													<div>
														<Avatar alt="" src={packageImage} sx={{ ml: '2px', mr: '10px' }} />
													</div>
													<div style={{ marginTop: "10px" }}>{pkg.packageTitle}</div>
												</Stack>
											)}

										</TableCell>
										<TableCell align="center">{formatKRW(pkg.packagePrice)}</TableCell>
										<TableCell align="center">{pkg.memberData?.memberNick}</TableCell>
										<TableCell align="center">{prettyEnum(pkg.packageLocation)}</TableCell>
										<TableCell align="center">{prettyEnum(pkg.packageType)}</TableCell>
										<TableCell align="center">
											{pkg.packageStatus === PackageStatus.DELETE && (
												<Button
													variant="outlined"
													sx={{ p: '3px', border: 'none', ':hover': { border: '1px solid #000000' } }}
													onClick={() => removePackageHandler(pkg._id)}
												>
													<DeleteIcon fontSize="small" />
												</Button>
											)}

											{pkg.packageStatus !== PackageStatus.DELETE && (
												<>
													<Button
														onClick={(e: any) => menuIconClickHandler(e, index)}
														className={statusBadge(pkg.packageStatus)}
													>
														{statusLabel(pkg.packageStatus)}
													</Button>

													<Menu
														className={'menu-modal'}
														MenuListProps={{
															'aria-labelledby': 'fade-button',
														}}
														anchorEl={anchorEl[index]}
														open={Boolean(anchorEl[index])}
														onClose={menuIconCloseHandler}
														TransitionComponent={Fade}
														sx={{ p: 1 }}
													>
														{Object.values(PackageStatus)
															.filter((ele) => ele !== pkg.packageStatus)
															.map((status: string) => (
																<MenuItem
																	onClick={() => updatePackageHandler({ _id: pkg._id, packageStatus: status })}
																	key={status}
																>
																	<Typography variant={'subtitle1'} component={'span'}>
																		{statusLabel(status)}
																	</Typography>
																</MenuItem>
															))}
													</Menu>
												</>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
