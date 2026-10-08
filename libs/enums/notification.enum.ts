export enum NotificationType {
	REQUESTED = 'REQUESTED',
	CONFIRMED = 'CONFIRMED',
	CANCELLED = 'CANCELLED',
	COMPLETED = 'COMPLETED',
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
}

export enum NotificationStatus {
	WAIT = 'WAIT', // not read yet
	READ = 'READ',
}

export enum NotificationGroup {
	MEMBER = 'MEMBER',
	PACKAGE = 'PACKAGE',
	RESERVATION = 'RESERVATION',
	ARTICLE = 'ARTICLE',
	NOTICE = 'NOTICE',
}
