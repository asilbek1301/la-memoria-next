import React, { useId, useState } from 'react';
import { Drawer, Menu, MenuItem } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { prettyEnum } from '../../utils';

interface SentenceSelectProps {
	/** what the menu chooses, for screen readers and the sheet title, e.g. "Tier" */
	name: string;
	/** text shown in the sentence for the current choice */
	label: string;
	/** label of the "no filter" option, e.g. "All tiers" */
	allLabel: string;
	values: string[];
	selected: string[];
	onSelect: (values: string[]) => void;
	className?: string;
}

/** one bracketed word of the sentence filter: a menu on desktop, a bottom sheet on phones **/
const SentenceSelect = (props: SentenceSelectProps) => {
	const { name, label, allLabel, values, selected, onSelect, className = '' } = props;
	const device = useDeviceDetect();
	const menuId = useId();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const close = () => setAnchorEl(null);
	const choose = (value: string | null) => {
		onSelect(value ? [value] : []);
		close();
	};

	const options = [
		{ value: null, label: allLabel, active: selected.length === 0 },
		...values.map((value) => ({ value, label: prettyEnum(value), active: selected.length === 1 && selected[0] === value })),
	];

	return (
		<>
			<button
				type="button"
				className={`sentence-select ${open ? 'open' : ''} ${className}`}
				aria-haspopup={device === 'mobile' ? 'dialog' : 'menu'}
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				aria-label={`${name}: ${label}. Change ${name.toLowerCase()}`}
				onClick={(e) => setAnchorEl(e.currentTarget)}
			>
				<span className={'select-value'}>{label}</span>
				<KeyboardArrowDownRoundedIcon className={'select-chevron'} aria-hidden="true" />
			</button>

			{device === 'mobile' ? (
				<Drawer
					anchor="bottom"
					open={open}
					onClose={close}
					classes={{ paper: 'filter-sheet' }}
					PaperProps={{ id: menuId, role: 'dialog', 'aria-label': name } as any}
				>
					<div className={'sheet-handle'} aria-hidden="true" />
					<p className={'sheet-title'}>{name}</p>
					<ul className={'sheet-options'}>
						{options.map((option) => (
							<li key={option.label}>
								<button
									type="button"
									className={option.active ? 'active' : ''}
									aria-pressed={option.active}
									onClick={() => choose(option.value)}
								>
									{option.label}
									{option.active && <CheckRoundedIcon aria-hidden="true" />}
								</button>
							</li>
						))}
					</ul>
				</Drawer>
			) : (
				<Menu
					id={menuId}
					anchorEl={anchorEl}
					open={open}
					onClose={close}
					classes={{ paper: 'filter-menu' }}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
					transformOrigin={{ vertical: 'top', horizontal: 'left' }}
					MenuListProps={{ 'aria-label': name }}
				>
					{options.map((option) => (
						<MenuItem key={option.label} selected={option.active} onClick={() => choose(option.value)}>
							{option.label}
							{option.active && <CheckRoundedIcon className={'menu-check'} aria-hidden="true" />}
						</MenuItem>
					))}
				</Menu>
			)}
		</>
	);
};

export default SentenceSelect;
