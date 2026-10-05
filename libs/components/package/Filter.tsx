import React, { useCallback, useEffect, useState } from 'react';
import {
	Stack,
	Typography,
	Checkbox,
	Button,
	OutlinedInput,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Tooltip,
	IconButton,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PackageLocation, PackageStyle, PackageType } from '../../enums/package.enum';
import { PackagesInquiry } from '../../types/package/package.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { packageDurations, packagePhotosList } from '../../config';
import RefreshIcon from '@mui/icons-material/Refresh';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface FilterType {
	searchFilter: PackagesInquiry;
	setSearchFilter: any;
	initialInput: PackagesInquiry;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [packageLocation, setPackageLocation] = useState<PackageLocation[]>(Object.values(PackageLocation));
	const [packageType, setPackageType] = useState<PackageType[]>(Object.values(PackageType));
	const [packageStyle, setPackageStyle] = useState<PackageStyle[]>(Object.values(PackageStyle));
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);

	/** LIFECYCLES **/
	
	useEffect(() => {
		if (searchFilter?.search?.locationList?.length == 0) {
			delete searchFilter.search.locationList;
			setShowMore(false);
			router
				.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.typeList?.length == 0) {
			delete searchFilter.search.typeList;
			router
				.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.styleList?.length == 0) {
			delete searchFilter.search.styleList;
			router
				.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.options?.length == 0) {
			delete searchFilter.search.options;
			router
				.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.photosList?.length == 0) {
			delete searchFilter.search.photosList;
			router
				.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.locationList) setShowMore(true);
	}, [searchFilter]);

	/** HANDLERS **/
	
	const packageLocationSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, locationList: [...(searchFilter?.search?.locationList || []), value] },
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, locationList: [...(searchFilter?.search?.locationList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.locationList?.includes(value)) {
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								locationList: searchFilter?.search?.locationList?.filter((item: string) => item !== value),
							},
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								locationList: searchFilter?.search?.locationList?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				if (searchFilter?.search?.typeList?.length == 0) {
					alert('error');
				}

				console.log('packageLocationSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, packageLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packageTypeSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] },
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.typeList?.includes(value)) {
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== value),
							},
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				if (searchFilter?.search?.typeList?.length == 0) {
					alert('error');
				}

				console.log('packageTypeSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, packageTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packageStyleSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, styleList: [...(searchFilter?.search?.styleList || []), value] },
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, styleList: [...(searchFilter?.search?.styleList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.styleList?.includes(value)) {
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								styleList: searchFilter?.search?.styleList?.filter((item: string) => item !== value),
							},
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								styleList: searchFilter?.search?.styleList?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				console.log('packageStyleSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, packageStyleSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packageOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, options: [...(searchFilter?.search?.options || []), value] },
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, options: [...(searchFilter?.search?.options || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.options?.includes(value)) {
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								options: searchFilter?.search?.options?.filter((item: string) => item !== value),
							},
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								options: searchFilter?.search?.options?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				console.log('packageOptionSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, packageOptionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packagePhotosSelectHandler = useCallback(
		async (number: Number) => {
			try {
				if (number != 0) {
					if (searchFilter?.search?.photosList?.includes(number)) {
						await router.push(
							`/package?input=${JSON.stringify({
								...searchFilter,
								search: {
									...searchFilter.search,
									photosList: searchFilter?.search?.photosList?.filter((item: Number) => item !== number),
								},
							})}`,
							`/package?input=${JSON.stringify({
								...searchFilter,
								search: {
									...searchFilter.search,
									photosList: searchFilter?.search?.photosList?.filter((item: Number) => item !== number),
								},
							})}`,
							{ scroll: false },
						);
					} else {
						await router.push(
							`/package?input=${JSON.stringify({
								...searchFilter,
								search: { ...searchFilter.search, photosList: [...(searchFilter?.search?.photosList || []), number] },
							})}`,
							`/package?input=${JSON.stringify({
								...searchFilter,
								search: { ...searchFilter.search, photosList: [...(searchFilter?.search?.photosList || []), number] },
							})}`,
							{ scroll: false },
						);
					}
				} else {
					delete searchFilter?.search.photosList;
					setSearchFilter({ ...searchFilter });
					await router.push(
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
							},
						})}`,
						`/package?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
							},
						})}`,
						{ scroll: false },
					);
				}

				console.log('packagePhotosSelectHandler:', number);
			} catch (err: any) {
				console.log('ERROR, packagePhotosSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packageDurationHandler = useCallback(
		async (e: any, type: string) => {
			const value = e.target.value;

			if (type == 'start') {
				await router.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							durationsRange: { ...searchFilter.search.durationsRange, start: value },
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							durationsRange: { ...searchFilter.search.durationsRange, start: value },
						},
					})}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							durationsRange: { ...searchFilter.search.durationsRange, end: value },
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							durationsRange: { ...searchFilter.search.durationsRange, end: value },
						},
					})}`,
					{ scroll: false },
				);
			}
		},
		[searchFilter],
	);

	const packagePriceHandler = useCallback(
		async (value: number, type: string) => {
			if (type == 'start') {
				await router.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 },
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 },
						},
					})}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 },
						},
					})}`,
					`/package?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 },
						},
					})}`,
					{ scroll: false },
				);
			}
		},
		[searchFilter],
	);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await router.push(
				`/package?input=${JSON.stringify(initialInput)}`,
				`/package?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>PACKAGES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-home'} mb={'40px'}>
					<Typography className={'title-main'}>Find Your Package</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={searchText}
							type={'text'}
							className={'search-input'}
							placeholder={'What are you looking for?'}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') {
									setSearchFilter({
										...searchFilter,
										search: { ...searchFilter.search, text: searchText },
									});
								}
							}}
							endAdornment={
								<>
									<CancelRoundedIcon
										onClick={() => {
											setSearchText('');
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: '' },
											});
										}}
									/>
								</>
							}
						/>
						<img src={'/img/icons/search_icon.png'} alt={''} />
						<Tooltip title="Reset">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<p className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>
						Location
					</p>
					<Stack
						className={`package-location`}
						style={{ height: showMore ? '253px' : '115px' }}
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.locationList) {
								setShowMore(false);
							}
						}}
					>
						{packageLocation.map((location: string) => {
							return (
								<Stack className={'input-box'} key={location}>
									<Checkbox
										id={location}
										className="package-checkbox"
										color="default"
										size="small"
										value={location}
										checked={(searchFilter?.search?.locationList || []).includes(location as PackageLocation)}
										onChange={packageLocationSelectHandler}
									/>
									<label htmlFor={location} style={{ cursor: 'pointer' }}>
										<Typography className="package-type">{location}</Typography>
									</label>
								</Stack>
							);
						})}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Package Type</Typography>
					{packageType.map((type: string) => (
						<Stack className={'input-box'} key={type}>
							<Checkbox
								id={type}
								className="package-checkbox"
								color="default"
								size="small"
								value={type}
								onChange={packageTypeSelectHandler}
								checked={(searchFilter?.search?.typeList || []).includes(type as PackageType)}
							/>
							<label style={{ cursor: 'pointer' }}>
								<Typography className="package_type">{type}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Package Style</Typography>
					{packageStyle.map((style: string) => (
						<Stack className={'input-box'} key={style}>
							<Checkbox
								id={style}
								className="package-checkbox"
								color="default"
								size="small"
								value={style}
								onChange={packageStyleSelectHandler}
								checked={(searchFilter?.search?.styleList || []).includes(style as PackageStyle)}
							/>
							<label htmlFor={style} style={{ cursor: 'pointer' }}>
								<Typography className="package_type">{style}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Edited Photos</Typography>
					<Stack className="button-group">
						<Button
							sx={{
								borderRadius: '12px 0 0 12px',
								border: !searchFilter?.search?.photosList ? '2px solid #181A20' : '1px solid #b9b9b9',
							}}
							onClick={() => packagePhotosSelectHandler(0)}
						>
							Any
						</Button>
						{packagePhotosList.map((photos: number, index: number) => {
							const isLast = index === packagePhotosList.length - 1;
							const selected = searchFilter?.search?.photosList?.includes(photos);
							return (
								<Button
									key={photos}
									sx={{
										borderRadius: isLast ? '0 12px 12px 0' : 0,
										border: selected ? '2px solid #181A20' : '1px solid #b9b9b9',
										borderLeft: selected ? undefined : 'none',
									}}
									onClick={() => packagePhotosSelectHandler(photos)}
								>
									{photos}
								</Button>
							);
						})}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Options</Typography>
					{[
						{ value: 'packageAlbum', label: 'Album' },
						{ value: 'packageDress', label: 'Dress' },
						{ value: 'packageMakeup', label: 'Makeup' },
					].map((option) => (
						<Stack className={'input-box'} key={option.value}>
							<Checkbox
								id={option.label}
								className="package-checkbox"
								color="default"
								size="small"
								value={option.value}
								checked={(searchFilter?.search?.options || []).includes(option.value)}
								onChange={packageOptionSelectHandler}
							/>
							<label htmlFor={option.label} style={{ cursor: 'pointer' }}>
								<Typography className="package-type">{option.label}</Typography>
							</label>
						</Stack>
					))}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Duration (hours)</Typography>
					<Stack className="square-year-input">
						<FormControl>
							<InputLabel id="demo-simple-select-label">Min</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={searchFilter?.search?.durationsRange?.start ?? 0}
								label="Min"
								onChange={(e: any) => packageDurationHandler(e, 'start')}
								MenuProps={MenuProps}
							>
								{packageDurations.map((duration: number) => (
									<MenuItem
										value={duration}
										disabled={(searchFilter?.search?.durationsRange?.end || 0) < duration}
										key={duration}
									>
										{duration}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<div className="central-divider"></div>
						<FormControl>
							<InputLabel id="demo-simple-select-label">Max</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={searchFilter?.search?.durationsRange?.end ?? packageDurations[packageDurations.length - 1]}
								label="Max"
								onChange={(e: any) => packageDurationHandler(e, 'end')}
								MenuProps={MenuProps}
							>
								{packageDurations.map((duration: number) => (
									<MenuItem
										value={duration}
										disabled={(searchFilter?.search?.durationsRange?.start || 0) > duration}
										key={duration}
									>
										{duration}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'}>
					<Typography className={'title'}>Price Range</Typography>
					<Stack className="square-year-input">
						<input
							type="number"
							placeholder="$ min"
							min={0}
							value={searchFilter?.search?.pricesRange?.start ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									packagePriceHandler(e.target.value, 'start');
								}
							}}
						/>
						<div className="central-divider"></div>
						<input
							type="number"
							placeholder="$ max"
							value={searchFilter?.search?.pricesRange?.end ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									packagePriceHandler(e.target.value, 'end');
								}
							}}
						/>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;
