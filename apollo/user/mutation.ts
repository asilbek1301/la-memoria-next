import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
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
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
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
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
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
`;

/**************************
 *        PACKAGE        *
 *************************/

export const CREATE_PACKAGE = gql`
	mutation CreatePackage($input: PackageInput!) {
		createPackage(input: $input) {
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
	}
`;

export const UPDATE_PACKAGE = gql`
	mutation UpdatePackage($input: PackageUpdate!) {
		updatePackage(input: $input) {
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
	}
`;

export const LIKE_TARGET_PACKAGE = gql`
	mutation LikeTargetPackage($input: String!) {
		likeTargetPackage(packageId: $input) {
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
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
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
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
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
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
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
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      RESERVATION       *
 *************************/

export const CREATE_RESERVATION = gql`
	mutation CreateReservation($input: ReservationInput!) {
		createReservation(input: $input) {
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
		}
	}
`;

export const UPDATE_RESERVATION = gql`
	mutation UpdateReservation($input: ReservationUpdate!) {
		updateReservation(input: $input) {
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
		}
	}
`;
