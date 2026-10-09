import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { MemberType } from '../../enums/member.enum';
import { SortOption } from '../common/ListControls';

export const defaultCommunityInput: BoardArticlesInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

/** the existing enum values with plain labels; the enum itself is unchanged **/
export const categoryLabels: Record<BoardArticleCategory, string> = {
	[BoardArticleCategory.FREE]: 'Free talk',
	[BoardArticleCategory.RECOMMEND]: 'Recommendations',
	[BoardArticleCategory.NEWS]: 'News',
	[BoardArticleCategory.HUMOR]: 'Humor',
};

export const categoryLabel = (category?: BoardArticleCategory | string) =>
	categoryLabels[category as BoardArticleCategory] ?? '';

export const categoryTabs: { value: BoardArticleCategory | 'ALL'; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	...Object.values(BoardArticleCategory).map((value) => ({ value, label: categoryLabels[value] })),
];

/** only the sorts the backend accepts for posts (availableBoardArticleSorts) **/
export const communitySortOptions: SortOption[] = [
	{ id: 'newest', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'liked', label: 'Most liked', sort: 'articleLikes', direction: Direction.DESC },
	{ id: 'viewed', label: 'Most viewed', sort: 'articleViews', direction: Direction.DESC },
];

/** `/community?input=<JSON>`, the same URL state as /package and /studio **/
export const communityHref = (input: BoardArticlesInquiry) => `/community?input=${JSON.stringify(input)}`;

const isCategory = (value: unknown): value is BoardArticleCategory =>
	Object.values(BoardArticleCategory).includes(value as BoardArticleCategory);

/** reads ?input=; older links with ?articleCategory=FREE still open on that category **/
export const parseCommunityInput = (raw: unknown, legacyCategory?: unknown): BoardArticlesInquiry => {
	const base: BoardArticlesInquiry = {
		...defaultCommunityInput,
		search: isCategory(legacyCategory) ? { articleCategory: legacyCategory } : {},
	};
	if (typeof raw !== 'string') return base;
	try {
		const parsed = JSON.parse(raw);
		const search = { ...(parsed?.search ?? {}) };
		if (!isCategory(search.articleCategory)) delete search.articleCategory;
		return { ...defaultCommunityInput, ...parsed, search };
	} catch {
		return base;
	}
};

export const articleHref = (article: Pick<BoardArticle, '_id' | 'articleCategory'>) =>
	`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`;

/** a studio author opens the studio page; anyone else opens their member page **/
export const authorHref = (article: BoardArticle) =>
	article?.memberData?.memberType === MemberType.STUDIO
		? { pathname: '/studio/detail', query: { studioId: article.memberData._id } }
		: { pathname: '/member', query: { memberId: article?.memberData?._id ?? article?.memberId } };

/** plain-text excerpt from the editor's HTML content **/
export const articleExcerpt = (html?: string) =>
	(html ?? '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim();

/** a category's list page: /community with that board selected **/
export const categoryHref = (category?: BoardArticleCategory) =>
	communityHref({ ...defaultCommunityInput, search: category ? { articleCategory: category } : {} });

/** the editor puts the cover photo inside the post as well; the post page shows it above the text, so the copy in
    the text (with the paragraph around it) is left out once **/
export const withoutCover = (html: string, image?: string) => {
	if (!image) return html;
	const src = image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const photo = `<img[^>]*src="[^"]*${src}"[^>]*>`;
	const inParagraph = new RegExp(`<p>\\s*${photo}\\s*(<br\\s*/?>)?\\s*</p>`);
	return inParagraph.test(html) ? html.replace(inParagraph, '') : html.replace(new RegExp(photo), '');
};
