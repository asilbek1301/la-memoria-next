import React, { useEffect, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { PackagesInquiry } from '../../types/package/package.input';
import SentenceSelect from './SentenceSelect';
import { SearchPatch, listLabel, locationValues, styleValues, tierValues } from './packageSearch';

interface SentenceFilterProps {
	input: PackagesInquiry;
	onSearch: (patch: SearchPatch) => void;
	onOpenMore: () => void;
	extraCount: number;
}

const tierSelect = (input: PackagesInquiry, onSearch: SentenceFilterProps['onSearch']) => (
	<SentenceSelect
		name="Tier"
		label={listLabel(input.search?.typeList, 'All tiers', 'tiers')}
		allLabel="All tiers"
		values={tierValues}
		selected={input.search?.typeList ?? []}
		onSelect={(typeList) => onSearch({ typeList: typeList as any })}
	/>
);

const locationSelect = (input: PackagesInquiry, onSearch: SentenceFilterProps['onSearch']) => (
	<SentenceSelect
		name="Location"
		label={listLabel(input.search?.locationList, 'All locations', 'locations')}
		allLabel="All locations"
		values={locationValues}
		selected={input.search?.locationList ?? []}
		onSelect={(locationList) => onSearch({ locationList: locationList as any })}
	/>
);

const styleSelect = (input: PackagesInquiry, onSearch: SentenceFilterProps['onSearch']) => (
	<SentenceSelect
		name="Style"
		label={
			input.search?.styleList?.length === 1
				? `${input.search.styleList[0].toLowerCase()} style`
				: listLabel(input.search?.styleList, 'any style', 'styles')
		}
		allLabel="Any style"
		values={styleValues}
		selected={input.search?.styleList ?? []}
		onSelect={(styleList) => onSearch({ styleList: styleList as any })}
	/>
);

export const MoreFiltersButton = ({ count, onClick }: { count: number; onClick: () => void }) => (
	<button type="button" className={'button-secondary more-filters-btn'} aria-haspopup="dialog" onClick={onClick}>
		<TuneRoundedIcon aria-hidden="true" />
		<span className={'btn-text'}>More filters</span>
		{count > 0 && (
			<span className={'filter-count'} aria-label={`${count} active`}>
				{count}
			</span>
		)}
	</button>
);

/** "I'm looking for [All tiers] packages in [All locations] with [any style]." plus search and More filters **/
const SentenceFilter = (props: SentenceFilterProps) => {
	const { input, onSearch, onOpenMore, extraCount } = props;
	const [text, setText] = useState<string>(input.search?.text ?? '');

	// keep the field in step with the URL (back button, chips, pasted links)
	useEffect(() => {
		setText(input.search?.text ?? '');
	}, [input.search?.text]);

	// search as you type, after a short pause
	useEffect(() => {
		const current = input.search?.text ?? '';
		if (text.trim() === current) return;
		const timer = setTimeout(() => onSearch({ text: text.trim() || undefined }), 450);
		return () => clearTimeout(timer);
	}, [text]);

	return (
		<div className={'sentence-filter'}>
			<p className={'sentence'}>
				I&apos;m looking for {tierSelect(input, onSearch)} packages in {locationSelect(input, onSearch)} with{' '}
				{styleSelect(input, onSearch)}.
			</p>
			<div className={'sentence-tools'}>
				<form
					className={'search-field'}
					role="search"
					onSubmit={(e) => {
						e.preventDefault();
						onSearch({ text: text.trim() || undefined });
					}}
				>
					<SearchRoundedIcon aria-hidden="true" />
					<input
						type="search"
						value={text}
						placeholder="Search by package name"
						aria-label="Search by package name"
						onChange={(e) => setText(e.target.value)}
					/>
					{text && (
						<button type="button" className={'clear-btn'} aria-label="Clear search" onClick={() => setText('')}>
							<CloseRoundedIcon />
						</button>
					)}
				</form>
				<MoreFiltersButton count={extraCount} onClick={onOpenMore} />
			</div>
		</div>
	);
};

/** the slim bar that replaces the sentence once it scrolls away **/
export const SentenceBar = (props: SentenceFilterProps & { visible: boolean }) => {
	const { input, onSearch, onOpenMore, extraCount, visible } = props;
	return (
		<div className={`sentence-bar ${visible ? 'visible' : ''}`} aria-hidden={!visible} {...(!visible ? ({ inert: '' } as any) : {})}>
			<div className={'bar-inner'}>
				<p className={'bar-summary'}>
					{tierSelect(input, onSearch)}
					<span className={'bar-dot'} aria-hidden="true">
						·
					</span>
					{locationSelect(input, onSearch)}
					<span className={'bar-dot'} aria-hidden="true">
						·
					</span>
					{styleSelect(input, onSearch)}
				</p>
				<MoreFiltersButton count={extraCount} onClick={onOpenMore} />
			</div>
		</div>
	);
};

export default SentenceFilter;
