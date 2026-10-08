import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../package/package';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	/** the sentence after the author's nickname, e.g. 'liked your package "Spring garden"' */
	notificationTitle: string;
	notificationRefId?: string | null;
	authorId?: string | null;
	createdAt: Date;
	authorData?: Member | null;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
}
