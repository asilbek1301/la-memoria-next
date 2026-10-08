import { NoticeCategory, NoticeStatus, NoticeTopic } from '../../enums/notice.enum';
import { TotalCounter } from '../package/package';

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTopic?: NoticeTopic | null;
	noticeTitle: string;
	noticeContent: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Notices {
	list: Notice[];
	metaCounter: TotalCounter[];
}
