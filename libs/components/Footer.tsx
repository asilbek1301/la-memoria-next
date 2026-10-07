import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import AnimatedLogo from './common/AnimatedLogo';
import { packageSearchHref, prettyEnum } from '../utils';
import { PackageLocation, PackageType } from '../enums/package.enum';

const footerColumns = [
	{
		title: 'Packages',
		links: [
			...Object.values(PackageType).map((type) => ({
				label: `${prettyEnum(type)} packages`,
				href: packageSearchHref({ typeList: [type] }),
			})),
			{ label: 'All packages', href: '/package' },
		],
	},
	{
		title: 'Studios',
		links: [
			{ label: 'All studios', href: '/studio' },
			{ label: 'Join as a studio', href: '/account/join' },
			{ label: 'Community', href: '/community?articleCategory=FREE' },
		],
	},
	{
		title: 'Help',
		links: [
			{ label: 'FAQ', href: '/cs?tab=faq' },
			{ label: 'Notices', href: '/cs?tab=notice' },
			{ label: 'About La Memoria', href: '/about' },
		],
	},
	{
		title: 'Regions',
		links: [PackageLocation.SEOUL, PackageLocation.BUSAN, PackageLocation.JEJU, PackageLocation.GYEONGJU].map(
			(location) => ({ label: prettyEnum(location), href: packageSearchHref({ locationList: [location] }) }),
		),
	},
];

const Footer = () => {
	return (
		<footer className={'footer-container'}>
			<div className={'footer-main'}>
				<div className={'brand-box'}>
					<Link href={'/'} aria-label="La Memoria home" className={'logo-box'}>
						<AnimatedLogo tone="dark" width={170} height={59} />
					</Link>
					<p className={'about'}>
						Pre-wedding photography packages from studios across Korea. Compare tiers, save the ones you love and
						reserve your shoot in one place.
					</p>
					<span className={'label'}>Customer care</span>
					<a className={'phone'} href="tel:+821048672909">
						+82 10 4867 2909
					</a>
				</div>

				<nav className={'footer-columns'} aria-label="Footer">
					{footerColumns.map((column) => (
						<div className={'column'} key={column.title}>
							<h2>{column.title}</h2>
							<ul>
								{column.links.map((link) => (
									<li key={link.label}>
										<Link href={link.href}>{link.label}</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>
			</div>

			<div className={'footer-bottom'}>
				<p>© {moment().year()} La Memoria. All rights reserved.</p>
			</div>
		</footer>
	);
};

export default Footer;
