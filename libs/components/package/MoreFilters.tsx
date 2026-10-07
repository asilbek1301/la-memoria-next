import React, { useEffect, useState } from 'react';
import { Drawer, Slider } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { PackagesInquiry } from '../../types/package/package.input';
import { packageDurations, packagePhotosList } from '../../config';
import { formatKRW } from '../../utils';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	DURATION_MAX,
	PRICE_MAX,
	PRICE_STEP,
	SearchPatch,
	durationRange,
	formatHours,
	includeOptions,
	priceRange,
} from './packageSearch';

interface MoreFiltersProps {
	open: boolean;
	onClose: () => void;
	input: PackagesInquiry;
	onSearch: (patch: SearchPatch) => void;
	total: number;
	loading: boolean;
}

const durationMarks = packageDurations.map((value) => ({ value }));

/** right-side panel (full-screen sheet on phones) with the filters that are not in the sentence **/
const MoreFilters = (props: MoreFiltersProps) => {
	const { open, onClose, input, onSearch, total, loading } = props;
	const device = useDeviceDetect();
	const photos = (input.search?.photosList ?? []) as number[];
	const options = input.search?.options ?? [];

	// sliders move locally while dragging and update the search when released
	const [duration, setDuration] = useState<number[]>(durationRange(input));
	const [price, setPrice] = useState<number[]>(priceRange(input));
	useEffect(() => setDuration(durationRange(input)), [input.search?.durationsRange?.start, input.search?.durationsRange?.end]);
	useEffect(() => setPrice(priceRange(input)), [input.search?.pricesRange?.start, input.search?.pricesRange?.end]);

	const togglePhotos = (value: number) =>
		onSearch({ photosList: photos.includes(value) ? photos.filter((v) => v !== value) : [...photos, value] });

	const toggleOption = (value: string) =>
		onSearch({ options: options.includes(value) ? options.filter((v) => v !== value) : [...options, value] });

	const reset = () =>
		onSearch({
			photosList: [],
			options: [],
			durationsRange: { start: 0, end: DURATION_MAX },
			pricesRange: { start: 0, end: PRICE_MAX },
		});

	return (
		<Drawer
			anchor={device === 'mobile' ? 'bottom' : 'right'}
			open={open}
			onClose={onClose}
			classes={{ paper: `filter-panel ${device === 'mobile' ? 'full' : ''}` }}
			PaperProps={{ role: 'dialog', 'aria-labelledby': 'more-filters-title' } as any}
		>
			<header className={'panel-head'}>
				<h2 id="more-filters-title" className={'panel-title'}>
					More filters
				</h2>
				<button type="button" className={'icon-btn'} aria-label="Close filters" onClick={onClose}>
					<CloseRoundedIcon />
				</button>
			</header>

			<div className={'panel-body'}>
				<fieldset className={'panel-group'}>
					<legend className={'group-label'}>Edited photos</legend>
					<div className={'photo-chips'}>
						{packagePhotosList.map((value) => {
							const active = photos.includes(value);
							return (
								<button
									type="button"
									key={value}
									className={`chip ${active ? 'active' : ''}`}
									aria-pressed={active}
									onClick={() => togglePhotos(value)}
								>
									{value}
								</button>
							);
						})}
					</div>
				</fieldset>

				<fieldset className={'panel-group'}>
					<legend className={'group-label'}>Includes</legend>
					<div className={'include-list'}>
						{includeOptions.map((option) => {
							const active = options.includes(option.value);
							return (
								<label key={option.value} className={`include-row ${active ? 'active' : ''}`}>
									<input type="checkbox" checked={active} onChange={() => toggleOption(option.value)} />
									<span className={'check-box'} aria-hidden="true">
										{active && <CheckRoundedIcon />}
									</span>
									{option.label}
								</label>
							);
						})}
					</div>
				</fieldset>

				<fieldset className={'panel-group'}>
					<legend className={'group-label'}>Duration</legend>
					<span className={'range-value'}>
						{duration[0]} – {formatHours(duration[1])}
					</span>
					<Slider
						className={'range-slider'}
						value={duration}
						min={0}
						max={DURATION_MAX}
						step={null}
						marks={durationMarks}
						disableSwap
						getAriaLabel={(index) => (index === 0 ? 'Shortest duration' : 'Longest duration')}
						getAriaValueText={(value) => formatHours(value)}
						onChange={(_, value) => setDuration(value as number[])}
						onChangeCommitted={(_, value) => {
							const [start, end] = value as number[];
							onSearch({ durationsRange: { start, end } });
						}}
					/>
					<div className={'range-ends'} aria-hidden="true">
						<span>0 hours</span>
						<span>{formatHours(DURATION_MAX)}</span>
					</div>
				</fieldset>

				<fieldset className={'panel-group'}>
					<legend className={'group-label'}>Price</legend>
					<p className={'price-value'}>
						{formatKRW(price[0])} <span aria-hidden="true">–</span> {formatKRW(price[1])}
					</p>
					<Slider
						className={'range-slider'}
						value={price}
						min={0}
						max={PRICE_MAX}
						step={PRICE_STEP}
						disableSwap
						getAriaLabel={(index) => (index === 0 ? 'Lowest price' : 'Highest price')}
						getAriaValueText={(value) => formatKRW(value)}
						onChange={(_, value) => setPrice(value as number[])}
						onChangeCommitted={(_, value) => {
							const [start, end] = value as number[];
							onSearch({ pricesRange: { start, end } });
						}}
					/>
					<div className={'range-ends'} aria-hidden="true">
						<span>{formatKRW(0)}</span>
						<span>{formatKRW(PRICE_MAX)}</span>
					</div>
				</fieldset>
			</div>

			<footer className={'panel-foot'}>
				<button type="button" className={'button-link'} onClick={reset}>
					Reset
				</button>
				<button type="button" className={'button-primary'} onClick={onClose} aria-live="polite">
					{loading ? 'Updating…' : `Show ${total} ${total === 1 ? 'package' : 'packages'}`}
				</button>
			</footer>
		</Drawer>
	);
};

export default MoreFilters;
