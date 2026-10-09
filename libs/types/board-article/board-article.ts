import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Member } from '../member/member';
import { MeLiked } from '../package/package';

export interface BoardArticle {
	_id: string;
	articleCategory: BoardArticleCategory;
	articleStatus: BoardArticleStatus;
	articleTitle: string;
	articleContent: string;
	articleImage: string;
	articleViews: number;
	articleLikes: number;
	articleComments: number;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

/** getBoardArticleNeighbors: the next older and the next newer post in the same category */
export interface BoardArticleNeighbors {
	previous?: Pick<BoardArticle, '_id' | 'articleCategory' | 'articleTitle'> | null;
	next?: Pick<BoardArticle, '_id' | 'articleCategory' | 'articleTitle'> | null;
}
