import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Rule } from './accountRules';

interface AccountFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: 'text' | 'password' | 'tel';
	autoComplete: string;
	/** shown under the field after a submit attempt */
	error?: string;
	/** rules listed under the field; each one ticks while the user types */
	rules?: Rule[];
}

/** one labelled input with optional live rule hints, an inline error and a Show / Hide button for passwords **/
const AccountField = forwardRef<HTMLInputElement, AccountFieldProps>((props, ref) => {
	const { t } = useTranslation('common');
	const { id, value, onChange, type = 'text', autoComplete, error, rules } = props;
	const label = t(props.label);
	const [visible, setVisible] = useState<boolean>(false);
	const isPassword = type === 'password';
	const describedBy = [rules?.length ? `${id}-rules` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');

	return (
		<div className={'account-field'}>
			<label htmlFor={id} className={'field-label'}>
				{label}
			</label>
			<div className={`input-wrap ${isPassword ? 'with-toggle' : ''}`}>
				<input
					ref={ref}
					id={id}
					type={isPassword && visible ? 'text' : type}
					inputMode={type === 'tel' ? 'tel' : undefined}
					autoComplete={autoComplete}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					aria-invalid={Boolean(error)}
					aria-describedby={describedBy || undefined}
					autoCapitalize="none"
					spellCheck={false}
				/>
				{isPassword && (
					<button
						type="button"
						className={'show-btn'}
						aria-label={t(visible ? 'Hide {{field}}' : 'Show {{field}}', { field: label.toLowerCase() })}
						aria-pressed={visible}
						onClick={() => setVisible(!visible)}
					>
						{visible ? t('Hide') : t('Show')}
					</button>
				)}
			</div>
			{rules && rules.length > 0 && (
				<ul id={`${id}-rules`} className={'field-rules'}>
					{rules.map((rule) => {
						const met = rule.test(value);
						return (
							<li key={rule.label} className={met ? 'met' : ''}>
								<CheckRoundedIcon aria-hidden="true" />
								{t(rule.label)}
								<span className={'visually-hidden'}>{met ? ` ${t('(done)')}` : ''}</span>
							</li>
						);
					})}
				</ul>
			)}
			{error && (
				<p id={`${id}-error`} className={'field-error'}>
					{t(error)}
				</p>
			)}
		</div>
	);
});

AccountField.displayName = 'AccountField';

export default AccountField;
