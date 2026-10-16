import { NoticeTopic } from '../../enums/notice.enum';

/** Help page labels. The questions and notices themselves are written by admins (getNotices) **/

export type HelpTab = 'faq' | 'notice' | 'contact';
export type TopicKey = 'packages' | 'reservations' | 'payments' | 'studios' | 'community';

export const SUPPORT_PHONE = '+82 10 8317 2332';
export const SUPPORT_TEL = 'tel:+821083172332';

export const helpTabs: { value: HelpTab; label: string }[] = [
	{ value: 'faq', label: 'FAQ' },
	{ value: 'notice', label: 'Notices' },
	{ value: 'contact', label: 'Contact' },
];

/** the URL uses the short key (?topic=payments); the API uses the enum **/
export const helpTopics: { value: TopicKey; topic: NoticeTopic; label: string }[] = [
	{ value: 'packages', topic: NoticeTopic.PACKAGES, label: 'Packages' },
	{ value: 'reservations', topic: NoticeTopic.RESERVATIONS, label: 'Reservations' },
	{ value: 'payments', topic: NoticeTopic.PAYMENTS, label: 'Payments' },
	{ value: 'studios', topic: NoticeTopic.STUDIOS, label: 'For studios' },
	{ value: 'community', topic: NoticeTopic.COMMUNITY, label: 'Community' },
];

export const topicLabel = (topic?: NoticeTopic | null) => helpTopics.find((item) => item.topic === topic)?.label ?? '';

export const isHelpTab = (value: unknown): value is HelpTab => helpTabs.some((tab) => tab.value === value);
export const isTopicKey = (value: unknown): value is TopicKey => helpTopics.some((topic) => topic.value === value);
