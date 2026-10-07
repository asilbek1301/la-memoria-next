import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';

/** Korean won price, e.g. ₩1,200,000 **/
export const formatKRW = (value: number | undefined): string => `₩${numeral(value ?? 0).format('0,0')}`;

/** enum value to display label, e.g. SEOUL -> Seoul **/
export const prettyEnum = (value?: string): string =>
	value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';

/** link to the package list with filters applied, e.g. { typeList: ['GOLD'] } **/
export const packageSearchHref = (search: Record<string, unknown> = {}): string =>
	`/package?input=${encodeURIComponent(
		JSON.stringify({ page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search }),
	)}`;

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const likeTargetPackageHandler = async (likeTargetPackage: any, id: string) => {
	try {
		await likeTargetPackage({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetPackageHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};
