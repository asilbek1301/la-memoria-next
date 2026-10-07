import React from 'react';
import { Package } from '../../../types/package/package';
import { PackageType } from '../../../enums/package.enum';
import { formatKRW, prettyEnum } from '../../../utils';
import { plural } from '../studioSearch';

export type TierFilter = PackageType | 'ALL';

interface StudioTiersProps {
	packages: Package[];
	active: TierFilter;
	onSelect: (tier: TierFilter) => void;
}

/** this studio's offer per tier: count and lowest price, or "Not offered"; a tier card filters the package grid **/
const StudioTiers = (props: StudioTiersProps) => {
	const { packages, active, onSelect } = props;

	return (
		<ul className={'studio-tiers'} aria-label="Packages by tier">
			{Object.values(PackageType).map((tier) => {
				const inTier = packages.filter((pkg) => pkg.packageType === tier);
				const offered = inTier.length > 0;
				const from = offered ? Math.min(...inTier.map((pkg) => pkg.packagePrice)) : 0;
				const selected = active === tier;
				return (
					<li key={tier}>
						<button
							type="button"
							className={`tier-card ${selected ? 'active' : ''} ${offered ? '' : 'off'}`}
							aria-pressed={selected}
							disabled={!offered}
							onClick={() => onSelect(selected ? 'ALL' : tier)}
						>
							<span className={'tier-name'}>{prettyEnum(tier)}</span>
							{offered ? (
								<>
									<span className={'tier-from'}>
										From <strong className={'price'}>{formatKRW(from)}</strong>
									</span>
									<span className={'tier-count'}>{plural(inTier.length, 'package')}</span>
								</>
							) : (
								<span className={'tier-off'}>Not offered</span>
							)}
						</button>
					</li>
				);
			})}
		</ul>
	);
};

export default StudioTiers;
