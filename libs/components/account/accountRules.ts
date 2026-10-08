/** Rules for the log in and sign up forms. Lengths match the backend (MemberInput / LoginInput in la-memoria);
    the phone check is ours only, the backend accepts any non-empty phone **/

export const NICK_MIN = 3;
export const NICK_MAX = 12;
export const PASSWORD_MIN = 5;
export const PASSWORD_MAX = 12;

export type AccountType = 'USER' | 'STUDIO';

/** one rule shown under a field; ticks when met */
export interface Rule {
	label: string;
	test: (value: string) => boolean;
}

const length = (min: number, max: number) => (value: string) => value.length >= min && value.length <= max;

export const nickRules: Rule[] = [{ label: `${NICK_MIN}–${NICK_MAX} characters`, test: length(NICK_MIN, NICK_MAX) }];

export const passwordRules: Rule[] = [
	{ label: `${PASSWORD_MIN}–${PASSWORD_MAX} characters`, test: length(PASSWORD_MIN, PASSWORD_MAX) },
];

// digits, spaces, dashes and a leading +; 9 to 15 digits in total (010-1234-5678 and +82 10 1234 5678 both pass)
export const phoneRules: Rule[] = [
	{
		label: 'A phone number studios can reach you on',
		test: (value) => /^\+?[\d\s-]+$/.test(value.trim()) && value.replace(/\D/g, '').length >= 9 && value.replace(/\D/g, '').length <= 15,
	},
];

/** the first unmet rule's message, or '' when the value passes */
export const firstError = (value: string, rules: Rule[], emptyMessage: string) => {
	if (!value.trim()) return emptyMessage;
	const failed = rules.find((rule) => !rule.test(value));
	return failed ? `Use ${failed.label.charAt(0).toLowerCase()}${failed.label.slice(1)}.` : '';
};

/** only paths on this site are followed after logging in (never another website, never "//host") */
export const safeReferrer = (value: unknown): string | null =>
	typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : null;
