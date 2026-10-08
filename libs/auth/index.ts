import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { GOOGLE_AUTH, LOGIN, SIGN_UP } from '../../apollo/user/mutation';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

/** the backend's login and signup errors, in plain words for the form **/
const authMessages: Record<string, string> = {
	'No member with that member nick!': 'No account with this nickname.',
	'Wrong password, try again!': 'Wrong password.',
	'You have been blocked!': 'This account has been blocked.',
	'Already used member nick or phone!': 'This nickname or phone number is already used.',
	'Not Allowed Request!': 'This account type cannot be created here.',
	'Google sign-in could not be verified!': 'Google sign-in did not work. Please try again.',
	'This account signs in with Google!': 'This account uses Google. Choose "Continue with Google" instead.',
	'Bad Request Exception': 'Please check the fields above.',
};

const toAuthError = (err: any): Error => {
	if (err?.networkError) return new Error('We could not reach the server. Please try again.');
	const message: string = err?.graphQLErrors?.[0]?.message ?? '';
	return new Error(authMessages[message] ?? 'Something went wrong. Please try again.');
};

/** saves the token and fills userVar from it **/
const saveToken = (jwtToken: string) => {
	updateStorage({ jwtToken });
	updateUserInfo(jwtToken);
};

/** logs in; on failure throws an Error whose message can be shown as is **/
export const logIn = async (nick: string, password: string): Promise<void> => {
	const apolloClient = await initializeApollo();
	try {
		const { data } = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
			context: { quiet: true }, // the form shows the message, not a popup
		});
		saveToken(data.login.accessToken);
	} catch (err) {
		throw toAuthError(err);
	}
};

/** creates a couple (USER) or studio (STUDIO) account and logs it in; throws like logIn **/
export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	const apolloClient = await initializeApollo();
	try {
		const { data } = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: { input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type } },
			fetchPolicy: 'network-only',
			context: { quiet: true }, // the form shows the message, not a popup
		});
		saveToken(data.signup.accessToken);
	} catch (err) {
		throw toAuthError(err);
	}
};

const GOOGLE_NEEDS_DETAILS = 'Google sign-up needs more details!';

/** signs in with a Google ID token. 'done': logged in. 'needs-details': a new Google user must first choose
    a nickname, phone and account type, then call this again with them. Throws like logIn **/
export const googleLogIn = async (
	idToken: string,
	details?: { nick: string; phone: string; type: string },
): Promise<'done' | 'needs-details'> => {
	const apolloClient = await initializeApollo();
	try {
		const { data } = await apolloClient.mutate({
			mutation: GOOGLE_AUTH,
			variables: {
				input: {
					idToken,
					...(details ? { memberNick: details.nick, memberPhone: details.phone, memberType: details.type } : {}),
				},
			},
			fetchPolicy: 'network-only',
			context: { quiet: true }, // the form shows the message, not a popup
		});
		saveToken(data.googleAuth.accessToken);
		return 'done';
	} catch (err: any) {
		if (err?.graphQLErrors?.[0]?.message === GOOGLE_NEEDS_DETAILS) return 'needs-details';
		throw toAuthError(err);
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberPackages: claims.memberPackages,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberPackages: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
