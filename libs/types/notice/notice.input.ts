import { NoticeCategory, NoticeStatus, NoticeTopic } from '../../enums/notice.enum';
import { Direction } from '../../enums/common.enum';

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	noticeTopic?: NoticeTopic;
	noticeTitle: string;
	noticeContent: string;
}

export interface NoticesInquiry {
	page: number;
	limit: number;
	search: {
		noticeCategory: NoticeCategory;
		noticeTopic?: NoticeTopic;
		text?: string;
	};
}

export interface AllNoticesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		noticeCategory?: NoticeCategory;
		noticeStatus?: NoticeStatus;
		noticeTopic?: NoticeTopic;
	};
}
