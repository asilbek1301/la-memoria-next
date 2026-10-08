import React, { useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Popover, Skeleton } from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { useLazyQuery, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATIONS } from '../../../apollo/user/query';
import { READ_ALL_NOTIFICATIONS, READ_NOTIFICATION } from '../../../apollo/user/mutation';
import { Notification } from '../../types/notification/notification';
import { NotificationGroup, NotificationStatus } from '../../enums/notification.enum';
import { MemberType } from '../../enums/member.enum';
import { memberPhoto } from '../studio/studioSearch';

const LIST_LIMIT = 10; // the panel shows the newest ten
const POLL_MS = 60_000; // the unread number refreshes once a minute
// the bell asks on its own every minute, so its errors (e.g. an expired login) never open a popup
const quiet = { context: { quiet: true } };

/** where a notification leads: the reservation list, the liked package, studio or post **/
const notificationHref = (item: Notification, memberType: string) => {
	const id = item.notificationRefId;
	switch (item.notificationGroup) {
		case NotificationGroup.RESERVATION:
			return '/mypage?category=myReservations';
		case NotificationGroup.PACKAGE:
			return `/package/detail?id=${id}`;
		case NotificationGroup.ARTICLE:
			return `/community/detail?id=${id}`;
		case NotificationGroup.MEMBER:
			return memberType === MemberType.STUDIO ? `/studio/detail?studioId=${id}` : '/mypage';
		default:
			return '/mypage';
	}
};

/** header bell for logged-in members: an unread count, and a panel with the newest notifications **/
const NotificationBell = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	/** APOLLO REQUESTS **/

	const { data: unreadData, refetch: refetchUnread } = useQuery(GET_UNREAD_NOTIFICATIONS, {
		...quiet,
		fetchPolicy: 'cache-and-network',
		pollInterval: POLL_MS,
		skip: !user?._id,
	});
	const [loadList, { data: listData, loading, refetch: refetchList }] = useLazyQuery(GET_NOTIFICATIONS, {
		...quiet,
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: LIST_LIMIT } },
	});
	const [readNotification] = useMutation(READ_NOTIFICATION, quiet);
	const [readAllNotifications] = useMutation(READ_ALL_NOTIFICATIONS, quiet);

	const unread: number = unreadData?.getUnreadNotifications ?? 0;
	const list: Notification[] = listData?.getNotifications?.list ?? [];

	if (!user?._id) return null;

	/** HANDLERS **/

	const openPanel = (e: React.MouseEvent<HTMLElement>) => {
		setAnchor(e.currentTarget);
		loadList();
		refetchUnread();
	};

	// mark it read, then go to what it is about
	const openNotification = async (item: Notification) => {
		setAnchor(null);
		if (item.notificationStatus === NotificationStatus.WAIT) {
			try {
				await readNotification({ variables: { notificationId: item._id } });
				refetchUnread();
			} catch {
				// still open the page; the dot stays until the next try
			}
		}
		router.push(notificationHref(item, user.memberType));
	};

	const markAllRead = async () => {
		try {
			await readAllNotifications();
			await Promise.all([refetchUnread(), refetchList()]);
		} catch {
			// nothing changes on screen, so the button simply stays
		}
	};

	return (
		<>
			<button
				type="button"
				className={'icon-btn bell-btn'}
				aria-label={unread ? `Notifications (${unread} unread)` : 'Notifications'}
				aria-haspopup="dialog"
				aria-expanded={Boolean(anchor)}
				onClick={openPanel}
			>
				<NotificationsNoneRoundedIcon />
				{unread > 0 && <span className={'count-badge'}>{unread > 99 ? '99+' : unread}</span>}
			</button>

			<Popover
				open={Boolean(anchor)}
				anchorEl={anchor}
				onClose={() => setAnchor(null)}
				classes={{ paper: 'notification-panel' }}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ paper: { role: 'dialog', 'aria-label': 'Notifications' } }}
			>
				<div className={'panel-head'}>
					<h2 className={'panel-title'}>Notifications</h2>
					{unread > 0 && (
						<button type="button" className={'button-link'} onClick={markAllRead}>
							Mark all as read
						</button>
					)}
				</div>

				{loading && !list.length ? (
					<div className={'panel-list'}>
						{[0, 1, 2].map((key) => (
							<div key={key} className={'notification-item'}>
								<Skeleton variant="circular" className={'skeleton avatar'} />
								<Skeleton variant="text" className={'skeleton text'} />
							</div>
						))}
					</div>
				) : list.length ? (
					<ul className={'panel-list'}>
						{list.map((item) => {
							const isNew = item.notificationStatus === NotificationStatus.WAIT;
							return (
								<li key={item._id}>
									<button
										type="button"
										className={`notification-item ${isNew ? 'unread' : ''}`}
										onClick={() => openNotification(item)}
									>
										<img
											className={'avatar'}
											src={memberPhoto(item.authorData?.memberImage) || '/img/profile/defaultUser.svg'}
											alt=""
										/>
										<span className={'item-body'}>
											<span className={'item-text'}>
												<strong>{item.authorData?.memberNick ?? 'Someone'}</strong> {item.notificationTitle}
											</span>
											<time className={'item-time'} dateTime={new Date(item.createdAt).toISOString()}>
												{moment(item.createdAt).fromNow()}
											</time>
										</span>
										{isNew && <span className={'unread-dot'} aria-label="Unread" />}
									</button>
								</li>
							);
						})}
					</ul>
				) : (
					<p className={'panel-empty'}>Nothing yet. Reservation updates and likes will show up here.</p>
				)}
			</Popover>
		</>
	);
};

export default NotificationBell;
