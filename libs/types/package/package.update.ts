import { PackageLocation, PackageStatus, PackageStyle, PackageType } from '../../enums/package.enum';

export interface PackageUpdate {
	_id: string;
	packageType?: PackageType;
	packageStatus?: PackageStatus;
	packageStyle?: PackageStyle;
	packageLocation?: PackageLocation;
	packageAddress?: string;
	packageTitle?: string;
	packagePrice?: number;
	packageDuration?: number;
	packagePhotos?: number;
	packageImages?: string[];
	packageDesc?: string;
	packageAlbum?: boolean;
	packageDress?: boolean;
	packageMakeup?: boolean;
	pausedAt?: Date;
	deletedAt?: Date;
}
