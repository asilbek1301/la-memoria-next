import { StudiosInquiry } from '../../types/member/member.input';
import { Member } from '../../types/member/member';
import { Direction } from '../../enums/common.enum';
import { SortOption } from '../common/ListControls';
import { REACT_APP_API_URL } from '../../config';

export const defaultStudiosInput: StudiosInquiry = {
	page: 1,
	limit: 8,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

/** only the sorts the backend accepts for studios (availableStudioSorts) **/
export const studioSortOptions: SortOption[] = [
	{ id: 'newest', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'liked', label: 'Most liked', sort: 'memberLikes', direction: Direction.DESC },
	{ id: 'viewed', label: 'Most viewed', sort: 'memberViews', direction: Direction.DESC },
	{ id: 'ranked', label: 'Top ranked', sort: 'memberRank', direction: Direction.DESC },
];

/** the same `/studio?input=<JSON>` URL the page has always used **/
export const studiosHref = (input: StudiosInquiry) => `/studio?input=${JSON.stringify(input)}`;

export const parseStudiosInput = (raw: unknown): StudiosInquiry => {
	if (typeof raw !== 'string') return defaultStudiosInput;
	try {
		const parsed = JSON.parse(raw);
		return { ...defaultStudiosInput, ...parsed, search: { ...(parsed?.search ?? {}) } };
	} catch {
		return defaultStudiosInput;
	}
};

export const studioHref = (studio: Member) => ({ pathname: '/studio/detail', query: { studioId: studio?._id } });

/** memberFullName when set, otherwise the nickname with a capital first letter **/
export const studioName = (studio: Member) => {
	if (studio?.memberFullName) return studio.memberFullName;
	const nick = studio?.memberNick ?? '';
	return nick.charAt(0).toUpperCase() + nick.slice(1);
};

/** "12, Dosan-daero 81-gil, Gangnam-gu, Seoul" -> "Gangnam-gu · Seoul"; other formats are shown as written **/
export const studioLocation = (address?: string) => {
	if (!address) return '';
	const parts = address
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	if (parts.length < 3) return address;
	return `${parts[parts.length - 2]} · ${parts[parts.length - 1]}`;
};

export const plural = (count: number, word: string) =>
	`${count.toLocaleString('en-US')} ${count === 1 ? word : `${word}s`}`;

export const studioImage = (studio: Member) =>
	studio?.memberImage ? `${REACT_APP_API_URL}/${studio.memberImage}` : '';

/** "2 packages · 120 followers": only counts above 0 **/
export const studioStats = (studio: Member) => {
	const packages = studio?.memberPackages ?? 0;
	const followers = studio?.memberFollowers ?? 0;
	return [packages > 0 && plural(packages, 'package'), followers > 0 && plural(followers, 'follower')]
		.filter(Boolean)
		.join(' · ');
};
