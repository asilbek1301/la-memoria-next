import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import AnimatedLogo from './common/AnimatedLogo';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import { motion, MotionConfig, useScroll, useTransform } from 'framer-motion';
import { glassPress, itemFadeUp, navbarVariants, springSnappy } from './common/motion';

const navLinks = [
	{ href: '/', base: '/', label: 'Home' },
	{ href: '/package', base: '/package', label: 'Packages' },
	{ href: '/studio', base: '/studio', label: 'Studios' },
	{ href: '/community?articleCategory=FREE', base: '/community', label: 'Community' },
	{ href: '/mypage', base: '/mypage', label: 'My Page', authOnly: true },
	{ href: '/cs', base: '/cs', label: 'CS' },
];

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [hoveredLink, setHoveredLink] = useState<string | null>(null);
	const { scrollY } = useScroll();
	const glassOpacity = useTransform(scrollY, [0, 80], [0.35, 1]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/package/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	const activeLink = navLinks.find((link) =>
		link.base === '/' ? router.pathname === '/' : router.pathname.startsWith(link.base),
	)?.href;
	const pillTarget = hoveredLink ?? activeLink;

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/package'}>
					<div>{t('Packages')}</div>
				</Link>
				<Link href={'/studio'}>
					<div> {t('Studios')} </div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div> {t('Community')} </div>
				</Link>
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
			</Stack>
		);
	} else {
		return (
			<MotionConfig reducedMotion="user">
				<Stack className={'navbar'}>
					<motion.div
						className={`navbar-main ${bgColor ? 'solid' : ''}`}
						variants={navbarVariants}
						initial="hidden"
						animate="visible"
					>
						<motion.div className={'glass-backdrop'} style={{ opacity: bgColor ? 1 : glassOpacity }} />
						<Stack className={'container'}>
							<motion.div variants={itemFadeUp} className={'logo-box'}>
								<Link href={'/'}>
									<AnimatedLogo />
								</Link>
							</motion.div>
							<motion.div variants={itemFadeUp} className={'router-box'} onMouseLeave={() => setHoveredLink(null)}>
								{navLinks
									.filter((link) => !link.authOnly || user?._id)
									.map((link) => (
										<Link href={link.href} key={link.href}>
											<div
												className={`nav-link ${activeLink === link.href ? 'active' : ''}`}
												onMouseEnter={() => setHoveredLink(link.href)}
											>
												{pillTarget === link.href && (
													<motion.span layoutId={'nav-pill'} className={'nav-pill'} transition={springSnappy} />
												)}
												<span className={'nav-label'}>{t(link.label)}</span>
											</div>
										</Link>
									))}
							</motion.div>
							<motion.div variants={itemFadeUp} className={'user-box'}>
								{user?._id ? (
									<>
										<motion.div
											{...glassPress}
											className={'login-user'}
											onClick={(event: any) => setLogoutAnchor(event.currentTarget)}
										>
											<img
												src={
													user?.memberImage
														? `${REACT_APP_API_URL}/${user?.memberImage}`
														: '/img/profile/defaultUser.svg'
												}
												alt=""
											/>
										</motion.div>

										<Menu
											id="basic-menu"
											anchorEl={logoutAnchor}
											open={logoutOpen}
											onClose={() => {
												setLogoutAnchor(null);
											}}
											sx={{ mt: '5px' }}
										>
											<MenuItem onClick={() => logOut()}>
												<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
												Logout
											</MenuItem>
										</Menu>
									</>
								) : (
									<Link href={'/account/join'}>
										<motion.div {...glassPress} className={'join-box'}>
											<AccountCircleOutlinedIcon />
											<span>
												{t('Login')} / {t('Register')}
											</span>
										</motion.div>
									</Link>
								)}

								<div className={'lan-box'}>
									{user?._id && <NotificationsOutlinedIcon className={'notification-icon'} />}
									<motion.div {...glassPress}>
										<Button
											disableRipple
											className="btn-lang"
											onClick={langClick}
											endIcon={<CaretDown size={14} color="#ffffff" weight="fill" />}
										>
											<div className={'flag'}>
												{lang !== null ? (
													<img src={`/img/flag/lang${lang}.png`} alt={'usaFlag'} />
												) : (
													<img src={`/img/flag/langen.png`} alt={'usaFlag'} />
												)}
											</div>
										</Button>
									</motion.div>

									<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
										<MenuItem disableRipple onClick={langChoice} id="en">
											<img
												className="img-flag"
												src={'/img/flag/langen.png'}
												onClick={langChoice}
												id="en"
												alt={'usaFlag'}
											/>
											{t('English')}
										</MenuItem>
										<MenuItem disableRipple onClick={langChoice} id="kr">
											<img
												className="img-flag"
												src={'/img/flag/langkr.png'}
												onClick={langChoice}
												id="uz"
												alt={'koreanFlag'}
											/>
											{t('Korean')}
										</MenuItem>
										<MenuItem disableRipple onClick={langChoice} id="ru">
											<img
												className="img-flag"
												src={'/img/flag/langru.png'}
												onClick={langChoice}
												id="ru"
												alt={'russiaFlag'}
											/>
											{t('Russian')}
										</MenuItem>
									</StyledMenu>
								</div>
							</motion.div>
						</Stack>
					</motion.div>
				</Stack>
			</MotionConfig>
		);
	}
};

export default withRouter(Top);
