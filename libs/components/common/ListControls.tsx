import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Direction } from '../../enums/common.enum';

/** shared list controls for the Packages and Studios pages: the sort menu and the pagination **/

export interface SortOption {
	id: string;
	label: string;
	sort: string;
	direction: Direction;
}

interface SortMenuProps {
	options: SortOption[];
	sort?: string;
	direction?: Direction;
	onSort: (sort: string, direction: Direction) => void;
}

export const SortMenu = (props: SortMenuProps) => {
	const { options, sort, direction, onSort } = props;
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const current = options.find((o) => o.sort === sort && o.direction === direction) ?? options[0];

	return (
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
				MenuListProps={{ 'aria-label': 'Sort' }}
			>
				{options.map((option) => (
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
	/** optional noun after the total, e.g. "studios" -> "Showing 1–8 of 24 studios" */
	noun?: string;
}) => {
	const { page, limit, total, onPage, noun } = props;
	const count = Math.ceil(total / limit);
	if (total === 0) return null;
	const from = (page - 1) * limit + 1;
	const to = Math.min(page * limit, total);

	return (
		<nav className={'results-pagination'} aria-label="Pages">
			<p className={'showing'}>
				Showing {from}–{to} of {total}
				{noun ? ` ${noun}` : ''}
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
