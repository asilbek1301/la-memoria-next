import { PackagesInquiry } from '../../types/package/package.input';
import { PackageLocation, PackageStyle, PackageType } from '../../enums/package.enum';
import { Direction } from '../../enums/common.enum';
import { formatKRW, prettyEnum } from '../../utils';

/** full ranges: a range equal to these means "any" **/
export const DURATION_MAX = 12;
export const PRICE_MAX = 10000000;
export const PRICE_STEP = 100000;

export const defaultPackagesInput: PackagesInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {
		durationsRange: { start: 0, end: DURATION_MAX },
		pricesRange: { start: 0, end: PRICE_MAX },
	},
};

export const sortOptions = [
	{ id: 'newest', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'price-asc', label: 'Price low to high', sort: 'packagePrice', direction: Direction.ASC },
	{ id: 'price-desc', label: 'Price high to low', sort: 'packagePrice', direction: Direction.DESC },
	{ id: 'liked', label: 'Most liked', sort: 'packageLikes', direction: Direction.DESC },
	{ id: 'viewed', label: 'Most viewed', sort: 'packageViews', direction: Direction.DESC },
];

export const includeOptions = [
	{ value: 'packageAlbum', label: 'Album' },
	{ value: 'packageDress', label: 'Dress' },
	{ value: 'packageMakeup', label: 'Makeup' },
];

export const tierValues = Object.values(PackageType);
export const locationValues = Object.values(PackageLocation);
export const styleValues = Object.values(PackageStyle);

export type SearchPatch = Partial<PackagesInquiry['search']>;

/** the same `/package?input=<JSON>` URL the page has always used **/
export const packagesHref = (input: PackagesInquiry) => `/package?input=${JSON.stringify(input)}`;

export const parsePackagesInput = (raw: unknown): PackagesInquiry => {
	if (typeof raw !== 'string') return defaultPackagesInput;
	try {
		const parsed = JSON.parse(raw);
		return { ...defaultPackagesInput, ...parsed, search: { ...(parsed?.search ?? {}) } };
	} catch {
		return defaultPackagesInput;
	}
};

/** apply a search change: empty lists and empty text are dropped, and the page goes back to 1 **/
export const applySearch = (input: PackagesInquiry, patch: SearchPatch): PackagesInquiry => {
	const search: Record<string, unknown> = { ...input.search, ...patch };
	Object.keys(search).forEach((key) => {
		const value = search[key];
		if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) delete search[key];
	});
	return { ...input, page: 1, search: search as PackagesInquiry['search'] };
};

export const durationRange = (input: PackagesInquiry): [number, number] => [
	input.search?.durationsRange?.start ?? 0,
	input.search?.durationsRange?.end ?? DURATION_MAX,
];

export const priceRange = (input: PackagesInquiry): [number, number] => [
	input.search?.pricesRange?.start ?? 0,
	input.search?.pricesRange?.end ?? PRICE_MAX,
];

export const formatHours = (value: number) => `${value} ${value === 1 ? 'hour' : 'hours'}`;

/** list label: one value by name, several as a count, e.g. "Seoul" or "2 locations" **/
export const listLabel = (values: string[] | undefined, emptyLabel: string, plural: string) => {
	if (!values?.length) return emptyLabel;
	if (values.length === 1) return prettyEnum(values[0]);
	return `${values.length} ${plural}`;
};

export interface ActiveChip {
	key: string;
	label: string;
	patch: SearchPatch;
}

/** every active filter as a removable chip **/
export const activeChips = (input: PackagesInquiry): ActiveChip[] => {
	const s = input.search ?? {};
	const chips: ActiveChip[] = [];
	(s.typeList ?? []).forEach((v) =>
		chips.push({ key: `type-${v}`, label: `${prettyEnum(v)} tier`, patch: { typeList: s.typeList?.filter((x) => x !== v) } }),
	);
	(s.locationList ?? []).forEach((v) =>
		chips.push({ key: `loc-${v}`, label: prettyEnum(v), patch: { locationList: s.locationList?.filter((x) => x !== v) } }),
	);
	(s.styleList ?? []).forEach((v) =>
		chips.push({ key: `style-${v}`, label: prettyEnum(v), patch: { styleList: s.styleList?.filter((x) => x !== v) } }),
	);
	(s.photosList ?? []).forEach((v) =>
		chips.push({ key: `photos-${v}`, label: `${v} photos`, patch: { photosList: s.photosList?.filter((x) => x !== v) } }),
	);
	(s.options ?? []).forEach((v) =>
		chips.push({
			key: `opt-${v}`,
			label: includeOptions.find((o) => o.value === v)?.label ?? v,
			patch: { options: s.options?.filter((x) => x !== v) },
		}),
	);
	const [dMin, dMax] = durationRange(input);
	if (dMin > 0 || dMax < DURATION_MAX)
		chips.push({
			key: 'duration',
			label: `${dMin}–${formatHours(dMax)}`,
			patch: { durationsRange: { start: 0, end: DURATION_MAX } },
		});
	const [pMin, pMax] = priceRange(input);
	if (pMin > 0 || pMax < PRICE_MAX)
		chips.push({
			key: 'price',
			label: `${formatKRW(pMin)} – ${formatKRW(pMax)}`,
			patch: { pricesRange: { start: 0, end: PRICE_MAX } },
		});
	if (s.text) chips.push({ key: 'text', label: `“${s.text}”`, patch: { text: undefined } });
	return chips;
};

/** filters that live in the "More filters" panel (not in the sentence) **/
export const extraFilterCount = (input: PackagesInquiry) => {
	const s = input.search ?? {};
	const [dMin, dMax] = durationRange(input);
	const [pMin, pMax] = priceRange(input);
	return (
		(s.photosList?.length ? 1 : 0) +
		(s.options?.length ? 1 : 0) +
		(dMin > 0 || dMax < DURATION_MAX ? 1 : 0) +
		(pMin > 0 || pMax < PRICE_MAX ? 1 : 0)
	);
};

export const clearedSearch = (input: PackagesInquiry): PackagesInquiry => ({
	...input,
	page: 1,
	search: { ...defaultPackagesInput.search },
});

/** "No Gold packages in Daegu with a classic style yet." **/
export const emptySentence = (input: PackagesInquiry) => {
	const s = input.search ?? {};
	const tier = s.typeList?.length === 1 ? `${prettyEnum(s.typeList[0])} ` : '';
	const place = s.locationList?.length ? ` in ${s.locationList.map(prettyEnum).join(' or ')}` : '';
	const style = s.styleList?.length
		? ` with a ${s.styleList.map((v) => prettyEnum(v).toLowerCase()).join(' or ')} style`
		: '';
	const text = s.text ? ` matching “${s.text}”` : '';
	return `No ${tier}packages${place}${style}${text} yet.`;
};
