import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { packageDurations, packagePhotosList } from '../../config';
import { PackageLocation, PackageStyle, PackageType } from '../../enums/package.enum';
import { PackagesInquiry } from '../../types/package/package.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { dropdownVariants, glassPress, itemFadeUp, searchShellVariants, springSnappy } from '../common/motion';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'background.paper',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: 24,
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

/** placeholder banners until package-type artwork is added **/
const packageTypeImages: Record<string, string> = {
	PEARL: '/img/banner/types/apartment.webp',
	GOLD: '/img/banner/types/villa.webp',
	DIAMOND: '/img/banner/types/house.webp',
};

interface HeaderFilterProps {
	initialInput: PackagesInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t, i18n } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<PackagesInquiry>(initialInput);
	const locationRef: any = useRef();
	const typeRef: any = useRef();
	const roomsRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openRooms, setOpenRooms] = useState(false);
	const [packageLocation, setPackageLocation] = useState<PackageLocation[]>(Object.values(PackageLocation));
	const [packageType, setPackageType] = useState<PackageType[]>(Object.values(PackageType));
	const [packageStyle, setPackageStyle] = useState<PackageStyle[]>(Object.values(PackageStyle));
	const [optionCheck, setOptionCheck] = useState('all');

	/** LIFECYCLES **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target)) {
				setOpenLocation(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}

			if (!roomsRef?.current?.contains(event.target)) {
				setOpenRooms(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);

		return () => {
			document.removeEventListener('mousedown', clickHandler);
		};
	}, []);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenRooms(false);
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenRooms(false);
		setOpenType(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
		setOpenRooms(false);
	};

	const roomStateChangeHandler = () => {
		setOpenRooms((prev) => !prev);
		setOpenType(false);
		setOpenLocation(false);
	};

	const disableAllStateHandler = () => {
		setOpenRooms(false);
		setOpenType(false);
		setOpenLocation(false);
	};

	const packageLocationSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						locationList: [value],
					},
				});
				typeStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, packageLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packageTypeSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						typeList: [value],
					},
				});
				roomStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, packageTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packageStyleSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						styleList: [value],
					},
				});
				disableAllStateHandler();
			} catch (err: any) {
				console.log('ERROR, packageStyleSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packagePhotosSelectHandler = useCallback(
		async (number: Number) => {
			try {
				if (number != 0) {
					if (searchFilter?.search?.photosList?.includes(number)) {
						setSearchFilter({
							...searchFilter,
							search: {
								...searchFilter.search,
								photosList: searchFilter?.search?.photosList?.filter((item: Number) => item !== number),
							},
						});
					} else {
						setSearchFilter({
							...searchFilter,
							search: { ...searchFilter.search, photosList: [...(searchFilter?.search?.photosList || []), number] },
						});
					}
				} else {
					delete searchFilter?.search.photosList;
					setSearchFilter({ ...searchFilter });
				}

				console.log('packagePhotosSelectHandler:', number);
			} catch (err: any) {
				console.log('ERROR, packagePhotosSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packageOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const value = e.target.value;
				setOptionCheck(value);

				if (value !== 'all') {
					setSearchFilter({
						...searchFilter,
						search: {
							...searchFilter.search,
							options: [value],
						},
					});
				} else {
					delete searchFilter.search.options;
					setSearchFilter({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					});
				}
			} catch (err: any) {
				console.log('ERROR, packageOptionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const packageDurationHandler = useCallback(
		async (e: any, type: string) => {
			const value = e.target.value;

			if (type == 'start') {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						// @ts-ignore
						durationsRange: { ...searchFilter.search.durationsRange, start: parseFloat(value) },
					},
				});
			} else {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						// @ts-ignore
						durationsRange: { ...searchFilter.search.durationsRange, end: parseFloat(value) },
					},
				});
			}
		},
		[searchFilter],
	);

	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
		setOptionCheck('all');
	};

	const pushSearchHandler = async () => {
		try {
			if (searchFilter?.search?.locationList?.length == 0) {
				delete searchFilter.search.locationList;
			}

			if (searchFilter?.search?.typeList?.length == 0) {
				delete searchFilter.search.typeList;
			}

			if (searchFilter?.search?.styleList?.length == 0) {
				delete searchFilter.search.styleList;
			}

			if (searchFilter?.search?.options?.length == 0) {
				delete searchFilter.search.options;
			}

			if (searchFilter?.search?.photosList?.length == 0) {
				delete searchFilter.search.photosList;
			}

			await router.push(
				`/package?input=${JSON.stringify(searchFilter)}`,
				`/package?input=${JSON.stringify(searchFilter)}`,
			);
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
		return (
			<MotionConfig reducedMotion="user">
				<motion.div className={'search-box'} variants={searchShellVariants} initial="hidden" animate="visible">
					<div className={'select-box'}>
						{[
							{
								key: 'location',
								open: openLocation,
								onClick: locationStateChangeHandler,
								label: searchFilter?.search?.locationList ? searchFilter?.search?.locationList[0] : t('Location'),
							},
							{
								key: 'type',
								open: openType,
								onClick: typeStateChangeHandler,
								label: searchFilter?.search?.typeList ? searchFilter?.search?.typeList[0] : t('Package type'),
							},
							{
								key: 'style',
								open: openRooms,
								onClick: roomStateChangeHandler,
								label: searchFilter?.search?.styleList ? searchFilter?.search?.styleList[0] : t('Style'),
							},
						].map((chip) => (
							<motion.div
								key={chip.key}
								variants={itemFadeUp}
								{...glassPress}
								className={`box ${chip.open ? 'on' : ''}`}
								onClick={chip.onClick}
								role={'button'}
								tabIndex={0}
							>
								{chip.open && (
									<motion.span layoutId={'search-active'} className={'box-highlight'} transition={springSnappy} />
								)}
								<span className={'box-label'}>{chip.label}</span>
								<motion.span className={'box-icon'} animate={{ rotate: chip.open ? 180 : 0 }} transition={springSnappy}>
									<ExpandMoreIcon />
								</motion.span>
							</motion.div>
						))}
					</div>
					<div className={'search-box-other'}>
						<motion.div
							variants={itemFadeUp}
							{...glassPress}
							className={'advanced-filter'}
							onClick={() => advancedFilterHandler(true)}
						>
							<img src="/img/icons/tune.svg" alt="" />
							<span>{t('Advanced')}</span>
						</motion.div>
						<motion.div variants={itemFadeUp} {...glassPress} className={'search-btn'} onClick={pushSearchHandler}>
							<img src="/img/icons/search_white.svg" alt="" />
						</motion.div>
					</div>

					{/*MENU */}
					<AnimatePresence>
						{openLocation && (
							<motion.div
								key={'filter-location'}
								className={'filter-location'}
								ref={locationRef}
								variants={dropdownVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								{packageLocation.map((location: string) => {
									return (
										<motion.div
											variants={itemFadeUp}
											whileHover={{ y: -3 }}
											onClick={() => packageLocationSelectHandler(location)}
											key={location}
										>
											<img src={`img/banner/cities/${location}.webp`} alt="" />
											<span>{location}</span>
										</motion.div>
									);
								})}
							</motion.div>
						)}

						{openType && (
							<motion.div
								key={'filter-type'}
								className={'filter-type'}
								ref={typeRef}
								variants={dropdownVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								{packageType.map((type: string) => {
									return (
										<motion.div
											variants={itemFadeUp}
											whileHover={{ y: -4, scale: 1.02 }}
											style={{ backgroundImage: `url(${packageTypeImages[type]})` }}
											onClick={() => packageTypeSelectHandler(type)}
											key={type}
										>
											<span>{type}</span>
										</motion.div>
									);
								})}
							</motion.div>
						)}

						{openRooms && (
							<motion.div
								key={'filter-rooms'}
								className={'filter-rooms'}
								ref={roomsRef}
								variants={dropdownVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								{packageStyle.map((style: string) => {
									return (
										<motion.span
											variants={itemFadeUp}
											{...glassPress}
											onClick={() => packageStyleSelectHandler(style)}
											key={style}
										>
											{style}
										</motion.span>
									);
								})}
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				{/* ADVANCED FILTER MODAL */}
				<Modal
					open={openAdvancedFilter}
					onClose={() => advancedFilterHandler(false)}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					{/* @ts-ignore */}
					<Box sx={style}>
						<motion.div
							className={'advanced-filter-modal'}
							initial={{ opacity: 0, scale: 0.96, y: 12 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={springSnappy}
						>
							<div className={'close'} onClick={() => advancedFilterHandler(false)}>
								<CloseIcon />
							</div>
							<div className={'top'}>
								<span>Find your package</span>
								<div className={'search-input-box'}>
									<img src="/img/icons/search.svg" alt="" />
									<input
										value={searchFilter?.search?.text ?? ''}
										type="text"
										placeholder={'What are you looking for?'}
										onChange={(e: any) => {
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: e.target.value },
											});
										}}
									/>
								</div>
							</div>
							<Divider sx={{ mt: '30px', mb: '35px' }} />
							<div className={'middle'}>
								<div className={'row-box'}>
									<div className={'box'}>
										<span>edited photos</span>
										<div className={'inside'}>
											<div
												className={`room ${!searchFilter?.search?.photosList ? 'active' : ''}`}
												onClick={() => packagePhotosSelectHandler(0)}
											>
												Any
											</div>
											{packagePhotosList.map((bed: number) => (
												<div
													className={`room ${searchFilter?.search?.photosList?.includes(bed) ? 'active' : ''}`}
													onClick={() => packagePhotosSelectHandler(bed)}
													key={bed}
												>
													{bed == 0 ? 'Any' : bed}
												</div>
											))}
										</div>
									</div>
									<div className={'box'}>
										<span>options</span>
										<div className={'inside'}>
											<FormControl>
												<Select
													value={optionCheck}
													onChange={packageOptionSelectHandler}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
												>
													<MenuItem value={'all'}>All Options</MenuItem>
													<MenuItem value={'packageAlbum'}>Album</MenuItem>
													<MenuItem value={'packageDress'}>Dress</MenuItem>
													<MenuItem value={'packageMakeup'}>Makeup</MenuItem>
												</Select>
											</FormControl>
										</div>
									</div>
								</div>
								<div className={'row-box'} style={{ marginTop: '44px' }}>
									<div className={'box'}>
										<span>duration (hours)</span>
										<div className={'inside space-between align-center'}>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.durationsRange?.start}
													onChange={(e: any) => packageDurationHandler(e, 'start')}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
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
											<div className={'minus-line'}></div>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.durationsRange?.end}
													onChange={(e: any) => packageDurationHandler(e, 'end')}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
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
										</div>
									</div>
								</div>
							</div>
							<Divider sx={{ mt: '60px', mb: '18px' }} />
							<div className={'bottom'}>
								<div onClick={resetFilterHandler}>
									<img src="/img/icons/reset.svg" alt="" />
									<span>Reset all filters</span>
								</div>
								<Button
									startIcon={<img src={'/img/icons/search.svg'} />}
									className={'search-btn'}
									onClick={pushSearchHandler}
								>
									Search
								</Button>
							</div>
						</motion.div>
					</Box>
				</Modal>
			</MotionConfig>
		);
	}
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			durationsRange: {
				start: 0,
				end: 12,
			},
			pricesRange: {
				start: 0,
				end: 10000000,
			},
		},
	},
};

export default HeaderFilter;
