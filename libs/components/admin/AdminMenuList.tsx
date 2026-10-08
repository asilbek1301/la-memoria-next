import React, { useEffect, useState } from 'react';
import { withRouter } from 'next/router';
import Link from 'next/link';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { CalendarCheck, ChatsCircle, Headset, SquaresFour, User, UserCircleGear } from 'phosphor-react';
import cookies from 'js-cookie';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const AdminMenuList = (props: any) => {
	const device = useDeviceDetect();
	const [, setMobileLayout] = useState(false);
	const [] = useState('Users');
	const [openMenu] = useState(typeof window === 'object' ? cookies.get('admin_menu') === 'true' : false);
	const [clickMenu, setClickMenu] = useState<any>([]);
	const [clickSubMenu, setClickSubMenu] = useState('');

	const {
		router: { pathname },
	} = props;

	const pathnames = pathname.split('/').filter((x: any) => x);

	/** LIFECYCLES **/
	useEffect(() => {
		if (device === 'mobile') setMobileLayout(true);

		switch (pathnames[1]) {
			case 'packages':
				setClickMenu(['Packages']);
				break;
			case 'reservations':
				setClickMenu(['Reservations']);
				break;
			case 'community':
				setClickMenu(['Community']);
				break;
			case 'cs':
				setClickMenu(['Help']);
				break;
			case 'users':
				setClickMenu(['Users']);
				break;
			default:
				setClickMenu([]); // the dashboard
				break;
		}

		switch (pathnames[2]) {
			case 'logs':
				setClickSubMenu('Logs');
				break;
			case 'inquiry':
				setClickSubMenu('1:1 Inquiry');
				break;
			case 'notice':
				setClickSubMenu('Notice');
				break;
			case 'faq':
				setClickSubMenu('FAQ');
				break;
			case 'board_create':
				setClickSubMenu('Board Create');
				break;
			default:
				setClickSubMenu('List');
				break;
		}
	}, []);

	/** HANDLERS **/
	const subMenuChangeHandler = (target: string) => {
		if (clickMenu.find((item: string) => item === target)) {
			setClickMenu(clickMenu.filter((menu: string) => target !== menu));
		} else {
			setClickMenu([...clickMenu, target]);
		}
	};

	const menu_set = [
		{
			title: 'Users',
			icon: <User size={20} color="currentColor" weight="fill" />,
			on_click: () => subMenuChangeHandler('Users'),
		},
		{
			title: 'Packages',
			icon: <UserCircleGear size={20} color="currentColor" weight="fill" />,
			on_click: () => subMenuChangeHandler('Packages'),
		},
		{
			title: 'Reservations',
			icon: <CalendarCheck size={20} color="currentColor" weight="fill" />,
			on_click: () => subMenuChangeHandler('Reservations'),
		},
		{
			title: 'Community',
			icon: <ChatsCircle size={20} color="currentColor" weight="fill" />,
			on_click: () => subMenuChangeHandler('Community'),
		},
		{
			title: 'Help',
			icon: <Headset size={20} color="currentColor" weight="fill" />,
			on_click: () => subMenuChangeHandler('Help'),
		},
	];

	const sub_menu_set: any = {
		Users: [{ title: 'List', url: '/_admin/users' }],
		Packages: [{ title: 'List', url: '/_admin/packages' }],
		Reservations: [{ title: 'List', url: '/_admin/reservations' }],
		Community: [{ title: 'List', url: '/_admin/community' }],
		Help: [
			{ title: 'FAQ', url: '/_admin/cs/faq' },
			{ title: 'Notice', url: '/_admin/cs/notice' },
			{ title: '1:1 Inquiry', url: '/_admin/cs/inquiry' },
		],
	};

	const onDashboard = pathnames.length === 1;

	return (
		<>
			{/* the overview: counts and the latest activity */}
			<List className={'menu_wrap'} disablePadding>
				<Link href={'/_admin'}>
					<ListItemButton
						component={'li'}
						className={onDashboard ? 'menu on dashboard' : 'menu dashboard'}
						sx={{ minHeight: 48, justifyContent: openMenu ? 'initial' : 'center', px: 2.5 }}
					>
						<ListItemIcon sx={{ minWidth: 0, mr: openMenu ? 3 : 'auto', justifyContent: 'center' }}>
							<SquaresFour size={20} color="currentColor" weight="fill" />
						</ListItemIcon>
						<ListItemText>Dashboard</ListItemText>
					</ListItemButton>
				</Link>
			</List>
			{menu_set.map((item, index) => (
				<List className={'menu_wrap'} key={index} disablePadding>
					<ListItemButton
						onClick={item.on_click}
						component={'li'}
						className={clickMenu[0] === item.title ? 'menu on' : 'menu'}
						sx={{
							minHeight: 48,
							justifyContent: openMenu ? 'initial' : 'center',
							px: 2.5,
						}}
					>
						<ListItemIcon
							sx={{
								minWidth: 0,
								mr: openMenu ? 3 : 'auto',
								justifyContent: 'center',
							}}
						>
							{item.icon}
						</ListItemIcon>
						<ListItemText>{item.title}</ListItemText>
						{clickMenu.find((menu: string) => item.title === menu) ? <ExpandLess /> : <ExpandMore />}
					</ListItemButton>
					<Collapse
						in={!!clickMenu.find((menu: string) => menu === item.title)}
						className="menu"
						timeout="auto"
						component="li"
						unmountOnExit
					>
						<List className="menu-list" disablePadding>
							{sub_menu_set[item.title] &&
								sub_menu_set[item.title].map((sub: any, i: number) => (
									<Link href={sub.url} shallow={true} replace={true} key={i}>
										<ListItemButton
											component="li"
											className={clickMenu[0] === item.title && clickSubMenu === sub.title ? 'li on' : 'li'}
										>
											<Typography variant={'body2'} component={'span'}>
												{sub.title}
											</Typography>
										</ListItemButton>
									</Link>
								))}
						</List>
					</Collapse>
				</List>
			))}
		</>
	);
};

export default withRouter(AdminMenuList);
