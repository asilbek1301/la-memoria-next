import React, { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useReveal } from '../common/motion';

interface HomeSectionProps {
	id: string;
	title: string;
	subtitle?: string;
	/** right side of the heading: filter tabs, arrows, "view all" link */
	aside?: ReactNode;
	tone?: 'ivory' | 'tinted';
	className?: string;
	children: ReactNode;
}

/** shared homepage section: serif title + optional aside, revealed with a gentle fade (visible by default, see useReveal) */
const HomeSection = (props: HomeSectionProps) => {
	const { id, title, subtitle, aside, tone = 'ivory', className = '', children } = props;
	const reveal = useReveal<HTMLElement>();

	return (
		<motion.section
			className={`home-section ${tone} ${className}`}
			aria-labelledby={`${id}-title`}
			{...reveal}
		>
			<div className={'container'}>
				<header className={'section-head'}>
					<div>
						<h2 id={`${id}-title`} className={'section-title'}>
							{title}
						</h2>
						{subtitle && <p className={'section-subtitle'}>{subtitle}</p>}
					</div>
					{aside && <div className={'section-aside'}>{aside}</div>}
				</header>
				{children}
			</div>
		</motion.section>
	);
};

export const ViewAllLink = ({ href, label }: { href: string; label: string }) => (
	<Link href={href} className={'button-link'}>
		{label}
	</Link>
);

interface FilterTabsProps<T extends string> {
	label: string;
	options: { value: T | 'ALL'; label: string }[];
	value: T | 'ALL';
	onChange: (value: T | 'ALL') => void;
}

export function FilterTabs<T extends string>({ label, options, value, onChange }: FilterTabsProps<T>) {
	return (
		<div className={'filter-tabs'} role="group" aria-label={label}>
			{options.map((option) => (
				<button
					type="button"
					key={option.value}
					className={option.value === value ? 'active' : ''}
					aria-pressed={option.value === value}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}

export const EmptyState = ({ message, href, linkLabel }: { message: string; href?: string; linkLabel?: string }) => (
	<div className={'empty-box'}>
		<p>{message}</p>
		{href && linkLabel && (
			<Link href={href} className={'button-secondary'}>
				{linkLabel}
			</Link>
		)}
	</div>
);

export default HomeSection;
