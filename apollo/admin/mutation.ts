import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
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

/**************************
 *        PACKAGE        *
 *************************/

export const UPDATE_PACKAGE_BY_ADMIN = gql`
	mutation UpdatePackageByAdmin($input: PackageUpdate!) {
		updatePackageByAdmin(input: $input) {
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

export const REMOVE_PACKAGE_BY_ADMIN = gql`
	mutation RemovePackageByAdmin($input: String!) {
		removePackageByAdmin(packageId: $input) {
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

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
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

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
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

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
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
