import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberWarnings
				memberBlocks
				memberPackages
				memberRank
				memberArticles
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PACKAGE        *
 *************************/

export const GET_ALL_PACKAGES_BY_ADMIN = gql`
	query GetAllPackagesByAdmin($input: AllPackagesInquiry!) {
		getAllPackagesByAdmin(input: $input) {
			list {
				_id
				packageType
				packageStatus
				packageLocation
				packageAddress
				packageTitle
				packagePrice
				packageDuration
				packagePhotos
				packageStyle
				packageViews
				packageLikes
				packageImages
				packageDesc
				packageAlbum
				packageDress
				packageMakeup
				memberId
				pausedAt
				deletedAt
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberPackages
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberPackages
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberPackages
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      RESERVATION       *
 *************************/

export const GET_ALL_RESERVATIONS_BY_ADMIN = gql`
	query GetAllReservationsByAdmin($input: ReservationsInquiry!) {
		getAllReservationsByAdmin(input: $input) {
			list {
				_id
				reservationStatus
				reservationDate
				reservationPrice
				reservationNote
				studioId
				memberId
				packageId
				confirmedAt
				cancelledAt
				completedAt
				createdAt
				updatedAt
				packageData {
					_id
					packageTitle
					packageType
					packageStyle
					packageLocation
					packageImages
					packagePrice
				}
				memberData {
					_id
					memberNick
					memberPhone
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
