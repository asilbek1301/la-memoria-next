import { PackageLocation, PackageStatus, PackageStyle, PackageType } from '../../enums/package.enum';
import { Direction } from '../../enums/common.enum';

export interface PackageInput {
	packageType: PackageType;
	packageStyle: PackageStyle;
	packageLocation: PackageLocation;
	packageAddress: string;
	packageTitle: string;
	packagePrice: number;
	packageDuration: number;
	packagePhotos: number;
	packageImages: string[];
	packageDesc?: string;
	packageAlbum?: boolean;
	packageDress?: boolean;
	packageMakeup?: boolean;
	memberId?: string;
}

interface PISearch {
	memberId?: string;
	locationList?: PackageLocation[];
	typeList?: PackageType[];
	styleList?: PackageStyle[];
	photosList?: Number[];
	options?: string[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
	durationsRange?: Range;
	text?: string;
}

export interface PackagesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface SPISearch {
	packageStatus?: PackageStatus;
}

export interface StudioPackagesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: SPISearch;
}

interface ALPISearch {
	packageStatus?: PackageStatus;
	packageLocationList?: PackageLocation[];
}

export interface AllPackagesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
