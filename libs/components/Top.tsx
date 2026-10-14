import React, { useCallback, useEffect, useState } from 'react';
import { memberPhoto } from './studio/studioSearch';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Drawer, Menu, MenuItem } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useQuery, useReactiveVar } from '@apollo/client';
import { motion, MotionConfig } from 'framer-motion';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { userVar } from '../../apollo/store';
import { GET_FAVORITES } from '../../apollo/user/query';
import AnimatedLogo from './common/AnimatedLogo';
import NotificationBell from './common/NotificationBell';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { itemFadeUp, navbarVariants, springSnappy } from './common/motion';

const navLinks = [
	{ href: '/package', base: '/package', label: 'Packages' },
	{ href: '/studio', base: '/studio', label: 'Studios' },
	{ href: '/community?articleCategory=FREE', base: '/community', label: 'Community' },
	{ href: '/cs', base: '/cs', label: 'Help' },
];

// id is the next-i18next locale; label is read out by screen readers in place of the short code
const languages = [
	{ id: 'en', code: 'EN', label: 'English' },
	{ id: 'kr', code: 'KR', label: 'Korean' },
	{ id: 'ru', code: 'RU', label: 'Russian' },
];

const Top = () => {
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const device = useDeviceDetect();
	const [lang, setLang] = useState<string>('en');
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
	const [hoveredLink, setHoveredLink] = useState<string | null>(null);

	/** APOLLO REQUESTS **/

	const { data: favoritesData } = useQuery(GET_FAVORITES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1 } },
		skip: !user?._id,
	});
	const savedTotal: number = favoritesData?.getFavorites?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/

	useEffect(() => {
		const stored = localStorage.getItem('locale');
		if (stored === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(stored);
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		setDrawerOpen(false);
	}, [router.asPath]);

	/** HANDLERS **/

	const langChoice = useCallback(
		async (id: string) => {
			setLang(id);
			localStorage.setItem('locale', id);
			setLangAnchor(null);
			await router.push(router.asPath, router.asPath, { locale: id });
		},
		[router],
	);

	const activeLink = navLinks.find((link) => router.pathname.startsWith(link.base))?.href;
	const indicatorTarget = hoveredLink ?? activeLink;
	const currentLang = languages.find((item) => item.id === lang) ?? languages[0];
	const savedHref = user?._id ? '/mypage?category=myFavorites' : '/account/join';
	// phones get the logo's own default size, so it fits beside the menu button and the three header buttons
	const logoSize = device === 'mobile' ? { width: 150, height: 52 } : { width: 170, height: 59 };

	return (
		<MotionConfig reducedMotion="user">
			<motion.header className={'navbar'} variants={navbarVariants} initial="hidden" animate="visible">
				<div className={'navbar-main'}>
					<button
						type="button"
						className={'menu-btn icon-btn'}
						aria-label="Open menu"
						onClick={() => setDrawerOpen(true)}
					>
						<MenuRoundedIcon />
					</button>

					<motion.nav
						variants={itemFadeUp}
						className={'router-box'}
						aria-label="Main"
						onMouseLeave={() => setHoveredLink(null)}
					>
						{navLinks.map((link) => (
							<Link
								href={link.href}
								key={link.href}
								className={`nav-link ${activeLink === link.href ? 'active' : ''}`}
								aria-current={activeLink === link.href ? 'page' : undefined}
								onMouseEnter={() => setHoveredLink(link.href)}
								onFocus={() => setHoveredLink(link.href)}
								onBlur={() => setHoveredLink(null)}
							>
								{t(link.label)}
								{indicatorTarget === link.href && (
									<motion.span layoutId={'nav-indicator'} className={'nav-indicator'} transition={springSnappy} />
								)}
							</Link>
						))}
					</motion.nav>

					<motion.div variants={itemFadeUp} className={'logo-box'}>
						<Link href={'/'} aria-label="La Memoria home">
							<AnimatedLogo tone="dark" {...logoSize} />
						</Link>
					</motion.div>

					<motion.div variants={itemFadeUp} className={'user-box'}>
						<NotificationBell />
						<Link
							href={savedHref}
							className={'icon-btn saved-btn'}
							aria-label={savedTotal ? `Liked packages (${savedTotal})` : 'Liked packages'}
						>
							<FavoriteBorderRoundedIcon />
						</Link>

						<button
							type="button"
							className={'lang-btn'}
							aria-label={`Language: ${currentLang.label}`}
							aria-haspopup="menu"
							aria-expanded={Boolean(langAnchor)}
							onClick={(e) => setLangAnchor(e.currentTarget)}
						>
							{currentLang.code}
						</button>
						<Menu
							anchorEl={langAnchor}
							open={Boolean(langAnchor)}
							onClose={() => setLangAnchor(null)}
							classes={{ paper: 'nav-menu lang-menu' }}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
							transformOrigin={{ vertical: 'top', horizontal: 'center' }}
						>
							{languages.map((item) => (
								<MenuItem
									key={item.id}
									selected={item.id === lang}
									aria-label={item.label}
									onClick={() => langChoice(item.id)}
								>
									{item.code}
								</MenuItem>
							))}
						</Menu>

						{user?._id ? (
							<>
								<button
									type="button"
									className={'avatar-btn'}
									aria-label="Account menu"
									aria-haspopup="menu"
									aria-expanded={Boolean(userAnchor)}
									onClick={(e) => setUserAnchor(e.currentTarget)}
								>
									<img
										src={
											memberPhoto(user?.memberImage) || '/img/profile/defaultUser.svg'
										}
										alt=""
									/>
								</button>
								<Menu
									anchorEl={userAnchor}
									open={Boolean(userAnchor)}
									onClose={() => setUserAnchor(null)}
									classes={{ paper: 'nav-menu' }}
									anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
									transformOrigin={{ vertical: 'top', horizontal: 'right' }}
								>
									<MenuItem
										onClick={() => {
											setUserAnchor(null);
											router.push('/mypage').then();
										}}
									>
										<PersonOutlineRoundedIcon className={'menu-icon'} aria-hidden="true" />
										{t('My Page')}
									</MenuItem>
									<MenuItem onClick={() => logOut()}>
										<LogoutRoundedIcon className={'menu-icon'} aria-hidden="true" />
										Log out
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href={'/account/join'} className={'login-btn'}>
								<PersonOutlineRoundedIcon />
								<span>{t('Login')}</span>
							</Link>
						)}
					</motion.div>
				</div>
			</motion.header>

			<Drawer
				anchor="left"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				classes={{ paper: 'nav-drawer' }}
			>
				<div className={'drawer-top'}>
					<AnimatedLogo tone="dark" width={130} height={46} />
					<button
						type="button"
						className={'icon-btn'}
						aria-label="Close menu"
						onClick={() => setDrawerOpen(false)}
					>
						<CloseRoundedIcon />
					</button>
				</div>
				<nav className={'drawer-nav'} aria-label="Main">
					<Link href={'/'}>{t('Home')}</Link>
					{navLinks.map((link) => (
						<Link href={link.href} key={link.href} aria-current={activeLink === link.href ? 'page' : undefined}>
							{t(link.label)}
						</Link>
					))}
					{user?._id && <Link href={'/mypage'}>{t('My Page')}</Link>}
				</nav>
				<div className={'drawer-lang'}>
					{languages.map((item) => (
						<button
							type="button"
							key={item.id}
							className={item.id === lang ? 'active' : ''}
							onClick={() => langChoice(item.id)}
						>
							{item.code}
						</button>
					))}
				</div>
			</Drawer>
		</MotionConfig>
	);
};

export default withRouter(Top);
