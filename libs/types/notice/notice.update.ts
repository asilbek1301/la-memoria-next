import { NoticeCategory, NoticeStatus, NoticeTopic } from '../../enums/notice.enum';

export interface NoticeUpdate {
	_id: string;
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeTopic?: NoticeTopic | null;
	noticeTitle?: string;
	noticeContent?: string;
}
