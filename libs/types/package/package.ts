import { PackageLocation, PackageStatus, PackageStyle, PackageType } from '../../enums/package.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Package {
	_id: string;
	packageType: PackageType;
	packageStatus: PackageStatus;
	packageStyle: PackageStyle;
	packageLocation: PackageLocation;
	packageAddress: string;
	packageTitle: string;
	packagePrice: number;
	packageDuration: number;
	packagePhotos: number;
	packageViews: number;
	packageLikes: number;
	packageComments: number;
	packageReservations: number;
	packageRank: number;
	packageImages: string[];
	packageDesc?: string;
	packageAlbum: boolean;
	packageDress: boolean;
	packageMakeup: boolean;
	memberId: string;
	pausedAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Packages {
	list: Package[];
	metaCounter: TotalCounter[];
}
