import React from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { SortMenu } from '../common/ListControls';
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

			<SortMenu options={sortOptions} sort={input.sort} direction={input.direction} onSort={onSort} />
		</div>
	);
};

export default ResultsToolbar;
