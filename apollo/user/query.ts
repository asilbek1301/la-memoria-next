import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_STUDIOS = gql`
	query GetStudios($input: StudiosInquiry!) {
		getStudios(input: $input) {
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
				memberFollowers
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember(memberId: $input) {
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
        memberPackages
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
        meLiked {
					memberId
					likeRefId
					myFavorite
				}
    }
}
`);

/**************************
 *        PACKAGE        *
 *************************/

export const GET_PACKAGE = gql`
	query GetPackage($input: String!) {
		getPackage(packageId: $input) {
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
			packageComments
			packageReservations
			packageRank
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
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_PACKAGES = gql`
	query GetPackages($input: PackagesInquiry!) {
		getPackages(input: $input) {
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
				packageRank
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
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_STUDIO_PACKAGES = gql`
	query GetStudioPackages($input: StudioPackagesInquiry!) {
		getStudioPackages(input: $input) {
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
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
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
				packageComments
				packageReservations
				packageRank
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
					memberPackages
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
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

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
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
				packageComments
				packageReservations
				packageRank
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
					memberPackages
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
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

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
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
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
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
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
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
					memberPackages
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					memberPackages
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
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

export const GET_MY_RESERVATIONS = gql`
	query GetMyReservations($input: ReservationsInquiry!) {
		getMyReservations(input: $input) {
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

export const GET_STUDIO_RESERVATIONS = gql`
	query GetStudioReservations($input: ReservationsInquiry!) {
		getStudioReservations(input: $input) {
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
