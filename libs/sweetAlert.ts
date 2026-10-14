import Swal from 'sweetalert2';

/**
 * Every pop-up uses the site's look instead of SweetAlert's own: an ivory card, the site fonts, a small icon and
 * espresso buttons. The styles are `.alert-box` in scss/pc/general.scss (the pop-up is drawn outside the page wraps).
 **/
const siteAlert = Swal.mixin({
	buttonsStyling: false,
	customClass: {
		container: 'alert-layer',
		popup: 'alert-box',
		icon: 'alert-icon',
		title: 'alert-title',
		htmlContainer: 'alert-text',
		actions: 'alert-actions',
		confirmButton: 'alert-confirm',
		cancelButton: 'alert-cancel',
	},
	showClass: { popup: 'alert-in' },
	hideClass: { popup: 'alert-out' },
});

// a small "!" in a soft circle replaces SweetAlert's large animated cross
const errorIcon = { icon: 'error' as const, iconHtml: '!' };

/** an error that stays until it is closed: a message and an OK button **/
export const sweetErrorHandling = async (err: any) => {
	await siteAlert.fire({
		...errorIcon,
		text: err.message,
		confirmButtonText: 'OK',
	});
};

/** asks before an action; resolves true for "Yes" **/
export const sweetConfirmAlert = (msg: string) =>
	siteAlert
		.fire({
			icon: 'question',
			iconHtml: '?',
			text: msg,
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'Cancel',
			reverseButtons: true, // Cancel first, the action last
			focusCancel: true,
		})
		.then((response) => Boolean(response?.isConfirmed));

/** a short error that closes by itself after `duration` ms **/
export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await siteAlert.fire({
		...errorIcon,
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

/** the same short error; kept so existing imports keep working **/
export const sweetMixinErrorAlert = sweetErrorAlert;
