import React from 'react';
import { useTranslation } from 'next-i18next';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { AccountType } from './accountRules';

// only these two can sign up; the backend refuses ADMIN as well
const accountTypes: { value: AccountType; title: string; text: string }[] = [
	{ value: 'USER', title: "I'm a couple", text: 'Find and book photoshoot packages' },
	{ value: 'STUDIO', title: "I'm a studio", text: 'Offer your packages to couples' },
];

/** "I'm a couple" / "I'm a studio" as two radio cards; the chosen one has an espresso border and a check **/
const AccountTypeCards = ({ value, onChange }: { value: AccountType; onChange: (value: AccountType) => void }) => {
	const { t } = useTranslation('common');

	return (
		<fieldset className={'account-types'}>
			<legend className={'field-label'}>{t('Account type')}</legend>
			<div className={'type-cards'}>
				{accountTypes.map((option) => (
					<label key={option.value} className={`type-card ${value === option.value ? 'selected' : ''}`}>
						<input
							type="radio"
							name="accountType"
							value={option.value}
							checked={value === option.value}
							onChange={() => onChange(option.value)}
						/>
						<span className={'type-check'} aria-hidden="true">
							<CheckRoundedIcon />
						</span>
						<span className={'type-title'}>{t(option.title)}</span>
						<span className={'type-text'}>{t(option.text)}</span>
					</label>
				))}
			</div>
		</fieldset>
	);
};

export default AccountTypeCards;
