export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;
// Google sign-in (Google Cloud OAuth client ID); empty means the Google button is hidden
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? '';

/** package duration choices (hours) **/
export const packageDurations = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12];

/** edited photo count choices **/
export const packagePhotosList = [10, 20, 30, 50, 100];

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topPackageRank = 2;
