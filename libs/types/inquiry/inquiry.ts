import { InquiryStatus } from '../../enums/inquiry.enum';
import { TotalCounter } from '../package/package';

export interface Inquiry {
	_id: string;
	inquiryStatus: InquiryStatus;
	inquiryName: string;
	inquiryEmail: string;
	inquiryMessage: string;
	memberId?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Inquiries {
	list: Inquiry[];
	metaCounter: TotalCounter[];
}

export interface InquiryInput {
	inquiryName: string;
	inquiryEmail: string;
	inquiryMessage: string;
}
