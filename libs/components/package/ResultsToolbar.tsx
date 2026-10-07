import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { PackagesInquiry } from '../../types/package/package.input';
import { ActiveChip, sortOptions } from './packageSearch';

interface ResultsToolbarProps {
	input: PackagesInquiry;
	total: number;
	loading: boolean;
	chips: ActiveChip[];
	onRemoveChip: (chip: ActiveChip) => void;
	onClearAll: () => void;
	onSort: (sort: string, direction: PackagesInquiry['direction']) => void;
}

/** result count, active filters as removable chips, and the sort menu **/
const ResultsToolbar = (props: ResultsToolbarProps) => {
	const { input, total, loading, chips, onRemoveChip, onClearAll, onSort } = props;
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const current =
		sortOptions.find((o) => o.sort === input.sort && o.direction === input.direction) ?? sortOptions[0];

	return (
		<div className={'results-toolbar'}>
			<p className={'result-count'} aria-live="polite">
				{loading ? 'Searching…' : `${total} ${total === 1 ? 'package' : 'packages'}`}
			</p>

			{chips.length > 0 && (
				<ul className={'active-chips'} aria-label="Active filters">
					{chips.map((chip) => (
						<li key={chip.key}>
							<button
								type="button"
								className={'filter-chip'}
								aria-label={`Remove filter ${chip.label}`}
								onClick={() => onRemoveChip(chip)}
							>
								{chip.label}
								<CloseRoundedIcon aria-hidden="true" />
							</button>
						</li>
					))}
					<li>
						<button type="button" className={'button-link clear-all'} onClick={onClearAll}>
							Clear all
						</button>
					</li>
				</ul>
			)}

			<div className={'sort-box'}>
				<span className={'sort-label'} id="sort-label">
					Sort by
				</span>
				<button
					type="button"
					className={'sort-btn'}
					aria-haspopup="menu"
					aria-expanded={Boolean(anchorEl)}
					aria-labelledby="sort-label sort-value"
					onClick={(e) => setAnchorEl(e.currentTarget)}
				>
					<span id="sort-value">{current.label}</span>
					<KeyboardArrowDownRoundedIcon aria-hidden="true" />
				</button>
				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={() => setAnchorEl(null)}
					classes={{ paper: 'filter-menu' }}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					MenuListProps={{ 'aria-label': 'Sort packages' }}
				>
					{sortOptions.map((option) => (
						<MenuItem
							key={option.id}
							selected={option.id === current.id}
							onClick={() => {
								setAnchorEl(null);
								onSort(option.sort, option.direction);
							}}
						>
							{option.label}
							{option.id === current.id && <CheckRoundedIcon className={'menu-check'} aria-hidden="true" />}
						</MenuItem>
					))}
				</Menu>
			</div>
		</div>
	);
};

/** page numbers around the current page, with gaps: 1 … 4 5 6 … 12 **/
const pageItems = (page: number, count: number): (number | 'gap')[] => {
	const pages = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
	const sorted = Array.from(pages).sort((a, b) => a - b);
	const items: (number | 'gap')[] = [];
	sorted.forEach((p, i) => {
		if (i > 0 && p - sorted[i - 1] > 1) items.push('gap');
		items.push(p);
	});
	return items;
};

export const ResultsPagination = (props: {
	page: number;
	limit: number;
	total: number;
	onPage: (page: number) => void;
}) => {
	const { page, limit, total, onPage } = props;
	const count = Math.ceil(total / limit);
	if (total === 0) return null;
	const from = (page - 1) * limit + 1;
	const to = Math.min(page * limit, total);

	return (
		<nav className={'results-pagination'} aria-label="Pages">
			<p className={'showing'}>
				Showing {from}–{to} of {total}
			</p>
			{count > 1 && (
				<div className={'page-list'}>
					<button
						type="button"
						className={'arrow-btn'}
						aria-label="Previous page"
						disabled={page <= 1}
						onClick={() => onPage(page - 1)}
					>
						<ChevronLeftRoundedIcon />
					</button>
					{pageItems(page, count).map((item, i) =>
						item === 'gap' ? (
							<span key={`gap-${i}`} className={'page-gap'} aria-hidden="true">
								…
							</span>
						) : (
							<button
								type="button"
								key={item}
								className={`page-num ${item === page ? 'active' : ''}`}
								aria-current={item === page ? 'page' : undefined}
								aria-label={`Page ${item}`}
								onClick={() => onPage(item)}
							>
								{item}
							</button>
						),
					)}
					<button
						type="button"
						className={'arrow-btn'}
						aria-label="Next page"
						disabled={page >= count}
						onClick={() => onPage(page + 1)}
					>
						<ChevronRightRoundedIcon />
					</button>
				</div>
			)}
		</nav>
	);
};

export default ResultsToolbar;
