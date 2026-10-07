import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Modal, Divider, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { packageDurations, packagePhotosList } from '../../config';
import { PackageLocation, PackageStyle, PackageType } from '../../enums/package.enum';
import { PackagesInquiry } from '../../types/package/package.input';
import { prettyEnum } from '../../utils';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { dropdownVariants, itemFadeUp, searchShellVariants, springSnappy } from '../common/motion';

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

interface HeaderFilterProps {
	initialInput: PackagesInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<PackagesInquiry>(initialInput);
	const locationRef: any = useRef();
	const typeRef: any = useRef();
	const roomsRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openRooms, setOpenRooms] = useState(false);
	const [packageLocation] = useState<PackageLocation[]>(Object.values(PackageLocation));
	const [packageType] = useState<PackageType[]>(Object.values(PackageType));
	const [packageStyle] = useState<PackageStyle[]>(Object.values(PackageStyle));
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

	const clearFieldHandler = (key: 'locationList' | 'typeList' | 'styleList') => {
		const search = { ...searchFilter.search };
		delete search[key];
		setSearchFilter({ ...searchFilter, search });
		disableAllStateHandler();
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

	const searchFields = [
		{
			key: 'locationList' as const,
			label: 'Location',
			allLabel: 'All locations',
			open: openLocation,
			ref: locationRef,
			toggle: locationStateChangeHandler,
			options: packageLocation,
			selected: searchFilter?.search?.locationList?.[0],
			onSelect: packageLocationSelectHandler,
		},
		{
			key: 'typeList' as const,
			label: 'Package type',
			allLabel: 'All tiers',
			open: openType,
			ref: typeRef,
			toggle: typeStateChangeHandler,
			options: packageType,
			selected: searchFilter?.search?.typeList?.[0],
			onSelect: packageTypeSelectHandler,
		},
		{
			key: 'styleList' as const,
			label: 'Style',
			allLabel: 'All styles',
			open: openRooms,
			ref: roomsRef,
			toggle: roomStateChangeHandler,
			options: packageStyle,
			selected: searchFilter?.search?.styleList?.[0],
			onSelect: packageStyleSelectHandler,
		},
	];

	return (
		<MotionConfig reducedMotion="user">
			{/* no initial/animate here: it follows the hero timeline set on HomeHero's root */}
			<motion.div className={'search-box'} variants={searchShellVariants}>
				<div className={'search-fields'}>
					{searchFields.map((field) => (
						<motion.div variants={itemFadeUp} className={'search-field'} ref={field.ref} key={field.key}>
							<button
								type="button"
								className={`field-trigger ${field.open ? 'on' : ''}`}
								aria-haspopup="listbox"
								aria-expanded={field.open}
								onClick={field.toggle}
							>
								<span className={'field-label'}>{t(field.label)}</span>
								<span className={'field-value'}>
									{field.selected ? prettyEnum(field.selected) : field.allLabel}
								</span>
								<motion.span
									className={'field-chevron'}
									animate={{ rotate: field.open ? 180 : 0 }}
									transition={springSnappy}
								>
									<ExpandMoreIcon />
								</motion.span>
							</button>

							<AnimatePresence>
								{field.open && (
									<motion.ul
										className={'field-menu'}
										role="listbox"
										aria-label={field.label}
										variants={dropdownVariants}
										initial="hidden"
										animate="visible"
										exit="exit"
									>
										<li>
											<button
												type="button"
												role="option"
												aria-selected={!field.selected}
												className={!field.selected ? 'selected' : ''}
												onClick={() => clearFieldHandler(field.key)}
											>
												{field.allLabel}
											</button>
										</li>
										{field.options.map((option: string) => (
											<li key={option}>
												<button
													type="button"
													role="option"
													aria-selected={field.selected === option}
													className={field.selected === option ? 'selected' : ''}
													onClick={() => field.onSelect(option)}
												>
													{prettyEnum(option)}
												</button>
											</li>
										))}
									</motion.ul>
								)}
							</AnimatePresence>
						</motion.div>
					))}
				</div>
				<motion.div variants={itemFadeUp} className={'search-actions'}>
					{/* <button type="button" className={'advanced-btn'} onClick={() => advancedFilterHandler(true)}>
						<TuneRoundedIcon />
						<span>{t('Advanced')}</span>
					</button> */}
					<button type="button" className={'search-btn'} onClick={pushSearchHandler}>
						Search
					</button>
				</motion.div>
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
